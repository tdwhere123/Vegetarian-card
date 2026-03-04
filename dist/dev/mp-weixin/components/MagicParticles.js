"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "MagicParticles",
  props: {
    theme: {
      type: String,
      default: "normal"
    }
  },
  setup(__props) {
    const props = __props;
    const particles = common_vendor.ref([]);
    const chars = ["✨", "🌿", "🍅", "🥔", "🥕", "⭐", "🍲"];
    const magicChars = ["✨", "🔮", "⚡", "🌙", "⭐", "🌌"];
    common_vendor.onMounted(() => {
      const count = 12;
      const list = [];
      for (let i = 0; i < count; i++) {
        const isMagic = props.theme === "creative";
        const charList = isMagic ? magicChars : chars;
        list.push({
          char: charList[Math.floor(Math.random() * charList.length)],
          style: {
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
            animationDuration: 4 + Math.random() * 6 + "s",
            // Slower
            animationDelay: Math.random() * 5 + "s",
            opacity: 0,
            fontSize: 20 + Math.random() * 30 + "rpx",
            transform: `scale(${0.5 + Math.random()})`
          }
        });
      }
      particles.value = list;
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(particles.value, (p, i, i0) => {
          return {
            a: common_vendor.t(p.char),
            b: i,
            c: common_vendor.s(p.style)
          };
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-08d54884"], ["__file", "D:/素食卡牌/src/components/MagicParticles.vue"]]);
wx.createComponent(Component);
