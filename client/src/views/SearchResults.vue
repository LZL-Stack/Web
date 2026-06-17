<template>
  <div class="search-page">
    <div class="section">
      <div class="section-header">
        <div class="section-header-left">
          <span class="section-icon">{{ pageIcon }}</span>
          <h2>{{ pageTitle }}</h2>
        </div>
        <span class="section-count">{{ displayVideos.length }} 个视频</span>
      </div>
      <div class="section-divider"></div>

      <!-- Search mode: empty keyword -->
      <div v-if="isSearch && !keyword" class="empty">
        <div class="empty-icon">🔍</div>
        <h2>输入关键词搜索视频</h2>
      </div>

      <!-- Search mode: no results -->
      <div v-else-if="isSearch && keyword && filtered.length === 0" class="empty">
        <div class="empty-icon">😕</div>
        <h2>没有找到 "{{ keyword }}" 相关视频</h2>
        <p>试试其他关键词</p>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- Video grid -->
      <div v-else class="video-grid">
        <div
          v-for="video in displayVideos"
          :key="video.id"
          class="video-card"
          @click="$router.push(`/video/${video.id}`)"
        >
          <div class="video-thumb" :style="{ background: getGradient(video.id) }">
            <div class="video-thumb-glow"></div>
            <div class="play-icon"><span class="play-triangle">▶</span></div>
            <div class="video-duration" v-if="video.duration">{{ video.duration }}</div>
          </div>
          <div class="video-info">
            <h3 class="video-title">{{ video.title }}</h3>
            <p class="video-meta">
              <span>{{ formatSize(video.size) }}</span>
              <span v-if="video.createdAt" class="meta-dot">·</span>
              <span v-if="video.createdAt">{{ formatDate(video.createdAt) }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Pagination for tab mode -->
      <div v-if="!isSearch && !loading && totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage = 1">首页</button>
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
        <button
          v-for="p in pageWindow" :key="p"
          :class="['page-btn', { active: p === currentPage }]"
          @click="currentPage = p"
        >{{ p }}</button>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage = totalPages">尾页</button>
        <div class="page-jump">
          <span class="page-jump-label">跳至</span>
          <input v-model.number="pageInput" type="number" class="page-jump-input" :min="1" :max="totalPages" @keyup.enter="jumpToPage" />
          <span class="page-jump-label">页</span>
          <button class="page-btn jump-btn" @click="jumpToPage">GO</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getVideos } from '../api/index.js'

export default {
  name: 'SearchResults',
  setup() {
    const route = useRoute()
    const videos = ref([])
    const loading = ref(true)
    const currentPage = ref(1)
    const pageInput = ref('')
    const PAGE_SIZE = 12
    const PAGE_WINDOW = 6

    const keyword = computed(() => (route.query.q || '').trim())
    const tab = computed(() => route.query.tab || '')
    const filterSection = computed(() => route.query.section || '')

    const isSearch = computed(() => !!keyword.value)

    // Title & icon based on mode
    const pageIcon = computed(() => {
      if (isSearch.value) return '🔍'
      if (tab.value === 'hot') return '🔥'
      if (tab.value === 'latest') return '✦'
      return '📹'
    })

    const pageTitle = computed(() => {
      if (isSearch.value) return `搜索: ${keyword.value}`
      if (tab.value === 'hot') return '热门推荐'
      if (tab.value === 'latest') return '最新更新'
      return '全部视频'
    })

    // Filtered results for search
    const filtered = computed(() => {
      const kw = keyword.value.toLowerCase()
      if (!kw) return []
      return videos.value.filter(v => v.title.toLowerCase().includes(kw))
    })

    // Section-filtered videos
    const sectionFiltered = computed(() => {
      if (!filterSection.value) return videos.value
      return videos.value.filter(v => v.section === filterSection.value)
    })

    // Which videos to display
    const displaySource = computed(() => {
      if (isSearch.value) return filtered.value
      return sectionFiltered.value
    })

    // Pagination
    const totalPages = computed(() => Math.max(1, Math.ceil(displaySource.value.length / PAGE_SIZE)))

    const displayVideos = computed(() => {
      if (isSearch.value) return filtered.value
      const start = (currentPage.value - 1) * PAGE_SIZE
      return displaySource.value.slice(start, start + PAGE_SIZE)
    })

    const pageWindow = computed(() => {
      const total = totalPages.value
      const cur = currentPage.value
      const half = Math.floor(PAGE_WINDOW / 2)
      let start = Math.max(1, cur - half)
      let end = Math.min(total, start + PAGE_WINDOW - 1)
      if (end - start + 1 < PAGE_WINDOW) {
        start = Math.max(1, end - PAGE_WINDOW + 1)
      }
      const pages = []
      for (let i = start; i <= end; i++) pages.push(i)
      return pages
    })

    function jumpToPage() {
      const p = Number(pageInput.value)
      if (p >= 1 && p <= totalPages.value) {
        currentPage.value = p
        pageInput.value = ''
      }
    }

    // Reset page when route changes
    watch(() => [route.query.q, route.query.tab], () => {
      currentPage.value = 1
      pageInput.value = ''
    })

    onMounted(async () => {
      try {
        const res = await getVideos()
        if (res.success) videos.value = res.data
      } catch (e) {
        console.error('加载失败:', e)
      } finally {
        loading.value = false
      }
    })

    function getGradient(id) {
      const g = [
        'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
        'linear-gradient(135deg, #0f3460, #533483, #7b2d8e)',
        'linear-gradient(135deg, #2d1b69, #1a1a2e, #0f0c29)',
        'linear-gradient(135deg, #1e1e3f, #2d1b69, #533483)'
      ]
      return g[id % g.length]
    }

    function formatSize(bytes) {
      if (!bytes) return '未知大小'
      const mb = bytes / 1024 / 1024
      if (mb < 1) return (bytes / 1024).toFixed(1) + ' KB'
      return mb.toFixed(1) + ' MB'
    }

    function formatDate(dateStr) {
      return dateStr ? dateStr.slice(0, 10) : ''
    }

    return {
      keyword, isSearch, pageIcon, pageTitle,
      displayVideos, filtered, loading,
      currentPage, totalPages, pageWindow, pageInput, jumpToPage,
      getGradient, formatSize, formatDate
    }
  }
}
</script>

<style scoped>
.search-page { position: relative; z-index: 1; }

.section-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
}
.section-header-left { display: flex; align-items: center; gap: 10px; }
.section-icon { font-size: 16px; }
.section-header h2 { font-size: 22px; font-weight: 700; color: #e8e0f0; letter-spacing: 1px; }
.section-count { font-size: 13px; color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.05); padding: 4px 12px; border-radius: 12px; }
.section-divider { height: 2px; background: linear-gradient(90deg, #7b2d8e, transparent); margin-bottom: 24px; border-radius: 2px; }

.video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }

.video-card {
  background: rgba(255,255,255,0.03); border-radius: 12px; overflow: hidden; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.05); transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
}
.video-card:hover { transform: translateY(-6px); border-color: rgba(123,45,142,0.3); box-shadow: 0 16px 48px rgba(0,0,0,0.4); }
.video-thumb { height: 150px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.video-thumb-glow { position: absolute; width: 100%; height: 100%; background: radial-gradient(ellipse at center, rgba(255,255,255,0.06), transparent); pointer-events: none; }
.play-icon {
  width: 44px; height: 44px; background: rgba(255,255,255,0.1); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px); border: 2px solid rgba(255,255,255,0.15);
  transition: all 0.3s; z-index: 1;
}
.play-triangle { font-size: 15px; color: #fff; margin-left: 3px; }
.video-card:hover .play-icon { transform: scale(1.15); background: rgba(123,45,142,0.5); border-color: #7b2d8e; box-shadow: 0 0 24px rgba(123,45,142,0.4); }
.video-info { padding: 12px 14px; background: rgba(0,0,0,0.2); }
.video-title { font-size: 14px; font-weight: 600; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #e8e0f0; }
.video-card:hover .video-title { color: #b088d6; }
.video-meta { font-size: 12px; color: rgba(255,255,255,0.3); display: flex; align-items: center; gap: 4px; }
.meta-dot { opacity: 0.5; }
.video-duration {
  position: absolute; bottom: 8px; right: 8px;
  padding: 2px 8px; font-size: 11px; border-radius: 4px;
  background: rgba(0,0,0,0.6); color: rgba(255,255,255,0.7);
  backdrop-filter: blur(4px); z-index: 1;
}

.empty { text-align: center; padding: 80px 0; }
.empty-icon { font-size: 56px; margin-bottom: 12px; filter: grayscale(0.3); }
.empty h2 { font-size: 18px; margin-bottom: 6px; color: rgba(255,255,255,0.6); }
.empty p { color: rgba(255,255,255,0.3); font-size: 13px; }

.loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 0; color: rgba(255,255,255,0.4); }
.loading-spinner { width: 36px; height: 36px; border: 3px solid rgba(123,45,142,0.2); border-top-color: #7b2d8e; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== Pagination ===== */
.pagination {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin-top: 28px; padding: 4px 0; flex-wrap: wrap;
}
.page-btn {
  min-width: 36px; height: 36px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.5);
  font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.25s;
  display: flex; align-items: center; justify-content: center;
  padding: 0 10px;
}
.page-btn:hover:not(:disabled) {
  background: rgba(123,45,142,0.15);
  border-color: rgba(123,45,142,0.3);
  color: #b088d6;
}
.page-btn.active {
  background: linear-gradient(135deg, #7b2d8e, #533483);
  border-color: #7b2d8e;
  color: #fff;
  box-shadow: 0 4px 16px rgba(123,45,142,0.3);
}
.page-btn:disabled { opacity: 0.2; cursor: not-allowed; }
.page-jump { display: flex; align-items: center; gap: 4px; margin-left: 12px; }
.page-jump-label { font-size: 12px; color: rgba(255,255,255,0.3); white-space: nowrap; }
.page-jump-input {
  width: 48px; height: 36px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  color: #e8e0f0; font-size: 13px; text-align: center;
  outline: none; transition: border-color 0.25s;
  -moz-appearance: textfield;
}
.page-jump-input::-webkit-outer-spin-button,
.page-jump-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.page-jump-input:focus {
  border-color: rgba(123,45,142,0.5);
  box-shadow: 0 0 8px rgba(123,45,142,0.15);
}
.jump-btn { min-width: 36px; }
</style>
