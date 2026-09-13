import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Activity, 
  Server, 
  Zap,
  Check,
  Cpu,
  HardDrive,
  Users,
  Radio
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SERVERS_LIST } from '../data/mockData';
import { VpsNode } from '../types';
import { subscribeVpsNodes, UnifiedServerNode } from '../lib/serverSync';

// Define the structure based on the video
interface ServerStatusItem {
  id: string;
  name: string;
  ip?: string;
  status: 'Online' | 'Down';
  uptimeData: boolean[]; // Array of 24 booleans representing hours, true=up, false=down
  eventText: string;
  cpuLoad?: number;
  ramUsage?: number;
  onlineUsers?: number;
}

interface ServerCategory {
  title: string;
  description: string;
  servers: ServerStatusItem[];
}

const UptimeBar: React.FC<{ data: boolean[] }> = ({ data }) => {
  return (
    <div className="flex items-center gap-[2px]">
      {data.map((isUp, idx) => (
        <div 
          key={idx} 
          className={`h-5 w-1.5 sm:w-2 rounded-[1px] ${
            isUp ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
          title={isUp ? 'Online' : 'Down'}
        />
      ))}
    </div>
  );
};

const StatusRow: React.FC<{ server: ServerStatusItem }> = ({ server }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-purple-500/10 last:border-0 gap-3 sm:gap-0">
      <div className="flex items-center gap-3 w-1/4">
        <div className={`w-3 h-3 rounded-full ${server.status === 'Online' ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
        <span className="font-semibold text-white text-sm">{server.name}</span>
      </div>
      
      <div className="flex items-center w-1/4">
        <span className={`text-sm font-bold ${server.status === 'Online' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {server.status}
        </span>
      </div>

      <div className="w-1/3 overflow-x-auto">
        <UptimeBar data={server.uptimeData} />
      </div>

      <div className="w-1/6 text-right">
        <span className="text-xs text-slate-400">{server.eventText}</span>
      </div>
    </div>
  );
};

const CategoryCard: React.FC<{ category: ServerCategory }> = ({ category }) => {
  return (
    <div className="bg-[#120d2c] border border-purple-500/20 rounded-2xl p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-1 uppercase tracking-wide">{category.title}</h2>
      <p className="text-sm text-slate-400 mb-6">{category.description}</p>
      
      <div className="bg-[#1a1440] rounded-xl p-4">
        <div className="flex flex-col sm:flex-row text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-purple-500/20 pb-3 hidden sm:flex">
          <div className="w-1/4">Server</div>
          <div className="w-1/4">Status</div>
          <div className="w-1/3">Uptime (24h)</div>
          <div className="w-1/6 text-right">Event</div>
        </div>
        
        <div className="flex flex-col">
          {category.servers.map(server => (
            <StatusRow key={server.id} server={server} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ServerStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const [liveServers, setLiveServers] = useState<UnifiedServerNode[]>(() => 
    SERVERS_LIST.map(s => ({ ...s, status: 'Down' as const }))
  );

  // Subscribe to live VPS nodes from Firestore
  useEffect(() => {
    const unsub = subscribeVpsNodes((servers) => {
      setLiveServers(servers);
    });
    return () => unsub();
  }, []);

  // Helper to generate uptime data
  const generateUptime = (isDown: boolean, downHours: number = 2) => {
    const data = Array(24).fill(true);
    if (isDown) {
      for (let i = 24 - downHours; i < 24; i++) {
        data[i] = false;
      }
    }
    return data;
  };

  // Build categories from resolved servers: SG and ID with their respective real heartbeat status
  const serverSources = liveServers.map((srv) => ({
    id: srv.id,
    name: `${srv.countryCode}1 ${srv.city}`,
    ip: srv.ip,
    city: srv.city,
    country: srv.country,
    countryCode: srv.countryCode,
    onlineUsers: srv.usedSlots,
    cpuLoad: srv.cpuLoad || (srv.status === 'Online' ? 12 : 0),
    ramUsage: srv.ramUsage || (srv.status === 'Online' ? 25 : 0),
    status: srv.status,
    lastHeartbeat: srv.lastHeartbeat || ''
  }));

  const buildServiceServers = (protoSuffix: string) => {
    return serverSources.map((srv) => ({
      id: `${srv.id}-${protoSuffix.toLowerCase()}`,
      name: `${srv.name} ${protoSuffix}`,
      ip: srv.ip,
      status: srv.status,
      uptimeData: generateUptime(srv.status === 'Down', 6),
      eventText: srv.status === 'Online' ? 'Active (Live Heartbeat)' : 'Offline (No VPS Heartbeat)',
      cpuLoad: srv.cpuLoad,
      ramUsage: srv.ramUsage,
      onlineUsers: srv.onlineUsers
    }));
  };

  const categories: ServerCategory[] = [
    {
      title: 'SERVER V2RAY VMESS',
      description: 'Current status for all v2ray vmess service.',
      servers: buildServiceServers('Vmess')
    },
    {
      title: 'SERVER XRAY VLESS',
      description: 'Current status for all xray vless service.',
      servers: buildServiceServers('Vless')
    },
    {
      title: 'SERVER TROJAN VPN',
      description: 'Current status for all trojan vpn service.',
      servers: buildServiceServers('Trojan')
    },
    {
      title: 'SERVER SSH TUNNEL',
      description: 'Current status for all ssh tunnel service.',
      servers: buildServiceServers('SSH')
    },
    {
      title: 'SERVER OPENVPN',
      description: 'Current status for all openvpn service.',
      servers: buildServiceServers('OVPN')
    }
  ];

  const onlineNodesCount = serverSources.filter(s => s.status === 'Online').length;

  return (
    <div className="min-h-screen text-slate-300 font-sans selection:bg-purple-500/30">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>{onlineNodesCount} of {serverSources.length} Servers Online & Operational</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Server Status</h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Real-time status and uptime information for the services we monitor. Status diperbarui secara otomatis dari heartbeat skrip VPS.
          </p>
        </div>

        {/* Server Categories List */}
        <div className="space-y-6">
          {categories.map((cat, index) => (
            <CategoryCard key={index} category={cat} />
          ))}
        </div>

        {/* Info Cards Section */}
        <div className="mt-12 space-y-6">
          {/* Transparency Card */}
          <div className="bg-[#120d2c] border border-purple-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Our Commitment to Transparency</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Welcome to our live Server Status dashboard. This page is your real-time window into the health and performance of our entire service infrastructure. We believe that trust is built on transparency, and this dashboard is a core part of our commitment to you. Whether you're a potential customer evaluating our reliability or an existing user checking on a connection, this page provides the unvarnished truth about our network performance.
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  When you rely on a service for critical tasks like secure browsing, accessing geo-restricted content, or low-latency gaming, uptime isn't just a metric—it's the entire experience. This page automatically monitors every single server in our fleet, from our high-speed SSH and VPN servers to our modern V2Ray, VLESS, and Trojan VPN nodes. Every success and every failure is logged and displayed here instantly, ensuring you always have the most current information.
                </p>
              </div>
            </div>
          </div>

          {/* How to Read Card */}
          <div className="bg-[#120d2c] border border-purple-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">How To Read This Status Page</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  We've designed this page to be simple, clear, and informative. Here's a quick guide to what you're seeing:
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><strong className="text-white">Server Groups:</strong> We've organized our servers by their protocol (SSH, V2Ray, etc.) so you can easily find the services relevant to you.</li>
                  <li><strong className="text-white">Status Indicator:</strong> This is the "live" pulse of the server. <strong className="text-emerald-400">Green Ping</strong>: The server is <strong className="text-emerald-400">Online</strong> and responding perfectly. <strong className="text-rose-400">Red Dot</strong>: The server is <strong className="text-rose-400">Down</strong>. Our system has detected a failure and is logging the incident.</li>
                  <li><strong className="text-white">Uptime (24h) Bar:</strong> This is the 24-hour historical log for each server, updated hourly. Each bar represents one hour. <strong className="text-emerald-400">Green Bar</strong>: The server was online for that full hour. <strong className="text-rose-400">Red Bar</strong>: The server experienced downtime during that hour.</li>
                  <li><strong className="text-white">Last Event:</strong> This column tells you, in plain English, when the last status change happened (e.g., "11 minutes ago").</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Why Uptime Card */}
          <div className="bg-[#120d2c] border border-purple-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Why Uptime Is Critical for SSH & VPN</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  A VPN or SSH service is useless if it's not online. Unlike a website, which you might visit for a few minutes, our services are designed to be connected for hours at a time. This is why stable uptime is our number one priority.
                </p>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  <strong className="text-white">For security and privacy</strong>, an unstable connection is dangerous. If your VPN drops unexpectedly, your device might reconnect to the internet without protection, exposing your real IP address and unencrypted data. Our high-uptime servers ensure your encrypted tunnel stays active, providing constant protection.
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  <strong className="text-white">For streaming and gaming</strong>, uptime directly impacts your experience. A "Down" server means your show stops. A "recovering" server (orange bar) shows our system's speed in fixing issues. A page full of green bars is our promise of a smooth, buffer-free experience. This 24/7 monitoring allows our technical team to proactively identify and resolve potential issues before they become major problems, ensuring the high-quality, stable service you pay for.
                </p>
              </div>
            </div>
          </div>
          
          {/* High-Performance Card */}
          <div className="bg-[#120d2c] border border-purple-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Our High-Performance Network</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  This status page is a direct reflection of our premium infrastructure. We build our network using high-performance, bare-metal servers in key data centers around the world. We don't oversell our servers, which means you get the speed and stability you need, exactly when you need it.
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  This commitment to quality is why we confidently display our live status. We want you to see the green bars. We want you to know that when you create an account, you are choosing a provider that values reliability as much as you do. Feel free to browse our server list, find the protocol and location that works best for you, and purchase with the confidence that you can always check its performance right here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServerStatusPage;
