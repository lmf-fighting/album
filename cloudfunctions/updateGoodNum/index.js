// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: 'dev-cgj7w',
  traceUser: true
})
const db=cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {

  return db.collection('recordInfo').doc(event._id).update({
    data: {
      goodNum: _.inc(event.i)
    },
    success: console.log,
    fail: console.error
  })
}