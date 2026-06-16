import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getVideos() {
  return api.get('/videos').then(res => res.data)
}

export function getVideo(id) {
  return api.get(`/videos/${id}`).then(res => res.data)
}

export function adminLogin(password) {
  return api.post('/admin/login', { password }).then(res => res.data)
}

export function uploadVideo(formData) {
  return api.post('/admin/videos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data)
}

export function deleteVideo(id) {
  return api.delete(`/admin/videos/${id}`).then(res => res.data)
}

export default api
