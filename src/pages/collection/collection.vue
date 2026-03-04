<template>
  <view class="container fade-in">
    <view class="header-bar">
      <text class="title">我的魔法卡册</text>
      <text class="stats">已收集 {{ sortedCards.length }} 张</text>
    </view>
    
    <scroll-view scroll-y class="grid-scroll">
      <view v-if="loading" class="loading-state">
        <text>加载数据中...</text>
      </view>
      
      <view v-else-if="sortedCards.length === 0" class="empty-state">
        <text class="empty-text">还没有卡片哦</text>
        <button class="create-btn" @click="goToCreate">去生成第一张</button>
      </view>
      
      <view v-else class="grid">
        <view v-for="c in sortedCards" :key="c._id" class="card-item" @click="openCard(c)">
          <view class="card-border" :class="['border-' + (c.rarity || 'N').toLowerCase(), { 'border-magic': c.theme === 'magic' }]">
            <view class="card-content">
              <image class="image" :src="c.ai_image_temp_url || c.ai_image_url || c.image_url" mode="aspectFill" />
              <view class="rarity-tag" :class="{ 'tag-magic': c.theme === 'magic' }">{{ c.rarity }}</view>
              <view class="card-footer">
                <text class="dish-name">{{ c.title }}</text>
                <view class="meta-row">
                  <view class="count-badge" v-if="c.status === 'unlocked'">已解锁</view>
                  <view class="count-badge" v-else>未解锁</view>
                  <text class="date-text" v-if="c.unlock_time">{{ formatDate(c.unlock_time) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <CustomTabBar :current="1" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomTabBar from '../../components/CustomTabBar.vue'

const cards = ref([])
const loading = ref(true)

async function load() {
  uni.hideTabBar()
  loading.value = true
  
  if (!wx.cloud) {
    loading.value = false
    return
  }

  const db = wx.cloud.database()
  try {
    const res = await db.collection('recipes')
      .orderBy('create_time', 'desc')
      .get()
    
    cards.value = res.data
  } catch (err) {
    console.error('Fetch cards failed', err)
  } finally {
    loading.value = false
  }
}

onMounted(load)
onShow(load)

const sortedCards = computed(() => {
  return [...cards.value].sort((a, b) => {
    // 优先显示已解锁
    if (a.status === 'unlocked' && b.status !== 'unlocked') return -1
    if (a.status !== 'unlocked' && b.status === 'unlocked') return 1
    // 按时间倒序
    const tA = new Date(a.unlock_time || a.create_time).getTime()
    const tB = new Date(b.unlock_time || b.create_time).getTime()
    return tB - tA
  })
})

function openCard(c) {
  uni.navigateTo({ url: `/pages/detail/detail?id=${c._id}` })
}

function goToCreate() {
  uni.switchTab({ url: '/pages/index/index' })
}

function formatDate(ts) {
  if (!ts) return ''
  const date = new Date(ts)
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}
</script>

<style scoped>
.container {
  padding: 30rpx;
  height: 100vh;
  background-color: #f7f1e3; /* Warm Beige */
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx; /* Space for TabBar */
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
}
.empty-text {
  font-size: 32rpx;
  color: #888;
  margin-bottom: 30rpx;
}
.create-btn {
  background: #ff6b6b;
  color: #fff;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
}

.fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98) translateY(20rpx); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30rpx;
  padding: 0 10rpx;
  margin-top: 40rpx;
}
.title {
  font-size: 40rpx;
  font-weight: 900;
  color: #2c3e50;
  letter-spacing: 2rpx;
}
.stats {
  font-size: 24rpx;
  color: #7f8c8d;
}

.grid-scroll {
  flex: 1;
  height: 0;
}
.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between; /* Ensure items spread out */
  padding-bottom: 40rpx;
}

.card-item {
  width: 48%; /* Force 2 columns with gap */
  aspect-ratio: 3/4;
  margin-bottom: 24rpx;
}

.card-border {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  padding: 8rpx;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.1);
  background: #fff;
  transition: transform 0.1s;
}
.card-border:active {
  transform: scale(0.98);
}

.border-n { border: 2rpx solid #bdc3c7; }
.border-r { border: 2rpx solid #3498db; }
.border-sr { border: 2rpx solid #9b59b6; }
.border-magic { border: 2rpx solid #e056fd; box-shadow: 0 0 16rpx rgba(156, 39, 176, 0.4); background: #2c0b3c; }

.card-content {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
  background: #eee;
}

.image {
  width: 100%;
  height: 100%;
}

.rarity-tag {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  font-weight: bold;
}
.tag-magic {
  background: rgba(156, 39, 176, 0.8);
  border: 1rpx solid #e056fd;
}

.card-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: 20rpx 10rpx 10rpx;
}

.dish-name {
  color: #fff;
  font-size: 26rpx;
  font-weight: bold;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.count-badge {
  background: rgba(255, 159, 67, 0.9);
  color: #fff;
  font-size: 16rpx;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  font-weight: bold;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.date-text {
  font-size: 16rpx;
  color: rgba(255, 255, 255, 0.9);
  font-family: monospace;
}
</style>
