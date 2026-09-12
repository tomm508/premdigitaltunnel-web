import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PickTunneling } from './components/PickTunneling';
import { ServiceList } from './components/ServiceList';
import { Features } from './components/Features';
import { SpeedGuide } from './components/SpeedGuide';
import { Faq } from './components/Faq';
import { CtaBanner } from './components/CtaBanner';
import { Statistics } from './components/Statistics';
import { Footer } from './components/Footer';
import { AccountModal } from './components/AccountModal';
import { ToolsModal } from './components/ToolsModal';
import { AuthModal } from './components/AuthModal';
import { TopupModal } from './components/TopupModal';
import { SshServerList } from './components/SshServerList';
import { SshCreateAccount } from './components/SshCreateAccount';
import { FreeTunneling } from './components/FreeTunneling';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { ServerStatusPage } from './pages/ServerStatusPage';
import { ProtocolType, GeneratedAccount, PlatformStat, TunnelServer } from './types';
import { INITIAL_STATS, SERVERS_LIST } from './data/mockData';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { auth, onSnapshot, doc, db, signOut, getDoc, setDoc, updateDoc, collection } from './lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>('ssh');
  const [selectedServer, setSelectedServer] = useState<TunnelServer | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [recentlyCreatedAccount, setRecentlyCreatedAccount] = useState<GeneratedAccount | null>(null);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState<boolean>(false);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<PlatformStat>(INITIAL_STATS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top and show loader on route change
  useEffect(() => {
    setIsPageLoading(true);
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 400); // 400ms loading effect
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Firebase User & Balance state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [userRole, setUserRole] = useState<'member' | 'admin'>('member');

  // Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore User Profile & Balance Listener
  useEffect(() => {
    if (!currentUser) {
      setUserBalance(0);
      return;
    }

    const unsubUser = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserBalance(data.balance ?? 0);
        setUserRole(currentUser.email === 'agustiantomi80@gmail.com' ? 'admin' : (data.role ?? 'member'));
      }
    }, (err) => {
      console.warn("Firestore snapshot error:", err);
    });

    return () => unsubUser();
  }, [currentUser]);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('premdigital_theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  // Real-time Platform Statistics Activity
  useEffect(() => {
    const initStats = async () => {
      try {
        const statsRef = doc(db, 'platform', 'stats');
        const docSnap = await getDoc(statsRef);
        if (!docSnap.exists()) {
          await setDoc(statsRef, INITIAL_STATS);
        } else {
          const d = docSnap.data();
          // If Firestore still holds the initial old 47466 / 19 mock data, clean it up to match reality
          if (d.activeServers === 19 && d.totalAccounts === 47466) {
            await setDoc(statsRef, INITIAL_STATS);
          }
        }
      } catch (e) {
        console.warn("Failed to init stats", e);
      }
    };
    initStats();

    let liveNodesActiveCount: number | null = null;
    let liveNodesOnlineUsers: number | null = null;

    // Listen to vps_nodes collection to automatically aggregate activeServers and onlineUsers across 1 or more VPS
    const unsubNodes = onSnapshot(collection(db, 'vps_nodes'), (snap) => {
      if (!snap.empty) {
        const now = Date.now();
        let onlineCount = 0;
        let activeNodes = 0;

        snap.forEach((doc) => {
          const node = doc.data();
          // If heartbeat was reported in the last 15 minutes (or marked online), consider active
          const lastHbTime = node.lastHeartbeat ? new Date(node.lastHeartbeat).getTime() : 0;
          const isRecentlyActive = (now - lastHbTime) < 15 * 60 * 1000 || node.status === 'Online';
          if (isRecentlyActive) {
            activeNodes += 1;
            onlineCount += Number(node.onlineUsers || 0);
          }
        });

        liveNodesActiveCount = activeNodes;
        liveNodesOnlineUsers = onlineCount;

        setStats((prev) => ({
          ...prev,
          activeServers: activeNodes,
          onlineUsers: onlineCount
        }));
      }
    }, (err) => {
      console.warn("vps_nodes listen error:", err);
    });

    const unsubStats = onSnapshot(doc(db, 'platform', 'stats'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats((prev) => ({
          activeServers: liveNodesActiveCount !== null ? liveNodesActiveCount : (typeof data.activeServers === 'number' ? data.activeServers : prev.activeServers || SERVERS_LIST.length),
          servicesToday: typeof data.servicesToday === 'number' ? data.servicesToday : prev.servicesToday,
          totalAccounts: typeof data.totalAccounts === 'number' ? data.totalAccounts : prev.totalAccounts,
          onlineUsers: liveNodesOnlineUsers !== null ? liveNodesOnlineUsers : (typeof data.onlineUsers === 'number' ? data.onlineUsers : prev.onlineUsers),
          breakdown: data.breakdown || prev.breakdown
        }));
      }
    }, (err) => {
      console.warn("Firestore stats snapshot error (might not exist yet):", err);
    });

    return () => {
      unsubStats();
      unsubNodes();
    };
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('premdigital_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleOpenProtocol = (proto: ProtocolType) => {
    if (proto === 'ssh') {
      navigate('/ssh-tunnel');
    } else {
      setSelectedProtocol(proto);
      setIsAccountModalOpen(true);
    }
  };

  const handleSelectServerForAccount = (server: TunnelServer) => {
    setSelectedServer(server);
    navigate('/ssh-tunnel/create');
  };

  const handleOpenTool = (toolId: string) => {
    setSelectedToolId(toolId);
    setIsToolsModalOpen(true);
  };

  const handleAccountCreated = async (acc: GeneratedAccount) => {
    // Optimistic UI update
    setStats((prev) => ({
      ...prev,
      servicesToday: prev.servicesToday + 1,
      totalAccounts: prev.totalAccounts + 1,
      breakdown: {
        ...prev.breakdown,
        [acc.protocol]: (prev.breakdown[acc.protocol] || 0) + 1,
      },
    }));

    // Actually update the real global stats in Firestore
    try {
      const statsRef = doc(db, 'platform', 'stats');
      const newBreakdown = { ...stats.breakdown, [acc.protocol]: (stats.breakdown[acc.protocol] || 0) + 1 };
      
      // Note: In production you would use a Transaction or FieldValue.increment() here to prevent race conditions.
      try {
        await updateDoc(statsRef, {
          servicesToday: stats.servicesToday + 1,
          totalAccounts: stats.totalAccounts + 1,
          breakdown: newBreakdown
        });
      } catch (e: any) {
        if (e.code === 'not-found') {
          await setDoc(statsRef, {
            servicesToday: stats.servicesToday + 1,
            totalAccounts: stats.totalAccounts + 1,
            breakdown: newBreakdown
          });
        }
      }
    } catch (e) {
      console.warn("Failed to sync global stats to Firestore", e);
    }

    showToast(`Akun SSH ${acc.server.country} berhasil digenerate!`);
    
    // Auto-open modal to view details after creation
    setSelectedProtocol(acc.protocol);
    setRecentlyCreatedAccount(acc);
    setIsAccountModalOpen(true);
  };

  const handleSuccessDeposit = (amount: number) => {
    showToast(`Top Up senilai Rp ${amount.toLocaleString()} berhasil! Saldo bertambah.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const scrollToSection = (sectionId: string) => {
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-[#0e0a22] text-slate-100' 
        : 'bg-[#f4f3fa] text-slate-800'
    }`}>
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          isDark={isDark}
          toggleTheme={toggleTheme}
          onSelectProtocol={handleOpenProtocol}
          onOpenTool={handleOpenTool}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenTopup={() => setIsTopupModalOpen(true)}
          currentUser={currentUser}
          userRole={userRole}
          userBalance={userBalance}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <Routes location={location}>
              <Route path="/" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Hero Section */}
                  <Hero
                    isDark={isDark}
                    onGetStarted={() => navigate('/free')}
                    onExploreProtocols={() => navigate('/free')}
                  />

                  {/* Pick Your Tunneling Overview */}
                  <PickTunneling
                    isDark={isDark}
                  />

                  {/* Choose Tunneling Service (Protocol Cards) */}
                  <ServiceList
                    isDark={isDark}
                    onChooseService={handleOpenProtocol}
                  />

                  {/* Premium Features Grid */}
                  <Features isDark={isDark} />

                  {/* Speed, Stability, and Setup Technical Guide */}
                  <SpeedGuide isDark={isDark} />

                  {/* Frequently Asked Questions Accordion */}
                  <Faq isDark={isDark} />

                  {/* Start Free Tunneling Call to Action Banner */}
                  <CtaBanner
                    isDark={isDark}
                    onStartFree={() => navigate('/free')}
                  />

                  {/* Platform Statistics & Today's Service Breakdown */}
                  <Statistics stats={stats} isDark={isDark} />
                </motion.div>
              } />
              
              <Route path="/free" element={
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FreeTunneling
                    isDark={isDark}
                    onBack={() => navigate('/')}
                    onSelectServer={(protocol, server) => {
                      if (protocol === 'ssh') {
                        setSelectedServer(server);
                        navigate('/ssh-tunnel/create');
                      } else {
                        setSelectedServer(server);
                        setSelectedProtocol(protocol);
                        setIsAccountModalOpen(true);
                      }
                    }}
                  />
                </motion.div>
              } />
              
              <Route path="/ssh-tunnel" element={
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <SshServerList
                    isDark={isDark}
                    onSelectServer={handleSelectServerForAccount}
                    onBack={() => {
                      navigate('/');
                    }}
                  />
                </motion.div>
              } />
              <Route path="/ssh-tunnel/create" element={
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <SshCreateAccount
                    server={selectedServer}
                    isDark={isDark}
                    currentUser={currentUser}
                    userBalance={userBalance}
                    onBack={() => {
                      navigate('/ssh-tunnel');
                    }}
                    onAccountCreated={handleAccountCreated}
                    onOpenTopup={() => setIsTopupModalOpen(true)}
                    onOpenLogin={() => setIsAuthModalOpen(true)}
                  />
                </motion.div>
              } />
            
              <Route path="/dashboard" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Dashboard
                    isDark={isDark}
                    currentUser={currentUser}
                    userBalance={userBalance}
                    onOpenTopup={() => setIsTopupModalOpen(true)}
                    onLogout={() => {
                      signOut(auth);
                      navigate('/');
                    }}
                  />
                </motion.div>
              } />

            
              <Route path="/admin" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <AdminPanel
                    isDark={isDark}
                    userRole={userRole}
                  />
                </motion.div>
              } />

              <Route path="/server-status" element={<ServerStatusPage />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer
          isDark={isDark}
          onScrollToTop={() => scrollToSection('hero')}
          onOpenTool={handleOpenTool}
        />
      </div>

      {/* Account Generation Modal with QR Code (for other protocols) */}
      <AccountModal
        protocol={selectedProtocol}
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setRecentlyCreatedAccount(null);
        }}
        onAccountCreated={handleAccountCreated}
        initialAccount={recentlyCreatedAccount}
        initialServer={selectedServer}
      />

      {/* Tools Modal (My IP, Ping, DNS, Subdomain, AI Chat) */}
      <ToolsModal
        toolId={selectedToolId}
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
      />

      {/* Login / Member Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        userBalance={userBalance}
        onOpenTopup={() => setIsTopupModalOpen(true)}
        onLogout={() => signOut(auth)}
      />

      {/* Top Up Saldo Modal */}
      <TopupModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        user={currentUser}
        balance={userBalance}
        onSuccessDeposit={handleSuccessDeposit}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl border border-emerald-400/30 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
