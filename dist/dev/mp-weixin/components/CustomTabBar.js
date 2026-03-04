"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "CustomTabBar",
  props: {
    current: {
      type: Number,
      default: 0
    },
    theme: {
      type: String,
      default: "normal"
    }
  },
  setup(__props) {
    function switchTab(url) {
      common_vendor.index.switchTab({ url });
    }
    return (_ctx, _cache) => {
      return {
        a: __props.current === 0 ? 1 : "",
        b: common_vendor.o(($event) => switchTab("/pages/index/index")),
        c: __props.current === 1 ? 1 : "",
        d: common_vendor.o(($event) => switchTab("/pages/collection/collection")),
        e: __props.current === 2 ? 1 : "",
        f: common_vendor.o(($event) => switchTab("/pages/profile/profile")),
        g: __props.theme === "creative" ? 1 : ""
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-55a48eff"], ["__file", "D:/素食卡牌/src/components/CustomTabBar.vue"]]);
wx.createComponent(Component);
