import { useLocation } from 'react-router-dom'

const titles = {
  '/dashboard': 'Dashboard',
  '/resume': 'Resume Analyzer',
  '/jobs': 'Job Matching',
  '/interview': 'Mock Interview',
  '/tracker': 'Application Tracker',
  '/roadmap': 'Career Roadmap',
  '/linkedin': 'LinkedIn AI',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/admin': 'Admin Panel',
}

export function usePageTitle() {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]
  return titles[base] || 'CareerPilot AI'
}
