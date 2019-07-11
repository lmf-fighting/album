// pages/index/index.js
const app = getApp()

Page({
  data: {
    openId: null,
    userInfo: {},
    recordInfo:[],
    pageInfo:{pageIndex:1,pageSize:5,total:0,sum:0,time:0}
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    this.getPullDownData();
    // this.getRecordInfos();
    this.setData({ openId: app.globalData.openId, userInfo: app.globalData.userInfo })
  },
  //需要放在上传文件页面
  uploadAndInsert: function () {
    app.doChooseImage(app.globalData.userInfo.nickName);
  },
  doDownload: function (fileId) {
    fileId = 'cloud://dev-cgj7w.6465-dev-cgj7w-1259601834/745c2279-2300-4d56-9b01-5f05c286af481562643271646.png'
    app.doDownload(fileId)
  },
  //获取
  getRecordInfos: function () {
    var that = this;
    const db = wx.cloud.database()
    var pageSize = that.pageSize;
    var pageIndex = that.pageIndex;
    db.collection('recordInfo').orderBy('time', 'desc').skip(pageIndex * pageSize).limit(5).get({
      success: function (res) {
        that.setData({ recordInfo:res.data})
      }
    })
  },
  //得到下拉的数据
  getPullDownData:function(){
    var that = this;
    const db = wx.cloud.database()
    var pageSize = that.data.pageInfo.pageSize;
    var pageIndex = that.data.pageInfo.pageIndex;
    var total=that.data.pageInfo.total;
    db.collection('recordInfo').count({
      success: function (res) {
        if (total < res.total){
          db.collection('recordInfo').orderBy('time', 'desc').skip(0).limit(5).get({
            success: function (d) {
              that.setData({ recordInfo: d.data, pageInfo: { pageIndex: 1, pageSize: 5, total: res.total, sum: d.data.length,time:d.data[0].time}})
            }
          })
          wx.showToast({
            title: '加载成功',
            icon: 'none'
          })
        }else{
          wx.showToast({
            title: '没有新数据',
            icon: 'none'
          })
          
        }
        // 隐藏导航栏加载框
        wx.hideNavigationBarLoading();
        // 停止下拉动作
        wx.stopPullDownRefresh();
        
      }
    })
  },
  //得到上拉的数据
  getReachBottomData:function(){
      var that=this;
      if(that.data.pageInfo.sum<that.data.pageInfo.total){
        var pageIndex=that.data.pageInfo.pageIndex;
        var pageSize=that.data.pageInfo.pageSize;
        pageIndex++;

        that.setData({["pageInfo.pageIndex"]:pageIndex})
        const db = wx.cloud.database()
        console.log(that.data.pageInfo.time)
        db.collection('recordInfo').where({ time: db.command.lte(that.data.pageInfo.time)}).orderBy('time', 'desc').skip((pageIndex-1)*pageSize).limit(pageSize).get({
          success: function (res) {
            var sum=that.data.pageInfo.sum;
            sum=sum+ res.data.length;

            var records=that.data.recordInfo;
            for (let i of res.data) {
              records.push(i)
            }

            that.setData({ recordInfo: records, ["pageInfo.sum"]: sum })
          },
        
        })
      }else{
        wx.showToast({
          title: '到底啦~',
          icon:'none'
        })
      }
    // 隐藏加载框
    wx.hideLoading();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 显示顶部刷新图标
    // wx.showNavigationBarLoading();
    this.getPullDownData();
        

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 显示加载图标
    wx.showLoading({
      title: '玩命加载中',
    })
    this.getReachBottomData()
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  } ,
   //点击图片实现预览
  //只支持 http 或者 https 协议的网络图片地址.
  previewImg: function (e) {
    var src = e.currentTarget.dataset.src;////获取data-src
    var imgList = e.currentTarget.dataset.list;//获取data-list
    wx.previewImage({
      current: src,     // 当前显示图片的http链接
      urls: imgList,     //需要预览的图片http链接列表
    })
  },
  addImages:function(){
    wx.navigateTo({
      url: '/pages/index2/index2',
    })
  },
  //点赞按钮的点击事件
  setGood: function (e) {
    var that=this;
    var rid = e.target.dataset.rid;
    var oid=app.globalData.openId;
    const db = wx.cloud.database()
    db.collection('goodsInfo').where({ _openid: oid, recordId: rid }).get({
      success: function (res) {
        
        if (res.data.length!=0) {//已经有了,取消点赞
          console.log("开始取消点赞。。。")
          //删除中间表记录
          db.collection('goodsInfo').doc(res.data[0]._id).remove({
            success: function (d) {

              //查看点赞数是否为零
              db.collection('recordInfo').doc(rid).get({
                success: function (res) {
                  console.log(res.data)
                  if (res.data.goodNum > 0) {
                    console.log("正在调用云函数。。。点赞-1。。。。")
                    //点赞数-1
                    that.updateGoodNum(rid,-1)
                  }
                }
              })
            }
          })

        } else {//点赞
          //中间表记录
          console.log("开始点赞。。。。")
          db.collection('goodsInfo').add({
            data: {
              recordId: rid
            },
            success: function (res) {
              console.log("正在调用云函数。。。点赞+1。。。。")
              //点赞+1
              that.updateGoodNum(rid, 1)
            }
          })
        }
      }
    })
  },
  updateGoodNum:function(rid,num){
    var that=this;
    wx.cloud.callFunction({
      name: 'updateGoodNum',
      data: {
        '_id': rid,
        'i':num
      },
      success(res) { 
        var index=that.data.recordInfo.findIndex((element) => (element._id == rid))
        var str = "recordInfo[" + index + "].goodNum";
        if(num==1){
          wx.showToast({
            title: '点赞',
            icon: 'none'
          })
          var goodNum = that.data.recordInfo[index].goodNum+1;
          that.setData({ [str]: goodNum })         
        } else{
          wx.showToast({
            title: '取消',
            icon: 'none'
          })
          var goodNum = that.data.recordInfo[index].goodNum - 1;
          that.setData({ [str]: goodNum })
        }  
      },
      fail: console.error
    })
  }
})