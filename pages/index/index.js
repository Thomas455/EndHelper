// index.js
// pages/index/index.js
Page({
  data: {
    // ---- 基础信息 ----
    uid: '',
    roleId: '',
    nickname: '',
    
    // ---- 玩家等级 ----
    levelCur: '',
    levelMax: '',
    
    // ---- BP通行证等级 ----
    bpLevelCur: '',
    bpLevelMax: '',
    
    // ---- 理智系统 ----
    apCurrent: '',
    apMax: '',
    apPercent: 0,      // 
    apStatus: '',  // 理智回满预计时间根据时间戳计算展示
    
    // ---- 每日任务 ----
    dailyActivity: '',      // 活跃度
    
    // ---- 周常任务 ----
    weeklyCur: '',//已经完成
    weeklyMax: '',
    
    // ---- 系统元数据 ----
    pollInterval: '5',         // 刷新间隔（秒）
    bizCode: 'beyond_kanban',  // 业务码
    arkStatus: '未绑定'        // 方舟绑定状态（null时显示未绑定）
  },

  onLoad() {
    // 页面加载时模拟获取数据（实际调用云函数）
    this.fetchData();
  },

  // 获取数据函数
  fetchData() {
    var token = wx.getStorageSync('userToken')
    console.log('正在获取数据...');
    wx.request({
      url: 'https://launcher.hypergryph.com/api/game/get_kanban?game_appcode=6LL0KJuqHBVz33WK&token='+token, 
      method: 'get',
      success: (res) => {
        if (res.data.beyond_kanban) {
          wx.showToast({ title: '登录成功', icon: 'success' });
          console.log("获取成功")
          
          //触发刷新
          this.setData({
            // ---- 基础信息 ----
            uid:res.data.beyond_kanban.uid,
            roleId: res.data.beyond_kanban.role_id,
            nickname: res.data.beyond_kanban.nickname,
            
            // ---- 玩家等级 ----
            levelCur: res.data.beyond_kanban.level.cur,
            levelMax: res.data.beyond_kanban.level.max_level,
            
            // ---- 通行证等级 ----
            bpLevelCur: res.data.beyond_kanban.bp_level.cur,
            bpLevelMax: res.data.beyond_kanban.bp_level.max_level,
            
            // ---- 理智系统 ----
            apCurrent: res.data.beyond_kanban.ap.current,
            apMax: res.data.beyond_kanban.ap.max,
            apPercent: res.data.beyond_kanban.ap.current/res.data.beyond_kanban.ap.max,      // 理智百分比
            apStatus: this.formatTime(res.data.beyond_kanban.ap.complete_recovery_time)+"回满",  // 理智回满预计时间根据时间戳计算展示
            
            // ---- 每日任务 ----
            dailyActivity: res.data.beyond_kanban.daily_task_info.activity,      // 活跃度
            
            // ---- 周常任务 ----
            weeklyCur: res.data.beyond_kanban.weekly_task_info.cur,
            weeklyMax: res.data.beyond_kanban.weekly_task_info.max,
            
            

          });

        } else {
          wx.showToast({ title: '登录过期', icon: 'error' });
          wx.removeStorage({
            key: 'userToken',
            success(res) {
            console.log(res);
            }
            });
            //触发跳转
          wx.redirectTo({
            url: '/pages/login/login'
          });

        }
        console.log(res.data);
      },
      fail: (err) => {
        console.error('验证码请求失败', err);
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

  // 点击刷新按钮
  onRefresh() {
    console.log('手动刷新数据');
    this.setData({
      apStatus: '⏳ 刷新中...'
    });
    
    // 模拟1秒后更新（后面替换为真实云函数回调）
    setTimeout(() => {
      this.fetchData();
    }, 800);
  },


  //退出登录按钮
  logout(){
    wx.showToast({ title: '登录过期', icon: 'error' });
          wx.removeStorage({
            key: 'userToken',
            success(res) {
            console.log(res);
            }
            });
            //触发跳转
          wx.redirectTo({
            url: '/pages/login/login'
          });
  },

  // 工具方法：将时间戳转为可读时间（后面使用）
  formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
  }
});