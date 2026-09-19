import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  ChevronRight, 
  Minimize2,
  Maximize2
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'mr_predi' | 'user';
  text: string;
  time: string;
  options?: Array<{ label: string; action: string }>;
}

interface MrPrediLiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToServices?: () => void;
  onOpenTopup?: () => void;
}

export const MrPrediLiveChat: React.FC<MrPrediLiveChatProps> = ({
  isOpen,
  onClose,
  onNavigateToServices,
  onOpenTopup
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'mr_predi',
      text: 'Yo halo Kak! Kenalin, gue **Mr. Predi** 😎🎩\nAda yang bisa Mr. Predi bantu hari ini?',
      time: 'Online',
      options: [
        { label: '🚀 Cek Status Server & Kuota', action: 'menu_server' },
        { label: '📱 Racikan Bug SNI Kuota', action: 'menu_sni' },
        { label: '⚡ Tutorial Setup SSH WS & V2Ray', action: 'menu_setup' },
        { label: '🎮 Server Khusus Game (Anti Lag)', action: 'menu_gaming' },
        { label: '💎 Akun Premium & Topup Saldo', action: 'menu_premium' },
        { label: '🛠️ Solusi Bengong / Disconnect / RTO', action: 'menu_troubleshoot' }
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

  const handleAction = (action: string, userLabel?: string) => {
    if (userLabel) {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'user',
          text: userLabel,
          time: getTimeString()
        }
      ]);
    }

    setIsTyping(true);

    setTimeout(() => {
      let replyText = '';
      let replyOptions: Message['options'] = [
        { label: '🏠 Menu Utama Mr. Predi', action: 'main_menu' },
        { label: '🚀 Cek Server Gratis', action: 'menu_server' },
        { label: '📱 Racikan Bug SNI', action: 'menu_sni' }
      ];

      switch (action) {
        case 'main_menu':
          replyText = 'Siap! Ini menu utama Mr. Predi ya Kak. Mau bahas yang mana nih:';
          replyOptions = [
            { label: '🚀 Cek Status Server & Kuota', action: 'menu_server' },
            { label: '📱 Racikan Bug SNI Kuota', action: 'menu_sni' },
            { label: '⚡ Tutorial Setup SSH WS & V2Ray', action: 'menu_setup' },
            { label: '🎮 Server Khusus Game (Anti Lag)', action: 'menu_gaming' },
            { label: '💎 Akun Premium & Topup Saldo', action: 'menu_premium' },
            { label: '🛠️ Solusi Bengong / RTO', action: 'menu_troubleshoot' }
          ];
          break;

        case 'menu_server':
          replyText = '🌐 **Status Server & Kuota Gratis dari Mr. Predi**\n\n• Server kita ada di **Singapore 🇸🇬 dan Indonesia 🇮🇩**.\n• Kuota akun free di-reset otomatis berkala.\n• Kalau server favorit Kakak lagi full, tinggal colek server node lainnya atau tunggu reset ya!';
          replyOptions = [
            { label: '🔄 Gas Buka Halaman Server', action: 'action_goto_servers' },
            { label: '💎 Mau Server VIP Anti Penuh?', action: 'menu_premium' },
            { label: '🏠 Menu Utama', action: 'main_menu' }
          ];
          break;

        case 'menu_sni':
          replyText = '🎯 **Racikan SNI / Bug Host Populer ala Mr. Predi**:\n\n1. **Paket Vidio / Streaming**: `quiz.int.vidio.com` atau `m.vidio.com`\n2. **Paket YouTube / Sosmed**: `m.youtube.com`, `v.whatsapp.net`\n3. **Paket Edukasi / Belajar**: `belajar.kemdikbud.go.id`, `ruangguru.com`\n4. **Paket Meeting / Zoom**: `zoom.us`\n\n*Tips Ganteng dari Mr. Predi:* Pasang bug host ini di kolom **SNI / Server Name Indication** pas generate akun atau di aplikasi VPN!';
          replyOptions = [
            { label: '⚡ Setting di HTTP Custom', action: 'sni_hc' },
            { label: '📱 Setting di v2rayNG', action: 'sni_v2ray' },
            { label: '🏠 Menu Utama', action: 'main_menu' }
          ];
          break;

        case 'sni_hc':
          replyText = '💡 **Cara Pasang di HTTP Custom ala Mr. Predi**:\n\n1. Bikin akun SSH WS di web ini.\n2. Buka HTTP Custom -> Centang **SSH** dan **Payload**.\n3. Masukkan Host/IP dan Port `443` (SSL) atau `80` (Non-TLS).\n4. Pada kolom Bug/SNI, isi bug paket Kakak (contoh: `quiz.int.vidio.com`).\n5. Klik Connect dan nikmati internetan wush! 🚀';
          replyOptions = [
            { label: '📱 Cara Pasang di v2rayNG', action: 'sni_v2ray' },
            { label: '🏠 Menu Utama', action: 'main_menu' }
          ];
          break;

        case 'sni_v2ray':
          replyText = '💡 **Cara Pasang di v2rayNG / V2Box**:\n\n1. Copy config link `vmess://` atau `vless://` yang udah dibuat.\n2. Buka v2rayNG -> Klik tanda **+** -> **Import config from clipboard**.\n3. Klik icon pensil (Edit config) -> cari kolom **SNI / Request Host**.\n4. Isi bug paket Kakak, simpan, lalu pencet Connect!';
          replyOptions = [
            { label: '🏠 Menu Utama', action: 'main_menu' },
            { label: '🛠️ Masih Bengong / RTO?', action: 'menu_troubleshoot' }
          ];
          break;

        case 'menu_setup':
          replyText = '⚡ **Aplikasi Tunneling Rekomendasi Mr. Predi**:\n\n• **Android**: v2rayNG, HTTP Custom, HTTP Injector, NekoBox.\n• **iOS / iPhone**: V2Box, Wings X, Shadowrocket, Streisand.\n• **PC Windows**: v2rayN, NetMod Syna, Clash Verge.\n\nSemua akun di PremDigital TUNNEL udah full CDN Cloudflare, anti ribet!';
          replyOptions = [
            { label: '🎮 Rekomendasi Game Low Ping', action: 'menu_gaming' },
            { label: '🏠 Menu Utama', action: 'main_menu' }
          ];
          break;

        case 'menu_gaming':
          replyText = '🎮 **Server Khusus Gamers (ML, FF, PUBG, Valorant)**:\n\nMr. Predi saranin banget pake **Server Singapore 🇸🇬 atau Indonesia 🇮🇩** jalur **SSH UDP Custom** atau **VLESS gRPC**.\nPing-nya adem bener di kisaran **15ms - 35ms**!';
          replyOptions = [
            { label: '🚀 Buka Daftar Server', action: 'action_goto_servers' },
            { label: '🏠 Menu Utama', action: 'main_menu' }
          ];
          break;

        case 'menu_premium':
          replyText = '💎 **Akun Premium VIP PremDigital TUNNEL**:\n\n• Bandwidth unlimited tanpa kuota harian\n• Port gigabit 1 Gbps ngebut\n• Aktif 30 hari anti expired mendadak\n• Server privat VIP jarang yang make jadi stabil abis!\n\nBisa langsung topup saldo instan via QRIS di web ini loh Kak!';
          replyOptions = [
            { label: '💳 Buka Menu Topup Saldo', action: 'action_goto_topup' },
            { label: '🏠 Menu Utama', action: 'main_menu' }
          ];
          break;

        case 'menu_troubleshoot':
          replyText = '🛠️ **Jurus Sakti Mr. Predi Atasi Bengong / RTO**:\n\n1. **Cek Kuota Asli**: Jangan sampai kuota paketnya 0 KB ya Kak, minimal ada sisa kuota paket bug-nya.\n2. **Jurus Mode Pesawat**: Hidupkan Mode Pesawat 5 detik terus matikan lagi biar dapet IP segar dari BTS provider.\n3. **Cek Bug SNI**: Pastikan SNI masih aktif dan sesuai paket.\n4. **Ganti Port**: Coba ganti antara Port 443 (TLS) dan Port 80 (Non-TLS).';
          replyOptions = [
            { label: '📱 Cek Racikan Bug SNI', action: 'menu_sni' },
            { label: '🚀 Coba Server Lain', action: 'action_goto_servers' },
            { label: '🏠 Menu Utama', action: 'main_menu' }
          ];
          break;

        case 'action_goto_servers':
          replyText = 'Siaaap! Mr. Predi arahin ke halaman server sekarang ya Kak. Tinggal pilih protokolnya!';
          if (onNavigateToServices) onNavigateToServices();
          break;

        case 'action_goto_topup':
          replyText = 'Mantap Kak! Mr. Predi bukakan popup Topup Saldo ya.';
          if (onOpenTopup) onOpenTopup();
          break;

        default:
          replyText = 'Sip Kak! Ada hal lain yang mau ditanyakan ke Mr. Predi? Monggo tanya aja!';
          break;
      }

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'mr_predi',
          text: replyText,
          time: getTimeString(),
          options: replyOptions
        }
      ]);
      setIsTyping(false);
    }, 650);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    const query = inputVal.trim();
    const nowTime = getTimeString();

    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'user',
        text: query,
        time: nowTime
      }
    ]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      const q = query.toLowerCase();
      let replyText = '';
      let replyOptions: Message['options'] = [
        { label: '🏠 Menu Utama', action: 'main_menu' },
        { label: '🚀 Server Gratis', action: 'menu_server' },
        { label: '🎯 Racikan Bug SNI', action: 'menu_sni' }
      ];

      if (q.includes('predi') || q.includes('mr') || q.includes('siapa') || q.includes('nama') || q.includes('maya') || q.includes('axis')) {
        replyText = 'Halo Kak! Gua **Mr. Predi** 😎🎩 Asisten virtual serba tahu di PremDigital TUNNEL, vibes-nya kayak Maya di AXISnet tapi versi cowok keren ahli tunneling wkwk!\n\nTugas Mr. Predi nemenin Kakak cari bug kuota, config anti bengong, dan server ngebut.';
      } else if (q.includes('sni') || q.includes('bug') || q.includes('kuota') || q.includes('vidio') || q.includes('axis') || q.includes('tsel') || q.includes('isat') || q.includes('tri') || q.includes('xl')) {
        replyText = 'Soal **Bug SNI Kuota**, Kakak tinggal cocokin sama kuota yang lagi aktif di kartu Kakak (Vidio, Ruangguru, YouTube, Sosmed, dll).\n\nMau Mr. Predi kasih list SNI yang lagi joss sekarang?';
        replyOptions = [
          { label: '🎯 Buka List SNI Populer', action: 'menu_sni' },
          { label: '⚡ Tutorial Pasang di App', action: 'menu_setup' }
        ];
      } else if (q.includes('v2ray') || q.includes('vmess') || q.includes('vless') || q.includes('trojan')) {
        replyText = 'Semua config V2Ray VMess, VLESS, dan Trojan di PremDigital udah ready support TLS/SSL Cloudflare CDN. Copy link vmess:// atau vless:// langsung gas ke v2rayNG!';
        replyOptions = [
          { label: '📱 Tutorial Setting di v2rayNG', action: 'sni_v2ray' },
          { label: '🚀 Cek Server Ready', action: 'action_goto_servers' }
        ];
      } else if (q.includes('game') || q.includes('ml') || q.includes('ff') || q.includes('pubg') || q.includes('ping') || q.includes('lag')) {
        replyText = 'Buat gaming low ping, langsung hajar server **Singapore atau Indonesia** jalur SSH UDP Custom / VLESS gRPC. Ping stabil 15-35 ms!';
        replyOptions = [
          { label: '🎮 Rekomendasi Game', action: 'menu_gaming' },
          { label: '🚀 Pilih Server', action: 'action_goto_servers' }
        ];
      } else if (q.includes('rto') || q.includes('disconnect') || q.includes('bengong') || q.includes('gagal') || q.includes('error')) {
        replyText = 'Koneksi bengong? Santai Kak, coba trik andalan Mr. Predi: nyalakan **Mode Pesawat** 5 detik lalu matikan lagi biar BTS ngasih IP baru yang seger!';
        replyOptions = [
          { label: '🛠️ Baca Solusi RTO Lengkap', action: 'menu_troubleshoot' },
          { label: '🚀 Coba Ganti Server', action: 'action_goto_servers' }
        ];
      } else if (q.includes('harga') || q.includes('beli') || q.includes('premium') || q.includes('vip') || q.includes('bayar') || q.includes('topup') || q.includes('saldo')) {
        replyText = 'Akun VIP / Premium PremDigital TUNNEL aktif 30 hari penuh, server privat, speed gigabit, dan anti rebutan kuota reset!';
        replyOptions = [
          { label: '💳 Topup Saldo Sekarang', action: 'action_goto_topup' },
          { label: '🏠 Menu Utama', action: 'main_menu' }
        ];
      } else {
        replyText = `Yo Kak! Mr. Predi siap bantu seputar SSH WS, V2Ray, bug SNI, atau error koneksi. Klik salah satu menu di bawah atau langsung ketik pertanyaan Kakak ya!`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'mr_predi',
          text: replyText,
          time: getTimeString(),
          options: replyOptions
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'mr_predi',
        text: 'Obrolan baru telah dimulai! Yo Kak, gue **Mr. Predi** siap nemenin lagi. Mau dibantu apa nih?',
        time: 'Online',
        options: [
          { label: '🚀 Cek Status Server & Kuota', action: 'menu_server' },
          { label: '📱 Racikan Bug SNI Kuota', action: 'menu_sni' },
          { label: '⚡ Tutorial Setup SSH WS & V2Ray', action: 'menu_setup' },
          { label: '🎮 Server Khusus Game', action: 'menu_gaming' },
          { label: '💎 Akun Premium & Topup Saldo', action: 'menu_premium' },
          { label: '🛠️ Solusi Bengong / RTO', action: 'menu_troubleshoot' }
        ]
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-end sm:right-6 sm:bottom-6 sm:left-auto justify-center pointer-events-none p-0 sm:p-4">
      {/* Main Chat Container */}
      <div 
        className={`pointer-events-auto w-full sm:w-[430px] bg-[#0f0a28] border border-purple-500/30 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-purple-950/90 flex flex-col transition-all duration-300 overflow-hidden ${
          isMinimized ? 'h-[70px]' : 'h-[85vh] sm:h-[630px] max-h-[92vh]'
        }`}
      >
        {/* Header ala Maya AXISnet versi Mr. Predi */}
        <div className="bg-gradient-to-r from-[#1b1146] via-[#2d186f] to-[#180e3f] px-4 py-3 border-b border-purple-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Mr. Predi Avatar with Hat/Cool Badge */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#0e0924] flex items-center justify-center text-white relative">
                  <span className="text-xl font-black tracking-tight bg-gradient-to-br from-purple-200 to-pink-300 bg-clip-text text-transparent">
                    🎩
                  </span>
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1b1146] ring-1 ring-emerald-400/50"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                  Mr. Predi
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-purple-900/90 text-purple-200 border border-purple-400/40">
                    PRO ASSISTANT
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-purple-300/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Online
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

        {/* Chat Body (hidden if minimized) */}
        {!isMinimized && (
          <>
            {/* Quick Slogan Bar */}
            <div className="bg-purple-950/50 border-b border-purple-500/10 px-4 py-2 flex items-center justify-between text-[11px] text-purple-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>Tanya bug SNI, V2Ray, SSH WS, atau server ke Mr. Predi!
                </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a061d]/85 backdrop-blur">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Tag */}
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                    {msg.sender === 'mr_predi' ? (
                      <span className="text-purple-300 font-extrabold flex items-center gap-1">
                        🎩 Mr. Predi
                      </span>
                    ) : (
                      <span className="font-semibold">Kamu</span>
                    )}
                    <span>• {msg.time}</span>
                  </div>

                  {/* Message Bubble */}
                  <div 
                    className={`max-w-[88%] p-3.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-[#150e38] border border-purple-500/30 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Interactive Quick Buttons */}
                  {msg.sender === 'mr_predi' && msg.options && msg.options.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[95%]">
                      {msg.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAction(opt.action, opt.label)}
                          disabled={isTyping}
                          className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-800/90 border border-purple-500/30 text-purple-200 text-xs font-medium flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50 text-left shadow-sm hover:text-white cursor-pointer"
                        >
                          <span>{opt.label}</span>
                          <ChevronRight className="w-3 h-3 text-purple-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-purple-300 font-bold">
                    <span>🎩 Mr. Predi lagi ngetik...</span>
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
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Tanya apa aja ke Mr. Predi..."
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
