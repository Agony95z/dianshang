const alipay = require('../utils/alipay')
const orderModel = require('../models/order')
exports.index = (req, res, next) => {
  // 路由进来查找支付网关和地址 
  // 跳到支付页面需要 订单 编号信息
  const num = req.params.num
  // 根据订单编号查询详细信息
  orderModel.detail(num)
    .then(order => {
      //获取支付地址   支付网关?参数项  重定向到支付链接
      res.redirect(alipay.getPayUrl(order))
    }).catch(err => next(err))
}
exports.callback =  (req, res, next) => {
  console.log('=========================================')
  //out_trade_no 自己的订单编号
  // trade_no 支付宝流水账单
  const {out_trade_no,trade_no} = req.query
  const pay_status = 1 //已支付
  // 订单支付完成后 需要修改订单信息 为已支付
  orderModel.edit(out_trade_no,pay_status,trade_no)
    .then(data=>{
      // data 是幌子
      // 修改完成后返回 该订单的详细信息 需要重新查看订单的详细信息 并渲染到页面  
      return orderModel.detail(out_trade_no)
    }).then(order=>{
    res.locals.order = order
    res.render('callback.art')
  }).catch(err=>{
    console.log(err)
    next(err)
  })
}