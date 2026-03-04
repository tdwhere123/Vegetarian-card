"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "LoadingView",
  setup(__props) {
    const messages = [
      "正在去异世界寻找灵感...",
      "大厨正在磨刀...",
      "正在和胡萝卜谈判...",
      "正在摆盘..."
    ];
    const idx = common_vendor.ref(0);
    const currentMessage = common_vendor.ref(messages[0]);
    let timer;
    common_vendor.onMounted(() => {
      timer = setInterval(() => {
        idx.value = (idx.value + 1) % messages.length;
        currentMessage.value = messages[idx.value];
      }, 1500);
    });
    common_vendor.onUnmounted(() => {
      if (timer)
        clearInterval(timer);
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(currentMessage.value)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4c2a2d9"], ["__file", "D:/素食卡牌/src/components/LoadingView.vue"]]);
wx.createComponent(Component);
