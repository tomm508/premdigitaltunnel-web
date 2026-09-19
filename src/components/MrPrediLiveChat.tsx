import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  HelpCircle, 
  Flame, 
  ShieldCheck, 
  Activity,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, ServiceItem } from '../types';

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: Server[];
  services: ServiceItem[];
  onSelectService?: (serviceId: string) => void;
  onSelectServer?: (serverId: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedPrompts?: string[];
}

const SYSTEM_PROMPT_CONTEXT = `
Kamu adalah Mr. Predi, Asisten AI Pintar & Customer Support Resmi untuk PremDigital TUNNEL.
Gaya bicaramu ramah, profesional, solutif, sedikit santai dengan sentuhan khas komunitas tunneling Indonesia (menggunakan istilah seperti bug SNI, inject, payload, akun SSH, V2Ray, VMess, VLESS, Trojan, Cloudflare CDN, bengong, fast connect).

Tugas utamamu:
1. Membantu pengguna memilih server SSH / V2Ray / Trojan yang tepat sesuai kebutuhan mereka (gaming low-ping, streaming 4K, bypass kuota edukasi/sosmed/vidio).
2. Menjelaskan cara setting aplikasi tunneling populer seperti v2rayNG, HTTP Custom, OpenTunnel, Clash, NekoBox, HTTP Injector.
3. Memberikan solusi saat koneksi bermasalah (bengong, 200 OK tapi bengong, SSL handshake error, connection refused, RTO).
4. Menjelaskan transparansi reset kuota akun gratis setiap jam 00:00 WIB dan opsi akun VIP/Premium.
5. Bersikap sopan, menyapa dengan ramah ("Halo Sobat PremDigital!" atau "Halo Kak!").
`;

export const AiChatModal: React.FC<AiChatModalProps> = ({
  isOpen,
  onClose,
  servers,
  services,
  onSelectService,
  onSelectServer
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('premdigital_ai_chat');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Halo! Saya **Mr. Predi**, asisten AI resmi PremDigital TUNNEL. 🎩\n\nAda yang bisa saya bantu hari ini? Anda bisa tanya seputar racikan Bug SNI, rekomendasi server low-ping untuk game, panduan v2rayNG/HTTP Custom, atau kendala koneksi bengong/RTO!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: [
          'Rekomendasi server buat main game (ML/FF)',
          'Cara pasang akun VLESS di v2rayNG',
          'Kenapa SSH terhubung tapi bengong?',
          'Info reset kuota harian'
        ]
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('premdigital_ai_chat', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      // Build conversation context
      const serverContext = servers.map(s => `- Server ${s.name} (${s.location}, ${s.countryCode}): Kuota ${s.usedToday}/${s.dailyQuota}, Ping ~${s.ping}ms, Status: ${s.status}`).join('\n');
      const serviceContext = services.map(srv => `- Layanan ${srv.name} (${srv.category}): ${srv.description}`).join('\n');

      const fullPrompt = `
Konteks Sistem PremDigital TUNNEL saat ini:
Daftar Server Aktif:
${serverContext || 'Server Singapore SG-1, SG-2, dan Indonesia ID-1 aktif normal.'}

Daftar Layanan:
${serviceContext || 'SSH Websocket CDN, VMess TLS, VLESS gRPC, Trojan GO.'}

Pertanyaan Pengguna:
${query}

Instruksi:
Jawab dengan ramah, jelas, to the point, dan solutif. Format jawaban dalam Markdown yang enak dibaca (gunakan bullet point atau bold jika perlu). Berikan rekomendasi langkah praktis.
`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          systemInstruction: SYSTEM_PROMPT_CONTEXT,
          history: messages.slice(-4).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi AI service');
      }

      const data = await response.json();
      const replyContent = data.reply || 'Maaf, saya sedang mengalami sedikit kendala jaringan. Silakan tanyakan kembali sebentar lagi ya Kak!';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: [
          'Cek status server gratis',
          'Racikan Bug SNI paket hemat',
          'Cara setting di HTTP Custom'
        ]
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      // Fallback response if API offline
      const fallbackReply = generateFallbackResponse(query);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: [
          'Rekomendasi server game',
          'Solusi koneksi bengong',
          'Info kuota & reset'
        ]
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateFallbackResponse = (q: string): string => {
    const query = q.toLowerCase();
    if (query.includes('game') || query.includes('ml') || query.includes('ff') || query.includes('ping')) {
      return "🎮 **Rekomendasi Server Game Low-Ping:**\nUntuk Mobile Legends, Free Fire, atau PUBG, kami sangat menyarankan menggunakan **Server Singapore (SG-1 atau SG-2)** dengan protokol **SSH UDP Custom** atau **VLESS gRPC**. Ping stabil di kisaran 20-35ms dengan jitter minimal!";
    }
    if (query.includes('bengong') || query.includes('rto') || query.includes('koneksi') || query.includes('putus')) {
      return "🛠️ **Solusi Mengatasi Koneksi Bengong / RTO:**\n1. Lakukan **On/Off Mode Pesawat** selama 5 detik untuk mereset IP Address kartu.\n2. Coba ganti port dari 443 (TLS) ke 80 (Non-TLS) atau sebaliknya.\n3. Periksa kembali masa aktif paket kuota Anda (minimal tersisa kuota paket 0KB tapi belum expired).\n4. Gunakan bug SNI alternatif jika bug utama mengalami limitasi operator.";
    }
    if (query.includes('reset') || query.includes('kuota') || query.includes('jadwal') || query.includes('penuh')) {
      return "⏰ **Informasi Kuota & Jadwal Reset:**\nSeluruh kuota akun gratis di PremDigital TUNNEL di-reset secara otomatis setiap pukul **00:00 WIB** setiap hari. Jika server favorit Anda penuh, silakan cek server cadangan kami atau upgrade ke akun VIP untuk akses unlimited tanpa batas kuota!";
    }
    if (query.includes('v2ray') || query.includes('vless') || query.includes('vmess') || query.includes('setting')) {
      return "📱 **Panduan Import V2Ray / VMess / VLESS:**\n1. Buat akun di halaman layanan kami dan salin link konfigurasi (`vmess://` atau `vless://`).\n2. Buka aplikasi **v2rayNG** atau **V2Box**.\n3. Tekan tanda **(+)** di kanan atas dan pilih **Import config from clipboard**.\n4. Edit konfigurasi pada bagian **SNI / Request Host** sesuaikan dengan paket kuota Anda, lalu hubungkan!";
    }
    return "Terima kasih atas pertanyaan Anda! Sebagai asisten AI PremDigital TUNNEL, saya merekomendasikan Anda untuk mencoba server berlogo **Recommended** di halaman layanan kami. Ada kendala spesifik lain mengenai bug SNI atau konfigurasi yang bisa saya bantu?";
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    localStorage.removeItem('premdigital_ai_chat');
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Percakapan telah direset. Halo lagi! Ada yang bisa Mr. Predi bantu terkait akun SSH/V2Ray atau kendala tunneling Anda? 🎩`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: [
          'Rekomendasi server game',
          'Cara pasang akun di v2rayNG',
          'Koneksi sering bengong'
        ]
      }
    ]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                      Mr. Predi
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">PRO ASSISTANT</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Online
                    </span>
                    <span>•</span>
                    <span>Asisten Virtual PremDigital</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Bersihkan Percakapan"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Context Subheader (Tanpa Badge 24 Jam) */}
            <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/50 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Tanya bug SNI, V2Ray, SSH WS, atau server ke Mr. Predi!
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1 text-xs text-slate-400">
                    {msg.role === 'assistant' ? (
                      <>
                        <Bot className="w-3.5 h-3.5 text-primary" />
                        <span className="font-semibold text-slate-300">Mr. Predi</span>
                      </>
                    ) : (
                      <span className="font-semibold text-slate-300">Anda</span>
                    )}
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>

                  {/* Suggested Prompts pills if provided */}
                  {msg.suggestedPrompts && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.suggestedPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(prompt)}
                          className="text-xs px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                  <span>Mr. Predi sedang menganalisis server & menyusun jawaban...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tanya apa saja seputar SSH, V2Ray, atau Bug SNI..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 p-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-primary/20 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                  <span>Mr. Predi • Virtual Assistant PremDigital</span>
                  <span className="text-emerald-400 font-medium">● AI Active</span>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
