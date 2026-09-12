export type ProtocolType = 'ssh' | 'vmess' | 'vless' | 'trojan';

export type ActiveView = 'home' | 'ssh-servers' | 'ssh-create';

export interface ProtocolService {
  id: ProtocolType;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  iconName: string;
  color: string;
  freeTrialDays: number;
  features: string[];
}

export interface TunnelServer {
  id: string;
  country: string;
  countryCode: string;
  flag: string;
  city: string;
  host: string;
  ip: string;
  load: number;
  ping: number;
  totalSlots: number;
  usedSlots: number;
  supportedProtocols: ProtocolType[];
  isVip?: boolean;
  limitCreated?: number;
  leftCreated?: number;
  freeActiveDays?: number;
}

export interface GeneratedAccount {
  protocol: ProtocolType;
  server: TunnelServer;
  username: string;
  password?: string;
  uuid?: string;
  expiryDate: string;
  activeDays: number;
  sni: string;
  ports: {
    sslTls?: number;
    dropbear?: number;
    openSsh?: number;
    wsCdn?: number;
    udpCustom?: string;
    v2rayPort?: number;
    trojanPort?: number;
  };
  configString?: string;
  payloadString?: string;
  rawConfig?: string;
  createdAt: string;
}

export interface PlatformStat {
  activeServers: number;
  servicesToday: number;
  totalAccounts: number;
  onlineUsers: number;
  breakdown: {
    ssh: number;
    trojan: number;
    vmess: number;
    vless: number;
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface VpsNode {
  id: string;
  name: string;
  ip: string;
  city?: string;
  country?: string;
  countryCode?: string;
  onlineUsers: number;
  cpuLoad: number;
  ramUsage: number;
  status: 'Online' | 'Down';
  lastHeartbeat: string;
  sshOnline?: number;
  xrayOnline?: number;
}
