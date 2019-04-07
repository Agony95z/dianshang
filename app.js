const express = require('express')
const path = require('path')
// 图标字体
const favicon = require('express-favicon')
// 打印日志
const logger = require('morgan')
// 显示错误的详细信息
const Youch = require('youch')
// 统一错误处理包
const createError = require('http-errors')
// 引入路由模块
const router = require('./routers')
// 配置session 
const session = require('express-session')
// session 数据持久化
const MySQLStore = require('express-mysql-session')(session)
// 引入自定义的中间件
const middleware = require('./middleware')
// 引入 公用资源
const config = require('./config')
// 引入cookie-parser
const cookieParser = require('cookie-parser')
const app = express()
app.listen(8080, () => console.log('server is running http://127.0.0.1:8080'))

// 打印日志,放在中间件最上面
app.use(logger('dev'))
// 开放public路径
app.use('/', express.static(path.join(__dirname, 'public')))
// 解析请求体
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))

app.use(cookieParser())
//配置 session 和session持久化  express-mysql-session
const sessionStore = new MySQLStore(config.options);
app.use(session({
    key:'PYGSID',
    secret: 'keyboard cat',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true }
}))


// 模板引擎
app.engine('art', require('express-art-template'));
app.set('view options', {
    debug: process.env.NODE_ENV !== 'production'
});
// res.render()必须是文件

// 配置图标
app.use(favicon(__dirname + './public/favicon.ico'))

// 配置自定义的公用中间件
app.use(middleware.base)

// 路由
app.use(router)

// 错误
app.use((req, res, next) => {
    // const err = new Error('Not Found')
    // err.status = 404
    // console.log(createError)
    // 以上的路由都走过了  是404没找到资源
    next(createError(404, 'Not Found'))
    // res.status(err.status||500).send(err.message)

})

  //走到中间件 如果错误有状态码就是  没有默认的就是服务端错误 500
  //输出的是字符串  有了模版引擎 响应一个页面
  //如果是生成环境  输出 404 500 页面
app.use((err, req, res, next) => {
    //错误页面对象初始化
    const env = req.app.get('env')
     //是开发环境
    if (env === 'development') {
        const youch = new Youch(err, req)
        return youch.toHTML().then((html)=>res.send(html))
        // return console.log(err)
    }
    // 生产环境错误处理
    res.status(err.status || 500)
    console.log(err.status)
    res.locals.status = err.status === 404 ? 404 : 500
    res.render('error.art')
    })