const orderModel = require('../models/order')
// 查询订单
exports.index = (req,res,next) =>{
    orderModel.find(req.session.user.id).then(orderList=>{
        // res.json(orderList)
        res.locals.orderList = orderList
        res.render('order.art')
    }).catch(err=>next(err))
}

// 生成订单
exports.create = (req, res, next) => {
    //商品ID的集合  字符串
    const items = req.query.ids
    //用户ID
    const userId = req.session.user.id
    //调用接口
    orderModel.create(userId, items)
      .then(order => {
        // 生成好的订单  展示结算面  /checkout/订单编号 重定向
        res.redirect('/checkout/' + order.order_number)
      }).catch(err => next(err))
  }

  //结算
exports.checkout = (req, res, next) => {
    //展示结算面
    const num = req.params.num
    //查询
    orderModel.detail(num)
      .then(order => {
        res.locals.order = order
        res.render('checkout.art')
      }).catch(err => next(err))
  }