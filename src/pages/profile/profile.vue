<template>
  <view class="container">
    <view class="banner">
      <text class="banner-title">个人中心</text>
      <text class="banner-sub">记录你的番茄足迹</text>
    </view>
    
    <view class="user-box">
      <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image class="avatar" :src="userInfo.avatarUrl" mode="aspectFill"></image>
        <view class="edit-icon">✏️</view>
      </button>
      <view class="info">
        <input type="nickname" class="nickname-input" v-model="userInfo.nickName" @blur="onNickBlur" placeholder="点击修改昵称" />
        <view class="stats">
          <text class="stat">累计生成：{{ totalGenerated }}</text>
          <text class="stat">累计解锁：{{ totalUnlocked }}</text>
        </view>
      </view>
    </view>

    <view class="timeline-title">番茄时间轴</view>
    <scroll-view scroll-y class="timeline">
      <view v-for="group in groupedRecords" :key="group.date" class="day-group">
        <view class="day-header">
          <text class="day-icon">🍅</text>
          <text class="day-date">{{ group.date }}</text>
        </view>
        <view class="card-grid">
          <view v-for="item in group.items" :key="item._id" class="card-item" @click="openEntry(item)">
            <view class="card-thumb-wrap" :class="{ 'thumb-magic': item.theme === 'magic' }">
              <image class="card-thumb" :src="item.user_image_url || item.ai_image_url" mode="aspectFill" />
              <view class="card-overlay">
                <text class="card-title">{{ item.title }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <view v-if="records.length === 0" class="empty">还没有解锁记录，去生成一张卡片吧～</view>
    </scroll-view>

    <view v-if="showModal" class="modal-mask" @click="closeModal">
      <view class="modal" @click.stop :class="{ 'modal-magic': current.theme === 'magic' }">
        <view class="modal-header">
          <text class="modal-title">{{ current.title }}</text>
          <text class="modal-date">{{ formatDateFull(current.unlock_time) }}</text>
        </view>
        
        <scroll-view scroll-y class="modal-body">
          <view class="modal-section">
            <text class="label">你的作品</text>
            <image class="modal-img" :src="current.user_image_url" mode="widthFix" />
            <view class="note-box" v-if="current.user_note">
              <text class="note-text">"{{ current.user_note }}"</text>
            </view>
          </view>
          
          <view class="modal-section" v-if="current.ai_image_url">
            <text class="label">灵感原图</text>
            <image class="modal-img" :src="current.ai_image_temp_url || current.ai_image_url" mode="widthFix" />
          </view>
          
          <view class="comment-box">
             <text class="ai-label">✨ AI 厨神点评：</text>
             <text class="ai-text">{{ current.ai_comment || '正在品鉴中...' }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
    <CustomTabBar :current="2" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomTabBar from '../../components/CustomTabBar.vue'

const totalGenerated = ref(0)
const totalUnlocked = ref(0)
const records = ref([])
const showModal = ref(false)
const current = ref({})

// User Info State
const defaultAvatar = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0' // Generic WeChat grey placeholder or Tomato URL if available
const userInfo = ref({
  avatarUrl: defaultAvatar,
  nickName: '番茄大厨'
})

onShow(async () => {
  uni.hideTabBar()
  
  // Load User Info
  const savedUser = uni.getStorageSync('user_profile')
  if (savedUser) {
    userInfo.value = savedUser
  }
  
  const db = wx.cloud.database()
  try {
    const countAll = await db.collection('recipes').count()
    totalGenerated.value = countAll.total || 0

    const countUnlocked = await db.collection('recipes').where({ status: 'unlocked' }).count()
    totalUnlocked.value = countUnlocked.total || 0

    const res = await db.collection('recipes')
      .where({ status: 'unlocked' })
      .orderBy('unlock_time', 'desc')
      .get()
    records.value = res.data || []
  } catch (err) {
    console.error(err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
})

// Group records by date
const groupedRecords = computed(() => {
  const groups = {}
  records.value.forEach(item => {
    const d = formatDate(item.unlock_time)
    if (!groups[d]) {
      groups[d] = []
    }
    groups[d].push(item)
  })
  // Convert to array
  return Object.keys(groups).map(date => ({
    date,
    items: groups[date]
  }))
})

function onChooseAvatar(e) {
  const { avatarUrl } = e.detail
  userInfo.value.avatarUrl = avatarUrl
  saveProfile()
}

function onNickBlur(e) {
  const val = e.detail.value
  if (val) {
    userInfo.value.nickName = val
    saveProfile()
  }
}

function saveProfile() {
  uni.setStorageSync('user_profile', userInfo.value)
}

function openEntry(item) {
  current.value = item
  showModal.value = true
}
function closeModal() { showModal.value = false }

function formatDate(ts) {
  if (!ts) return '未知日期'
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatDateFull(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
}
</script>

<style scoped>
.container { padding: 30rpx; background: #f7f3ea; min-height: 100vh; padding-bottom: 120rpx; box-sizing: border-box; }
.banner { background: linear-gradient(135deg, #ff6b6b, #ff8787); border-radius: 24rpx; padding: 40rpx; box-shadow: 0 10rpx 24rpx rgba(255, 107, 107, 0.2); margin-bottom: 30rpx; color: #fff; }
.banner-title { font-size: 40rpx; font-weight: 800; display: block; }
.banner-sub { display: block; margin-top: 10rpx; font-size: 26rpx; opacity: 0.9; }

/* User Box */
.user-box { 
  display: flex; align-items: center; gap: 30rpx; margin-bottom: 40rpx; 
  background: #fff; border-radius: 24rpx; padding: 30rpx; 
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.05); 
}
.avatar-wrapper {
  padding: 0; margin: 0; background: none; border: none;
  width: 140rpx; height: 140rpx; position: relative;
}
.avatar-wrapper::after { border: none; }
.avatar { 
  width: 140rpx; height: 140rpx; border-radius: 50%; 
  border: 6rpx solid #ffe3e3; box-sizing: border-box;
}
.edit-icon {
  position: absolute; bottom: 0; right: 0;
  background: #333; color: #fff; font-size: 20rpx;
  width: 40rpx; height: 40rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.info { flex: 1; display: flex; flex-direction: column; gap: 16rpx; }
.nickname-input {
  font-size: 36rpx; font-weight: bold; color: #333;
  height: 60rpx; line-height: 60rpx;
}
.stats { display: flex; gap: 20rpx; }
.stat { 
  font-size: 24rpx; color: #d84315; background: #ffccbc; 
  padding: 8rpx 20rpx; border-radius: 20rpx; font-weight: bold;
}

/* Timeline */
.timeline-title { font-size: 32rpx; color: #2c3e50; margin: 0 0 20rpx 10rpx; font-weight: 800; }
.timeline { height: calc(100vh - 500rpx); }

.day-group { margin-bottom: 40rpx; }
.day-header { display: flex; align-items: center; margin-bottom: 20rpx; }
.day-icon { font-size: 32rpx; margin-right: 10rpx; }
.day-date { font-size: 30rpx; font-weight: bold; color: #555; }

.card-grid {
  display: flex; flex-wrap: wrap; gap: 20rpx;
}
.card-item {
  width: 31%; /* 3 columns */
  aspect-ratio: 3/4;
}
.card-thumb-wrap {
  width: 100%; height: 100%;
  position: relative; border-radius: 16rpx; overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}
.thumb-magic {
  border: 2rpx solid #e056fd;
  box-shadow: 0 0 12rpx rgba(156, 39, 176, 0.4);
}
.card-thumb { width: 100%; height: 100%; background: #eee; }
.card-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 10rpx;
}
.card-title {
  color: #fff; font-size: 22rpx; font-weight: bold;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;
}

.empty { text-align: center; color: #999; padding: 60rpx; font-size: 28rpx; }

/* Modal */
.modal-mask { 
  position: fixed; top:0; left:0; right:0; bottom:0; 
  background: rgba(0,0,0,0.7); 
  display:flex; align-items:center; justify-content:center; 
  z-index:999; backdrop-filter: blur(4px);
}
.modal { 
  background:#fff; width: 640rpx; max-height: 80vh;
  border-radius: 30rpx; padding: 0; overflow: hidden;
  display: flex; flex-direction: column;
}
.modal-header {
  padding: 30rpx; border-bottom: 2rpx solid #eee; text-align: center;
}
.modal-title { font-size: 34rpx; font-weight: bold; display: block; color: #333; }
.modal-date { font-size: 24rpx; color: #999; margin-top: 6rpx; display: block; }

.modal-body { padding: 30rpx; flex: 1; overflow-y: auto; }
.modal-section { margin-bottom: 40rpx; }
.label { 
  font-size: 28rpx; font-weight: bold; color: #555; 
  margin-bottom: 16rpx; display: block; border-left: 8rpx solid #ff6b6b; padding-left: 16rpx;
}
.modal-img { width: 100%; border-radius: 16rpx; display: block; box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1); }
.note-box { 
  margin-top: 20rpx; background: #fff9c4; padding: 20rpx; 
  border-radius: 12rpx; color: #5d4037; font-size: 28rpx;
}
.comment-box { 
  background: #fce4ec; padding: 24rpx; border-radius: 16rpx;
}
.ai-label { font-weight: bold; color: #c2185b; font-size: 26rpx; margin-bottom: 10rpx; display: block; }
.ai-text { color: #880e4f; font-size: 28rpx; line-height: 1.6; text-align: justify; }

/* Magic Modal */
.modal-magic {
  background: #2c0b3c;
  border: 2rpx solid #e056fd;
}
.modal-magic .modal-header { border-bottom-color: #7b1fa2; }
.modal-magic .modal-title { color: #e056fd; text-shadow: 0 0 10rpx rgba(224, 86, 253, 0.4); }
.modal-magic .modal-date { color: #ce93d8; }
.modal-magic .label { color: #e1bee7; border-left-color: #e056fd; }
.modal-magic .note-box { background: rgba(74, 20, 140, 0.6); color: #e1bee7; }
.modal-magic .comment-box { background: rgba(74, 20, 140, 0.6); border: 1rpx solid #7b1fa2; }
.modal-magic .ai-label { color: #e056fd; }
.modal-magic .ai-text { color: #f8bbd0; }
</style>
