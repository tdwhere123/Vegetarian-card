"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  CustomTabBar();
}
const CustomTabBar = () => "../../components/CustomTabBar.js";
const _sfc_main = {
  __name: "profile",
  setup(__props) {
    const totalGenerated = common_vendor.ref(0);
    const totalUnlocked = common_vendor.ref(0);
    const records = common_vendor.ref([]);
    const showModal = common_vendor.ref(false);
    const current = common_vendor.ref({});
    const defaultAvatar = "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";
    const userInfo = common_vendor.ref({
      avatarUrl: defaultAvatar,
      nickName: "番茄大厨"
    });
    common_vendor.onShow(async () => {
      common_vendor.index.hideTabBar();
      const savedUser = common_vendor.index.getStorageSync("user_profile");
      if (savedUser) {
        userInfo.value = savedUser;
      }
      const db = common_vendor.wx$1.cloud.database();
      try {
        const countAll = await db.collection("recipes").count();
        totalGenerated.value = countAll.total || 0;
        const countUnlocked = await db.collection("recipes").where({ status: "unlocked" }).count();
        totalUnlocked.value = countUnlocked.total || 0;
        const res = await db.collection("recipes").where({ status: "unlocked" }).orderBy("unlock_time", "desc").get();
        records.value = res.data || [];
      } catch (err) {
        console.error(err);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    });
    const groupedRecords = common_vendor.computed(() => {
      const groups = {};
      records.value.forEach((item) => {
        const d = formatDate(item.unlock_time);
        if (!groups[d]) {
          groups[d] = [];
        }
        groups[d].push(item);
      });
      return Object.keys(groups).map((date) => ({
        date,
        items: groups[date]
      }));
    });
    function onChooseAvatar(e) {
      const { avatarUrl } = e.detail;
      userInfo.value.avatarUrl = avatarUrl;
      saveProfile();
    }
    function onNickBlur(e) {
      const val = e.detail.value;
      if (val) {
        userInfo.value.nickName = val;
        saveProfile();
      }
    }
    function saveProfile() {
      common_vendor.index.setStorageSync("user_profile", userInfo.value);
    }
    function openEntry(item) {
      current.value = item;
      showModal.value = true;
    }
    function closeModal() {
      showModal.value = false;
    }
    function formatDate(ts) {
      if (!ts)
        return "未知日期";
      const d = new Date(ts);
      return `${d.getMonth() + 1}月${d.getDate()}日`;
    }
    function formatDateFull(ts) {
      if (!ts)
        return "";
      const d = new Date(ts);
      return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value.avatarUrl,
        b: common_vendor.o(onChooseAvatar),
        c: common_vendor.o(onNickBlur),
        d: userInfo.value.nickName,
        e: common_vendor.o(($event) => userInfo.value.nickName = $event.detail.value),
        f: common_vendor.t(totalGenerated.value),
        g: common_vendor.t(totalUnlocked.value),
        h: common_vendor.f(common_vendor.unref(groupedRecords), (group, k0, i0) => {
          return {
            a: common_vendor.t(group.date),
            b: common_vendor.f(group.items, (item, k1, i1) => {
              return {
                a: item.user_image_url || item.ai_image_url,
                b: common_vendor.t(item.title),
                c: item.theme === "magic" ? 1 : "",
                d: item._id,
                e: common_vendor.o(($event) => openEntry(item), item._id)
              };
            }),
            c: group.date
          };
        }),
        i: records.value.length === 0
      }, records.value.length === 0 ? {} : {}, {
        j: showModal.value
      }, showModal.value ? common_vendor.e({
        k: common_vendor.t(current.value.title),
        l: common_vendor.t(formatDateFull(current.value.unlock_time)),
        m: current.value.user_image_url,
        n: current.value.user_note
      }, current.value.user_note ? {
        o: common_vendor.t(current.value.user_note)
      } : {}, {
        p: current.value.ai_image_url
      }, current.value.ai_image_url ? {
        q: current.value.ai_image_temp_url || current.value.ai_image_url
      } : {}, {
        r: common_vendor.t(current.value.ai_comment || "正在品鉴中..."),
        s: common_vendor.o(() => {
        }),
        t: current.value.theme === "magic" ? 1 : "",
        v: common_vendor.o(closeModal)
      }) : {}, {
        w: common_vendor.p({
          current: 2
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-04d37cba"], ["__file", "D:/素食卡牌/src/pages/profile/profile.vue"]]);
wx.createPage(MiniProgramPage);
