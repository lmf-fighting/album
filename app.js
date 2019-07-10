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
        console.log('callFunction test result: ', res)
        console.log("test:" + res.result.event.userInfo.openId)
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
          console.log("results:")
          console.log(results);
            that.doInsert(userInfo.avatarUrl, userInfo.nickName, new Date().getTime(), results);
        }).catch(function (err) {
          console.log(err);
        });
        },
          fail: e => {
            console.error(e)
          }, complete: () => {
            wx.hideLoading()
            wx.redirectTo({
              // url: '/pages/index/index',
              url: '/pages/index2/index2',
            })
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
    console.log("doInsert...")
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
        console.log("res:" + res)
      }
    })
  },
  //下载
  doDownload:function(fileId){
    var that=this;
    wx.cloud.downloadFile({
      fileID: fileId,
      success: res => {
        // get temp file path
        console.log("保存路径："+res.tempFilePath)
        wx.saveImageToPhotosAlbum({

          filePath: res.tempFilePath,
          success(res) {
            wx.showToast({
              title: '下载成功',
              icon: 'success',
              duration: 2000
            })
          }
        })
      },
      fail: err => {
        // handle error
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