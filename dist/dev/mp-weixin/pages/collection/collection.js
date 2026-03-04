"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  CustomTabBar();
}
const CustomTabBar = () => "../../components/CustomTabBar.js";
const _sfc_main = {
  __name: "collection",
  setup(__props) {
    const cards = common_vendor.ref([]);
    const loading = common_vendor.ref(true);
    async function load() {
      common_vendor.index.hideTabBar();
      loading.value = true;
      if (!common_vendor.wx$1.cloud) {
        loading.value = false;
        return;
      }
      const db = common_vendor.wx$1.cloud.database();
      try {
        const res = await db.collection("recipes").orderBy("create_time", "desc").get();
        cards.value = res.data;
      } catch (err) {
        console.error("Fetch cards failed", err);
      } finally {
        loading.value = false;
      }
    }
    common_vendor.onMounted(load);
    common_vendor.onShow(load);
    const sortedCards = common_vendor.computed(() => {
      return [...cards.value].sort((a, b) => {
        if (a.status === "unlocked" && b.status !== "unlocked")
          return -1;
        if (a.status !== "unlocked" && b.status === "unlocked")
          return 1;
        const tA = new Date(a.unlock_time || a.create_time).getTime();
        const tB = new Date(b.unlock_time || b.create_time).getTime();
        return tB - tA;
      });
    });
    function openCard(c) {
      common_vendor.index.navigateTo({ url: `/pages/detail/detail?id=${c._id}` });
    }
    function goToCreate() {
      common_vendor.index.switchTab({ url: "/pages/index/index" });
    }
    function formatDate(ts) {
      if (!ts)
        return "";
      const date = new Date(ts);
      return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(common_vendor.unref(sortedCards).length),
        b: loading.value
      }, loading.value ? {} : common_vendor.unref(sortedCards).length === 0 ? {
        d: common_vendor.o(goToCreate)
      } : {
        e: common_vendor.f(common_vendor.unref(sortedCards), (c, k0, i0) => {
          return common_vendor.e({
            a: c.ai_image_temp_url || c.ai_image_url || c.image_url,
            b: common_vendor.t(c.rarity),
            c: c.theme === "magic" ? 1 : "",
            d: common_vendor.t(c.title),
            e: c.status === "unlocked"
          }, c.status === "unlocked" ? {} : {}, {
            f: c.unlock_time
          }, c.unlock_time ? {
            g: common_vendor.t(formatDate(c.unlock_time))
          } : {}, {
            h: common_vendor.n("border-" + (c.rarity || "N").toLowerCase()),
            i: common_vendor.n({
              "border-magic": c.theme === "magic"
            }),
            j: c._id,
            k: common_vendor.o(($event) => openCard(c), c._id)
          });
        })
      }, {
        c: common_vendor.unref(sortedCards).length === 0,
        f: common_vendor.p({
          current: 1
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f0d3a5d5"], ["__file", "D:/素食卡牌/src/pages/collection/collection.vue"]]);
wx.createPage(MiniProgramPage);
