<script>
export default {
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-2gjwqg9o320f71b5', // ⚠️ 请替换为你的云开发环境 ID
        traceUser: true
      })
    }
  },
  onShow() {},
  onHide() {}
}
</script>
<style>
page {
  background-color: #f7f3ea;
  color: #333;
}
</style>
