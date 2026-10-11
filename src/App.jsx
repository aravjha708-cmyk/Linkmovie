import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { ToastProvider, useToast } from './components/Toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import CreateLink from './pages/CreateLink';
import ManageLinks from './pages/ManageLinks';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AdminLogin from './pages/AdminLogin';
import Interstitial from './pages/Interstitial';
import MovieHome from './pages/MovieHome';
import NotFound from './pages/NotFound';

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDevAuth, setIsDevAuth] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { addToast } = useToast();

  // Listen to browser navigation (back/forward)
  useEffect(() => {
    function handleLocationChange() {
      setCurrentPath(window.location.pathname);
    }
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Check admin session when visiting /admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.checkSession();
        if (res.authenticated) {
          setIsAuthenticated(true);
          setIsDevAuth(res.isDevAuth || false);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    }

    if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
      checkAuth();
    } else {
      setAuthChecking(false);
    }
  }, [currentPath]);

  function navigateTo(tabOrPath) {
    if (tabOrPath.startsWith('/')) {
      window.history.pushState({}, '', tabOrPath);
      setCurrentPath(tabOrPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setAdminTab(tabOrPath);
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
      setIsAuthenticated(false);
      addToast('Signed out of MoviesHouse4u admin', 'info');
      navigateTo('/admin');
    } catch (err) {
      addToast('Sign out error', 'error');
    }
  }

  // Parse path
  const trimmedPath = currentPath.replace(/^\/+|\/+$/g, '');

  // 1. Root path ("/") -> Public Movie Catalog Homepage (referencing https://movieshouse4u.netlify.app/)
  if (trimmedPath === '') {
    return <MovieHome onNavigate={navigateTo} />;
  }

  // 2. Admin routes ("/admin", "/admin/*") -> Dedicated Protected Admin Dashboard & Login
  if (trimmedPath === 'admin' || trimmedPath.startsWith('admin/')) {
    if (authChecking) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Checking admin authorization...
        </div>
      );
    }

    if (!isAuthenticated) {
      return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return renderAdminArea();
  }

  // 3. Short Link Interstitial Flow ("/:shortCode")
  const reservedPaths = ['api', 'admin', 'assets', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'movies', 'category', 'search'];
  if (!reservedPaths.includes(trimmedPath.toLowerCase())) {
    return <Interstitial shortCode={trimmedPath} />;
  }

  // 4. Fallback 404
  return <NotFound code={trimmedPath} />;

  function renderAdminArea() {
    const titles = {
      dashboard: 'MoviesHouse4u Overview',
      create: 'Create Movie Link',
      links: 'Manage Movie Links',
      analytics: 'Click & Funnel Analytics',
      settings: 'Portal Settings'
    };

    return (
      <div className="admin-layout">
        <Sidebar
          currentRoute={adminTab}
          onNavigate={(tab) => navigateTo(tab)}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="admin-content">
          <Navbar
            currentTitle={titles[adminTab] || 'MoviesHouse4u Admin'}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isDevAuth={isDevAuth}
          />

          <main className="admin-main">
            {adminTab === 'dashboard' && <AdminDashboard onNavigate={navigateTo} />}
            {adminTab === 'create' && <CreateLink onNavigate={navigateTo} />}
            {adminTab === 'links' && <ManageLinks />}
            {adminTab === 'analytics' && <Analytics />}
            {adminTab === 'settings' && <Settings />}
          </main>
        </div>
      </div>
    );
  }
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
