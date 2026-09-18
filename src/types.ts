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
  domain?: string;
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
  domain?: string;
  host?: string;
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

export interface UserServiceAccount {
  id: string;
  protocol: ProtocolType;
  username: string;
  password?: string;
  uuid?: string;
  server: TunnelServer;
  activeDays: number;
  expiredAt: string;
  createdAt: string;
  type: 'free' | 'premium';
  status: 'active' | 'expired';
  configString?: string;
  payloadString?: string;
  rawConfig?: string;
}

export interface TransactionItem {
  id: string;
  type: 'topup' | 'service_creation' | 'server_migration';
  title: string;
  description?: string;
  amount: number;
  status: 'success' | 'pending' | 'rejected' | 'failed';
  paymentMethod?: string;
  createdAt: string;
  protocol?: ProtocolType;
  serverName?: string;
}

export interface DnsRecord {
  id: string;
  hostname: string;
  subdomain: string;
  type: 'A' | 'CNAME' | 'AAAA' | 'TXT';
  target: string;
  ttl: number;
  proxied: boolean;
  createdAt: string;
  status: 'Active' | 'Propagating';
}
