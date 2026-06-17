import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import VideoPlayer from '../views/VideoPlayer.vue'
import SearchResults from '../views/SearchResults.vue'
import Profile from '../views/Profile.vue'
import AdminLogin from '../views/admin/AdminLogin.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/video/:id', name: 'VideoPlayer', component: VideoPlayer },
  { path: '/search', name: 'SearchResults', component: SearchResults },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/admin/login', name: 'AdminLogin', component: AdminLogin },
  { path: '/admin', name: 'AdminDashboard', component: AdminDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
