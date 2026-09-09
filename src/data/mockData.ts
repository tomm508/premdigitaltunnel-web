import { ProtocolService, TunnelServer, FaqItem } from '../types';

export const PROTOCOL_SERVICES: ProtocolService[] = [
  {
    id: 'ssh',
    name: 'Create SSH Tunneling',
    badge: 'SSH Tunnel',
    tagline: 'Secure SSH tunneling with WebSocket and UDP options.',
    description: 'High-speed SSH tunnel supporting SSL/TLS Stunnel, Dropbear, OpenSSH, WebSocket CDN, and UDP Custom for gaming & streaming.',
    iconName: 'Share2',
    color: 'from-blue-600 to-indigo-600',
    freeTrialDays: 3,
    features: [
      '3 days free trial + renew options',
      '3 days 7 days or 30 days renewals',
      'Easy setup guides & global regions',
      'WebSocket, Dropbear & UDP Custom'
    ]
  },
  {
    id: 'vmess',
    name: 'Create V2Ray Vmess',
    badge: 'V2Ray Vmess',
    tagline: 'V2ray Vmess with modern transports WebSocket Cloudflare CDN.',
    description: 'Robust VMess protocol with dynamic UUID security, Cloudflare CDN integration, TLS encryption, and anti-censorship routing.',
    iconName: 'Zap',
    color: 'from-emerald-500 to-teal-600',
    freeTrialDays: 3,
    features: [
      '3 days free trial + renew options',
      '3 days 7 days or 30 days renewals',
      'WebSocket, gRPC, HTTP/2, QUIC',
      'Anti-DPI & Cloudflare CDN CDN ready'
    ]
  },
  {
    id: 'vless',
    name: 'Create Xray Vless',
    badge: 'Xray Vless',
    tagline: 'Xray Vless with modern transports WebSocket Cloudflare CDN.',
    description: 'Next-generation lightweight VLESS protocol without redundant encryption overhead, delivering ultra-fast throughput and low battery drain.',
    iconName: 'Shield',
    color: 'from-pink-500 to-purple-600',
    freeTrialDays: 3,
    features: [
      '3 days free trial + renew options',
      '3 days 7 days or 30 days renewals',
      'WebSocket, gRPC, HTTP/2, QUIC',
      'XTLS & Reality support'
    ]
  },
  {
    id: 'trojan',
    name: 'Create Trojan VPN',
    badge: 'Trojan VPN',
    tagline: 'Trojan VPN 443 Websocket CDN Cloudflare - blends with normal HTTPS.',
    description: 'Bypasses the toughest firewalls by disguising tunneling traffic as standard HTTPS web browsing over Port 443 with TLS 1.3.',
    iconName: 'Lock',
    color: 'from-red-500 to-amber-600',
    freeTrialDays: 3,
    features: [
      '3 days free trial + renew options',
      '3 days 7 days or 30 days renewals',
      'TLS 1.3 powered privacy',
      'Unblockable Port 443 HTTPS mimicry'
    ]
  },
  {
    id: 'openvpn',
    name: 'Create OpenVPN',
    badge: 'OpenVPN',
    tagline: 'Classic compatibility or modern speed — your choice.',
    description: 'Industry standard security with custom certificate authentication, TCP 443 and UDP 1194 options, and multi-OS config import.',
    iconName: 'Key',
    color: 'from-cyan-500 to-blue-600',
    freeTrialDays: 7,
    features: [
      '7 days free trial + renew options',
      '3 days 7 days or 30 days renewals',
      'Config profiles ready to import (.ovpn)',
      'TCP 443 & UDP 1194 high throughput'
    ]
  },
  {
    id: 'wireguard',
    name: 'Create Wireguard VPN',
    badge: 'Wireguard',
    tagline: 'Classic compatibility or modern speed — your choice.',
    description: 'State-of-the-art cryptographic tunnel using ChaCha20 and Curve25519. Instant handshake, seamless roaming, and zero latency.',
    iconName: 'Activity',
    color: 'from-teal-400 to-emerald-500',
    freeTrialDays: 7,
    features: [
      '7 days free trial + renew options',
      '3 days 7 days or 30 days renewals',
      'Config profiles ready to import (.conf)',
      'Ultra low latency for mobile and gaming'
    ]
  }
];

export const SERVERS_LIST: TunnelServer[] = [
  {
    id: 'my-vps-01',
    country: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    city: 'Server Pribadi (My VPS)',
    host: 'sg1.domainanda.com',
    ip: '103.xxx.xxx.xxx',
    load: 12,
    ping: 24,
    totalSlots: 100,
    usedSlots: 5,
    supportedProtocols: ['ssh', 'vmess', 'vless', 'trojan', 'openvpn', 'wireguard'],
    isVip: false
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I create a free VPN SSH Tunneling account?',
    answer: 'Simply navigate to the "Choose Tunneling Service" section, select your preferred protocol (SSH, VMess, VLESS, Trojan, OpenVPN, or WireGuard), choose your server location (such as Singapore or Indonesia), enter your desired username and optional bug host/SNI, and click "Generate Account". Your account credentials, config links, and QR code will be created immediately.'
  },
  {
    question: 'Do you keep logs of my activity?',
    answer: 'No. PremDigital TUNNEL operates with a strict zero-logs policy. Our servers are configured with RAM-only transient routing where no connection metadata, browsing destinations, or user payloads are ever written to disk or preserved.'
  },
  {
    question: 'Which protocol is best for gaming and low latency?',
    answer: 'For competitive gaming (e.g. Mobile Legends, Free Fire, PUBG, Valorant), WireGuard and SSH UDP Custom offer the lowest latency and least protocol packet overhead. For bypassing firewalls with moderate latency, SSH WebSocket or VMess via Cloudflare CDN is recommended.'
  },
  {
    question: 'What is Bug Host / SNI (Server Name Indication)?',
    answer: 'A Bug Host or SNI is a domain name used in the TLS handshake header or HTTP Host request (e.g., m.youtube.com, zoom.us) to allow tunnel traffic to pass through captive portals, zero-rated ISP packages, or strict censorship firewalls that only whitelist specific domain categories.'
  },
  {
    question: 'How do I renew my account when it expires?',
    answer: 'Free accounts are valid for 3 to 7 days depending on the protocol. Once expired or within 24 hours of expiry, you can easily renew the account with the same username on our website, or generate a fresh account in just 2 clicks.'
  },
  {
    question: 'Can I use these configurations on Android, iPhone, and PC?',
    answer: 'Yes! Our generated accounts can be imported into popular tunneling apps across all platforms: v2rayNG, V2Box, Sing-box, NapsternetV, NetMod Syna, HTTP Injector, Clash / Clash Verge, OpenVPN Connect, and the official WireGuard app.'
  }
];

export const INITIAL_STATS = {
  activeServers: 19,
  servicesToday: 24,
  totalAccounts: 47466,
  onlineUsers: 2170,
  breakdown: {
    ssh: 18,
    openvpn: 2,
    trojan: 1,
    vmess: 2,
    vless: 1,
    wireguard: 0
  }
};
