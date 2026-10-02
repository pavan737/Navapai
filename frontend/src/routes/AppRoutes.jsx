import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { Home } from '../pages/public/Home';
import { ExploreDomains } from '../pages/public/ExploreDomains';
import { DomainDetail } from '../pages/public/DomainDetail';
import { ProjectsShowcase } from '../pages/public/ProjectsShowcase';
import { DeveloperPortfolio } from '../pages/public/DeveloperPortfolio';
import { ResourcesLibrary } from '../pages/public/ResourcesLibrary';
import { About } from '../pages/public/About';
import { Contact } from '../pages/public/Contact';
import { Register } from '../pages/auth/Register';
import { Login } from '../pages/auth/Login';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { Profile } from '../pages/dashboard/Profile';
import { MyDomains } from '../pages/dashboard/MyDomains';
import { DomainWorkspace } from '../pages/dashboard/DomainWorkspace';
import { LearningPlans } from '../pages/dashboard/LearningPlans';
import { LearningPlanDetail } from '../pages/dashboard/LearningPlanDetail';
import { MyProjects } from '../pages/dashboard/MyProjects';
import { ProjectWorkspace } from '../pages/dashboard/ProjectWorkspace';
import { WeeklyTasks } from '../pages/dashboard/WeeklyTasks';
import { DeveloperNotes } from '../pages/dashboard/DeveloperNotes';
import { MyBookmarks } from '../pages/dashboard/MyBookmarks';
import { CareerMilestones } from '../pages/dashboard/CareerMilestones';
import { AchievementsDashboard } from '../pages/dashboard/AchievementsDashboard';
import { Leaderboard } from '../pages/public/Leaderboard';
import { CommunityKnowledge } from '../pages/public/CommunityKnowledge';
import { OverviewDashboard } from '../pages/dashboard/OverviewDashboard';
import { AdminSuite } from '../pages/admin/AdminSuite';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Website Layout */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="domains" element={<ExploreDomains />} />
          <Route path="domains/:slug" element={<DomainDetail />} />
          <Route path="projects" element={<ProjectsShowcase />} />
          <Route path="portfolio/:username" element={<DeveloperPortfolio />} />
          <Route path="resources" element={<ResourcesLibrary />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="community" element={<CommunityKnowledge />} />
          <Route path="admin-suite" element={<AdminSuite />} />

          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          
          {/* Auth & Profile Routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="profile" element={<Profile />} />
          
          {/* Dashboard Modules */}
          <Route path="dashboard" element={<OverviewDashboard />} />
          <Route path="dashboard/domains" element={<MyDomains />} />

          <Route path="dashboard/domains/:id" element={<DomainWorkspace />} />

          {/* Phase 6: Learning Plans & Roadmaps */}
          <Route path="dashboard/plans" element={<LearningPlans />} />
          <Route path="dashboard/plans/:id" element={<LearningPlanDetail />} />

          {/* Phase 7: Projects & GitHub Portfolio */}
          <Route path="dashboard/projects" element={<MyProjects />} />
          <Route path="dashboard/projects/:id" element={<ProjectWorkspace />} />

          {/* Phase 8: Weekly Tasks & To-Dos */}
          <Route path="dashboard/tasks" element={<WeeklyTasks />} />

          {/* Phase 9 & 10: Developer Notes & Bookmarks */}
          <Route path="dashboard/notes" element={<DeveloperNotes />} />
          <Route path="dashboard/bookmarks" element={<MyBookmarks />} />

          {/* Phase 11 & 12: Career & Gamification */}
          <Route path="dashboard/career" element={<CareerMilestones />} />
          <Route path="dashboard/achievements" element={<AchievementsDashboard />} />
        </Route>

        {/* Catch-all Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};




