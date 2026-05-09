import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, Palette, Save, Camera, Moon, Sun, Loader } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuthStore, useThemeStore } from '../../store'
import { authService } from '../../services'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
]

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    name: '', email: '', title: '', location: '', bio: '', linkedin: '', github: '',
  })
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPassword, setSavingPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    emailAlerts: true, jobMatches: true, interviewReminders: true,
    weeklyReport: false, applicationUpdates: true,
  })

  // Always reload profile from server on mount to get latest persisted data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authService.getProfile()
        const u = res.data
        setProfile({
          name: u.name || '',
          email: u.email || '',
          title: u.title || '',
          location: u.location || '',
          bio: u.bio || '',
          linkedin: u.linkedin || '',
          github: u.github || '',
        })
        // Sync store with latest server data
        updateUser(u)
      } catch {
        // Fallback to store data
        setProfile({
          name: user?.name || '',
          email: user?.email || '',
          title: user?.title || '',
          location: user?.location || '',
          bio: user?.bio || '',
          linkedin: user?.linkedin || '',
          github: user?.github || '',
        })
      } finally {
        setLoadingProfile(false)
      }
    }
    loadProfile()
  }, [])

  const saveProfile = async () => {
    if (!profile.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const res = await authService.updateProfile({
        name: profile.name,
        title: profile.title,
        location: profile.location,
        bio: profile.bio,
        linkedin: profile.linkedin,
        github: profile.github,
      })
      updateUser(res.data)
      toast.success('Profile saved successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all password fields')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setSavingPassword(true)
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password updated successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences</p>
      </div>

      <div className="flex gap-1 bg-white/4 border border-white/8 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id ? 'bg-primary-500/20 text-primary-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            {loadingProfile ? (
              <div className="flex items-center justify-center py-12">
                <Loader size={24} className="animate-spin text-primary-400" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold">
                      {profile.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-600 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                      <Camera size={12} />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{profile.name || 'Your Name'}</p>
                    <p className="text-sm text-slate-400">{profile.email}</p>
                    {profile.title && <p className="text-xs text-primary-400 mt-0.5">{profile.title}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name', placeholder: 'Alex Morgan' },
                    { key: 'email', label: 'Email', placeholder: 'you@example.com', disabled: true },
                    { key: 'title', label: 'Job Title', placeholder: 'Senior Frontend Engineer' },
                    { key: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
                    { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/yourname' },
                    { key: 'github', label: 'GitHub URL', placeholder: 'github.com/yourname' },
                  ].map(({ key, label, placeholder, disabled }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
                      <input
                        type="text"
                        value={profile[key]}
                        onChange={(e) => !disabled && setProfile({ ...profile, [key]: e.target.value })}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`input-field ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us about yourself, your experience, and career goals..."
                      className="input-field resize-none"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={saveProfile} loading={saving}>
                    <Save size={15} /> Save Changes
                  </Button>
                </div>
              </>
            )}
          </Card>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="font-semibold text-white mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              {[
                { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important alerts via email' },
                { key: 'jobMatches', label: 'Job Match Notifications', desc: 'Get notified when new jobs match your profile' },
                { key: 'interviewReminders', label: 'Interview Reminders', desc: 'Reminders before scheduled interviews' },
                { key: 'weeklyReport', label: 'Weekly Progress Report', desc: 'Weekly summary of your career activity' },
                { key: 'applicationUpdates', label: 'Application Updates', desc: 'Status changes on your applications' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${notifications[key] ? 'bg-primary-500' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifications[key] ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'appearance' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="font-semibold text-white mb-4">Theme</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Easy on the eyes, great for night work' },
                { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Classic bright theme' },
              ].map(({ id, label, icon: Icon, desc }) => (
                <div
                  key={id}
                  onClick={() => id !== theme && toggleTheme()}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    theme === id ? 'border-primary-500/50 bg-primary-500/10' : 'border-white/8 bg-white/3 hover:border-white/15'
                  }`}
                >
                  <Icon size={20} className={theme === id ? 'text-primary-400' : 'text-slate-400'} />
                  <p className="font-medium text-white text-sm mt-2">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="font-semibold text-white mb-4">Change Password</h3>
            <div className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Current Password' },
                { key: 'newPassword', label: 'New Password' },
                { key: 'confirmPassword', label: 'Confirm New Password' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
                  <input
                    type="password"
                    value={passwordForm[key]}
                    onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                    placeholder="••••••••"
                    className="input-field"
                    autoComplete={key === 'currentPassword' ? 'current-password' : 'new-password'}
                  />
                </div>
              ))}
              <Button onClick={changePassword} loading={savingPassword} className="mt-2">
                Update Password
              </Button>
            </div>
          </Card>

          <Card className="mt-4 border-red-500/20">
            <h3 className="font-semibold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-400 mb-4">Permanently delete your account and all associated data.</p>
            <Button variant="danger" size="sm">Delete Account</Button>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
