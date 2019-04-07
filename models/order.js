const axios = require('./api')
//操作订单相关的数据
// 获取指定 ID 对应用户的全部订单信息
exports.find = (userId) => {
  return axios.get(`orders?user_id=${userId}`)
    .then(res => res.data).catch(err => Promise.reject(err))
}

// 生成订单
exports.create = (userId, items) => {
    return axios.post(`orders`, {user_id: userId, items})
      .then(res => {
        //   console.log(res)
          return res.data
        }).catch(err => Promise.reject(err))
}

//获取单条订单信息 通过订单编号
exports.detail = (num) => {
    return axios.get(`orders/${num}`)
      .then(res => res.data).catch(err => Promise.reject(err))
}

//订单修改
exports.edit = (num, pay_status, trade_no) => {
  const send_status = 0
  const express_address = '张三 北京顺义 13200001111 100010'
  return axios.patch(`/orders/${num}`, {pay_status,trade_no,send_status,express_address})
    .then(res => res.data).catch(err => {
      console.log(err)
      Promise.reject(err)
    })
}