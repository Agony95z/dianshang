// 汇总所有路由
const express = require('express')
const router = express.Router()
const home = require('./controllers/home')
const account = require('./controllers/account')
const list = require('./controllers/list')
const item = require('./controllers/item')
const cart = require('./controllers/cart')
const member = require('./controllers/member')
const {checkLogin} = require('./middleware')
const order = require('./controllers/order')
const pay = require('./controllers/pay')
// 首页路由
router.get('/',home.index)

//猜你喜欢路由接口
router.get('/like',home.like) 

// 搜索页面路由
router.get('/search',list.search)

// 详情页面路由
router.get('/item/:id(\\d+)',item.index)

// 实现加入购物车的路由
router.get('/cart/add',cart.add)

// 查看购物车的路由 先查看页面 然后在该页面上发送ajax请求 去实现局部交互
router.get('/cart',cart.index)//响应页面
router.get('/cart/list', cart.list)  //查询  
router.post('/cart/edit', cart.edit)  //编辑
router.post('/cart/remove', cart.remove) //删除

// 登录成功后 添加购物车成功后 路由
router.get('/cart/success', cart.addAfter) //添加成功

// 退出登录路由
router.get('/logout', account.logout) //退出

// 进入个人中心路由之前 要判断是否登录  加入检查是否登录的中间件 在middleware 中设置
//个人中心路由
router.get('/member',checkLogin,member.index) 

//订单和支付
// 查看订单
router.get('/order', checkLogin, order.index)
// 生成订单
router.get('/order/create', checkLogin, order.create)
// 生成订单重定向
router.get('/checkout/:num', checkLogin, order.checkout)

// 支付
router.get('/pay/:num(\\d+)', checkLogin, pay.index)
// 支付成功后  回跳信息路由
router.all('/pay/callback', checkLogin, pay.callback)

// 列表界面接口
// 正则表达式  限制只能传入数字 对应页面a连接的href属性  href:'/list/{$value.id}'
router.get('/list/:id(\\d+)',list.index)

// 登录页面路由
router.get('/login',account.index)
//登录逻辑
router.post('/login', account.login) 
module.exports = router