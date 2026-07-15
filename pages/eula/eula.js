// pages/eula/eula.js
Page({

  data: {
    
    // 协议版本号（更新协议时递增，会强制用户重新同意）
    eulaVersion: '0.1.1'
  },

  onLoad(options) {
    const app = getApp();

    // 可以检查是否已经同意过，如果已同意则自动跳转
    const agreedVersion = wx.getStorageSync('eulaAgreedVersion');
    if (agreedVersion === app.globalData.eulaVersion) {
      // 已同意当前版本，直接跳转到登录页
      this.redirectToLogin();
    }
    // 否则展示 EULA 页面
  },

  // 用户点击"同意"
  onAgree() {
    // 记录用户已同意及当前协议版本
    wx.setStorageSync('eulaAgreedVersion', this.data.eulaVersion);
    wx.setStorageSync('eulaAgreedTime', new Date().toISOString());
    
    // 跳转到登录页
    this.redirectToLogin();
  },

  // 用户点击"不同意"
  onDisagree() {
    wx.showModal({
      title: '提示',
      content: '您需要同意用户协议才能使用本工具。点击"确定"退出，或点击"取消"重新阅读。',
      confirmText: '退出',
      cancelText: '重新阅读',
      success: (res) => {
        if (res.confirm) {
          // 用户选择退出
          wx.showToast({
            title: '已退出',
            icon: 'none',
            duration: 1500
          });
          // 延迟退出（让 Toast 显示完）
          setTimeout(() => {
            // 退出小程序（微信小程序没有直接退出API，调用 navigateBack 到首页或使用 wx.exitMiniProgram）
            // 方法1：尝试退出（仅支持部分场景）
            wx.navigateBack({
              delta: 0,
              fail: () => {
                // 如果无法返回，展示提示
                wx.showModal({
                  title: '提示',
                  content: '请点击右上角「···」关闭小程序',
                  showCancel: false
                });
              }
            });
          }, 1000);
        } else {
          // 用户选择重新阅读，留在当前页面
          // 可选：滚动到顶部
          wx.pageScrollTo({ scrollTop: 0 });
        }
      }
    });
  },

  // 跳转到登录页
  redirectToLogin() {
    wx.redirectTo({
      url: '/pages/login/login',
      fail: (err) => {
        console.error('跳转登录页失败', err);
        // 兜底：如果跳转失败，尝试切换 Tab（如果有）
        wx.switchTab({
          url: '/pages/login/login',
          fail: () => {
            wx.showToast({ title: '页面跳转失败', icon: 'none' });
          }
        });
      }
    });
  }
});