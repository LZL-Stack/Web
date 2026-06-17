<template>
  <div class="home">
    <!-- Anime-style decorative elements -->
    <div class="anime-deco">
      <div class="deco-circle c1"></div>
      <div class="deco-circle c2"></div>
      <div class="deco-circle c3"></div>
      <div class="deco-line l1"></div>
      <div class="deco-line l2"></div>
    </div>

    <!-- ===== Main Content Box ===== -->
    <div class="main-content-box">

    <!-- Hero Carousel (unchanged) -->
    <div class="hero-section">
      <div class="hero-bg-glow"></div>
      <div class="carousel">
        <div
          class="carousel-slides"
          :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
        >
          <div
            v-for="(item, index) in bannerItems"
            :key="index"
            class="carousel-slide"
            :style="{ backgroundImage: `url(${item.image})` }"
          >
            <div class="carousel-overlay"></div>
            <div class="carousel-content">
              <div class="carousel-badge">{{ item.badge }}</div>
              <h2 class="carousel-title">{{ item.title }}</h2>
              <p class="carousel-desc">{{ item.desc }}</p>
            </div>
          </div>
        </div>
        <div class="carousel-dots">
          <span
            v-for="(item, index) in bannerItems"
            :key="index"
            :class="['dot', { active: index === currentSlide }]"
            @click="currentSlide = index"
          ></span>
        </div>
        <button class="carousel-arrow left" @click="prevSlide">‹</button>
        <button class="carousel-arrow right" @click="nextSlide">›</button>
      </div>
    </div>

    <!-- ===== Category Tag Bar ===== -->
    <div class="section category-bar">
      <div class="category-tags">
        <span
          v-for="cat in categories"
          :key="cat"
          :class="['cat-tag', { active: activeCategory === cat }]"
          @click="activeCategory = cat"
        >{{ cat }}</span>
      </div>
      <div class="category-more">探索更多 ›</div>
    </div>

    <!-- ===== Featured / Trending Section ===== -->
    <div class="section featured-section">
      <div class="section-header">
        <div class="section-header-left">
          <span class="section-icon">🔥</span>
          <h2>热门推荐</h2>
        </div>
        <router-link :to="`/search?tab=hot&section=hot`" class="section-link">查看全部 ›</router-link>
      </div>
      <div class="section-divider"></div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <div v-else-if="videos.length === 0" class="empty">
        <div class="empty-glow"></div>
        <div class="empty-icon">🎬</div>
        <h2>还没有视频</h2>
        <p>内容即将上线，敬请期待</p>
      </div>

      <div v-if="hotVideos.length > 0">
        <div class="featured-grid">
          <div
            v-for="v in hotVideos.slice(0, 4)"
            :key="v.id"
            class="featured-card"
            @click="$router.push(`/video/${v.id}`)"
          >
            <div class="featured-bg" :style="{ background: getGradient(v.id) }">
              <div class="featured-glow"></div>
              <div class="featured-play-btn">▶</div>
              <div class="featured-badge" v-if="hotVideos.indexOf(v) === 0">精选</div>
              <div class="featured-rank" v-else-if="hotVideos.indexOf(v) + 1 <= 4">TOP{{ hotVideos.indexOf(v) + 1 }}</div>
            </div>
            <div class="featured-info">
              <h3>{{ v.title }}</h3>
              <p>{{ formatSize(v.size) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Latest Videos Section ===== -->
    <div class="section latest-section">
      <div class="section-header">
        <div class="section-header-left">
          <span class="section-icon">✦</span>
          <h2>最新更新</h2>
          <span class="section-badge">NEW</span>
        </div>
        <router-link :to="`/search?tab=latest&section=latest`" class="section-link">查看全部 ›</router-link>
      </div>
      <div class="section-divider"></div>

      <div v-if="!loading && latestVideos.length > 0" class="video-grid">
        <div
          v-for="video in paginatedVideos"
          :key="video.id"
          class="video-card"
          @click="$router.push(`/video/${video.id}`)"
        >
          <div class="video-thumb" :style="{ background: getGradient(video.id) }">
            <div class="video-thumb-glow"></div>
            <div class="play-icon">
              <span class="play-triangle">▶</span>
            </div>
            <div class="video-duration" v-if="video.duration">{{ video.duration }}</div>
          </div>
          <div class="video-info">
            <h3 class="video-title">{{ video.title }}</h3>
            <p class="video-meta">
              <span class="meta-size">{{ formatSize(video.size) }}</span>
              <span v-if="video.createdAt" class="meta-dot">·</span>
              <span v-if="video.createdAt" class="meta-date">{{ formatDate(video.createdAt) }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- ===== Pagination ===== -->
      <div v-if="!loading && latestVideos.length > 8" class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage = 1"
        >首页</button>
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >‹</button>
        <button
          v-for="p in pageWindow"
          :key="p"
          :class="['page-btn', { active: p === currentPage }]"
          @click="currentPage = p"
        >{{ p }}</button>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >›</button>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage = totalPages"
        >尾页</button>
        <div class="page-jump">
          <span class="page-jump-label">跳至</span>
          <input
            v-model.number="pageInput"
            type="number"
            class="page-jump-input"
            :min="1"
            :max="totalPages"
            @keyup.enter="jumpToPage"
          />
          <span class="page-jump-label">页</span>
          <button class="page-btn jump-btn" @click="jumpToPage">GO</button>
        </div>
      </div>
    </div>

    <!-- ===== Genre Tags Cloud ===== -->
    <div class="section tags-section">
      <div class="section-header">
        <div class="section-header-left">
          <span class="section-icon">🏷</span>
          <h2>热门标签</h2>
        </div>
      </div>
      <div class="section-divider"></div>
      <div class="tags-cloud">
        <span
          v-for="tag in genreTags"
          :key="tag"
          class="tag-item"
          :style="{ fontSize: tagSize(tag) }"
        >{{ tag }}</span>
      </div>
    </div>

    <!-- ===== Site Footer ===== -->
    <div class="site-footer">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>关于我们</h4>
          <a href="#">视频介绍</a>
          <a href="#">联系方式</a>
          <a href="#">免责声明</a>
        </div>
        <div class="footer-col">
          <h4>视频分类</h4>
          <a href="#">国漫专区</a>
          <a href="#">日漫专区</a>
          <a href="#">热门排行</a>
        </div>
        <div class="footer-col">
          <h4>友情链接</h4>
          <a href="#">斗破苍穹</a>
          <a href="#">吞噬星空</a>
          <a href="#">完美世界</a>
        </div>
        <div class="footer-col">
          <h4>帮助支持</h4>
          <a href="#">播放帮助</a>
          <a href="#">意见反馈</a>
          <a href="#">广告合作</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>本站内容仅供学习交流，请勿用于商业用途。如有侵权请联系删除。</p>
        <p class="footer-icp">© 2026 视频网站  All Rights Reserved</p>
      </div>
    </div>
    </div>
    <!-- ===== Main Content Box End ===== -->
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getVideos } from '../api/index.js'

export default {
  name: 'Home',
  setup() {
    const videos = ref([])
    const loading = ref(true)
    const currentSlide = ref(0)
    const activeCategory = ref('全部')
    const currentPage = ref(1)
    const PAGE_SIZE = 8
    const PAGE_WINDOW = 6
    const pageInput = ref('')
    let timer = null

    const hotVideos = computed(() => videos.value.filter(v => v.section === 'hot'))
    const latestVideos = computed(() => videos.value.filter(v => v.section === 'latest'))

    const totalPages = computed(() => Math.max(1, Math.ceil(latestVideos.value.length / PAGE_SIZE)))

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

    const paginatedVideos = computed(() => {
      const start = (currentPage.value - 1) * PAGE_SIZE
      return latestVideos.value.slice(start, start + PAGE_SIZE)
    })

    function jumpToPage() {
      const p = Number(pageInput.value)
      if (p >= 1 && p <= totalPages.value) {
        currentPage.value = p
        pageInput.value = ''
      }
    }

    const categories = ['全部', '国漫', '日漫', '热血', '玄幻', '修仙', '科幻', '搞笑', '冒险']
    const genreTags = ['斗破苍穹', '吞噬星空', '凡人修仙传', '喜羊羊', '熊出没', '完美世界', '仙逆', '神印王座', '一念永恒', '斗罗大陆', '绝世唐门', '大主宰', '武动乾坤', '遮天', '星辰变']

    const bannerItems = [
      { title: '斗破苍穹', desc: '三十年河东，三十年河西，莫欺少年穷', badge: '热血 · 玄幻', image: '/images/doupocangqiong.jpg' },
      { title: '喜羊羊与灰太狼', desc: '我一定会回来的！', badge: '经典 · 童年', image: '/images/xiyangyang.jpg' },
      { title: '熊出没', desc: '保护森林，熊熊有责', badge: '欢乐 · 冒险', image: '/images/xiongchumo.jpg' },
      { title: '凡人修仙传', desc: '修仙之路，漫漫其修远兮', badge: '修仙 · 国漫', image: '/images/fanrenxiuxian.jpg' },
      { title: '吞噬星空', desc: '浩瀚宇宙，强者为尊', badge: '科幻 · 战斗', image: '/images/tunshixingkong.jpg' }
    ]

    onMounted(async () => {
      try {
        const res = await getVideos()
        if (res.success) videos.value = res.data
      } catch (e) {
        console.error('加载视频列表失败:', e)
      } finally {
        loading.value = false
        currentPage.value = 1
      }
      timer = setInterval(() => nextSlide(), 4500)
    })

    onUnmounted(() => { if (timer) clearInterval(timer) })

    function nextSlide() { currentSlide.value = (currentSlide.value + 1) % bannerItems.length }
    function prevSlide() { currentSlide.value = (currentSlide.value - 1 + bannerItems.length) % bannerItems.length }

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

    function tagSize(tag) {
      const sizes = ['12px', '13px', '14px', '15px', '16px', '18px']
      const idx = tag.length % sizes.length
      return sizes[idx]
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

    return { videos, loading, currentSlide, bannerItems, categories, activeCategory, genreTags, nextSlide, prevSlide, getGradient, tagSize, formatSize, formatDate, paginatedVideos, currentPage, totalPages, pageWindow, pageInput, jumpToPage, hotVideos, latestVideos }
  }
}
</script>

<style scoped>
/* ========================================
   ANIME THEME - DARK NEON STYLE
   ======================================== */
.home {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ===== Anime Decorative Elements ===== */
.anime-deco {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}
.deco-circle.c1 {
  width: 600px; height: 600px; top: -200px; right: -100px;
  background: radial-gradient(circle, #7b2d8e, #533483, transparent);
  animation: float1 20s ease-in-out infinite;
}
.deco-circle.c2 {
  width: 500px; height: 500px; bottom: -150px; left: -150px;
  background: radial-gradient(circle, #0f3460, #16213e, transparent);
  animation: float2 25s ease-in-out infinite;
}
.deco-circle.c3 {
  width: 300px; height: 300px; top: 50%; left: 60%;
  background: radial-gradient(circle, #533483, transparent);
  animation: float3 15s ease-in-out infinite;
}
@keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-80px,60px)} }
@keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(60px,-80px)} }
@keyframes float3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-40px,40px) scale(1.2)} }

.deco-line {
  position: absolute; height: 1px; width: 100%; opacity: 0.05;
  background: linear-gradient(90deg, transparent, #7b2d8e, #0f3460, transparent);
}
.deco-line.l1 { top: 20%; animation: slideLine 8s linear infinite; }
.deco-line.l2 { top: 70%; animation: slideLine 12s linear infinite reverse; }
@keyframes slideLine { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }

/* ===== Main Content Box ===== */
.main-content-box {
  flex: 1;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 24px;
  padding: 32px 40px;
  margin: 24px 0 0;
  box-shadow: 0 4px 40px rgba(0, 0, 0, 0.15);
}

/* ===== Hero Section ===== */
.hero-section { position: relative; z-index: 1; margin-bottom: 32px; }
.hero-bg-glow {
  position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
  width: 800px; height: 400px;
  background: radial-gradient(ellipse, rgba(83, 52, 131, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

/* ===== Carousel ===== */
.carousel {
  position: relative; border-radius: 16px; overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
}
.carousel-slides { display: flex; transition: transform 0.6s cubic-bezier(0.4,0,0.2,1); }
.carousel-slide {
  min-width: 100%; height: 420px; display: flex; align-items: center; justify-content: center;
  position: relative; background-size: cover; background-position: center center; background-repeat: no-repeat;
}
.carousel-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(10,10,26,0.1) 0%, rgba(10,10,26,0.3) 40%, rgba(10,10,26,0.75) 100%);
}
.carousel-content { position: relative; z-index: 2; text-align: center; color: #fff; padding: 40px; max-width: 700px; }
.carousel-badge {
  display: inline-block; padding: 4px 16px; border-radius: 20px;
  background: rgba(123,45,142,0.6); backdrop-filter: blur(8px);
  font-size: 12px; letter-spacing: 2px; margin-bottom: 16px;
  border: 1px solid rgba(255,255,255,0.1); text-transform: uppercase;
}
.carousel-title {
  font-size: 42px; font-weight: 800; margin-bottom: 12px;
  text-shadow: 0 4px 24px rgba(0,0,0,0.6); letter-spacing: 3px;
  background: linear-gradient(135deg, #fff 60%, #b088d6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.carousel-desc { font-size: 16px; opacity: 0.85; line-height: 1.6; text-shadow: 0 2px 8px rgba(0,0,0,0.4); color: rgba(255,255,255,0.85); }
.carousel-dots { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 3; }
.dot {
  width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.3);
  cursor: pointer; transition: all 0.3s;
}
.dot.active {
  width: 28px; border-radius: 4px;
  background: linear-gradient(90deg, #7b2d8e, #b088d6);
  box-shadow: 0 0 12px rgba(123,45,142,0.6);
}
.carousel-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 44px; height: 44px; border-radius: 50%; border: none;
  background: rgba(255,255,255,0.08); backdrop-filter: blur(12px);
  color: #fff; font-size: 28px; cursor: pointer; transition: all 0.3s;
  z-index: 3; display: flex; align-items: center; justify-content: center;
  line-height: 1; border: 1px solid rgba(255,255,255,0.08);
}
.carousel-arrow:hover { background: rgba(123,45,142,0.5); border-color: rgba(123,45,142,0.4); transform: translateY(-50%) scale(1.1); }
.carousel-arrow.left { left: 16px; }
.carousel-arrow.right { right: 16px; }

/* ===== Section ===== */
.section { position: relative; z-index: 1; margin-bottom: 56px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-header-left { display: flex; align-items: center; gap: 10px; }
.section-icon { font-size: 16px; }
.section-header h2 { font-size: 22px; font-weight: 700; color: #2a2a3a; letter-spacing: 1px; }
.section-badge {
  font-size: 10px; padding: 2px 8px; border-radius: 8px;
  background: linear-gradient(135deg, #7b2d8e, #b088d6);
  color: #fff; font-weight: 700; letter-spacing: 1px; animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
.section-link { font-size: 13px; color: rgba(100, 80, 140, 0.5); cursor: pointer; transition: color 0.3s; text-decoration: none; }
.section-link:hover { color: #7b2d8e; }
.section-divider { height: 2px; background: linear-gradient(90deg, #7b2d8e, transparent); margin-bottom: 24px; border-radius: 2px; }

/* ===== Category Bar ===== */
.category-bar {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(180, 160, 210, 0.1); border-radius: 12px;
  padding: 12px 20px; border: 1px solid rgba(180, 160, 210, 0.15);
}
.category-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.cat-tag {
  padding: 6px 16px; background: rgba(180, 160, 210, 0.12); border-radius: 20px;
  font-size: 13px; color: rgba(80, 60, 120, 0.5); cursor: pointer; transition: all 0.3s;
  border: 1px solid rgba(180, 160, 210, 0.15);
}
.cat-tag:hover { background: rgba(123,45,142,0.2); color: #b088d6; border-color: rgba(123,45,142,0.3); }
.cat-tag.active {
  background: linear-gradient(135deg, #7b2d8e, #533483);
  color: #fff; border-color: transparent; box-shadow: 0 0 16px rgba(123,45,142,0.3);
}
.category-more { font-size: 13px; color: rgba(100, 80, 140, 0.4); cursor: pointer; transition: color 0.3s; white-space: nowrap; margin-left: 12px; }
.category-more:hover { color: #7b2d8e; }

/* ===== Featured Section ===== */
.featured-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.featured-card {
  border-radius: 14px; overflow: hidden; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.06);
  transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
  position: relative;
}
.featured-card:hover { transform: translateY(-6px); border-color: rgba(123,45,142,0.3); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
.featured-bg {
  position: relative; height: 200px; display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.featured-glow {
  position: absolute; width: 200%; height: 200%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.08), transparent);
  pointer-events: none;
}
.featured-play-btn {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: #fff; border: 2px solid rgba(255,255,255,0.2);
  transition: all 0.3s; z-index: 1;
}
.featured-card:hover .featured-play-btn { background: rgba(123,45,142,0.5); border-color: #7b2d8e; transform: scale(1.1); box-shadow: 0 0 30px rgba(123,45,142,0.4); }
.featured-badge {
  position: absolute; top: 12px; left: 12px;
  padding: 4px 14px; border-radius: 6px;
  background: linear-gradient(135deg, #7b2d8e, #b088d6);
  color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 1px;
  z-index: 1;
}
.featured-rank {
  position: absolute; top: 10px; right: 10px;
  padding: 2px 10px; border-radius: 4px;
  background: rgba(0,0,0,0.5); color: #f0c040; font-size: 11px; font-weight: 700;
  backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.08); z-index: 1;
}
.featured-info { padding: 14px 16px; background: rgba(255, 255, 255, 0.7); }
.featured-info h3 { font-size: 15px; font-weight: 600; color: #2a2a3a; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.featured-info p { font-size: 12px; color: rgba(100, 80, 140, 0.4); }

/* ===== Video Grid ===== */
.video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 26px; }
.video-card {
  background: rgba(255, 255, 255, 0.6); border-radius: 12px; overflow: hidden; cursor: pointer;
  border: 1px solid rgba(180, 160, 210, 0.15); transition: all 0.35s cubic-bezier(0.4,0,0.2,1); position: relative;
}
.video-card::before {
  content: ''; position: absolute; inset: 0; border-radius: 12px;
  background: linear-gradient(135deg, rgba(123,45,142,0.05), transparent);
  opacity: 0; transition: opacity 0.35s; pointer-events: none;
}
.video-card:hover { transform: translateY(-8px); border-color: rgba(123,45,142,0.3); box-shadow: 0 16px 48px rgba(0,0,0,0.4), 0 0 24px rgba(123,45,142,0.15); }
.video-card:hover::before { opacity: 1; }
.video-thumb {
  height: 160px; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.video-thumb-glow { position: absolute; width: 100%; height: 100%; background: radial-gradient(ellipse at center, rgba(255,255,255,0.06), transparent); pointer-events: none; }
.play-icon {
  width: 48px; height: 48px; background: rgba(255,255,255,0.1); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px); border: 2px solid rgba(255,255,255,0.15);
  transition: all 0.3s; z-index: 1;
}
.play-triangle { font-size: 16px; color: #fff; margin-left: 3px; }
.video-card:hover .play-icon { transform: scale(1.15); background: rgba(123,45,142,0.5); border-color: #7b2d8e; box-shadow: 0 0 24px rgba(123,45,142,0.4); }
.video-duration {
  position: absolute; bottom: 8px; right: 8px;
  padding: 2px 8px; font-size: 11px; border-radius: 4px;
  background: rgba(0,0,0,0.6); color: rgba(255,255,255,0.7);
  backdrop-filter: blur(4px); z-index: 1;
}
.video-info { padding: 12px 14px; background: rgba(255, 255, 255, 0.5); }
.video-title { font-size: 14px; font-weight: 600; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #2a2a3a; transition: color 0.3s; }
.video-card:hover .video-title { color: #7b2d8e; }
.video-meta { font-size: 12px; color: rgba(100, 80, 140, 0.4); display: flex; align-items: center; gap: 4px; }

/* ===== Pagination ===== */
.pagination {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin-top: 28px; padding: 4px 0;
}
.page-btn {
  min-width: 36px; height: 36px; border-radius: 8px;
  border: 1px solid rgba(180, 160, 210, 0.2);
  background: rgba(255, 255, 255, 0.5);
  color: rgba(80, 60, 120, 0.5);
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
.page-btn:disabled {
  opacity: 0.2; cursor: not-allowed;
}
.page-jump {
  display: flex; align-items: center; gap: 4px; margin-left: 12px;
}
.page-jump-label {
  font-size: 12px; color: rgba(100, 80, 140, 0.4); white-space: nowrap;
}
.page-jump-input {
  width: 48px; height: 36px; border-radius: 8px;
  border: 1px solid rgba(180, 160, 210, 0.2);
  background: rgba(255, 255, 255, 0.5);
  color: #2a2a3a; font-size: 13px; text-align: center;
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
.meta-dot { opacity: 0.5; }

/* ===== Tags Cloud ===== */
.tags-cloud { display: flex; flex-wrap: wrap; gap: 10px; padding: 8px 0; }
.tag-item {
  display: inline-block; padding: 6px 18px; border-radius: 20px;
  background: rgba(180, 160, 210, 0.12); border: 1px solid rgba(180, 160, 210, 0.15);
  color: rgba(80, 60, 120, 0.5); cursor: pointer; transition: all 0.3s; font-weight: 600;
}
.tag-item:hover { background: rgba(123,45,142,0.12); color: #7b2d8e; border-color: rgba(123,45,142,0.25); transform: translateY(-2px); }

/* ===== Site Footer ===== */
.site-footer {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(180, 160, 210, 0.2);
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  margin-bottom: 32px;
}

.footer-col h4 {
  font-size: 14px;
  font-weight: 700;
  color: #2a2a3a;
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.footer-col a {
  display: block;
  font-size: 13px;
  color: rgba(100, 80, 140, 0.4);
  text-decoration: none;
  margin-bottom: 10px;
  transition: color 0.3s;
}

.footer-col a:hover {
  color: #7b2d8e;
}

.footer-bottom {
  text-align: center;
  padding: 20px 0 8px;
  border-top: 1px solid rgba(180, 160, 210, 0.12);
}

.footer-bottom p {
  font-size: 12px;
  color: rgba(100, 80, 140, 0.3);
  margin-bottom: 4px;
}

.footer-icp {
  font-size: 11px;
  color: rgba(100, 80, 140, 0.2);
}

/* ===== Loading ===== */
.loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 0; color: rgba(100, 80, 140, 0.4); font-size: 14px; }
.loading-spinner { width: 36px; height: 36px; border: 3px solid rgba(123,45,142,0.2); border-top-color: #7b2d8e; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== Empty ===== */
.empty { text-align: center; padding: 60px 0; position: relative; }
.empty-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 200px; height: 200px; background: radial-gradient(circle, rgba(123,45,142,0.1), transparent); pointer-events: none; }
.empty-icon { font-size: 56px; margin-bottom: 12px; filter: grayscale(0.3); }
.empty h2 { font-size: 18px; margin-bottom: 6px; color: rgba(255,255,255,0.6); }
.empty p { color: rgba(255,255,255,0.3); font-size: 13px; }
</style>
