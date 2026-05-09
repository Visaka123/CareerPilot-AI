import axios from 'axios'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Backend returns ApiResponse<T> { success, data, message }
// Unwrap so callers always get res.data = actual payload T
api.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === 'object' && 'success' in res.data) {
      if (!res.data.success) {
        const err = new Error(res.data.message || 'Request failed')
        err.response = { data: res.data }
        return Promise.reject(err)
      }
      res.data = res.data.data
    }
    return res
  },
  (err) => {
    const status = err.response?.status
    const msg = err.response?.data?.message || err.message

    if (status === 401) {
      useAuthStore.getState().logout()
      if (!window.location.pathname.includes('/login')) window.location.href = '/login'
    } else if (status === 403) {
      toast.error('Access denied')
    } else if (status >= 500) {
      toast.error('Server error. Please try again.')
    }
    return Promise.reject(err)
  }
)

export default api
