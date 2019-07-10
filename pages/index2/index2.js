//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    openId: null,
    userInfo: {},
    recordInfo: [{ _id: 4, headIcon: '', nickName: '', time: '', imageList: [], goodNum: 100, isGood: true },
    { _id: 3, headIcon: '', nickName: '', time: '', imageList: [], goodNum: 100, isGood: false },
    { _id: 2, headIcon: '', nickName: '', time: '', imageList: [], goodNum: 100, isGood: false },
    { _id: 1, headIcon: '', nickName: '', time: '', imageList: [], goodNum: 100, isGood: true }],
    pageInfo: { pageIndex: 1, pageSize: 5 }
  },
  onLoad: function () {
  },
  doDownload: function (fileId){
    fileId ='cloud://dev-cgj7w.6465-dev-cgj7w-1259601834/745c2279-2300-4d56-9b01-5f05c286af481562643271646.png'
    app.doDownload(fileId)
  },
  getImagesByOpenIdAndTime:function(options){
    app.getImagesByOpenIdAndTime(options.currentTarget.dataset.time)
  },
  uploadAndInsert:function(){
    console.log("uploadAndInsert...")
    app.doChooseImage();
  },
  getRecordInfos: function () {
    var that = this;
    const db = wx.cloud.database()
    var pageSize = that.pageSize;
    var pageIndex = that.pageIndex;
    db.collection('recordInfo').orderBy('time', 'desc').skip(pageIndex * pageSize).limit(5).get({
      success: function (res) {
        
        console.log(res)
      }
    })
  },


})
