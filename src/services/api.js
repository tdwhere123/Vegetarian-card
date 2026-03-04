/**
 * API Service Wrapper for WeChat Cloud Functions
 */

// 1. 生成菜谱 (Text)
export async function generateRecipe(ingredients, prefs) {
  try {
    const res = await wx.cloud.callFunction({
      name: 'generateRecipe',
      data: {
        ingredients,
        prefs
      }
    })

    if (res.result.success) {
      return {
        _id: res.result._id,
        ...res.result.recipe
      }
    } else {
      throw new Error(res.result.error || 'Unknown Error')
    }
  } catch (err) {
    console.error('Cloud generateRecipe failed:', err)
    throw err
  }
}

// 2. 生成图片 (Async)
export async function generateImage(recipeId, imagePrompt) {
  try {
    const res = await wx.cloud.callFunction({
      name: 'generateImage',
      data: {
        recipeId,
        imagePrompt
      }
    })
    return res.result
  } catch (err) {
    console.error('Cloud generateImage failed:', err)
    return { success: false, error: err.message }
  }
}

// 3. 解锁菜谱 (Upload + Vision)
export async function unlockRecipe(recipeId, fileID, userNote, dishName) {
  try {
    const res = await wx.cloud.callFunction({
      name: 'unlockRecipe',
      data: {
        recipeId,
        fileID,
        userNote,
        dishName
      }
    })
    return res.result
  } catch (err) {
    console.error('Cloud unlockRecipe failed:', err)
    throw err
  }
}
