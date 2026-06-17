<template>
  <div id="app" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- ===== Left Sidebar ===== -->
    <aside class="site-sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo" @click="$router.push('/')">🎬</div>
        <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
          {{ sidebarCollapsed ? '▶' : '◀' }}
        </button>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">首页推荐</span>
        </router-link>
        <router-link to="/search?tab=hot" class="nav-item">
          <span class="nav-icon">🔥</span>
          <span class="nav-label">热门推荐</span>
        </router-link>
        <router-link to="/search?tab=latest" class="nav-item">
          <span class="nav-icon">✦</span>
          <span class="nav-label">最新更新</span>
        </router-link>
      </nav>
      <div class="sidebar-divider"></div>
      <div class="sidebar-info">
        <div class="info-item">
          <span class="info-label">视频总数</span>
          <span class="info-value">{{ profile.videoCount || 50 }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">今日访问</span>
          <span class="info-value">1.2k</span>
        </div>
        <div class="info-item">
          <span class="info-label">在线用户</span>
          <span class="info-value">36</span>
        </div>
      </div>
      <div class="sidebar-footer">
        <div class="sidebar-version">v1.0.0</div>
      </div>
    </aside>

    <!-- ===== Top Header ===== -->
    <header class="site-header">
      <div class="header-inner">
        <div class="header-left">
          <router-link to="/" class="logo">🎬 视频网站</router-link>
        </div>
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="搜索视频..."
            @keyup.enter="doSearch"
          />
          <button class="search-btn" @click="doSearch">🔍</button>
        </div>
      </div>
    </header>

    <!-- ===== Top-Right Avatar ===== -->
    <div class="avatar-corner" @click="$router.push('/profile')">
      <div class="avatar">
        <img v-if="profile.avatar" :src="profile.avatar" alt="avatar" />
        <span v-else class="avatar-text">{{ profile.nickname?.charAt(0) || 'U' }}</span>
      </div>
      <span class="avatar-name">{{ profile.nickname || '游客' }}</span>
    </div>

    <!-- ===== Back Button ===== -->
    <button v-if="$route.name !== 'Home'" class="back-btn" @click="$router.back()">← 返回</button>

    <!-- ===== Main Content ===== -->
    <main class="site-main">
      <router-view />
    </main>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const DEFAULT_PROFILE = {
  nickname: '国漫爱好者',
  bio: '喜欢看国漫，每周追更！',
  avatar: '',
  email: '',
  videoCount: 50
}

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const sidebarCollapsed = ref(false)
    const profile = reactive({ ...DEFAULT_PROFILE })

    onMounted(() => {
      try {
        const saved = localStorage.getItem('user_profile')
        if (saved) Object.assign(profile, JSON.parse(saved))
      } catch {}
    })

    // Expose profile globally for child components
    window.__PROFILE__ = profile

    function doSearch() {
      const q = searchQuery.value.trim()
      if (q) {
        router.push({ path: '/search', query: { q } })
      }
    }

    return { searchQuery, sidebarCollapsed, profile, doSearch }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: #2a2a3a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

/* ===== Sidebar ===== */
.site-sidebar {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  width: 200px;
  background: rgba(255, 255, 255, 0.92);
  border-right: 1px solid rgba(180, 160, 210, 0.3);
  backdrop-filter: blur(20px);
  z-index: 200;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;
}
.sidebar-collapsed .site-sidebar {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(180, 160, 210, 0.2);
  height: 60px;
}
.sidebar-logo {
  font-size: 24px;
  cursor: pointer;
  flex-shrink: 0;
}
.sidebar-toggle {
  background: none;
  border: none;
  color: rgba(100, 80, 140, 0.5);
  cursor: pointer;
  font-size: 12px;
  padding: 4px;
  transition: color 0.2s;
  flex-shrink: 0;
}
.sidebar-toggle:hover { color: #7b2d8e; }

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: rgba(80, 60, 120, 0.6);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.25s;
  white-space: nowrap;
  overflow: hidden;
}
.nav-item:hover {
  background: rgba(123,45,142,0.06);
  color: #5a2d7e;
}
.nav-item.router-link-active {
  background: rgba(123,45,142,0.15);
  color: #b088d6;
}
.nav-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}
.nav-label {
  flex-shrink: 0;
}
.sidebar-collapsed .nav-label,
.sidebar-collapsed .sidebar-info,
.sidebar-collapsed .sidebar-version { display: none; }

.sidebar-collapsed .sidebar-header {
  justify-content: center;
  padding: 14px 8px;
}
.sidebar-collapsed .sidebar-logo {
  display: none;
}
.sidebar-collapsed .sidebar-toggle {
  font-size: 14px;
}

.sidebar-divider {
  height: 1px;
  background: rgba(180, 160, 210, 0.2);
  margin: 0 16px;
}

.sidebar-info {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.info-label {
  font-size: 12px;
  color: rgba(100, 80, 140, 0.4);
}
.info-value {
  font-size: 13px;
  font-weight: 600;
  color: rgba(80, 60, 120, 0.6);
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(180, 160, 210, 0.2);
}
.sidebar-version {
  font-size: 11px;
  color: rgba(100, 80, 140, 0.25);
}

/* ===== Header ===== */
.site-header {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(180, 160, 210, 0.2);
  padding: 0 24px;
  position: fixed;
  top: 0; left: 200px; right: 0;
  height: 60px;
  z-index: 100;
  transition: left 0.3s;
}
.sidebar-collapsed .site-header {
  left: 60px;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left { flex-shrink: 0; }

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #4a2d7e;
  text-decoration: none;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #7b2d8e 40%, #b088d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(180, 160, 210, 0.12);
  border-radius: 20px;
  border: 1px solid rgba(180, 160, 210, 0.2);
  overflow: hidden;
  flex: 1;
  max-width: 400px;
  transition: border-color 0.3s;
}
.search-box:focus-within {
  border-color: rgba(123, 45, 142, 0.4);
  box-shadow: 0 0 12px rgba(123, 45, 142, 0.12);
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #2a2a3a;
  font-size: 13px;
  padding: 8px 14px;
}
.search-input::placeholder { color: rgba(100, 80, 140, 0.3); }
.search-btn {
  background: transparent;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
  line-height: 1;
}
.search-btn:hover { opacity: 0.7; }

/* ===== Top-Right Avatar ===== */
.avatar-corner {
  position: fixed;
  top: 12px;
  right: 20px;
  z-index: 300;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  transition: background 0.25s;
}
.avatar-corner:hover {
  background: rgba(255,255,255,0.06);
}
.avatar-corner .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7b2d8e, #533483);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,0.1);
  transition: border-color 0.3s;
}
.avatar-corner:hover .avatar {
  border-color: rgba(123,45,142,0.5);
  box-shadow: 0 0 16px rgba(123,45,142,0.3);
}
.avatar-corner .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-corner .avatar-text {
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}
.avatar-corner .avatar-name {
  font-size: 13px;
  color: rgba(80, 60, 120, 0.5);
  transition: color 0.2s;
}
.avatar-corner:hover .avatar-name {
  color: #7b2d8e;
}

/* ===== Main Content ===== */
.back-btn {
  position: fixed;
  top: 60px;
  left: 200px;
  z-index: 999;
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  border: none;
  border-radius: 10px;
  padding: 8px 20px;
  font-size: 14px;
  color: #5a4a7a;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  font-weight: 600;
  box-shadow: 0 2px 16px rgba(168, 237, 234, 0.4);
}
.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(254, 214, 227, 0.55);
}

.site-main {
  max-width: 1450px;
  margin: 0 auto;
  padding: 100px 24px 0 224px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: padding-left 0.3s;
  background: transparent;
}
.sidebar-collapsed .site-main {
  padding-left: 84px;
}
</style>
