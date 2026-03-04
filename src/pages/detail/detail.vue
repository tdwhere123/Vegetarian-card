<template>
  <view class="container" :class="{ 'theme-magic': currentCard.theme === 'magic' }">
    <view v-if="loading" class="loading-container">
      <view class="magic-circle">
        <text class="circle-icon">✨</text>
      </view>
      <text class="loading-text">正在从异世界召唤灵感...</text>
      <view class="loading-tips">
        <text class="tip-item">✦ 正在编织美味咒语...</text>
      </view>
    </view>

    <view v-else class="scene">
      <view class="card" :class="[{ 'is-flipped': isFlipped }, 'rarity-' + (currentCard.rarity || 'N').toLowerCase()]" @click="toggleFlip">
        
        <!-- FRONT -->
        <view class="card-face card-front">
          <view class="card-inner">
            <view class="rarity-badge">{{ currentCard.rarity }}</view>
            
            <view class="image-area">
              <view class="image-wrap" :class="{ grayscale: !isUnlocked }">
                <!-- AI Image or Generating Placeholder -->
                <image v-if="currentCard.ai_image_temp_url || currentCard.ai_image_url" class="image" :src="currentCard.ai_image_temp_url || currentCard.ai_image_url" mode="aspectFill" />
                <view v-else class="generating-placeholder">
                  <text class="spin">🎨</text>
                  <text>AI 绘图中...</text>
                </view>

                <view v-if="!isUnlocked" class="lock-overlay">
                  <text class="lock-icon">🔒</text>
                  <text class="lock-text">烹饪解锁</text>
                </view>
              </view>
            </view>

            <view class="content-area">
              <view class="header">
                <text class="title">{{ currentCard.title }}</text>
                <view class="divider"></view>
              </view>
              
              <scroll-view scroll-y class="scroll-content">
                <view class="section">
                  <view class="section-title">✦ 魔法素材 ✦</view>
                  <view class="chips">
                    <text v-if="!currentCard.ingredients || currentCard.ingredients.length === 0" class="chip">生成中...</text>
                    <text v-else v-for="it in currentCard.ingredients" :key="it" class="chip">{{ it }}</text>
                  </view>
                </view>
                
                <view class="section">
                  <view class="section-title">✦ 炼制仪式 ✦</view>
                  <view class="steps">
                    <view v-if="!currentCard.steps || currentCard.steps.length === 0" class="step-item">
                      <text class="step-num">1</text>
                      <text class="step-text">菜谱生成中，请稍候...</text>
                    </view>
                    <view v-else v-for="(s, idx) in currentCard.steps" :key="s" class="step-item">
                      <text class="step-num">{{ idx + 1 }}</text>
                      <text class="step-text">{{ s }}</text>
                    </view>
                  </view>
                </view>
              </scroll-view>
            </view>
          </view>
        </view>

        <!-- BACK -->
        <view class="card-face card-back">
          <view class="card-inner back-inner">
            <view class="back-header">用户实拍</view>
            <image class="user-image" :src="currentCard.user_image_url" mode="aspectFill" />
            
            <view class="user-note-box">
              <text class="note-label">心得：</text>
              <text class="note-content">{{ currentCard.user_note }}</text>
            </view>
            
            <view class="ai-comment-box">
              <text class="ai-label">AI 点评：</text>
              <text v-if="currentCard.ai_comment" class="ai-content">{{ currentCard.ai_comment }}</text>
              <view v-else class="ai-loading">
                <text class="spin-small">✨</text> 正在品鉴...
              </view>
            </view>

            <view class="back-footer">
               <text class="unlock-date">{{ formatDate(currentCard.unlock_time) }} 解锁</text>
            </view>
          </view>
        </view>

      </view>
  </view>

  <view v-if="!loading" class="footer">
      <button v-if="!isUnlocked" class="btn btn-primary btn-game" @click.stop="handleUnlock">
        <text class="btn-icon">📸</text> 上传成品解锁
      </button>
      <button v-else class="btn btn-success btn-game" @click.stop="toggleFlip">
        <text class="btn-icon">🔄</text> {{ isFlipped ? '查看食谱' : '查看评价' }}
      </button>
  </view>

  <view v-if="!loading" class="legal-tip">🤖 内容由 AI 生成，仅供参考</view>

  <!-- Upload Modal -->
    <view v-if="showUploadModal" class="modal-mask">
      <view class="modal-content">
        <view class="modal-title">上传心得</view>
        <textarea v-model="uploadNote" placeholder="写下你的烹饪心得..." class="modal-input" />
        <view class="modal-actions">
          <button class="modal-btn cancel" @click="showUploadModal = false">取消</button>
          <button class="modal-btn confirm" @click="confirmUpload">确定</button>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { generateImage, unlockRecipe } from '../../services/api.js'

const currentCard = ref({})
const loading = ref(true)
const isFlipped = ref(false)
const showUploadModal = ref(false)
const uploadNote = ref('')
const tempFilePath = ref('')
const pollingTimer = ref(null)

const isUnlocked = computed(() => currentCard.value.status === 'unlocked')
const hasAiComment = computed(() => !!currentCard.value.ai_comment)

onLoad(async (options) => {
  if (options.id) {
    if (options.new) {
      const cache = uni.getStorageSync('current_recipe_cache')
      if (cache && cache._id === options.id) {
        currentCard.value = {
          _id: cache._id,
          title: cache.title || '',
          rarity: cache.rarity || 'N',
          ingredients: Array.isArray(cache.ingredients) ? cache.ingredients : [],
          steps: Array.isArray(cache.steps) ? cache.steps : [],
          image_prompt: cache.image_prompt || '',
          ai_image_url: cache.ai_image_url || '',
          ai_image_temp_url: cache.ai_image_temp_url || '',
          user_image_url: '',
          user_note: '',
          ai_comment: '',
          status: 'locked',
          create_time: Date.now(),
          unlock_time: null,
          theme: cache.theme || 'normal'
        }
        loading.value = false
      }
    }
    await loadCard(options.id)
    
    // Check if we need to poll for image or comment
    startPolling(options.id)
    
    // Trigger generation if new and no image
    if (!currentCard.value.ai_image_url && options.new) {
      triggerImageGen(options.id, currentCard.value.image_prompt)
    }
  }
})

onUnmounted(() => {
  if (pollingTimer.value) clearInterval(pollingTimer.value)
})

async function loadCard(id) {
  // Handle Mock Data
  if (id.startsWith('mock_')) {
    const mockData = uni.getStorageSync('current_mock_recipe')
    if (mockData && mockData._id === id) {
      currentCard.value = mockData
      loading.value = false
      return
    }
  }

  if (!wx.cloud) return
  const db = wx.cloud.database()
  try {
    const res = await db.collection('recipes').doc(id).get()
    currentCard.value = res.data
    const normalizeArr = (val, isStep = false) => {
      if (Array.isArray(val)) return val
      if (typeof val === 'string') {
        try {
          const j = JSON.parse(val)
          if (Array.isArray(j)) return j
        } catch(e) {}
        const parts = String(val)
          .replace(/\r/g, '')
          .split(isStep ? /[\n。；;]+/ : /[，,、\n;；]+/)
          .map(s => s.replace(/^\d+[\.\s、]/, '').trim())
          .filter(Boolean)
        return parts
      }
      return []
    }
    currentCard.value.ingredients = normalizeArr(currentCard.value.ingredients, false)
    currentCard.value.steps = normalizeArr(currentCard.value.steps, true)
  } catch (err) {
    console.error('Load card failed', err)
    uni.showToast({ title: '加载卡片失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function startPolling(id) {
  if (pollingTimer.value) clearInterval(pollingTimer.value)
  
  pollingTimer.value = setInterval(async () => {
    // If we have both image and (if unlocked) comment, stop polling
    const needImage = !currentCard.value.ai_image_url
    const needComment = isUnlocked.value && !currentCard.value.ai_comment
    
    if (!needImage && !needComment) {
      clearInterval(pollingTimer.value)
      return
    }

    const db = wx.cloud.database()
    try {
      const res = await db.collection('recipes').doc(id).get()
      const newData = res.data
      
      // Update Image if it appears
      if (newData.ai_image_temp_url && !currentCard.value.ai_image_temp_url) {
        currentCard.value.ai_image_temp_url = newData.ai_image_temp_url
      }
      if (newData.ai_image_url && !currentCard.value.ai_image_url) {
        currentCard.value.ai_image_url = newData.ai_image_url
      }
      
      // Update Comment if it appears
      if (newData.ai_comment && !currentCard.value.ai_comment) {
        currentCard.value.ai_comment = newData.ai_comment
      }
    } catch (e) {
      console.error('Polling error', e)
    }
  }, 3000)
}

async function triggerImageGen(id, prompt) {
  // 异步调用，不阻塞 UI
  const res = await generateImage(id, prompt)
  if (res && res.imageUrl) {
    currentCard.value.ai_image_url = res.imageUrl
  }
}

function toggleFlip() {
  if (!isUnlocked.value) {
    uni.showToast({ title: '请先解锁卡片哦', icon: 'none' })
    return
  }
  isFlipped.value = !isFlipped.value
}

function handleUnlock() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      tempFilePath.value = res.tempFilePaths[0]
      showUploadModal.value = true
    }
  })
}

async function confirmUpload() {
  if (!uploadNote.value) {
    uni.showToast({ title: '写句心得吧~', icon: 'none' })
    return
  }
  
  showUploadModal.value = false
  uni.showLoading({ title: 'AI 正在品鉴...' })
  
  try {
    // 1. Upload Image
    const uploadRes = await wx.cloud.uploadFile({
      cloudPath: `user_works/${currentCard.value._id}_${Date.now()}.png`,
      filePath: tempFilePath.value
    })
    
    // 2. Call Unlock Cloud Function
    const res = await unlockRecipe(
      currentCard.value._id, 
      uploadRes.fileID, 
      uploadNote.value, 
      currentCard.value.title
    )
    
    if (res.success) {
      currentCard.value.status = 'unlocked'
      currentCard.value.user_image_url = uploadRes.fileID
      currentCard.value.user_note = uploadNote.value
      currentCard.value.ai_comment = res.aiComment
      currentCard.value.unlock_time = new Date() // Client side update for display
      
      uni.showToast({ title: '解锁成功！', icon: 'success' })
      setTimeout(() => {
        isFlipped.value = true
      }, 1000)
    } else {
      throw new Error(res.error)
    }
    
  } catch (err) {
    console.error('Unlock failed', err)
    uni.showToast({ title: '解锁失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function formatDate(ts) {
  if (!ts) return ''
  const date = new Date(ts)
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}
</script>

<style scoped>
.container {
  padding: 0;
  height: 100vh;
  background-color: #f7f3ea;
  perspective: 1500rpx; /* 3D Perspective */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scene {
  width: 600rpx;
  height: 900rpx;
  position: relative;
  margin-bottom: 40rpx;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 30rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 40rpx rgba(0,0,0,0.15);
}

.card-front {
  background: #fff;
}

.card-back {
  background: #fff;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
}

/* Back Styles */
.back-inner {
  padding: 30rpx;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #fff9e6;
}
.back-header {
  font-size: 36rpx;
  font-weight: bold;
  color: #5d4037;
  text-align: center;
  margin-bottom: 20rpx;
}
.user-image {
  width: 100%;
  height: 400rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
}
.user-note-box, .ai-comment-box {
  background: rgba(255,255,255,0.6);
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}
.note-label, .ai-label {
  font-weight: bold;
  color: #795548;
  display: block;
  margin-bottom: 8rpx;
}
.ai-content {
  color: #d81b60;
  font-style: italic;
}
.ai-loading {
  color: #888;
  font-size: 26rpx;
  display: flex;
  align-items: center;
}
.spin-small {
  animation: spin 2s linear infinite;
  margin-right: 10rpx;
  display: inline-block;
}
.back-footer {
  margin-top: auto;
  text-align: center;
  font-size: 24rpx;
  color: #aaa;
}

/* Keep original inner styles mostly */
.card-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}
.rarity-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background: #000;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-weight: bold;
  font-size: 24rpx;
  z-index: 10;
}
.image-area {
  height: 420rpx; /* Fixed height instead of percentage */
  min-height: 420rpx;
  width: 100%;
  position: relative;
  flex-shrink: 0; /* Prevent compression */
}
.image-wrap {
  width: 100%;
  height: 100%;
  min-height: 420rpx;
  position: relative;
}
.grayscale {
  filter: grayscale(100%);
}
.image {
  width: 100%;
  height: 100%;
  display: block;
}
.generating-placeholder {
  width: 100%;
  height: 100%;
  min-height: 420rpx;
  background: #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
}
.spin {
  font-size: 60rpx;
  animation: spin 2s linear infinite;
  margin-bottom: 20rpx;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

.lock-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.content-area {
  flex: 1;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
}
.header {
  text-align: center;
  margin-bottom: 20rpx;
}
.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}
.scroll-content {
  flex: 1;
  overflow-y: auto;
}
.section { margin-bottom: 30rpx; }
.section-title {
  font-size: 26rpx;
  color: #888;
  margin-bottom: 16rpx;
  text-align: center;
}
.chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 10rpx; }
.chip { background: #f0f0f0; padding: 6rpx 20rpx; border-radius: 30rpx; font-size: 24rpx; }
.step-item { display: flex; margin-bottom: 16rpx; }
.step-num { 
  background: #333; color: #fff; width: 36rpx; height: 36rpx; 
  border-radius: 50%; text-align: center; line-height: 36rpx; 
  font-size: 22rpx; margin-right: 16rpx; flex-shrink: 0;
}
.step-text { font-size: 28rpx; color: #555; line-height: 1.5; }

.footer {
  position: absolute;
  bottom: 60rpx;
  width: 100%;
  display: flex;
  justify-content: center;
}
.btn {
  padding: 20rpx 60rpx;
  border-radius: 50rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  box-shadow: 0 10rpx 20rpx rgba(0,0,0,0.1);
}
.btn-primary { background: #333; color: #fff; }
.btn-success { background: #4caf50; color: #fff; }
.btn-icon { margin-right: 10rpx; }

/* Modal */
.modal-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  width: 600rpx;
  padding: 40rpx;
  border-radius: 20rpx;
}
.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}
.modal-input {
  width: 100%;
  height: 200rpx;
  background: #f9f9f9;
  padding: 20rpx;
  box-sizing: border-box;
  margin-bottom: 30rpx;
  border-radius: 10rpx;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
}
.modal-btn {
  width: 45%;
  font-size: 28rpx;
}
.confirm { background: #333; color: #fff; }

.legal-tip {
  position: absolute;
  bottom: 10rpx;
  width: 100%;
  text-align: center;
  font-size: 22rpx;
  color: #9e9e9e;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.magic-circle { font-size: 80rpx; animation: spin 3s linear infinite; margin-bottom: 40rpx; }
.loading-text { font-size: 32rpx; color: #555; font-weight: bold; margin-bottom: 20rpx; }
.loading-tips { font-size: 24rpx; color: #999; }

/* Magic Theme Styles */
.container.theme-magic {
  background-color: #2c0b3c;
  background-image: 
    radial-gradient(rgba(156, 39, 176, 0.2) 1px, transparent 1px),
    radial-gradient(rgba(156, 39, 176, 0.1) 1px, transparent 1px);
}

.theme-magic .loading-text { color: #e056fd; text-shadow: 0 0 10rpx rgba(224, 86, 253, 0.5); }
.theme-magic .magic-circle { color: #e056fd; text-shadow: 0 0 20rpx rgba(224, 86, 253, 0.8); }
.theme-magic .loading-tips { color: #d1c4e9; }

.theme-magic .card-front {
  background: #1a1a2e;
  border: 2rpx solid #e056fd;
  box-shadow: 0 0 30rpx rgba(156, 39, 176, 0.3);
}
.theme-magic .card-inner { background-color: #1a1a2e; }
.theme-magic .title { color: #e056fd; text-shadow: 0 0 10rpx rgba(224, 86, 253, 0.3); }
.theme-magic .section-title { color: #ce93d8; }
.theme-magic .chip { background: #4a148c; color: #e1bee7; border: 1rpx solid #7b1fa2; }
.theme-magic .step-text { color: #e1bee7; }
.theme-magic .step-num { background: #e056fd; color: #2c0b3c; box-shadow: 0 0 10rpx rgba(224, 86, 253, 0.5); }
.theme-magic .generating-placeholder { background: #2c0b3c; color: #ce93d8; }
.theme-magic .legal-tip { color: #ab47bc; }

.theme-magic .card-back { background: #1a1a2e; border: 2rpx solid #e056fd; }
.theme-magic .back-inner { background: #2c0b3c; }
.theme-magic .back-header { color: #e056fd; }
.theme-magic .user-note-box, .theme-magic .ai-comment-box { background: rgba(74, 20, 140, 0.6); border: 1rpx solid #7b1fa2; }
.theme-magic .note-label, .theme-magic .ai-label { color: #e056fd; }
.theme-magic .note-content { color: #e1bee7; }
.theme-magic .ai-content { color: #f8bbd0; }
.theme-magic .user-image { border-color: #e056fd; }

.theme-magic .btn-primary { 
  background: linear-gradient(135deg, #7b1fa2, #e056fd); 
  box-shadow: 0 0 20rpx rgba(156, 39, 176, 0.5);
}
.theme-magic .btn-success {
  background: linear-gradient(135deg, #009688, #64ffda);
  color: #004d40;
}
</style>
