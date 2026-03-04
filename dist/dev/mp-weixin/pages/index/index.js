"use strict";
const common_vendor = require("../../common/vendor.js");
const services_api = require("../../services/api.js");
if (!Math) {
  (MagicParticles + CustomTabBar + LoadingView)();
}
const CustomTabBar = () => "../../components/CustomTabBar.js";
const MagicParticles = () => "../../components/MagicParticles.js";
const LoadingView = () => "../../components/LoadingView.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const ingredients = common_vendor.ref("");
    const noFive = common_vendor.ref(false);
    const vegan = common_vendor.ref(false);
    const creative = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const hasInput = common_vendor.computed(() => ingredients.value.trim().length > 0);
    const buttonText = common_vendor.computed(() => hasInput.value ? "用这些变魔法" : "随机给我一个惊喜");
    function toggleNoFive() {
      noFive.value = !noFive.value;
    }
    function toggleVegan() {
      vegan.value = !vegan.value;
    }
    function toggleCreative() {
      creative.value = !creative.value;
    }
    async function handleGenerate() {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      if (loading.value)
        return;
      loading.value = true;
      try {
        const prefs = {
          noFive: noFive.value,
          vegan: vegan.value,
          creative: creative.value
        };
        const res = await services_api.generateRecipe(ingredients.value.trim(), prefs);
        if (res && res._id) {
          try {
            common_vendor.index.setStorageSync("current_recipe_cache", {
              _id: res._id,
              title: ((_a = res.recipe) == null ? void 0 : _a.dish_name) || "",
              rarity: ((_b = res.recipe) == null ? void 0 : _b.rarity) || "N",
              ingredients: ((_c = res.recipe) == null ? void 0 : _c.ingredients) || [],
              steps: ((_d = res.recipe) == null ? void 0 : _d.steps) || [],
              image_prompt: ((_e = res.recipe) == null ? void 0 : _e.image_prompt) || "",
              ai_image_url: ((_f = res.recipe) == null ? void 0 : _f.ai_image_url) || "",
              ai_image_temp_url: ((_g = res.recipe) == null ? void 0 : _g.ai_image_temp_url) || "",
              theme: ((_h = res.recipe) == null ? void 0 : _h.theme) || (creative.value ? "magic" : "normal")
            });
          } catch (e) {
          }
          common_vendor.index.navigateTo({
            url: `/pages/detail/detail?id=${res._id}&new=true`
          });
          ingredients.value = "";
        } else {
          common_vendor.index.showToast({ title: "生成失败，请重试", icon: "none" });
        }
      } catch (err) {
        console.error("Generate failed", err);
        common_vendor.index.showToast({ title: "生成失败，请稍后重试", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    common_vendor.onShow(() => {
      common_vendor.index.hideTabBar();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          theme: creative.value ? "creative" : "normal"
        }),
        b: ingredients.value,
        c: common_vendor.o(($event) => ingredients.value = $event.detail.value),
        d: noFive.value ? 1 : "",
        e: common_vendor.o(toggleNoFive),
        f: vegan.value ? 1 : "",
        g: common_vendor.o(toggleVegan),
        h: creative.value ? 1 : "",
        i: common_vendor.o(toggleCreative),
        j: !loading.value
      }, !loading.value ? {
        k: common_vendor.t(common_vendor.unref(hasInput) ? "✨" : "🎲"),
        l: common_vendor.t(common_vendor.unref(buttonText))
      } : {}, {
        m: !common_vendor.unref(hasInput) ? 1 : "",
        n: loading.value ? 1 : "",
        o: loading.value,
        p: common_vendor.o(handleGenerate),
        q: loading.value
      }, loading.value ? {} : {}, {
        r: common_vendor.p({
          current: 0,
          theme: creative.value ? "creative" : "normal"
        }),
        s: loading.value
      }, loading.value ? {} : {}, {
        t: creative.value ? 1 : ""
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"], ["__file", "D:/素食卡牌/src/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
