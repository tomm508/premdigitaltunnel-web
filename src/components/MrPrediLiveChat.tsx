import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  ChevronRight, 
  Minimize2,
  Maximize2,
  Bot
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'mr_predi' | 'user';
  text: string;
  time: string;
  suggestedPrompts?: string[];
}

interface MrPrediLiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToServices?: () => void;
  onOpenTopup?: () => void;
}

const SYSTEM_PROMPT = `
Kamu adalah Mr. Predi, Asisten AI Pintar Resmi dari PremDigital TUNNEL.
Kepribadianmu: Gaul, ramah, ahli seluk-beluk tunneling Indonesia (bug SNI Vidio/Sosmed/Edu/YouTube, v2rayNG, HTTP Custom, SSH WS CDN Cloudflare, VLESS gRPC, Trojan GO, dan solusi bengong/RTO).
Sapa pengguna dengan "Kak" atau "Sobat PremDigital".
Format jawaban dengan Markdown rapi, to the point, dan solutif.
`;

export const MrPrediLiveChat: React.FC<MrPrediLiveChatProps> = ({
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'mr_predi',
      text: 'Yo halo Kak! Kenalin, gue **Mr. Predi** 😎🎩 Asisten AI resmi PremDigital TUNNEL.\n\nAda yang bisa Mr. Predi bantu hari ini? Kakak bisa tanya bebas apa saja tentang racikan Bug SNI, rekomendasi server low-ping untuk game, panduan v2rayNG/HTTP Custom, atau kendala koneksi bengong/RTO!',
      time: 'Online',
      suggestedPrompts: [
        '🚀 Rekomendasi server buat main game (ML/FF)',
        '📱 Racikan Bug SNI kuota paling joss',
        '⚡ Cara pasang akun VLESS di v2rayNG',
        '🛠️ Kenapa SSH terhubung tapi bengong?',
        '💎 Info reset kuota gratis & akun VIP'
      ]
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping, isMinimized]);

  const getTimeString = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // FUNGSI UTAMA: MENGIRIM PERTANYAAN KE OTAK AI GEMINI ASLI
  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: promptText,
      time: getTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputVal('');
    setIsTyping(true);

    try {
      // 1. PANGGIL OTAK AI GEMINI ASLI
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction: SYSTEM_PROMPT,
          history: messages.slice(-4).map(m => ({
            role: m.sender === 'mr_predi' ? 'model' : 'user',
            parts: [{ text: m.text }]
          }))
        })
      });

      if (!response.ok) {
        throw new Error('AI API Error');
      }

      const data = await response.json();
      const aiReply = data.reply || 'Yo Kak! Ada kendala lain yang bisa Mr. Predi bantu?';

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'mr_predi',
          text: aiReply,
          time: getTimeString(),
          suggestedPrompts: [
            '📱 Racikan Bug SNI lainnya',
            '🎮 Rekomendasi server game',
            '🛠️ Solusi bengong / RTO'
          ]
        }
      ]);
    } catch (error) {
      console.warn("Fallback AI offline response:", error);
      // Fallback Cerdas jika offline
      let fallbackText = "Yo Kak! Mr. Predi siap bantu seputar SSH WS, V2Ray, bug SNI, atau error koneksi. Silakan pilih menu di bawah atau coba tanyakan hal spesifik ya!";
      const q = promptText.toLowerCase();

      if (q.includes('game') || q.includes('ml') || q.includes('ff') || q.includes('ping')) {
        fallbackText = "🎮 **Rekomendasi Server Game Low-Ping ala Mr. Predi:**\nBuat Mobile Legends, Free Fire, atau PUBG, Mr. Predi saranin banget pake **Server Singapore 🇸🇬 atau Indonesia 🇮🇩** jalur **SSH UDP Custom** atau **VLESS gRPC**. Ping-nya adem bener di kisaran **15ms - 35ms**!";
      } else if (q.includes('sni') || q.includes('bug') || q.includes('kuota') || q.includes('vidio')) {
        fallbackText = "🎯 **Racikan Bug SNI Populer ala Mr. Predi:**\n1. **Paket Vidio/Streaming**: `quiz.int.vidio.com` atau `m.vidio.com`\n2. **Paket YouTube/Sosmed**: `m.youtube.com`, `v.whatsapp.net`\n3. **Paket Edukasi**: `belajar.kemdikbud.go.id`, `ruangguru.com`\n\n*Tips:* Pasang bug host ini di kolom **SNI / Server Name Indication** pas generate akun!";
      } else if (q.includes('bengong') || q.includes('rto') || q.includes('disconnect')) {
        fallbackText = "🛠️ **Jurus Sakti Mr. Predi Atasi Bengong / RTO:**\n1. Lakukan **On/Off Mode Pesawat** selama 5 detik biar dapet IP segar dari BTS provider.\n2. Coba ganti port dari 443 (TLS) ke 80 (Non-TLS).\n3. Pastikan kuota paket bug Anda masih aktif!";
      }

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'mr_predi',
          text: fallbackText,
          time: getTimeString(),
          suggestedPrompts: [
            '🚀 Cek Server Gratis',
            '🎯 Racikan Bug SNI',
            '💎 Info Akun VIP'
          ]
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'mr_predi',
        text: 'Obrolan telah direset! Yo Kak, gue **Mr. Predi AI** siap nemenin lagi. Mau dibantu apa nih seputar tunneling?',
        time: 'Online',
        suggestedPrompts: [
          '🚀 Rekomendasi server buat main game (ML/FF)',
          '📱 Racikan Bug SNI kuota paling joss',
          '⚡ Cara pasang akun VLESS di v2rayNG',
          '🛠️ Kenapa SSH terhubung tapi bengong?'
        ]
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-end sm:right-6 sm:bottom-6 sm:left-auto justify-center pointer-events-none p-0 sm:p-4">
      <div 
        className={`pointer-events-auto w-full sm:w-[440px] bg-[#0f0a28] border border-purple-500/30 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-purple-950/90 flex flex-col transition-all duration-300 overflow-hidden ${
          isMinimized ? 'h-[70px]' : 'h-[85vh] sm:h-[630px] max-h-[92vh]'
        }`}
      >
        {/* Header Mr. Predi AI */}
        <div className="bg-gradient-to-r from-[#1b1146] via-[#2d186f] to-[#180e3f] px-4 py-3 border-b border-purple-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#0e0924] flex items-center justify-center text-white relative">
                  <span className="text-xl select-none">🎩</span>
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1b1146] ring-1 ring-emerald-400/50"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                  Mr. Predi
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-purple-900/90 text-purple-200 border border-purple-400/40">
                    GEMINI AI
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-purple-300/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Online • Asisten Virtual PremDigital
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              type="button"
              onClick={resetChat}
              className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:flex cursor-pointer"
              title={isMinimized ? 'Perbesar' : 'Kecilkan'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Tutup Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="bg-purple-950/50 border-b border-purple-500/10 px-4 py-2 flex items-center justify-between text-[11px] text-purple-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>Tanya apa saja seputar SSH WS, V2Ray, atau Bug SNI!</span>
              </span>
            </div>

            {/* Area Pesan Chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a061d]/85 backdrop-blur">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                    {msg.sender === 'mr_predi' ? (
                      <span className="text-purple-300 font-extrabold flex items-center gap-1">
                        🎩 Mr. Predi AI
                      </span>
                    ) : (
                      <span className="font-semibold">Kamu</span>
                    )}
                    <span>• {msg.time}</span>
                  </div>

                  <div 
                    className={`max-w-[88%] p-3.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-[#150e38] border border-purple-500/30 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Tombol Rekomendasi Cepat (Pills) */}
                  {msg.sender === 'mr_predi' && msg.suggestedPrompts && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[95%]">
                      {msg.suggestedPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendPrompt(prompt)}
                          disabled={isTyping}
                          className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-800/90 border border-purple-500/30 text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 text-left shadow-sm hover:text-white cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
                          <span>{prompt}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-purple-300 font-bold">
                    <span>🎩 Mr. Predi AI lagi mikir & nyusun jawaban...</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#150e38] border border-purple-500/30 rounded-tl-none shadow-md flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 bg-[#110b2e] border-t border-purple-500/20">
              <form onSubmit={(e) => { e.preventDefault(); handleSendPrompt(inputVal); }} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Tanya apa aja ke Mr. Predi AI..."
                  className="flex-1 bg-[#0a061d] border border-purple-500/30 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400 placeholder-slate-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isTyping}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-purple-900/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kirim</span>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MrPrediLiveChat;
