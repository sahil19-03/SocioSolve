import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Explore from './pages/Explore';
import ChallengeDetail from './pages/ChallengeDetail';
import SubmitChallenge from './pages/SubmitChallenge';
import SubmitSolution from './pages/SubmitSolution';
import TeamFormation from './pages/TeamFormation';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';

import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SubmitterDashboard from './pages/SubmitterDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import ExpertDashboard from './pages/ExpertDashboard';
import Analytics from './pages/Analytics';
import MilestoneTracker from './pages/MilestoneTracker';
import IndustryPortal from './pages/IndustryPortal';
import UniversityAdminDashboard from './pages/UniversityAdminDashboard';
import NodalOfficerDashboard from './pages/NodalOfficerDashboard';
import CommunityDashboard from './pages/CommunityDashboard';
import Profile from './pages/Profile';

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <TopHeader />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/challenge/:id" element={<ChallengeDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/submit-challenge" element={<ProtectedRoute><SubmitChallenge /></ProtectedRoute>} />
          <Route path="/submit-solution" element={<ProtectedRoute allowedRoles={['student', 'admin']}><SubmitSolution /></ProtectedRoute>} />
          <Route path="/team-formation" element={<ProtectedRoute allowedRoles={['student', 'faculty', 'university_admin', 'admin']}><TeamFormation /></ProtectedRoute>} />

          <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={['student','admin']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/nodal" element={<ProtectedRoute allowedRoles={['nodal_officer','admin']}><NodalOfficerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/submitter" element={<ProtectedRoute allowedRoles={['citizen','admin']}><SubmitterDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/faculty" element={<ProtectedRoute allowedRoles={['faculty','admin']}><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/expert" element={<ProtectedRoute allowedRoles={['expert','admin']}><ExpertDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/university" element={<ProtectedRoute allowedRoles={['university_admin','admin']}><UniversityAdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/community" element={<ProtectedRoute allowedRoles={['community','citizen','admin']}><CommunityDashboard /></ProtectedRoute>} />

          <Route path="/industry" element={<ProtectedRoute allowedRoles={['industry_partner','admin']}><IndustryPortal /></ProtectedRoute>} />
          <Route path="/milestones" element={<ProtectedRoute><MilestoneTracker /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}
