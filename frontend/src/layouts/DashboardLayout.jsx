import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/ui/Sidebar'
import Topbar from '../components/ui/Topbar'
import ChatAssistant from '../components/chat/ChatAssistant'
import { useAuthStore } from '../store'
import { usePageTitle } from '../hooks/usePageTitle'

export default function DashboardLayout() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const title = usePageTitle()

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen bg-surface-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <ChatAssistant />
    </div>
  )
}
