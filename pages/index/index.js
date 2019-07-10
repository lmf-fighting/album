// pages/index/index.js
const app = getApp()

Page({
  data: {
    openId: null,
    userInfo: {},
    recordInfo:[],
    pageInfo:{pageIndex:1,pageSize:5}
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    this.getRecordInfos();
    this.setData({ openId: app.globalData.openId, userInfo: app.globalData.userInfo })
    console.log("mylog:" + app.globalData.openId)
    console.log("userInfo:" + app.globalData.userInfo)
  },
  //需要放在上传文件页面
  uploadAndInsert: function () {
    console.log("uploadAndInsert...")
    app.doChooseImage(app.globalData.userInfo.nickName);
  },
  doDownload: function (fileId) {
    fileId = 'cloud://dev-cgj7w.6465-dev-cgj7w-1259601834/745c2279-2300-4d56-9b01-5f05c286af481562643271646.png'
    app.doDownload(fileId)
  },
  getRecordInfos: function () {
    var that = this;
    const db = wx.cloud.database()
    var pageSize = that.pageSize;
    var pageIndex = that.pageIndex;
    db.collection('recordInfo').orderBy('time', 'desc').skip(pageIndex * pageSize).limit(5).get({
      success: function (res) {
        console.log("在这里：")
        console.log(res.data)
        that.setData({ recordInfo:res.data})
      }
    })
  },



  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log("来自页面内转发按钮"+res.target)
    }
    return {
      title: '',
      path: '/page/user?id=123'
    }
  },
  //点击图片实现预览
  //只支持 http 或者 https 协议的网络图片地址.
  previewImg: function (e) {
    var src = e.currentTarget.dataset.src;////获取data-src
    var imgList = e.currentTarget.dataset.list;//获取data-list
    wx.previewImage({
      current: src,     // 当前显示图片的http链接
      urls: imgList,     //需要预览的图片http链接列表
    })
  }
})