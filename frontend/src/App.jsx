import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const ResumeAnalyzerPage = lazy(() => import('./pages/resume/ResumeAnalyzerPage'))
const JobMatchingPage = lazy(() => import('./pages/jobs/JobMatchingPage'))
const LiveMarketScanPage = lazy(() => import('./pages/jobs/LiveMarketScanPage'))
const MockInterviewPage = lazy(() => import('./pages/interview/MockInterviewPage'))
const ApplicationTrackerPage = lazy(() => import('./pages/tracker/ApplicationTrackerPage'))
const CareerRoadmapPage = lazy(() => import('./pages/roadmap/CareerRoadmapPage'))
const LinkedInAIPage = lazy(() => import('./pages/linkedin/LinkedInAIPage'))
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage'))
const AdminPage = lazy(() => import('./pages/admin/AdminPage'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#13131f',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#4ade80', secondary: '#13131f' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#13131f' } },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/resume" element={<ResumeAnalyzerPage />} />
            <Route path="/jobs" element={<JobMatchingPage />} />
            <Route path="/jobs/live-scan" element={<LiveMarketScanPage />} />
            <Route path="/interview" element={<MockInterviewPage />} />
            <Route path="/tracker" element={<ApplicationTrackerPage />} />
            <Route path="/roadmap" element={<CareerRoadmapPage />} />
            <Route path="/linkedin" element={<LinkedInAIPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
