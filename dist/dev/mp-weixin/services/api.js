"use strict";
const common_vendor = require("../common/vendor.js");
async function generateRecipe(ingredients, prefs) {
  try {
    const res = await common_vendor.wx$1.cloud.callFunction({
      name: "generateRecipe",
      data: {
        ingredients,
        prefs
      }
    });
    if (res.result.success) {
      return {
        _id: res.result._id,
        ...res.result.recipe
      };
    } else {
      throw new Error(res.result.error || "Unknown Error");
    }
  } catch (err) {
    console.error("Cloud generateRecipe failed:", err);
    throw err;
  }
}
async function generateImage(recipeId, imagePrompt) {
  try {
    const res = await common_vendor.wx$1.cloud.callFunction({
      name: "generateImage",
      data: {
        recipeId,
        imagePrompt
      }
    });
    return res.result;
  } catch (err) {
    console.error("Cloud generateImage failed:", err);
    return { success: false, error: err.message };
  }
}
async function unlockRecipe(recipeId, fileID, userNote, dishName) {
  try {
    const res = await common_vendor.wx$1.cloud.callFunction({
      name: "unlockRecipe",
      data: {
        recipeId,
        fileID,
        userNote,
        dishName
      }
    });
    return res.result;
  } catch (err) {
    console.error("Cloud unlockRecipe failed:", err);
    throw err;
  }
}
exports.generateImage = generateImage;
exports.generateRecipe = generateRecipe;
exports.unlockRecipe = unlockRecipe;
