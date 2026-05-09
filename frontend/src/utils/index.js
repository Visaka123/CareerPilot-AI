import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function formatRelativeTime(date) {
  const now = new Date()
  const d = new Date(date)
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function getScoreColor(score) {
  if (score >= 80) return '#4ade80'
  if (score >= 60) return '#facc15'
  if (score >= 40) return '#fb923c'
  return '#f87171'
}

export function getStatusBadge(status) {
  const map = {
    applied: { label: 'Applied', class: 'badge-info' },
    interview: { label: 'Interview', class: 'badge-warning' },
    offer: { label: 'Offer', class: 'badge-success' },
    rejected: { label: 'Rejected', class: 'badge-danger' },
    saved: { label: 'Saved', class: 'badge-purple' },
  }
  return map[status] || { label: status, class: 'badge-info' }
}

export function truncate(str, n = 100) {
  return str?.length > n ? str.slice(0, n) + '...' : str
}
