import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { HomePage, AboutPage, ContextPage, Footer, AccessGate } from './public/PublicPages';
import { LoginPage, RegisterPage } from './auth/AuthPages';
import { DashboardPage as StudentDashboardPage, PackagesPage, TrainersPage, BookingPage, SchedulePage, ProgressPage, ReviewsPage, MyPackagePage } from './roles/member/pages';
import { DashboardPage as TrainerDashboardPage, SchedulePage as TrainerSchedulePage, StudentsPage as TrainerStudentsPage } from './roles/trainer/pages';
import { DashboardPage as AdminDashboardPage, PackagesPage as AdminPackagesPage, TrainersPage as AdminTrainersPage, StudentsPage as AdminStudentsPage, SchedulesPage as AdminSchedulesPage, RevenuePage as AdminRevenuePage, PaymentsPage as AdminPaymentsPage } from './roles/admin/pages';
import ProfilePage from './pages/ProfilePage';

const menuPaths = { dashboard:'/member', packages:'/member/packages', 'my-packages':'/member/my-packages', booking:'/member/booking', trainers:'/member/trainers', schedule:'/member/schedule', progress:'/member/progress', reviews:'/member/reviews', profile:'/member/profile', 'trainer-dashboard':'/trainer', 'trainer-schedule':'/trainer/schedule', 'trainer-students':'/trainer/students', 'trainer-reviews':'/trainer/reviews', 'admin-dashboard':'/admin', 'admin-packages':'/admin/packages', 'admin-trainers':'/admin/trainers', 'admin-students':'/admin/students', 'admin-schedules':'/admin/schedules', 'admin-payments':'/admin/payments', 'admin-revenue':'/admin/revenue' };
const menuFromPath = path => Object.entries(menuPaths).find(([, value]) => value === path)?.[0] || (path.startsWith('/trainer') ? 'trainer-dashboard' : path.startsWith('/admin') ? 'admin-dashboard' : 'dashboard');
const workspacePath = path => path.startsWith('/member') || path.startsWith('/trainer') || path.startsWith('/admin');

function App() {
  const { user, loading, login, logout, register } = useAuth();
  const [path, setPath] = useState(() => window.location.pathname || '/');
  const [activeMenu, setActiveMenu] = useState(() => menuFromPath(window.location.pathname || '/'));
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('fitmanager_sidebar') === 'collapsed');
  const [theme, setTheme] = useState(() => localStorage.getItem('fitmanager_theme') || 'dark');
  useEffect(() => { const sync = () => { const next = window.location.pathname || '/'; setPath(next); setActiveMenu(menuFromPath(next)); }; window.addEventListener('popstate', sync); return () => window.removeEventListener('popstate', sync); }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('fitmanager_theme', theme); }, [theme]);
  useEffect(() => localStorage.setItem('fitmanager_sidebar', collapsed ? 'collapsed' : 'expanded'), [collapsed]);
  const navigate = next => { const target = next || '/'; if (target !== window.location.pathname) window.history.pushState({}, '', target); setPath(target); setActiveMenu(menuFromPath(target)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const chooseMenu = menu => navigate(menuPaths[menu] || '/');
  const handleLogout = async () => { await logout(); navigate('/'); };
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  useEffect(() => {
    if (!user || !['/', '/login', '/register'].includes(path)) return undefined;
    const target = user.role === 'admin' ? '/admin' : user.role === 'trainer' ? '/trainer' : '/member';
    if (window.location.pathname === target) return undefined;
    const redirect = window.setTimeout(() => {
      window.history.replaceState({}, '', target);
      setPath(target);
      setActiveMenu(menuFromPath(target));
    }, 0);
    return () => window.clearTimeout(redirect);
  }, [user, path]);
  const publicPath = ['/', '/about', '/context', '/login', '/register', '/packages'].includes(path);
  const authPublicPath = ['/', '/login', '/register'].includes(path);
  if (loading) return <div className="boot-screen"><span className="brand-mark">FM</span><strong>FitManager</strong><span>Đang khởi động workspace...</span></div>;
  if (!user && workspacePath(path)) return <div className="site-frame"><Header isPublic theme={theme} onToggleTheme={toggleTheme} onNavigate={navigate} onOpenLogin={() => navigate('/login')} onOpenSignUp={() => navigate('/register')} /><main className="public-main"><AccessGate onNavigate={navigate} /></main><Footer onNavigate={navigate} /></div>;
  // Authenticated users stay in their role workspace when a stale public URL is restored.
  // Marketing pages remain available through About, Context and Packages.
  if (publicPath && !workspacePath(path) && !(user && authPublicPath)) {
    let page = <HomePage onNavigate={navigate} />;
    if (path === '/about') page = <AboutPage onNavigate={navigate} />;
    if (path === '/context') page = <ContextPage />;
    if (path === '/login') page = <LoginPage onLogin={login} onNavigate={navigate} />;
    if (path === '/register') page = <RegisterPage onRegister={register} onNavigate={navigate} />;
    if (path === '/packages') page = <div className="public-catalog"><PackagesPage user={user} onLogin={() => navigate('/login')} onRegistered={() => navigate('/member/my-packages')} /></div>;
    return <div className="site-frame"><Header isPublic theme={theme} user={user} onToggleTheme={toggleTheme} onNavigate={navigate} onOpenLogin={() => navigate('/login')} onOpenSignUp={() => navigate('/register')} onLogout={handleLogout} /><main className="public-main">{page}</main><Footer onNavigate={navigate} /></div>;
  }
  const renderPage = () => {
    if (activeMenu === 'profile') return <ProfilePage user={user} />;
    if (user.role === 'admin') { switch (activeMenu) { case 'admin-packages': return <AdminPackagesPage />; case 'admin-trainers': return <AdminTrainersPage />; case 'admin-students': return <AdminStudentsPage />; case 'admin-schedules': return <AdminSchedulesPage />; case 'admin-payments': return <AdminPaymentsPage />; case 'admin-revenue': return <AdminRevenuePage />; default: return <AdminDashboardPage user={user} />; } }
    if (user.role === 'trainer') { switch (activeMenu) { case 'trainer-schedule': return <TrainerSchedulePage user={user} />; case 'trainer-students': return <TrainerStudentsPage user={user} />; case 'trainer-reviews': return <ReviewsPage key="trainer-reviews" role="trainer" />; default: return <TrainerDashboardPage user={user} />; } }
    switch (activeMenu) { case 'packages': return <PackagesPage user={user} onLogin={() => navigate('/login')} onRegistered={() => chooseMenu('my-packages')} />; case 'my-packages': return <MyPackagePage onNavigateToPackages={() => chooseMenu('packages')} />; case 'booking': return <BookingPage preSelectedTrainerId={selectedTrainerId} onBooked={() => chooseMenu('schedule')} />; case 'trainers': return <TrainersPage onSelectPtForBooking={id => { setSelectedTrainerId(id); chooseMenu('booking'); }} />; case 'schedule': return <SchedulePage />; case 'progress': return <ProgressPage />; case 'reviews': return <ReviewsPage key="member-reviews" />; default: return <StudentDashboardPage user={user} onNavigate={chooseMenu} />; }
  };
  return <div className={`app-container workspace-layout ${collapsed ? 'sidebar-collapsed' : ''}`}><Sidebar user={user} activeMenu={activeMenu} setActiveMenu={chooseMenu} collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} onLogout={handleLogout} /><div className="main-content"><Header user={user} theme={theme} onToggleTheme={toggleTheme} onToggleSidebar={() => setCollapsed(false)} onNavigate={navigate} onLogout={handleLogout} /><main className="page-body">{renderPage()}</main></div></div>;
}

export default App;
