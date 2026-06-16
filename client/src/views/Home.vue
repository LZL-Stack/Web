<template>
  <div class="home">
    <!-- Carousel Banner -->
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
            <h2 class="carousel-title">{{ item.title }}</h2>
            <p class="carousel-desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
      <!-- Dots -->
      <div class="carousel-dots">
        <span
          v-for="(item, index) in bannerItems"
          :key="index"
          :class="['dot', { active: index === currentSlide }]"
          @click="currentSlide = index"
        ></span>
      </div>
      <!-- Arrows -->
      <button class="carousel-arrow left" @click="prevSlide">‹</button>
      <button class="carousel-arrow right" @click="nextSlide">›</button>
    </div>

    <!-- Video list section -->
    <div class="section">
      <div class="section-header">
        <h2>全部视频</h2>
        <span class="section-count" v-if="videos.length">{{ videos.length }} 个视频</span>
      </div>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="videos.length === 0" class="empty">
        <div class="empty-icon">📹</div>
        <h2>还没有视频</h2>
        <p>内容即将上线，敬请期待</p>
      </div>

      <div v-else class="video-grid">
        <div
          v-for="video in videos"
          :key="video.id"
          class="video-card"
          @click="$router.push(`/video/${video.id}`)"
        >
          <div class="video-thumb" :style="{ background: getGradient(video.id) }">
            <div class="play-icon">▶</div>
          </div>
          <div class="video-info">
            <h3 class="video-title">{{ video.title }}</h3>
            <p class="video-meta">
              {{ formatSize(video.size) }}
              <span v-if="video.createdAt"> · {{ formatDate(video.createdAt) }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { getVideos } from '../api/index.js'

export default {
  name: 'Home',
  setup() {
    const videos = ref([])
    const loading = ref(true)
    const currentSlide = ref(0)
    let timer = null

    const bannerItems = [
      { title: '斗破苍穹', desc: '三十年河东，三十年河西，莫欺少年穷', image: '/images/doupocangqiong.jpg' },
      { title: '喜羊羊与灰太狼', desc: '我一定会回来的！', image: '/images/xiyangyang.jpg' },
      { title: '熊出没', desc: '保护森林，熊熊有责', image: '/images/xiongchumo.jpg' },
      { title: '凡人修仙传', desc: '修仙之路，漫漫其修远兮', image: '/images/fanrenxiuxian.jpg' },
      { title: '吞噬星空', desc: '浩瀚宇宙，强者为尊', image: '/images/tunshixingkong.jpg' }
    ]

    onMounted(async () => {
      try {
        const res = await getVideos()
        if (res.success) videos.value = res.data
      } catch (e) {
        console.error('加载视频列表失败:', e)
      } finally {
        loading.value = false
      }

      // Auto-play carousel
      timer = setInterval(() => {
        nextSlide()
      }, 4000)
    })

    onUnmounted(() => {
      if (timer) clearInterval(timer)
    })

    function nextSlide() {
      currentSlide.value = (currentSlide.value + 1) % bannerItems.length
    }

    function prevSlide() {
      currentSlide.value = (currentSlide.value - 1 + bannerItems.length) % bannerItems.length
    }

    function getGradient(id) {
      const g = [
        'linear-gradient(135deg, #1a1a2e, #16213e)',
        'linear-gradient(135deg, #16213e, #0f3460)',
        'linear-gradient(135deg, #0f3460, #533483)',
        'linear-gradient(135deg, #302b63, #24243e)',
        'linear-gradient(135deg, #24243e, #16213e)'
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

    return { videos, loading, currentSlide, bannerItems, nextSlide, prevSlide, getGradient, formatSize, formatDate }
  }
}
</script>

<style scoped>
/* ===== Background ===== */
.home {
  position: relative;
}

.home::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(26, 26, 46, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(15, 52, 96, 0.03) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.section {
  position: relative;
  z-index: 1;
}

/* ===== Carousel ===== */
.carousel {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 48px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.carousel-slides {
  display: flex;
  transition: transform 0.6s ease-in-out;
}

.carousel-slide {
  min-width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}

.carousel-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.15) 0%,
    rgba(0,0,0,0.5) 100%
  );
}

.carousel-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
  padding: 40px;
  max-width: 700px;
}

.carousel-title {
  font-size: 38px;
  font-weight: 800;
  margin-bottom: 12px;
  text-shadow: 0 4px 16px rgba(0,0,0,0.5);
  letter-spacing: 2px;
}

.carousel-desc {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.6;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
}

/* Dots */
.carousel-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 3;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active {
  background: #fff;
  transform: scale(1.3);
  box-shadow: 0 0 8px rgba(255,255,255,0.5);
}

/* Arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.carousel-arrow:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-50%) scale(1.1);
}

.carousel-arrow.left {
  left: 16px;
}

.carousel-arrow.right {
  right: 16px;
}

/* ===== Section Header ===== */
.section-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}

.section-count {
  font-size: 14px;
  color: #888;
}

/* ===== Loading ===== */
.loading {
  text-align: center;
  padding: 80px 0;
  color: #888;
  font-size: 16px;
}

/* ===== Empty State ===== */
.empty {
  text-align: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty h2 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #333;
}

.empty p {
  color: #888;
}

/* ===== Video Grid ===== */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.video-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: transform 0.25s, box-shadow 0.25s;
}

.video-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}

.video-thumb {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  width: 56px;
  height: 56px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  backdrop-filter: blur(4px);
  transition: transform 0.3s;
}

.video-card:hover .play-icon {
  transform: scale(1.15);
}

.video-info {
  padding: 16px;
}

.video-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-meta {
  font-size: 13px;
  color: #888;
}
</style>
