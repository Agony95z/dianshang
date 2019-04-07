const productModel = require('../models/products')
exports.index = (req,res,next) => {
    // 向后台拿数据
    const id = req.params.id
    // 需要商品图片 商品信息 商品简介 随机商品列表
    Promise.all([
        productModel.getProduct(id,false),
        productModel.getLikeProducts()
    ]).then(results=>{
        res.locals.detail = results[0]
        res.locals.likes = results[1]
        // res.json(res.locals)
        res.render('item.art')
    }).catch(err=>next(err))
}