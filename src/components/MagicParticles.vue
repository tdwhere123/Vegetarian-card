<template>
  <view class="particles-container">
    <view 
      v-for="(p, i) in particles" 
      :key="i" 
      class="particle"
      :style="p.style"
    >
      {{ p.char }}
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  theme: {
    type: String,
    default: 'normal'
  }
})

const particles = ref([])
const chars = ['✨', '🌿', '🍅', '🥔', '🥕', '⭐', '🍲']
const magicChars = ['✨', '🔮', '⚡', '🌙', '⭐', '🌌']

onMounted(() => {
  const count = 12
  const list = []
  for (let i = 0; i < count; i++) {
    const isMagic = props.theme === 'creative'
    const charList = isMagic ? magicChars : chars
    
    list.push({
      char: charList[Math.floor(Math.random() * charList.length)],
      style: {
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDuration: (4 + Math.random() * 6) + 's', // Slower
        animationDelay: (Math.random() * 5) + 's',
        opacity: 0,
        fontSize: (20 + Math.random() * 30) + 'rpx',
        transform: `scale(${0.5 + Math.random()})`
      }
    })
  }
  particles.value = list
})
</script>

<style scoped>
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1; /* Above background, below content */
  overflow: hidden;
}

.particle {
  position: absolute;
  animation: float linear infinite;
  opacity: 0;
}

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 0.8; }
  50% { opacity: 0.6; }
  80% { opacity: 0.8; }
  100% { transform: translateY(-150px) rotate(360deg); opacity: 0; }
}
</style>
