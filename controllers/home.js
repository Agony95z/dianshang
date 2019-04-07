// 首页业务处理

// 调用models里的home.js中的getSlider()去后台拿数据
const homeModel = require('../models/home')
// // 调用models里的products.js中的getLikeProducts()去后台拿数据
const productModel = require('../models/products')
exports.index = (req,res,next)=>{
    // // models中返回一个getSlider()Promise对象
    // homeModel.getSlider().then(data=>{
    //     res.locals.slider = data
    //     res.render('home.art')
    // }).catch(err=>next(err))

    // // getLikeProducts()拿到猜你喜欢的数据
    // productModel.getLikeProducts().then(data=>{
    //     res.locals.likes = data
    //     res.render('home.art')  //这样写是有问题的 因为上一个res.render()里面封装了res.end(),所以上一个res.render()下面的代码不会再执行
    // }).catch(err=>next(err))
    Promise.all([homeModel.getSlider(),productModel.getLikeProducts()]).then(results=>{
        res.locals.slider = results[0]
        res.locals.likes = results[1]
        res.render('home.art')
    }).catch(err=>next(err)) //两个promise对象中的任何一个有错都会走这一个catch()
    
}

// 猜你喜欢的换一换请求数据
module.exports.like = (req,res,next) =>{
    productModel.getLikeProducts().then(data=>{
        res.json(data)
    }).catch(err=>next(err))
}