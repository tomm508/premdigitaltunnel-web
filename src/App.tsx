import React, { useState, useEffect } from 'react';
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
import { ProtocolType, GeneratedAccount, PlatformStat, ActiveView, TunnelServer } from './types';
import { INITIAL_STATS, SERVERS_LIST } from './data/mockData';
import { CheckCircle2 } from 'lucide-react';
import { auth, onSnapshot, doc, db, signOut } from './lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>('ssh');
  const [selectedServer, setSelectedServer] = useState<TunnelServer>(SERVERS_LIST[0]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState<boolean>(false);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<PlatformStat>(INITIAL_STATS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Firebase User & Balance state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);

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

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('premdigital_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleOpenProtocol = (proto: ProtocolType) => {
    if (proto === 'ssh') {
      // Direct to multi-step SSH flow matching the video
      setCurrentView('ssh-servers');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSelectedProtocol(proto);
      setIsAccountModalOpen(true);
    }
  };

  const handleSelectServerForAccount = (server: TunnelServer) => {
    setSelectedServer(server);
    setCurrentView('ssh-create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTool = (toolId: string) => {
    setSelectedToolId(toolId);
    setIsToolsModalOpen(true);
  };

  const handleAccountCreated = (acc: GeneratedAccount) => {
    setStats((prev) => ({
      ...prev,
      servicesToday: prev.servicesToday + 1,
      totalAccounts: prev.totalAccounts + 1,
      breakdown: {
        ...prev.breakdown,
        [acc.protocol]: (prev.breakdown[acc.protocol] || 0) + 1,
      },
    }));

    showToast(`Akun SSH ${acc.server.country} berhasil digenerate!`);
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
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-[#0e0a22] text-slate-100' 
        : 'bg-[#f4f3fa] text-slate-800'
    }`}>
      {/* Background Ambience Gradient (GPU safe radial gradients) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(126, 34, 206, 0.18), transparent 70%), radial-gradient(ellipse 60% 40% at 90% 75%, rgba(67, 24, 154, 0.12), transparent 70%)'
            : 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(168, 85, 247, 0.10), transparent 70%), radial-gradient(ellipse 60% 40% at 90% 75%, rgba(192, 132, 252, 0.08), transparent 70%)'
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          isDark={isDark}
          toggleTheme={toggleTheme}
          onSelectProtocol={handleOpenProtocol}
          onOpenTool={handleOpenTool}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenTopup={() => setIsTopupModalOpen(true)}
          onScrollToSection={scrollToSection}
          currentUser={currentUser}
          userBalance={userBalance}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {currentView === 'home' && (
            <>
              {/* Hero Section */}
              <Hero
                isDark={isDark}
                onGetStarted={() => handleOpenProtocol('ssh')}
                onExploreProtocols={() => scrollToSection('services')}
              />

              {/* Pick Your Tunneling Overview */}
              <PickTunneling
                isDark={isDark}
                onSelectProtocol={handleOpenProtocol}
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
                onStartFree={() => handleOpenProtocol('ssh')}
              />

              {/* Platform Statistics & Today's Service Breakdown */}
              <Statistics stats={stats} isDark={isDark} />
            </>
          )}

          {currentView === 'ssh-servers' && (
            <SshServerList
              isDark={isDark}
              onSelectServer={handleSelectServerForAccount}
              onBack={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentView === 'ssh-create' && (
            <SshCreateAccount
              server={selectedServer}
              isDark={isDark}
              currentUser={currentUser}
              userBalance={userBalance}
              onBack={() => {
                setCurrentView('ssh-servers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onAccountCreated={handleAccountCreated}
              onOpenTopup={() => setIsTopupModalOpen(true)}
            />
          )}
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
        onClose={() => setIsAccountModalOpen(false)}
        onAccountCreated={handleAccountCreated}
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
