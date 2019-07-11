//index.js
//获取应用实例

const app = getApp();
var util = require('../../utils/util.js');


Page({
  data: {
    openId: null,
    userInfo: {},
    datetime:new Date(),
    recordInfo: [{ _id: 4, headIcon: '', nickName: '', time: '', imageList: [], goodNum: 100, isGood: true },
    { _id: 3, headIcon: '', nickName: '', time: '', imageList: [], goodNum: 100, isGood: false },
    { _id: 2, headIcon: '', nickName: '', time: '', imageList: [], goodNum: 100, isGood: false },
    { _id: 1, headIcon: '', nickName: '', time: '', imageList: [], goodNum: 100, isGood: true }],
    pageInfo: { pageIndex: 1, pageSize: 5 }
  },
 
  onLoad: function (options) {
    var that=this;
   this.getRecordInfos();
    
  // var datetime = util.formateTime(new Date());
    this.setData({
      
      userInfo: app.globalData.userInfo,
      datetime: util.formatTime(new Date())
      });

  },
  getImagesByOpenIdAndTime:function(options){
    app.getImagesByOpenIdAndTime(options.currentTarget.dataset.time)
  },
  uploadAndInsert:function(){
    app.doChooseImage();
  },
  getRecordInfos: function () {
    var that = this;
    const db = wx.cloud.database()
    var pageSize = that.pageSize;
    var pageIndex = that.pageIndex;
    db.collection('recordInfo').orderBy('time', 'desc').skip(pageIndex * pageSize).limit(5).get({
      success: function (res) {
        app.globalData.recordInfo=res.data;
      }
    })
  }

  


})
