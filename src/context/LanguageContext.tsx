import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
  isTranslating: boolean;
  triggerGoogleTranslate: (targetLang?: string) => void;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.free': 'Free Accounts',
    'nav.tools': 'Tools',
    'nav.faq': 'FAQ',
    'nav.stats': 'Statistics',
    'nav.server_status': 'Server Status',
    'nav.login': 'Sign In',
    'nav.dashboard': 'Dashboard',
    'nav.admin': 'Admin',
    'nav.balance': 'Balance',
    'nav.topup': 'Top Up',
    'nav.logout': 'Sign Out',
    'nav.my_ip': 'My IP Location',
    'nav.dns_check': 'DNS Checker',
    'nav.ping_test': 'Ping Test',
    'nav.host_to_ip': 'Host to IP',
    'nav.subdomain_finder': 'Subdomain Finder',
    'nav.ai_chat': 'Chat With AI',

    // Hero
    'hero.badge': 'Keep Alive & Secure, by premdigital.web.id',
    'hero.title_prefix': 'Fast Secure',
    'hero.title_highlight': 'SSH VPN Tunneling',
    'hero.subtitle': 'Create VPN and SSH tunneling accounts in seconds. SSH Tunnel WebSocket, V2Ray Vmess, Xray Vless, Trojan VPN with global high-speed servers and zero logs policy.',
    'hero.encryption': 'Secure Encryption',
    'hero.servers': 'Global Servers',
    'hero.speed': 'High Speed',
    'hero.zero_log': 'Zero Logging',
    'hero.btn_free': 'Free Accounts',
    'hero.btn_protocols': 'Explore Protocols',
    'hero.btn_status': 'Server Status',

    // Protocols
    'protocols.title': 'Choose Your Tunneling Protocol',
    'protocols.subtitle': 'Select from our wide range of high-performance encrypted tunneling protocols.',
    'protocols.ssh': 'SSH Tunnel WebSocket',
    'protocols.ssh_desc': 'Classic SSH tunnel with HTTP custom payload and WebSocket Cloudflare CDN support.',
    'protocols.vmess': 'V2Ray VMess',
    'protocols.vmess_desc': 'Popular proxy protocol with TLS/gRPC and WebSocket obfuscation.',
    'protocols.vless': 'Xray VLESS',
    'protocols.vless_desc': 'Lightweight next-gen protocol with XTLS Vision and minimal overhead.',
    'protocols.trojan': 'Trojan VPN',
    'protocols.trojan_desc': 'Mimics standard HTTPS web traffic to bypass tough deep packet inspection.',
    'protocols.select_server': 'Select Server',

    // Statistics
    'stats.live_badge': 'Live Statistics',
    'stats.title': 'Platform Statistics',
    'stats.subtitle': 'Real-time statistics of our VPN and SSH tunneling platform',
    'stats.active_servers': 'Active Servers',
    'stats.active_servers_sub': 'Global infrastructure',
    'stats.services_today': 'Services Today',
    'stats.services_today_sub': 'Created today',
    'stats.total_accounts': 'Total Accounts',
    'stats.total_accounts_sub': 'All time created',
    'stats.total_visitors': 'Total Visitors',
    'stats.total_visitors_sub': 'Website visitors entered',
    'stats.breakdown_title': "Today's Service Breakdown",

    // Dashboard
    'dash.title': 'Dashboard',
    'dash.welcome': 'Welcome back',
    'dash.balance_card': 'ACCOUNT BALANCE',
    'dash.topup_btn': 'Top Up Balance',
    'dash.view_tx': 'View Transactions',
    'dash.transactions_title': 'TRANSACTIONS',
    'dash.history_title': 'History & Activity',
    'dash.history_desc': 'View all deposit and account purchase records',
    'dash.free_feature': 'FREE FEATURE',
    'dash.free_services': 'Free Services',
    'dash.free_services_sub': 'Active free trials (3-7 days)',
    'dash.premium_services': 'Premium Services',
    'dash.premium_services_sub': 'Active 30-day VIP accounts',
    'dash.dns_records': 'DNS Records',
    'dash.dns_records_sub': 'Custom subdomains & pointing',
    'dash.migrate_feature': 'Free Server Migration',
    'dash.migrate_banner': 'Switch your VPN account to any server anytime with zero extra fees! Your username, password, and active days remain preserved.',
    'dash.view_active': 'View Active Services',
    'dash.manage_dns': 'Manage DNS Records',
    'dash.manage': 'Manage',
    'dash.special_promo': 'Special Promotion',
    'dash.discount_info': 'Enjoy up to %DISCOUNT%% discount on all premium service purchases! Balance is ready to use anytime.',
    'dash.member_since': 'Member since',
    'dash.user_settings': 'User Settings',
    'dash.my_services': 'Your Active Services',
    'dash.my_services_sub': 'Manage configs, copy credentials, or switch servers instantly',
    'dash.filter_all': 'All',
    'dash.filter_free': 'Free',
    'dash.filter_premium': 'Premium',
    'dash.btn_detail': 'Detail Config',
    'dash.btn_migrate': 'Migrate Server',
    'dash.btn_delete': 'Delete Service',
    'dash.no_services_title': 'No Services Found',
    'dash.no_services_desc': "You haven't created any accounts yet. Create a free SSH, VMess, VLESS, or Trojan account now!",
    'dash.no_filtered_services': 'No services found in this filter category.',
    'dash.show_all_services': 'Show All Services',
    'dash.active_status': 'Active',
    'dash.expired': 'Expired',
    'dash.days_left_prefix': 'Remaining',
    'dash.days': 'Days',
    'dash.no_services': 'No active services yet.',
    'dash.create_first': 'Create Your First Account',

    // Modals
    'modal.create_acc': 'Create Account',
    'modal.migrate_title': 'Free Server Migration',
    'modal.dns_title': 'DNS Records Management',
    'modal.tx_title': 'Transaction History',
    'modal.topup_title': 'Top Up Account Balance',
    'modal.copy_config': 'Copy Config',
    'modal.download_txt': 'Download File',
    'modal.scan_qr': 'Scan QR Code',
    'modal.close': 'Close',

    // Transactions
    'tx.status_success': 'Success',
    'tx.status_pending': 'Pending Verification',
    'tx.status_rejected': 'Rejected',
    'tx.modal_title': 'Transaction History',
    'tx.modal_subtitle': 'Deposit records, service purchases, and server migrations',
    'tx.current_balance': 'Your Account Balance',
    'tx.tab_all': 'All',
    'tx.tab_deposit': 'Deposit',
    'tx.tab_services': 'VPN Services',
    'tx.tab_migration': 'Migrate Server',
    'tx.loading': 'Loading transaction history...',
    'tx.empty_title': 'No Transactions Yet',
    'tx.empty_topup': "You haven't made any balance deposits yet.",
    'tx.empty_migration': "You haven't performed any server migrations yet.",
    'tx.empty_general': 'No activity history found in this category.',
    'tx.deposit_now': 'Deposit Balance Now',
    'tx.amount_label': 'Amount',
    'tx.free_badge': 'FREE (Rp 0)',
    'tx.showing': 'Showing',
    'tx.items': 'transactions',

    // Server Migration
    'migrate.modal_title': 'Migrate VPN Server',
    'migrate.free_badge': '100% FREE',
    'migrate.modal_sub': 'Move your account to any server anytime without extra fees and retain all remaining active days',
    'migrate.success_title': 'Server Migration Successful!',
    'migrate.success_desc': 'Account',
    'migrate.success_to': 'has been successfully moved to',
    'migrate.active_period': 'Active Period',
    'migrate.left': 'Left',
    'migrate.new_cfg': 'New Config',
    'migrate.done_btn': 'Done & Return',
    'migrate.current_server': 'CURRENT SERVER',
    'migrate.target_badge': 'TARGET',
    'migrate.target_server': 'TARGET SERVER',
    'migrate.cost_label': 'Cost',
    'migrate.free_cost': 'FREE',
    'migrate.select_target_prompt': 'Select target server below',
    'migrate.select_new_server': 'Select New Target Server',
    'migrate.available_prefix': 'Available',
    'migrate.servers_word': 'Servers',
    'migrate.current_word': 'Current',
    'migrate.guarantee_title': 'PremDigital Server Migration Guarantee',
    'migrate.guarantee_1': 'Username, password, and protocol remain completely identical.',
    'migrate.guarantee_2': 'Remaining active period is fully transferred automatically.',
    'migrate.guarantee_3': 'Old server credentials transition seamlessly to the new node.',
    'migrate.migrating_btn': 'Migrating Server...',
    'migrate.confirm_btn': 'Confirm Migration (Free)',
    'migrate.proto_label': 'Protocol',
    'migrate.user_label': 'User',

    // DNS Records
    'dns.modal_title': 'DNS Records & Subdomain Pointing',
    'dns.modal_sub': 'Manage free Cloudflare domain/subdomain pointing for your VPN and tunnel servers',
    'dns.add_title': 'Add New Subdomain / DNS Record',
    'dns.subdomain_name': 'Subdomain Name',
    'dns.subdomain_placeholder': 'e.g. myserver1',
    'dns.preview_label': 'Preview',
    'dns.type_label': 'Type',
    'dns.target_label': 'Target IP / Host',
    'dns.use_vps_ip': 'Use VPS IP',
    'dns.proxied_label': 'Cloudflare Proxied (CDN On)',
    'dns.dnsonly_label': 'DNS Only (Bypass CDN - SSH/VPN Recommended)',
    'dns.save_btn': 'Save DNS Record',
    'dns.your_records': 'Your DNS Records',
    'dns.cf_integrated': 'Active domain pointing with Cloudflare integration',
    'dns.empty_title': 'No DNS Records Yet',
    'dns.empty_desc': 'Create your first custom subdomain above to point any VPS IP with',
    'dns.copy_hostname': 'Copy Hostname',
    'dns.checking': 'Checking...',
    'dns.test_btn': 'Test DNS',
    'dns.delete_title': 'Delete Record',
    'dns.footer_count': 'DNS Subdomains Registered',

    // Footer
    'footer.desc': 'High speed SSH and VPN tunneling platform offering free and premium services worldwide with Cloudflare CDN integration.',
    'footer.quick_links': 'Quick Links',
    'footer.protocols': 'Protocols',
    'footer.rights': 'All rights reserved.',

    // General
    'lang.name': 'English',
    'lang.switch': 'Switch Language',
    'lang.translate_all': 'Translate to Any Language'
  },
  id: {
    // Navbar
    'nav.home': 'Beranda',
    'nav.services': 'Layanan',
    'nav.free': 'Akun Gratis',
    'nav.tools': 'Alat Jaringan',
    'nav.faq': 'Tanya Jawab',
    'nav.stats': 'Statistik',
    'nav.server_status': 'Status Server',
    'nav.login': 'Masuk Akun',
    'nav.dashboard': 'Dasbor',
    'nav.admin': 'Admin',
    'nav.balance': 'Saldo',
    'nav.topup': 'Isi Saldo',
    'nav.logout': 'Keluar',
    'nav.my_ip': 'Lokasi IP Saya',
    'nav.dns_check': 'Cek DNS',
    'nav.ping_test': 'Uji Ping',
    'nav.host_to_ip': 'Host ke IP',
    'nav.subdomain_finder': 'Pencari Subdomain',
    'nav.ai_chat': 'Tanya AI Bot',

    // Hero
    'hero.badge': 'Online & Aman, oleh premdigital.web.id',
    'hero.title_prefix': 'Cepat & Aman',
    'hero.title_highlight': 'Tunneling SSH & VPN',
    'hero.subtitle': 'Buat akun VPN dan tunneling SSH dalam hitungan detik. SSH Tunnel WebSocket, V2Ray Vmess, Xray Vless, Trojan VPN dengan server global berkecepatan tinggi tanpa log.',
    'hero.encryption': 'Enkripsi Kuat',
    'hero.servers': 'Server Global',
    'hero.speed': 'Kecepatan Tinggi',
    'hero.zero_log': 'Tanpa Log (Privat)',
    'hero.btn_free': 'Akun Gratis',
    'hero.btn_protocols': 'Jelajahi Protokol',
    'hero.btn_status': 'Status Server',

    // Protocols
    'protocols.title': 'Pilih Protokol Tunneling Anda',
    'protocols.subtitle': 'Pilih dari beragam protokol tunneling terenkripsi berkecepatan tinggi kami.',
    'protocols.ssh': 'SSH Tunnel WebSocket',
    'protocols.ssh_desc': 'Tunnel SSH klasik dengan dukungan custom HTTP payload dan WebSocket Cloudflare CDN.',
    'protocols.vmess': 'V2Ray VMess',
    'protocols.vmess_desc': 'Protokol proxy terpopuler dengan TLS/gRPC dan obfuscation WebSocket.',
    'protocols.vless': 'Xray VLESS',
    'protocols.vless_desc': 'Protokol ringan generasi terbaru dengan XTLS Vision dan performa maksimal.',
    'protocols.trojan': 'Trojan VPN',
    'protocols.trojan_desc': 'Menyerupai lalu lintas HTTPS standar untuk menembus firewall ketat.',
    'protocols.select_server': 'Pilih Server',

    // Statistics
    'stats.live_badge': 'Statistik Langsung',
    'stats.title': 'Statistik Platform',
    'stats.subtitle': 'Statistik real-time platform VPN dan SSH tunneling kami',
    'stats.active_servers': 'Server Aktif',
    'stats.active_servers_sub': 'Infrastruktur global',
    'stats.services_today': 'Layanan Hari Ini',
    'stats.services_today_sub': 'Dibuat hari ini',
    'stats.total_accounts': 'Total Akun',
    'stats.total_accounts_sub': 'Total akun dibuat',
    'stats.total_visitors': 'Total Pengunjung',
    'stats.total_visitors_sub': 'Pengunjung masuk ke web',
    'stats.breakdown_title': 'Rincian Layanan Hari Ini',

    // Dashboard
    'dash.title': 'Dasbor Pengguna',
    'dash.welcome': 'Selamat datang kembali',
    'dash.balance_card': 'SALDO AKUN',
    'dash.topup_btn': 'Top Up Saldo',
    'dash.view_tx': 'Lihat Transaksi',
    'dash.transactions_title': 'TRANSAKSI',
    'dash.history_title': 'Riwayat & Mutasi',
    'dash.history_desc': 'Lihat semua catatan deposit & pembelian akun',
    'dash.free_feature': 'FITUR GRATIS',
    'dash.free_services': 'Layanan Gratis',
    'dash.free_services_sub': 'Akun aktif 3-7 hari',
    'dash.premium_services': 'Layanan Premium',
    'dash.premium_services_sub': 'Akun VIP aktif 30 hari',
    'dash.dns_records': 'Kelola DNS',
    'dash.dns_records_sub': 'Subdomain & Pointing IP',
    'dash.migrate_feature': 'Gratis Pindah Server',
    'dash.migrate_banner': 'Pindahkan akun VPN Anda ke server lain sampai puas tanpa biaya tambahan! Masa aktif dan username akun Anda tetap dipertahankan.',
    'dash.view_active': 'Lihat Layanan Aktif',
    'dash.manage_dns': 'Kelola DNS Records',
    'dash.manage': 'Kelola',
    'dash.special_promo': 'Promo Spesial',
    'dash.discount_info': 'Dapatkan diskon up to %DISCOUNT%% setiap pembelian layanan premium! Saldo Anda siap digunakan kapan saja.',
    'dash.member_since': 'Member sejak',
    'dash.user_settings': 'Pengaturan Pengguna',
    'dash.my_services': 'Layanan Aktif Anda',
    'dash.my_services_sub': 'Kelola config, salin akun, atau pindahkan server secara instan',
    'dash.filter_all': 'Semua',
    'dash.filter_free': 'Gratis',
    'dash.filter_premium': 'Premium',
    'dash.btn_detail': 'Detail Config',
    'dash.btn_migrate': 'Pindah Server',
    'dash.btn_delete': 'Hapus Layanan',
    'dash.no_services_title': 'Belum Ada Layanan',
    'dash.no_services_desc': 'Anda belum membuat akun. Buat akun SSH, VMess, VLESS, atau Trojan gratis sekarang!',
    'dash.no_filtered_services': 'Tidak ada layanan pada kategori filter ini.',
    'dash.show_all_services': 'Tampilkan Semua Layanan',
    'dash.active_status': 'Aktif',
    'dash.expired': 'Kadaluarsa',
    'dash.days_left_prefix': 'Sisa',
    'dash.days': 'Hari',
    'dash.no_services': 'Belum ada layanan aktif.',
    'dash.create_first': 'Buat Akun Pertama Anda',

    // Modals
    'modal.create_acc': 'Buat Akun',
    'modal.migrate_title': 'Pindah Server Gratis',
    'modal.dns_title': 'Kelola Record DNS',
    'modal.tx_title': 'Riwayat Transaksi',
    'modal.topup_title': 'Isi Saldo Akun',
    'modal.copy_config': 'Salin Config',
    'modal.download_txt': 'Unduh File',
    'modal.scan_qr': 'Pindai QR Code',
    'modal.close': 'Tutup',

    // Transactions
    'tx.status_success': 'Berhasil',
    'tx.status_pending': 'Menunggu Verifikasi',
    'tx.status_rejected': 'Ditolak',
    'tx.modal_title': 'Riwayat Transaksi',
    'tx.modal_subtitle': 'Catatan deposit saldo, pembelian layanan, dan pindah server',
    'tx.current_balance': 'Saldo Akun Anda',
    'tx.tab_all': 'Semua',
    'tx.tab_deposit': 'Deposit',
    'tx.tab_services': 'Layanan VPN',
    'tx.tab_migration': 'Pindah Server',
    'tx.loading': 'Memuat riwayat transaksi...',
    'tx.empty_title': 'Belum Ada Transaksi',
    'tx.empty_topup': 'Anda belum pernah melakukan deposit saldo.',
    'tx.empty_migration': 'Anda belum pernah melakukan pemindahan server.',
    'tx.empty_general': 'Belum ada riwayat aktivitas pada kategori ini.',
    'tx.deposit_now': 'Deposit Saldo Sekarang',
    'tx.amount_label': 'Nominal',
    'tx.free_badge': 'GRATIS (Rp 0)',
    'tx.showing': 'Menampilkan',
    'tx.items': 'transaksi',

    // Server Migration
    'migrate.modal_title': 'Pindah Server VPN',
    'migrate.free_badge': 'GRATIS 100%',
    'migrate.modal_sub': 'Pindahkan akun Anda ke server lain kapan saja tanpa biaya & tanpa mengurangi masa aktif',
    'migrate.success_title': 'Pindah Server Berhasil!',
    'migrate.success_desc': 'Akun',
    'migrate.success_to': 'berhasil dipindahkan ke server',
    'migrate.active_period': 'Masa Aktif',
    'migrate.left': 'Lagi',
    'migrate.new_cfg': 'Config Baru',
    'migrate.done_btn': 'Selesai & Kembali',
    'migrate.current_server': 'SERVER SAAT INI',
    'migrate.target_badge': 'TUJUAN',
    'migrate.target_server': 'SERVER TUJUAN',
    'migrate.cost_label': 'Biaya',
    'migrate.free_cost': 'GRATIS',
    'migrate.select_target_prompt': 'Pilih server tujuan di bawah',
    'migrate.select_new_server': 'Pilih Server Tujuan Baru',
    'migrate.available_prefix': 'Tersedia',
    'migrate.servers_word': 'Server',
    'migrate.current_word': 'Saat Ini',
    'migrate.guarantee_title': 'Jaminan Pindah Server PremDigital',
    'migrate.guarantee_1': 'Username, password, dan protokol tetap sama persis.',
    'migrate.guarantee_2': 'Sisa masa aktif otomatis terbawa secara penuh.',
    'migrate.guarantee_3': 'Akun di server lama otomatis dialihkan ke node baru secara instan.',
    'migrate.migrating_btn': 'Memindahkan Server...',
    'migrate.confirm_btn': 'Konfirmasi Pindah (Gratis)',
    'migrate.proto_label': 'Protokol',
    'migrate.user_label': 'User',

    // DNS Records
    'dns.modal_title': 'DNS Records & Subdomain Pointing',
    'dns.modal_sub': 'Kelola pointing domain/subdomain Cloudflare gratis untuk server VPN & tunnel Anda',
    'dns.add_title': 'Tambah Subdomain / DNS Record Baru',
    'dns.subdomain_name': 'Nama Subdomain',
    'dns.subdomain_placeholder': 'contoh: myserver1',
    'dns.preview_label': 'Preview',
    'dns.type_label': 'Tipe',
    'dns.target_label': 'Target IP / Host',
    'dns.use_vps_ip': 'Pakai IP VPS',
    'dns.proxied_label': 'Cloudflare Proxied (CDN On)',
    'dns.dnsonly_label': 'DNS Only (Bypass CDN - Rekomendasi SSH)',
    'dns.save_btn': 'Simpan DNS Record',
    'dns.your_records': 'Daftar DNS Records Anda',
    'dns.cf_integrated': 'Poin domain aktif & terintegrasi Cloudflare',
    'dns.empty_title': 'Belum Ada DNS Record',
    'dns.empty_desc': 'Buat subdomain kustom pertama Anda di atas untuk menghubungkan IP VPS dengan domain',
    'dns.copy_hostname': 'Salin Hostname',
    'dns.checking': 'Memeriksa...',
    'dns.test_btn': 'Uji DNS',
    'dns.delete_title': 'Hapus Record',
    'dns.footer_count': 'Subdomain DNS terdaftar',

    // Footer
    'footer.desc': 'Platform tunneling SSH dan VPN berkecepatan tinggi yang menawarkan layanan gratis dan premium di seluruh dunia dengan integrasi Cloudflare CDN.',
    'footer.quick_links': 'Tautan Cepat',
    'footer.protocols': 'Protokol',
    'footer.rights': 'Seluruh hak cipta dilindungi.',

    // General
    'lang.name': 'Bahasa Indonesia',
    'lang.switch': 'Ganti Bahasa',
    'lang.translate_all': 'Terjemahkan ke Bahasa Lain'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
  isTranslating: false,
  triggerGoogleTranslate: () => {}
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default language is English ('en') as requested by user
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('premdigital_lang');
    if (saved === 'id' || saved === 'en') {
      return saved;
    }
    return 'en'; // Default English
  });
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('premdigital_lang', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    if (translations.en[key]) {
      return translations.en[key];
    }
    return defaultText || key;
  };

  const triggerGoogleTranslate = (targetLang?: string) => {
    setIsTranslating(true);
    // Dynamically load Google Translate Script if not present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'en',
          autoDisplay: false,
          includedLanguages: 'en,id,zh-CN,ja,es,fr,de,ar,ru,ko,th,vi,ms,pt'
        }, 'google_translate_element');
        setIsTranslating(false);
      };
    } else {
      setIsTranslating(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTranslating, triggerGoogleTranslate }}>
      {children}
      {/* Hidden container for Google Translate element */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
