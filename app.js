//app.js
var util = require('/utils/util.js');

//app.js
App({
  onLaunch: function () {

    wx.cloud.init({
      env: 'dev-cgj7w',
      traceUser:true
    })
    //通过云函数获取openid
    this.getOpenId();

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

  },
  globalData: {
    userInfo: null,
    openId:null,
    author:null
  },
   getOpenId: function () {
    var that=this;
    wx.cloud.callFunction({
      name: 'getOpenId',
      complete: res => {
        that.globalData.openId =res.result.event.userInfo.openId
      }
    })
  },
  //选择图片
  doChooseImage:function(){
    var that = this;
    var userInfo = that.globalData.userInfo;
    // 选择图片
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        var promise = Promise.all(res.tempFilePaths.map((tempFilePath, index) => {
          return new Promise(function (resolve, reject) {
            that.doUpload(resolve, reject,tempFilePath)
          });
        }));
        promise.then(function (results) {
          that.doInsert(userInfo.avatarUrl, userInfo.nickName, util.formatTime(new Date()), results);
        }).catch(function (err) {
          console.log(err);
        });
        },
          fail: e => {
            console.error(e)
          }, complete: () => {
            wx.hideLoading()
          }
    })
  },
  //上传图片
  doUpload: function (resolve, reject,filePath) {
    var that = this;
    var cloudPath=that.getUUID() + filePath.match(/\.[^.]+?$/)[0];
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        resolve(res.fileID);
      },
      fail: e => {
        reject(new Error('failed to upload file'));
      }
    })
  },
  //插入数据库
  doInsert: function (headIcon, nickName, time,imageList) {
    wx.cloud.database().collection('recordInfo').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        time: time,
        headIcon: headIcon,
        nickName: nickName,
        imageList: imageList,
        goodNum:0
      },
      success: function (res) {
        wx.redirectTo({
          url: '/pages/index/index',
        });
      }
    })
  },
  getUUID:function(){
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);

    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
  }
})