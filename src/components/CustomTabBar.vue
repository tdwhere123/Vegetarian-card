<template>
  <view class="tab-bar" :class="{ 'theme-creative': theme === 'creative' }">
    <view class="tab-item" :class="{ active: current === 0 }" @click="switchTab('/pages/index/index')">
      <view class="icon-box">
        <text class="icon">🏠</text>
      </view>
      <text class="label">灵感厨房</text>
    </view>
    <view class="tab-item" :class="{ active: current === 1 }" @click="switchTab('/pages/collection/collection')">
      <view class="icon-box">
        <text class="icon">📒</text>
      </view>
      <text class="label">我的卡册</text>
    </view>
    <view class="tab-item" :class="{ active: current === 2 }" @click="switchTab('/pages/profile/profile')">
      <view class="icon-box">
        <text class="icon">👤</text>
      </view>
      <text class="label">个人中心</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  current: {
    type: Number,
    default: 0
  },
  theme: {
    type: String,
    default: 'normal'
  }
})

function switchTab(url) {
  uni.switchTab({ url })
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
  border-top: 1rpx solid #f0f0f0;
  z-index: 9999;
  padding-bottom: env(safe-area-inset-bottom);
  transition: all 0.5s ease;
}

/* Creative Mode Styles */
.tab-bar.theme-creative {
  background: #2c0b3c;
  border-top: 1rpx solid #9c27b0;
  box-shadow: 0 -4rpx 20rpx rgba(156, 39, 176, 0.3);
}
.tab-bar.theme-creative .tab-item .label {
  color: #d1c4e9;
}
.tab-bar.theme-creative .tab-item.active .label {
  color: #e056fd;
  text-shadow: 0 0 10rpx rgba(224, 86, 253, 0.5);
}
.tab-bar.theme-creative .tab-item.active .icon-box {
  background-color: rgba(224, 86, 253, 0.2);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
}

.icon-box {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  margin-bottom: 4rpx;
  transition: all 0.2s;
}

.icon {
  font-size: 40rpx;
}

.label {
  font-size: 20rpx;
  color: #95a5a6;
  font-weight: 500;
}

.tab-item.active .icon-box {
  background-color: #fff0e6;
  transform: translateY(-4rpx);
}

.tab-item.active .icon {
  transform: scale(1.1);
}

.tab-item.active .label {
  color: #ff9f43;
  font-weight: bold;
}
</style>
