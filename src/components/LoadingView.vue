<template>
  <view class="loading-overlay">
    <view class="anim">
      <text class="veg veg1">🥕</text>
      <text class="veg veg2">🥦</text>
      <text class="veg veg3">🍅</text>
    </view>
    <text class="msg">{{ currentMessage }}</text>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const messages = [
  '正在去异世界寻找灵感...',
  '大厨正在磨刀...',
  '正在和胡萝卜谈判...',
  '正在摆盘...'
]

const idx = ref(0)
const currentMessage = ref(messages[0])
let timer

onMounted(() => {
  timer = setInterval(() => {
    idx.value = (idx.value + 1) % messages.length
    currentMessage.value = messages[idx.value]
  }, 1500)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(247, 243, 234, 0.96);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.anim { display: flex; gap: 20rpx; margin-bottom: 30rpx; }
.veg { font-size: 64rpx; animation: bounce 1.2s infinite ease-in-out; }
.veg2 { animation-delay: 0.2s; }
.veg3 { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 100% { transform: translateY(0) }
  50% { transform: translateY(-18rpx) }
}
.msg { font-size: 30rpx; color: #6d6d6d; }
</style>
