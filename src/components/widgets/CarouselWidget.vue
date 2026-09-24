<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  previewMode: {
    type: Boolean,
    default: false
  }
})

const p = computed(() => props.component.props || {})

// 每行一项：图片地址|说明文字|跳转链接
const slides = computed(() =>
  String(p.value.images || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [url, caption, link] = line.split('|')
      return {
        url: (url || '').trim(),
        caption: (caption || '').trim(),
        link: (link || '').trim()
      }
    })
    .filter(slide => slide.url)
)

const linkTarget = computed(() => p.value.linkTarget || '_self')

/**
 * 编辑态阻止跳转，避免在画布上误点就跳走；预览态正常跳转
 */
function handleSlideClick(event) {
  if (!props.previewMode) {
    event.preventDefault()
  }
}

const current = ref(0)
const showIndicators = computed(() => p.value.showIndicators !== false)
const showArrows = computed(() => p.value.showArrows !== false)
// 编辑态不自动播放，避免干扰编辑；预览态按设置自动播放
const autoplay = computed(() => p.value.autoplay === true && props.previewMode)
const interval = computed(() => Math.max(500, Number(p.value.interval) || 3000))

let timer = null

function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function start() {
  stop()
  if (autoplay.value && slides.value.length > 1) {
    timer = setInterval(next, interval.value)
  }
}

function next() {
  if (slides.value.length === 0) return
  current.value = (current.value + 1) % slides.value.length
}

function prev() {
  if (slides.value.length === 0) return
  current.value = (current.value - 1 + slides.value.length) % slides.value.length
}

function goTo(index) {
  current.value = index
}

// 当前索引越界时回到第一张
watch(slides, () => {
  if (current.value >= slides.value.length) current.value = 0
  start()
})

watch([autoplay, interval], start)

onMounted(start)
onUnmounted(stop)
</script>

<template>
  <div class="carousel-widget">
    <div v-if="slides.length === 0" class="carousel-empty">请填写图片地址（每行一项：地址|说明）</div>

    <template v-else>
      <div class="carousel-stage">
        <a
          class="carousel-slide-link"
          :class="{ clickable: !!slides[current]?.link }"
          :href="slides[current]?.link || undefined"
          :target="slides[current]?.link ? linkTarget : undefined"
          @click="handleSlideClick"
        >
          <img
            class="carousel-image"
            :src="slides[current]?.url"
            :alt="slides[current]?.caption || ''"
          />
        </a>
        <div v-if="slides[current]?.caption" class="carousel-caption">
          {{ slides[current].caption }}
        </div>

        <button
          v-if="showArrows && slides.length > 1"
          class="carousel-arrow carousel-arrow-left"
          type="button"
          @click.stop="prev"
        >‹</button>
        <button
          v-if="showArrows && slides.length > 1"
          class="carousel-arrow carousel-arrow-right"
          type="button"
          @click.stop="next"
        >›</button>
      </div>

      <div v-if="showIndicators && slides.length > 1" class="carousel-dots">
        <span
          v-for="(slide, index) in slides"
          :key="index"
          class="carousel-dot"
          :class="{ active: index === current }"
          @click.stop="goTo(index)"
        ></span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.carousel-widget {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: inherit;
  box-sizing: border-box;
}

.carousel-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
}

.carousel-slide-link {
  display: block;
  width: 100%;
  height: 100%;
  text-decoration: none;
}

.carousel-slide-link.clickable {
  cursor: pointer;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.45);
  color: #ffffff;
  font-size: 13px;
  line-height: 1.5;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.35);
  color: #ffffff;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.carousel-arrow:hover {
  background-color: rgba(0, 0, 0, 0.6);
}

.carousel-arrow-left {
  left: 10px;
}

.carousel-arrow-right {
  right: 10px;
}

.carousel-dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  z-index: 2;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.carousel-dot:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.carousel-dot.active {
  width: 20px;
  border-radius: 4px;
  background-color: #ffffff;
}

.carousel-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-size: 13px;
  text-align: center;
  padding: 12px;
  box-sizing: border-box;
}
</style>
