<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

const p = computed(() => props.component.props || {})

const src = computed(() => p.value.src || '')
const isIframe = computed(() => p.value.videoType === 'iframe')
const poster = computed(() => p.value.poster || undefined)
const autoplay = computed(() => p.value.autoplay === true)
const loop = computed(() => p.value.loop === true)
// 浏览器要求自动播放必须静音
const muted = computed(() => p.value.muted !== false)
const controls = computed(() => p.value.controls !== false)
</script>

<template>
  <div class="video-widget">
    <iframe
      v-if="isIframe && src"
      class="video-el"
      :src="src"
      frameborder="0"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowfullscreen
    ></iframe>
    <video
      v-else-if="src"
      class="video-el"
      :src="src"
      :poster="poster"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      :controls="controls"
      playsinline
    ></video>
    <div v-else class="video-empty">请填写视频地址</div>
  </div>
</template>

<style scoped>
.video-widget {
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.video-el {
  width: 100%;
  height: 100%;
  display: block;
  border: none;
  object-fit: contain;
}

.video-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-size: 13px;
}
</style>
