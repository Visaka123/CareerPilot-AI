import api from './api'

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
}

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
  getRecommendations: () => api.get('/dashboard/recommendations'),
  getWeeklyChart: () => api.get('/dashboard/weekly-chart'),
}

export const resumeService = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  analyze: (resumeId) => api.post(`/resume/${resumeId}/analyze`),
  getAll: () => api.get('/resume'),
  getById: (id) => api.get(`/resume/${id}`),
  delete: (id) => api.delete(`/resume/${id}`),
}

export const jobService = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  search: (params) => api.get('/jobs/search', { params }),
  save: (id) => api.post(`/jobs/${id}/save`),
  unsave: (id) => api.delete(`/jobs/${id}/save`),
  getSaved: () => api.get('/jobs/saved'),
  getRecommended: () => api.get('/jobs/recommended'),
  syncExternal: () => api.post('/jobs/sync'),
}

export const applicationService = {
  getAll: () => api.get('/applications'),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  getStats: () => api.get('/applications/stats'),
  getTimeline: (id) => api.get(`/applications/${id}/timeline`),
  addNote: (id, note) => api.post(`/applications/${id}/notes`, { note }),
  applyJob: (jobId) => api.post(`/applications/apply/${jobId}`),
  applyAllJobs: () => api.post('/applications/apply-all'),
}

export const interviewService = {
  generate: (data) => api.post('/interview/generate', data),
  submitAnswer: (sessionId, data) => api.post(`/interview/${sessionId}/answer`, data),
  getHistory: () => api.get('/interview/history'),
  getSession: (id) => api.get(`/interview/${id}`),
  deleteSession: (id) => api.delete(`/interview/${id}`),
}

export const roadmapService = {
  generate: (data) => api.post('/roadmap/generate', data),
  getAll: () => api.get('/roadmap'),
  getById: (id) => api.get(`/roadmap/${id}`),
  updateProgress: (id, data) => api.put(`/roadmap/${id}/progress`, data),
  delete: (id) => api.delete(`/roadmap/${id}`),
}

export const linkedinService = {
  generatePost: (data) => api.post('/linkedin/generate-post', data),
  generateMessage: (data) => api.post('/linkedin/generate-message', data),
  generateEmail: (data) => api.post('/linkedin/generate-email', data),
  getHistory: () => api.get('/linkedin/history'),
}

export const chatService = {
  sendMessage: (data) => api.post('/chat/message', data),
  getHistory: () => api.get('/chat/history'),
  clearHistory: () => api.delete('/chat/history'),
}

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
}

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
}

export const skillService = {
  getSalaryPrediction: (data) => api.post('/skills/salary-prediction', data),
  getGapAnalysis: (data) => api.post('/skills/gap-analysis', data),
}

export const scraperService = {
  trigger: (params) => api.post('/scraper/trigger', null, { params }),
  getJobs: (params) => api.get('/scraper/jobs', { params }),
  getStatus: (collectorId = 'c_mt5qs76z2qeo1prcw6') => api.get(`/scraper/status/${collectorId}`),
  getSkillDemand: () => api.get('/scraper/analytics/skills'),
}
