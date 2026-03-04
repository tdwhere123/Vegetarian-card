"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/detail/detail.js";
  "./pages/collection/collection.js";
  "./pages/profile/profile.js";
}
const _sfc_main = {
  onLaunch() {
    if (common_vendor.wx$1.cloud) {
      common_vendor.wx$1.cloud.init({
        env: "",
        // ⚠️ 请替换为你的云开发环境 ID
        traceUser: true
      });
    }
  },
  onShow() {
  },
  onHide() {
  }
};
const App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "D:/素食卡牌/src/App.vue"]]);
function createApp() {
  const app = common_vendor.createSSRApp(App);
  return { app };
}
createApp().app.mount("#app");
exports.createApp = createApp;
