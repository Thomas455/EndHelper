// pages/login/login.js
Page({
  data: {
    loginType: 'password',       // 'password' | 'code'
    account: '',                 // 密码登录-账号
    password: '',                // 密码登录-密码
    phone: '',                   // 验证码登录-手机号
    verifyCode: '',              // 验证码登录-验证码
    codeSending: false,          // 是否正在发送验证码
    codeBtnText: '获取验证码',
    logging: false,              // 是否正在登录
  },
  onLoad(){
    var token = wx.getStorageSync('userToken')
    if(token === null){
      return;
    }

    //校验token是否有效
    wx.request({
      url: 'https://as.hypergryph.com/user/info/v1/basic?token='+token, 
      method: 'get',
      success: (res) => {
        if (res.data.msg === "OK") {
          wx.showToast({ title: '登录成功', icon: 'success' });
          //触发跳转
          wx.redirectTo({
            url: '/pages/index/index'
          });

        } else {
          wx.showToast({ title: '登录过期', icon: 'error' });
          wx.removeStorage({
            key: 'userToken',
            success(res) {
            console.log(res);
            }
            });

        }
        console.log(res.data);
      },
      fail: (err) => {
        console.error('token有效性请求失败', err);
        wx.showToast({ title: '网络异常，请重新登录', icon: 'error' });
        wx.removeStorage({
          key: 'userToken',
          success(res) {
          console.log(res);
          }
        });
      }
    });

  },


  // 切换登录方式
  switchTab(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ loginType: type });
  },

  // 输入监听
  onAccountInput(e) {
    this.setData({ account: e.detail.value });
  },
  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },
  onCodeInput(e) {
    this.setData({ verifyCode: e.detail.value });
  },
  // 单独写一个倒计时方法
  startCountdown() {
    this.setData({ codeSending: true });
    let countdown = 60;
    this.setData({ codeBtnText: `${countdown}s` });
    const timer = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({ codeSending: false, codeBtnText: '获取验证码' });
      } else {
        this.setData({ codeBtnText: `${countdown}s` });
      }
    }, 1000);
  },
  


  // 获取验证码（倒计时60s）
  getVerifyCode() {
    const phone = this.data.phone;
    if (!phone || phone.length !== 11) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    // 防止重复点击
    if (this.data.codeSending) return;

    //发送验证码
    wx.request({
      url: 'https://as.hypergryph.com/general/v1/send_phone_code', 
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        "phone": phone,
        "type": 2
      },
      success: (res) => {
        if (res.data.msg === "OK") {
          wx.showToast({ title: '验证码已发送', icon: 'success' });
          this.startCountdown(); // 启动倒计时
        } else {
          wx.showToast({ title: res.data.msg || '发送失败', icon: 'error' });
          this.setData({ codeSending: false });
        }
        console.log(res.data);
      },
      fail: (err) => {
        console.error('验证码请求失败', err);
        wx.showToast({ title: '网络异常，请重试', icon: 'none' });
        this.setData({ codeSending: false });
      }
    });
    



    // 模拟倒计时（真实场景在发送成功后启动）
    const timer = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({ codeSending: false, codeBtnText: '获取验证码' });
      } else {
        this.setData({ codeBtnText: `${countdown}s` });
      }
    }, 1000);
  },

  // 登录处理
  handleLogin() {
    if (this.data.logging) return;

    // 根据登录类型构造请求数据
    var loginurl;
    let loginData = {};
    if (this.data.loginType === 'password') {
      loginurl="https://as.hypergryph.com/user/auth/v1/token_by_phone_password";
      const { account, password } = this.data;
      console.log("密码登录");
      if (!account || !password) {
        wx.showToast({ title: '请填写完整信息', icon: 'none' });
        return;
      }

      loginData = { 
        "phone" : account,
        "password": password 
      };

    } else {
      loginurl="https://as.hypergryph.com/user/auth/v2/token_by_phone_code";
      const { phone, verifyCode } = this.data;
      console.log("验证码登录");
      if (!phone || !verifyCode) {
        wx.showToast({ title: '请填写手机号和验证码', icon: 'none' });
        return;
      }
      loginData = { 
        "phone" : phone,
        "code": verifyCode 
      };
    }

    this.setData({ logging: true });

    //请求
     wx.request({
       url: loginurl,
       method: 'POST',
       data: loginData,
       success: (res) => {
         console.log('登录响应:', res.data);
         if (res.data.status === 0) {
           const token = res.data.data.token;
           console.log("登录成功："+token);
           wx.setStorageSync('userToken', token);//储存token
           wx.showToast({ title: '登录成功', icon: 'success' });
           // 跳转到主页
           wx.redirectTo({
            url: '/pages/index/index'
          });
         } else {
          console.log("登录未成功");
           wx.showToast({ title: res?.data?.data?.msg || res?.data?.msg || res?.message || res?.data?.message , icon: 'error' });
         }
       },
       fail: () => {
         wx.showToast({ title: '网络异常', icon: 'error' });
       },
       complete: () => {
         this.setData({ logging: false });
       }
     });
     
  }
});