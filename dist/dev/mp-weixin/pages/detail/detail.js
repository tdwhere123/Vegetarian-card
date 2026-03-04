"use strict";
const common_vendor = require("../../common/vendor.js");
const services_api = require("../../services/api.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const currentCard = common_vendor.ref({});
    const loading = common_vendor.ref(true);
    const isFlipped = common_vendor.ref(false);
    const showUploadModal = common_vendor.ref(false);
    const uploadNote = common_vendor.ref("");
    const tempFilePath = common_vendor.ref("");
    const pollingTimer = common_vendor.ref(null);
    const isUnlocked = common_vendor.computed(() => currentCard.value.status === "unlocked");
    common_vendor.computed(() => !!currentCard.value.ai_comment);
    common_vendor.onLoad(async (options) => {
      if (options.id) {
        if (options.new) {
          const cache = common_vendor.index.getStorageSync("current_recipe_cache");
          if (cache && cache._id === options.id) {
            currentCard.value = {
              _id: cache._id,
              title: cache.title || "",
              rarity: cache.rarity || "N",
              ingredients: Array.isArray(cache.ingredients) ? cache.ingredients : [],
              steps: Array.isArray(cache.steps) ? cache.steps : [],
              image_prompt: cache.image_prompt || "",
              ai_image_url: cache.ai_image_url || "",
              ai_image_temp_url: cache.ai_image_temp_url || "",
              user_image_url: "",
              user_note: "",
              ai_comment: "",
              status: "locked",
              create_time: Date.now(),
              unlock_time: null,
              theme: cache.theme || "normal"
            };
            loading.value = false;
          }
        }
        await loadCard(options.id);
        startPolling(options.id);
        if (!currentCard.value.ai_image_url && options.new) {
          triggerImageGen(options.id, currentCard.value.image_prompt);
        }
      }
    });
    common_vendor.onUnmounted(() => {
      if (pollingTimer.value)
        clearInterval(pollingTimer.value);
    });
    async function loadCard(id) {
      if (id.startsWith("mock_")) {
        const mockData = common_vendor.index.getStorageSync("current_mock_recipe");
        if (mockData && mockData._id === id) {
          currentCard.value = mockData;
          loading.value = false;
          return;
        }
      }
      if (!common_vendor.wx$1.cloud)
        return;
      const db = common_vendor.wx$1.cloud.database();
      try {
        const res = await db.collection("recipes").doc(id).get();
        currentCard.value = res.data;
        const normalizeArr = (val, isStep = false) => {
          if (Array.isArray(val))
            return val;
          if (typeof val === "string") {
            try {
              const j = JSON.parse(val);
              if (Array.isArray(j))
                return j;
            } catch (e) {
            }
            const parts = String(val).replace(/\r/g, "").split(isStep ? /[\n。；;]+/ : /[，,、\n;；]+/).map((s) => s.replace(/^\d+[\.\s、]/, "").trim()).filter(Boolean);
            return parts;
          }
          return [];
        };
        currentCard.value.ingredients = normalizeArr(currentCard.value.ingredients, false);
        currentCard.value.steps = normalizeArr(currentCard.value.steps, true);
      } catch (err) {
        console.error("Load card failed", err);
        common_vendor.index.showToast({ title: "加载卡片失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    function startPolling(id) {
      if (pollingTimer.value)
        clearInterval(pollingTimer.value);
      pollingTimer.value = setInterval(async () => {
        const needImage = !currentCard.value.ai_image_url;
        const needComment = isUnlocked.value && !currentCard.value.ai_comment;
        if (!needImage && !needComment) {
          clearInterval(pollingTimer.value);
          return;
        }
        const db = common_vendor.wx$1.cloud.database();
        try {
          const res = await db.collection("recipes").doc(id).get();
          const newData = res.data;
          if (newData.ai_image_temp_url && !currentCard.value.ai_image_temp_url) {
            currentCard.value.ai_image_temp_url = newData.ai_image_temp_url;
          }
          if (newData.ai_image_url && !currentCard.value.ai_image_url) {
            currentCard.value.ai_image_url = newData.ai_image_url;
          }
          if (newData.ai_comment && !currentCard.value.ai_comment) {
            currentCard.value.ai_comment = newData.ai_comment;
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3e3);
    }
    async function triggerImageGen(id, prompt) {
      const res = await services_api.generateImage(id, prompt);
      if (res && res.imageUrl) {
        currentCard.value.ai_image_url = res.imageUrl;
      }
    }
    function toggleFlip() {
      if (!isUnlocked.value) {
        common_vendor.index.showToast({ title: "请先解锁卡片哦", icon: "none" });
        return;
      }
      isFlipped.value = !isFlipped.value;
    }
    function handleUnlock() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          tempFilePath.value = res.tempFilePaths[0];
          showUploadModal.value = true;
        }
      });
    }
    async function confirmUpload() {
      if (!uploadNote.value) {
        common_vendor.index.showToast({ title: "写句心得吧~", icon: "none" });
        return;
      }
      showUploadModal.value = false;
      common_vendor.index.showLoading({ title: "AI 正在品鉴..." });
      try {
        const uploadRes = await common_vendor.wx$1.cloud.uploadFile({
          cloudPath: `user_works/${currentCard.value._id}_${Date.now()}.png`,
          filePath: tempFilePath.value
        });
        const res = await services_api.unlockRecipe(
          currentCard.value._id,
          uploadRes.fileID,
          uploadNote.value,
          currentCard.value.title
        );
        if (res.success) {
          currentCard.value.status = "unlocked";
          currentCard.value.user_image_url = uploadRes.fileID;
          currentCard.value.user_note = uploadNote.value;
          currentCard.value.ai_comment = res.aiComment;
          currentCard.value.unlock_time = /* @__PURE__ */ new Date();
          common_vendor.index.showToast({ title: "解锁成功！", icon: "success" });
          setTimeout(() => {
            isFlipped.value = true;
          }, 1e3);
        } else {
          throw new Error(res.error);
        }
      } catch (err) {
        console.error("Unlock failed", err);
        common_vendor.index.showToast({ title: "解锁失败，请重试", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
    function formatDate(ts) {
      if (!ts)
        return "";
      const date = new Date(ts);
      return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {} : common_vendor.e({
        b: common_vendor.t(currentCard.value.rarity),
        c: currentCard.value.ai_image_temp_url || currentCard.value.ai_image_url
      }, currentCard.value.ai_image_temp_url || currentCard.value.ai_image_url ? {
        d: currentCard.value.ai_image_temp_url || currentCard.value.ai_image_url
      } : {}, {
        e: !common_vendor.unref(isUnlocked)
      }, !common_vendor.unref(isUnlocked) ? {} : {}, {
        f: !common_vendor.unref(isUnlocked) ? 1 : "",
        g: common_vendor.t(currentCard.value.title),
        h: !currentCard.value.ingredients || currentCard.value.ingredients.length === 0
      }, !currentCard.value.ingredients || currentCard.value.ingredients.length === 0 ? {} : {
        i: common_vendor.f(currentCard.value.ingredients, (it, k0, i0) => {
          return {
            a: common_vendor.t(it),
            b: it
          };
        })
      }, {
        j: !currentCard.value.steps || currentCard.value.steps.length === 0
      }, !currentCard.value.steps || currentCard.value.steps.length === 0 ? {} : {
        k: common_vendor.f(currentCard.value.steps, (s, idx, i0) => {
          return {
            a: common_vendor.t(idx + 1),
            b: common_vendor.t(s),
            c: s
          };
        })
      }, {
        l: currentCard.value.user_image_url,
        m: common_vendor.t(currentCard.value.user_note),
        n: currentCard.value.ai_comment
      }, currentCard.value.ai_comment ? {
        o: common_vendor.t(currentCard.value.ai_comment)
      } : {}, {
        p: common_vendor.t(formatDate(currentCard.value.unlock_time)),
        q: common_vendor.n({
          "is-flipped": isFlipped.value
        }),
        r: common_vendor.n("rarity-" + (currentCard.value.rarity || "N").toLowerCase()),
        s: common_vendor.o(toggleFlip)
      }), {
        t: !loading.value
      }, !loading.value ? common_vendor.e({
        v: !common_vendor.unref(isUnlocked)
      }, !common_vendor.unref(isUnlocked) ? {
        w: common_vendor.o(handleUnlock)
      } : {
        x: common_vendor.t(isFlipped.value ? "查看食谱" : "查看评价"),
        y: common_vendor.o(toggleFlip)
      }) : {}, {
        z: !loading.value
      }, !loading.value ? {} : {}, {
        A: showUploadModal.value
      }, showUploadModal.value ? {
        B: uploadNote.value,
        C: common_vendor.o(($event) => uploadNote.value = $event.detail.value),
        D: common_vendor.o(($event) => showUploadModal.value = false),
        E: common_vendor.o(confirmUpload)
      } : {}, {
        F: currentCard.value.theme === "magic" ? 1 : ""
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9cb6f745"], ["__file", "D:/素食卡牌/src/pages/detail/detail.vue"]]);
wx.createPage(MiniProgramPage);
