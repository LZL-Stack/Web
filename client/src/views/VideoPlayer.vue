<template>
  <div class="player-page" v-if="video">
    <div class="video-container">
      <video
        ref="videoRef"
        :src="video.url"
        controls
        class="video-player"
        preload="metadata"
      ></video>
    </div>
    <div class="video-details">
      <h1>{{ video.title }}</h1>
      <p class="meta" v-if="video.description">{{ video.description }}</p>
      <p class="meta">
        {{ formatSize(video.size) }}
        <span v-if="video.createdAt"> · {{ formatDate(video.createdAt) }}</span>
      </p>
    </div>
  </div>

  <div v-else-if="loading" class="loading">加载中...</div>

  <div v-else class="loading">视频不存在或已被删除</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getVideo } from '../api/index.js'

export default {
  name: 'VideoPlayer',
  setup() {
    const route = useRoute()
    const video = ref(null)
    const loading = ref(true)
    const videoRef = ref(null)

    onMounted(async () => {
      try {
        const res = await getVideo(route.params.id)
        if (res.success) video.value = res.data
      } catch (e) {
        console.error('加载视频失败:', e)
      } finally {
        loading.value = false
      }
    })

    function formatSize(bytes) {
      if (!bytes) return '未知大小'
      const mb = bytes / 1024 / 1024
      if (mb < 1) return (bytes / 1024).toFixed(1) + ' KB'
      return mb.toFixed(1) + ' MB'
    }

    function formatDate(dateStr) {
      return dateStr ? dateStr.slice(0, 10) : ''
    }

    return { video, loading, videoRef, formatSize, formatDate }
  }
}
</script>

<style scoped>
.video-container {
  background: #000;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 24px;
}

.video-player {
  width: 100%;
  max-height: 70vh;
  display: block;
}

.video-details h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.meta {
  color: #888;
  font-size: 14px;
  line-height: 1.8;
}

.loading {
  text-align: center;
  padding: 80px 0;
  color: #888;
  font-size: 16px;
}
</style>
