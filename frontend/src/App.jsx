import { useState } from 'react';
import ConnectionStatus from './components/ConnectionStatus';
// Hooks
import { useAuth } from './hooks/useAuth';
import { useSchedule } from './hooks/useSchedule';
import { useProgress } from './hooks/useProgress';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';
import RegisterModal from './components/RegisterModal';
import RateTrainerModal from './components/RateTrainerModal';

// Pages - Student
import PackagesPage from './pages/PackagesPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import TrainersPage from './pages/TrainersPage';
import BookingPage from './pages/BookingPage';
import SchedulePage from './pages/SchedulePage';
import ProgressPage from './pages/ProgressPage';
import ReviewsPage from './pages/ReviewsPage';
import MyPackagePage from './pages/MyPackagePage';

// Pages - Trainer
import TrainerDashboardPage from './pages/TrainerDashboardPage';
import TrainerSchedulePage from './pages/TrainerSchedulePage';
import TrainerStudentsPage from './pages/TrainerStudentsPage';

// Pages - Admin
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminPackagesPage from './pages/AdminPackagesPage';
import AdminTrainersPage from './pages/AdminTrainersPage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminSchedulesPage from './pages/AdminSchedulesPage';
import AdminRevenuePage from './pages/AdminRevenuePage';

// A2.1 — Profile cho cả 3 role
import ProfilePage from './pages/ProfilePage';

import { initialReviews, myPackageInfo } from './data/mockData';

function App() {
  // Custom Hooks — auth thật từ server
  const { user, loading: authLoading, login, logout, register, role } = useAuth();
  const { schedules, addSchedule, cancelSchedule, completeSchedule } = useSchedule();
  const { progress } = useProgress();

  // App Level State
  const [activeMenu, setActiveMenu] = useState('packages');
  const [reviews, setReviews] = useState(initialReviews);
  const [myPackage] = useState(myPackageInfo);

  // Modals & Navigation State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [preSelectedTrainer, setPreSelectedTrainer] = useState(null);
  const [trainerToReview, setTrainerToReview] = useState(null);

  // Tự redirect theo role server sau khi đăng nhập/phục hồi phiên
  const redirectByRole = (userRole) => {
    if (userRole === 'admin') setActiveMenu('admin-dashboard');
    else if (userRole === 'trainer') setActiveMenu('trainer-dashboard');
    else setActiveMenu('dashboard');
  };

  // Login thật qua API — gọi useAuth.login
  const handleLoginSuccess = async (email, password) => {
    const serverUser = await login(email, password);
    redirectByRole(serverUser.role);
    return serverUser;
  };

  // Register thật qua API
  const handleRegisterSuccess = async (payload) => {
    const serverUser = await register(payload);
    redirectByRole(serverUser.role);
    return serverUser;
  };

  // Logout thật
  const handleLogout = async () => {
    await logout();
    setActiveMenu('packages');
  };

  // Handlers
  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setShowRegisterModal(true);
  };

  const handleSelectPtForBooking = (pt) => {
    setPreSelectedTrainer(pt);
    setActiveMenu('booking');
  };

  const handleOpenReviewModal = (pt) => {
    setTrainerToReview(pt);
    setShowReviewModal(true);
  };

  const handleSubmitReview = (newReview) => {
    setReviews([newReview, ...reviews]);
  };

  // Render Current Page Based on Role and activeMenu
  const renderCurrentPage = () => {
    // Profile — dùng chung cho cả 3 role
    if (activeMenu === 'profile') {
      return <ProfilePage user={user} />;
    }

    // Admin Role Pages — role từ server là lowercase
    if (role === 'admin') {
      switch (activeMenu) {
        case 'admin-packages':
          return <AdminPackagesPage />;
        case 'admin-trainers':
          return <AdminTrainersPage />;
        case 'admin-students':
          return <AdminStudentsPage />;
        case 'admin-schedules':
          return <AdminSchedulesPage />;
        case 'admin-revenue':
          return <AdminRevenuePage />;
        case 'admin-dashboard':
        default:
          return <AdminDashboardPage user={user} />;
      }
    }

    // Trainer Role Pages
    if (role === 'trainer') {
      switch (activeMenu) {
        case 'trainer-schedule':
          return <TrainerSchedulePage user={user} />;
        case 'trainer-students':
          return <TrainerStudentsPage user={user} />;
        case 'trainer-reviews':
          return <ReviewsPage reviews={reviews} onOpenReviewModal={handleOpenReviewModal} />;
        case 'trainer-dashboard':
        default:
          return <TrainerDashboardPage user={user} />;
      }
    }

    // Student / User Role Pages
    switch (activeMenu) {
      case 'dashboard':
        return (
          <StudentDashboardPage
            user={user}
            schedules={schedules}
            progress={progress}
            myPackage={myPackage}
            onNavigate={(menuId) => setActiveMenu(menuId)}
          />
        );

      case 'trainers':
        return (
          <TrainersPage
            onSelectPtForBooking={handleSelectPtForBooking}
            onOpenReviewModal={handleOpenReviewModal}
          />
        );

      case 'booking':
        return (
          <BookingPage
            preSelectedTrainer={preSelectedTrainer}
            onAddScheduleSuccess={addSchedule}
          />
        );

      case 'schedule':
        return (
          <SchedulePage
            schedules={schedules}
            onCancelSchedule={cancelSchedule}
            onCompleteSchedule={completeSchedule}
          />
        );

      case 'progress':
        return <ProgressPage />;

      case 'reviews':
        return (
          <ReviewsPage
            reviews={reviews}
            onOpenReviewModal={handleOpenReviewModal}
          />
        );

      case 'my-packages':
        return (
          <MyPackagePage
            onNavigateToPackages={() => setActiveMenu('packages')}
          />
        );

      case 'packages':
      default:
        return (
          <PackagesPage onSelectPackage={handleSelectPackage} />
        );
    }
  };

  // Nếu đang phục hồi phiên, hiện loading toàn màn hình
  if (authLoading) {
    return (
      <div
        style={{
          height: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0A0F1E', color: '#00E676', gap: '16px'
        }}
      >
        <div className="spinner-border" style={{ color: '#00E676', width: '2.5rem', height: '2.5rem' }} role="status" />
        <span style={{ fontSize: '0.9rem', color: '#64748B' }}>Đang khởi động FitManager...</span>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar user={user} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* Main Content Dashboard */}
      <div className="main-content">
        {/* Header Bar */}
        <Header
          user={user}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenSignUp={() => setShowSignUpModal(true)}
          onLogout={handleLogout}
        />
        <ConnectionStatus />

        {/* Main Body Page */}
        <main className="page-body">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Modals */}
      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <SignUpModal
        show={showSignUpModal}
        onHide={() => setShowSignUpModal(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />

      <RegisterModal
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
        selectedPackage={selectedPackage}
        isYearly={true}
      />

      <RateTrainerModal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        trainerToReview={trainerToReview}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
}

export default App;
