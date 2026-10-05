import React, { useState } from 'react';
// Hooks
import { useAuth } from './hooks/useAuth';
import { useSchedule } from './hooks/useSchedule';
import { useProgress } from './hooks/useProgress';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import RateTrainerModal from './components/RateTrainerModal';

// Pages
import PackagesPage from './pages/PackagesPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import TrainerDashboardPage from './pages/TrainerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TrainersPage from './pages/TrainersPage';
import BookingPage from './pages/BookingPage';
import SchedulePage from './pages/SchedulePage';
import ProgressPage from './pages/ProgressPage';
import ReviewsPage from './pages/ReviewsPage';
import MyPackagePage from './pages/MyPackagePage';

import { initialReviews, myPackageInfo } from './data/mockData';

function App() {
  // Custom Hooks
  const { user, login, role } = useAuth();
  const { schedules, addSchedule, cancelSchedule, completeSchedule } = useSchedule();
  const { progress } = useProgress();

  // App Level State
  const [activeMenu, setActiveMenu] = useState('packages');
  const [reviews, setReviews] = useState(initialReviews);
  const [myPackage, setMyPackage] = useState(myPackageInfo);

  // Modals & Navigation State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [preSelectedTrainer, setPreSelectedTrainer] = useState(null);
  const [trainerToReview, setTrainerToReview] = useState(null);

  // Login & Auto-Redirect to Role Dashboard
  const handleLoginSuccess = (account) => {
    login(account);
    if (account.role === 'ADMIN') {
      setActiveMenu('admin-dashboard');
    } else if (account.role === 'TRAINER') {
      setActiveMenu('trainer-dashboard');
    } else {
      setActiveMenu('dashboard');
    }
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
    // Admin Role Pages
    if (role === 'ADMIN') {
      switch (activeMenu) {
        case 'admin-users':
        case 'admin-packages':
        case 'admin-trainers':
        case 'admin-dashboard':
        default:
          return <AdminDashboardPage user={user} />;
      }
    }

    // Trainer Role Pages
    if (role === 'TRAINER') {
      switch (activeMenu) {
        case 'trainer-schedule':
        case 'trainer-students':
        case 'trainer-reviews':
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

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar user={user} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* Main Content Dashboard */}
      <div className="main-content">
        {/* Header Bar */}
        <Header user={user} onOpenLogin={() => setShowLoginModal(true)} />

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
