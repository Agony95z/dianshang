const productsModel = require('../models/products')
const categoryModel = require('../models/category')
const pagination = require('../utils/pagination')
const querystring = require('querystring')
// 专门请求商品列表项的业务请求
exports.index = (req,res,next) =>{
    // https://ns-api.uieee.com/v1/categories/:id/products?page=1&per_page=10&limit=10&offset=0&sort=commend&include=introduce,category&q=电视  接口信息 后面参数可选 
    // 拿id的方式特殊一些  用的req.params.id 其他数据还是键值对的形式
    // -------------------------------------
    // 获取前端传过来的id 通过对应id去后台查找对应的数据
    // console.log(12)
    const cateId = req.params.id
    // 获取排序方式
    const sort = req.query.sort || 'commend'  //'commend' 如果没有传参  默认综合排序
    // 获取分页页码
    const page = req.query.page || 1
    // 定义一页显示多少数据  这个数据对应 per_page
    const size = 5
    //需要 路径导航数据   当前分类的上一级分类 或者 上上级分类
    //需要 排序方式数据
    //需要 渲染分页数据
    //需要 列表数据
    // productsModel.getCateProducts(cateId,sort,page,size).then(data=>{
    //     res.locals.list = data
    //     res.render('list.art')
    // }).catch(err => next(err)) 
    
    
    // // 拿数据渲染到页面的同时 拿数据填充面包屑
    Promise.all([categoryModel.getCategoryParent(cateId),productsModel.getCateProducts(cateId,page,size,sort)])
    .then(results=>{
        res.locals.cate = results[0] //分类数据
        // console.log(results[0])
        res.locals.list = results[1].list //列表数据
        res.locals.sort = sort  //排序数据   price 降序  -price 升序
        // res.locals.total = results[1].total //分页总页数
        // 传入req 是为了在pagination函数中去 解析 url地址栏 改变page 值 从而实现根据不同page值请求不同数据的需求
        res.locals.pagination = pagination({page,total:results[1].total,req})
        res.render('list.art')
    }).catch(err => next(err)) 


}

// 搜索框路由
exports.search = (req,res,next) =>{
    const q = req.query.q
    const page = req.query.page || 1
    const sort = req.query.sort || 'commend'
    const size = 10

    // 搜索框内输入汉字 可能存在解析汉字为乱码的情况 所以用浏览器带的 encodeURIComponent() 或者Node.js内置模块
    // querystring.escape()去解决 解析乱码啊问题 
    //转URL编码 encodeURIComponent(q) 浏览器端拥有的  但NODEJS也可以使用
    //转URL编码 querystring.escape(str) 

    productsModel.getSearchProducts(querystring.escape(q),page,sort,size).then(data=>{
        res.locals.list = data.list
        res.locals.sort = sort
        res.locals.q = q
        res.locals.pagination = pagination({page,total:data.total,req})
        res.render('list.art')
        // res.json(data)
    }).catch(err=>next(err))
}