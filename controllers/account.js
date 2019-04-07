// 引入二维码包
const svgCaptcha = require('svg-captcha')
const creatError = require('http-errors')
const accountModel = require('../models/account')
const config = require('../config')
const cart = require('../models/cart')
// 登录页面
exports.index = (req, res, next) => {
    // 跳转到登录页面
    // 需要有验证码功能
    // 与create api类似，您有相同的选项和返回值。区别在于数据是svg将是屏幕上的数学方程式，而文本将是字符串中该等式的结果，否则用法与上面相同。
    // captcha 获取的是一个对象 {text：xx , data:<svg xmlns="xxxxx"></svg>}
    // data 是一张svg 图片  响应给客户端
    // text 这张图片中写了啥 text 要存在服务器里面
    const captcha = svgCaptcha.createMathExpr({
        width: 108,
        height: 30,
        fontSize: 32,
        noise: 5,
        color: true,
        background: '#7D959A',
        size: 8
    })
    
    // 响应一张验证图片 给客户端
    res.locals.svg = captcha.data
    // 响应的同时 需要保存随机生成的图片的结果到 服务器的session中 给登录的时候做验证用  如果不保存 客户端下一次提交登录的时候服务器不知道你输入的对错 没有判断标准
    // 把 text 存储在服务器 和浏览器下一次提交上来的做比对  也就是验证 服务器下发给你的图片 和 保存在 服务器端的text 是否一致
    //  刷新页面  服务端就会下发一张图片给客户端  req是设置  res是响应 通过req.session 将text保存在session中 
    // 客户端登录验证的时候 会把图片和你放在 session 里面的 text 进行比对
    // 每次刷新页面 都会下发一个svg 然后 设置 text 保存到session之后 才返回页面给浏览器
    req.session.captcahText = captcha.text
    // 为了未登录点到登录才能看到的逻辑设计  返回地址栏中的 需要 点击完以后登录才能跳转的页面的地址  在form表单中提交的时候带上  然后重定向到returnUrl 填写的地址 默认登陆后跳转到 member
    // 未登录的情况下 如果query中没有 returnUrl 默认 为member 那么在form表单中 提交的则为member  所以登陆后会跳转到member  如果点了其它的 例如 order 那么query中则带有要回跳的地址为 order 那么提交到form表单中的 为 order
    res.locals.returnUrl = req.query.returnUrl || '/member'

    res.render('login.art')
}
// 登录页面
exports.login = (req,res,next) =>{
    const body = req.body
    // 有时需要将现有对象转为 Promise 对象，Promise.resolve方法就起到这个作用。
    // 如果参数是一个原始值，或者是一个不具有then方法的对象，则Promise.resolve方法返回一个新的 Promise 对象，状态为resolved。
    // 由于字符串不属于异步操作（判断方法是字符串对象不具有 then 方法），返回 Promise 实例的状态从一生成就是resolved，所以回调函数会立即执行。Promise.resolve方法的参数，会同时传给回调函数。
    // --------------------------------------------------------------------------------
    // Promise.resolve方法允许调用时不带参数，直接返回一个resolved状态的 Promise 对象。
    // 所以，如果希望得到一个 Promise 对象，比较方便的方法就是直接调用Promise.resolve方法。
    // --------------------------------------------------------------------------------------
    // 1.校验表单的完整性
    // 2.验证验证码
    // 3.验证用户名密码
    // 4.自动登录功能
    // 5.cookie中的购物车合并到账户中的购物车
    // 必须按照顺序走
    // ------------------------------------------------------------------------------------------
    // 验证表单操作 实际上不需要promise异步操作 但是想验证完一个条件后继续下一件事情 可以通过promise组织起来
    // 优点  如果在校验数据的时候有错误  可以统一处理错误
    console.log(body)
    Promise.resolve().then(()=>{
        // 校验表单数据的完整性
        if(!(body.username && body.password && body.captcha)) {
            throw creatError(400,'提交信息不完整')
        }
        // 校验验证码
        if(body.captcha !== req.session.captcahText) {
            throw creatError(400,'验证码不正确')
        }
        // 校验用户名和密码
        // 返回一个promise对象 结果在then里面 
        // 如何验证  只有你密码和账号对的时候后台猜给你返回对应的用户数据 如果传值不对 后台不会返回数据
        return accountModel.login(body.username,body.password)
    }).then(user=>{
        // res.json(user)
        // 如果用户名或密码不对 不走这里直接走服务器错误？
        if(!(user && user.id)) {
            throw creatError(400,'用户名或者密码不对')
        }
        // 程序走到这里 说明用户名和密码 正确 可以保存在 session 中
        req.session.user = user
        res.locals.user = req.session.user
        // 自动登录功能
        if(body.auto == 1) {
            // 把密码保存到cookie中 响应给 客户端
            // 思路 存储id和密码 下次自动登录的时候  通过id去找到user信息  然后去匹配密码
            const autoData = {uid:user.id,pwd:user.password}
            const expires = new Data(Date.now()+config.cookie.cart_expires)
            res.cookie(config.cookie.cart_key,JSON.stringify(autoData),{expires})
        }

        // 合并购物车
        const cookieStr = req.cookies[config.cookie.cart_key] || '[]'
        const cartList = JSON.parse(cookieStr)
        const promiseAll = cartList.map(item=>cart.add(user.id,item.id,item.amount))
        return Promise.all(promiseAll)
    }).then(()=>{
         // 合并完购物车以后 清除cookie 清除验证码
         res.clearCookie(config.cookie.cart_key)
         // 清除验证码
         req.session.captcahText = null
        // 重定向到个人中心
        // 正常逻辑登录后跳转到个人中心 非正常逻辑  点我的订单应该跳到我的订单 所以不能写死
        // res.redirect('/member') 
        // 默认登录以后跳转到个人中心  但是如果未登录之前点到登录之后才能看到的页面  例如点到我的订单 order 那么先登录 登陆完以后应该跳转到 order页面而不是member页面  所以在表单提交中带上要登录以后要回跳的地址 returnUrl 中 req.url带的地址
        res.redirect(body.returnUrl||'/member')
    }).catch(err=>{
        // res.json(err)
        res.locals.errMsg = err.message
        console.log('错误------------------',err.message);
        if (err.status !== 400) {
            res.locals.errMsg = '服务器繁忙'
        }
        // 加上用户输入的 用户名和密码
        res.locals.username = body.username
        res.locals.password = body.password
        // 错误后需要重新设置验证码
        const captcha = svgCaptcha.createMathExpr({
            width: 108,
            height: 30,
            fontSize: 32,
            noise: 5,
            color: true,
            background: '#7D959A',
            size: 8
        })
        // 响应一张验证图片 给客户端
        res.locals.svg = captcha.data
        // 保存在服务器
        req.session.captcahText = captcha.text
        res.render('login.art')
    })
}
// 退出页面逻辑
exports.logout = (req,res,next) =>{
    // 退出登录以后  会走else语句  但是在登录成功后 已经清除了     res.clearCookie(config.cookie.cart_key)
    // 所以当登录以后再去清除 session 会走else语句  但是cookie已经被清除  所以购物车中不会再显示商品
    req.session.user = null
    //delete  req.session.user 这种方式也可以删除用户登录信息

    res.redirect('/login')
}