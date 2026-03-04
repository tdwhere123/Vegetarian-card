<template>
  <view class="container fade-in" :class="{ 'theme-creative': creative }">
    <MagicParticles :theme="creative ? 'creative' : 'normal'" />
    
    <view class="header">
      <view class="title-main">Veggie Spark</view>
      <view class="title-sub">咔嚓！把蔬菜变成魔法卡片✨</view>
    </view>
    
    <view class="magic-pot-container">
      <view class="input-card">
        <textarea 
          v-model="ingredients" 
          class="textarea" 
          placeholder="今天冰箱里有什么？（例如：番茄、土豆）" 
          placeholder-style="color: #bfb09c; font-style: italic;"
          :maxlength="100"
        />
        <view class="tags-row">
          <view class="tag-toggle" :class="{ active: noFive }" @click="toggleNoFive">
            <text class="icon">🚫</text> 无五辛
          </view>
          <view class="tag-toggle" :class="{ active: vegan }" @click="toggleVegan">
            <text class="icon">🥛</text> 纯素
          </view>
          <view class="tag-toggle creative-toggle" :class="{ active: creative }" @click="toggleCreative">
            <text class="icon">🔮</text> 魔法模式
          </view>
        </view>
      </view>

      <!-- Move Button Inside this container to keep it close -->
      <view class="action-area">
        <button 
          class="btn-magic" 
          :class="{ 'btn-random': !hasInput, 'btn-loading': loading }" 
          :disabled="loading" 
          @click="handleGenerate"
          hover-class="btn-hover"
        >
          <view v-if="!loading" class="btn-content">
            <text class="btn-icon">{{ hasInput ? '✨' : '🎲' }}</text>
            <text class="btn-text">{{ buttonText }}</text>
          </view>
          <view v-else class="loading-anim">
            <text class="dot dot1">🥕</text>
            <text class="dot dot2">🥦</text>
            <text class="dot dot3">🍅</text>
          </view>
        </button>
        <text class="tip-text" v-if="loading">正在召唤灵感精灵...</text>
      </view>
    </view>
    
    <CustomTabBar :current="0" :theme="creative ? 'creative' : 'normal'" />
    <LoadingView v-if="loading" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomTabBar from '../../components/CustomTabBar.vue'
import MagicParticles from '../../components/MagicParticles.vue'
import LoadingView from '../../components/LoadingView.vue'
import { generateRecipe } from '../../services/api.js'

const ingredients = ref('')
const noFive = ref(false)
const vegan = ref(false)
const creative = ref(false)
const loading = ref(false)

const hasInput = computed(() => ingredients.value.trim().length > 0)
const buttonText = computed(() => hasInput.value ? '用这些变魔法' : '随机给我一个惊喜')

function toggleNoFive() { noFive.value = !noFive.value }
function toggleVegan() { vegan.value = !vegan.value }
function toggleCreative() { creative.value = !creative.value }

async function handleGenerate() {
  if (loading.value) return
  loading.value = true
  
  try {
    const prefs = {
      noFive: noFive.value,
      vegan: vegan.value,
      creative: creative.value
    }
    
    // Call Cloud Function
    const res = await generateRecipe(ingredients.value.trim(), prefs)
    
    if (res && res._id) {
      try {
        uni.setStorageSync('current_recipe_cache', {
          _id: res._id,
          title: res.recipe?.dish_name || '',
          rarity: res.recipe?.rarity || 'N',
          ingredients: res.recipe?.ingredients || [],
          steps: res.recipe?.steps || [],
          image_prompt: res.recipe?.image_prompt || '',
          ai_image_url: res.recipe?.ai_image_url || '',
          ai_image_temp_url: res.recipe?.ai_image_temp_url || '',
          theme: res.recipe?.theme || (creative.value ? 'magic' : 'normal')
        })
      } catch(e) {}
      // Navigate to detail with ID and new flag
      uni.navigateTo({
        url: `/pages/detail/detail?id=${res._id}&new=true`
      })
      // Clear input
      ingredients.value = ''
    } else {
      uni.showToast({ title: '生成失败，请重试', icon: 'none' })
    }
    
  } catch (err) {
    console.error('Generate failed', err)
    uni.showToast({ title: '生成失败，请稍后重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onShow(() => { uni.hideTabBar() })
</script>

<style scoped>
.container {
  padding: 40rpx;
  min-height: 100vh;
  background-color: #f7f1e3; /* Warm Beige */
  display: flex;
  flex-direction: column;
  padding-bottom: 140rpx; /* Space for TabBar and Action Area */
  transition: background-color 0.5s ease;
  position: relative; /* For particles */
  z-index: 1;
}

.fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98) translateY(20rpx); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* Creative Theme (Purple Magic) */
.container.theme-creative {
  background-color: #2c0b3c; /* Dark Purple */
  background-image: 
    radial-gradient(rgba(156, 39, 176, 0.2) 1px, transparent 1px),
    radial-gradient(rgba(156, 39, 176, 0.1) 1px, transparent 1px);
}
.container.theme-creative .title-main {
  color: #e056fd;
  text-shadow: 0 0 20rpx rgba(224, 86, 253, 0.5);
}
.container.theme-creative .title-sub {
  background: rgba(44, 11, 60, 0.8);
  color: #fff;
  border: 1rpx solid #e056fd;
}
.container.theme-creative .input-card {
  background: rgba(255, 255, 255, 0.1);
  border-color: #9c27b0;
  backdrop-filter: blur(10px);
}
.container.theme-creative .textarea {
  color: #fff;
}
.container.theme-creative .btn-magic {
  background: linear-gradient(135deg, #9c27b0, #e056fd);
  box-shadow: 0 0 30rpx rgba(156, 39, 176, 0.6);
}

.header {
  margin-top: 60rpx;
  margin-bottom: 50rpx;
  text-align: center;
}
.title-main {
  font-family: 'Courier New', Courier, monospace;
  font-size: 60rpx;
  font-weight: 900;
  color: #2c3e50;
  margin-bottom: 12rpx;
  letter-spacing: -2rpx;
}
.title-sub {
  font-size: 28rpx;
  color: #7f8c8d;
  font-weight: 500;
  background: #fff;
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  display: inline-block;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.05);
}

.magic-pot-container {
  margin-bottom: 20rpx; /* Reduced margin */
}

.input-card {
  background: #ffffff;
  border-radius: 40rpx;
  padding: 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(139, 94, 60, 0.1);
  border: 2rpx solid #e6e6e6;
  margin-bottom: 30rpx; /* Add space between card and button */
}

.textarea {
  width: 100%;
  height: 200rpx;
  font-size: 32rpx;
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 30rpx;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-toggle {
  background: #f8f9fa;
  border: 2rpx solid #eee;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8rpx;
  transition: all 0.2s;
}
.tag-toggle.active {
    background: #fff0f6;
    border-color: #ff9f43;
    color: #ff9f43;
    font-weight: bold;
  }
  .creative-toggle.active {
    background: #f3e5f5;
    border-color: #9c27b0;
    color: #9c27b0;
    animation: pulse-purple 1.5s infinite;
  }
  
  @keyframes pulse-purple {
    0% { box-shadow: 0 0 0 0 rgba(156, 39, 176, 0.4); transform: scale(1); }
    70% { box-shadow: 0 0 0 10rpx rgba(156, 39, 176, 0); transform: scale(1.05); }
    100% { box-shadow: 0 0 0 0 rgba(156, 39, 176, 0); transform: scale(1); }
  }

.action-area {
  margin-top: 0; /* Remove auto margin to keep it close */
  margin-bottom: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-magic {
  width: 100%;
  height: 120rpx;
  border-radius: 60rpx;
  background: #ff9f43;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 30rpx rgba(255, 159, 67, 0.3);
  transition: all 0.2s;
  border: none;
}
.btn-random {
  background: #2ecc71;
  box-shadow: 0 16rpx 30rpx rgba(46, 204, 113, 0.3);
}
.btn-loading {
  background: #95a5a6;
  box-shadow: none;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.btn-icon {
  font-size: 40rpx;
}
.btn-text {
  font-size: 36rpx;
  font-weight: bold;
}

.btn-hover {
  transform: translateY(4rpx);
  box-shadow: 0 8rpx 10rpx rgba(0,0,0,0.2);
}

.loading-anim {
  display: flex;
  gap: 10rpx;
}
.dot {
  font-size: 40rpx;
  animation: bounce 1s infinite;
}
.dot1 { animation-delay: 0s; }
.dot2 { animation-delay: 0.2s; }
.dot3 { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

.tip-text {
  margin-top: 24rpx;
  font-size: 24rpx;
  color: #95a5a6;
}
</style>
