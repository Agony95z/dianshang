// 自定义中间件
// 获取头部信息
const config = require('./config')
// 分类信息
const categoryModel = require('./models/category')
// 商品信息
const productModel = require('./models/products')
// 购物车信息
const cartModel = require('./models/cart')

// 解析 请求地址栏  
const qs = require('querystring')
exports.base = (req, res, next) => {
    // 1.设置头部信息
    res.locals.site = config.site
    // 2.设置用户信息
    if (req.session.user) {
        res.locals.user = req.session.user
    }
    // 3.获取分类信息  树状数据结构
    const getCategory = () => {
        // 如果已经缓存
        if (req.app.locals.cateList) {
            // 如果req.app中有缓存  需要把这个缓存放到响应中发送给服务端
            res.locals.cateList = req.app.locals.cateList
            // 放行  不放行 路由中的res.render()没法拿到数据  模板渲染会失败
            // next()
            // promise.all() 参数必须是promise对象
            return Promise.resolve()
        } else {
            return categoryModel.getCategoryTree().then(data => {
                // 当第一次发起请求的时候  把数据进行缓存 这个数据不会到页面上  这个是应用的 只有res.locals才会响应给服务端
                req.app.locals.cateList = data
                // res.loacls中的数据  是你每一次去发送请求都是从服务端拿的新的数据
                res.locals.cateList = data
                // console.log(data)
                // 放行
                // next()
            })
        }

    }

    // 获取购物车信息  登录的时候  未登录的时候
    // 放在头部做简单展示 只需要知道商品总数量 和 商品名字即可
    const getCart = () =>{
        if(req.session.user) {
            // 登录状态 返回一个list数组
            return cartModel.find(req.session.user.id).then(list => {
                const headerCart = {
                  list: list.map(item => item.name),
                  amount: list.reduce((prev, item) => prev + item.amount, 0) //叠加操作
                }
                res.locals.headerCart = headerCart
              })
        }else {
            const cookieStr = req.cookies[config.cookie.cart_key] || '[]'
            const cartList = JSON.parse(cookieStr)
            // cookie中存储了几件商品 就通过 id 去后台拿几次商品信息
            const promiseArr = cartList.map(item =>productModel.getProduct(item.id,true))
            return Promise.all(promiseArr).then(products=>{
                // 商品信息中内容较多  拿出有用信息即可
                const headerCart = {
                    list: products.map(item=>item.name),// 拿出products数组中每一项商品的名字
                    amount:cartList.reduce((prev,item)=>prev+item.amount,0)  //叠加操作
                    // reduce() 方法接收一个函数作为累加器（accumulator），数组中的每个值（从左到右）开始缩减，最终为一个值。 0 代表初始值  // 如果不存在初始值，那么prev第一次值为1   prev代表每一次的累加值
                    // reduce() 方法对累加器和数组中的每个元素（从左到右）应用一个函数，将其减少为单个值。
                    // 对数组中的所有元素调用指定的回调函数。该回调函数的返回值为累积结果，并且此返回值在下一次调用该回调函数时作为参数提供。
                }
                res.locals.headerCart = headerCart
            })
        }
    }

    // 分类信息和购物车信息一起返回给页面
    Promise.all([getCategory(), getCart()])
        .then(() => {
            // 两个异步操作都执行完毕  放行
            next()
        }).catch(err => next(err))

}


exports.checkLogin = (req, res, next) => {
    if (!req.session.user) {
        // returnUrl记录登录完成后 回跳到哪里
        // req.url 也就是你当前访问的地址  这个地址可能会带有传参 带有特殊符号 可能会有解析问题  所以引入 querystring
        return res.redirect('/login?returnUrl=' + qs.escape(req.url))
        // 加上return  为了终止程序执行 
        // 如果没有登录进入if 
    }
    // 如果已经登录不会走 if  直接走next放行
    next()
}