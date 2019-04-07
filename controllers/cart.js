const config = require('../config')
const productModel = require('../models/products')
const cartModel = require('../models/cart')
// 加入购物车请求
exports.add = (req,res,next) =>{
    // 当来到加入购物车的页面的时候 需要判断用户是否登录  若没有登录  则把数据存储在cookie中
    //用户点击加入购物车的时候 会带有id 有可能还带有 amount 所以分别获取
    const id = req.query.id
    const amount = +req.query.amount || 1
    // console.log(id,amount)
    // 判断登录状态 session 的配置在app中设置
    if(req.session.user) {
        // 登录后逻辑
        cartModel.add(req.session.user.id,id,amount).then(data=>{
            // 需要一些商品数据  不能直接把数据 这样搁置 需要重定向  因为这样 刷新一次页面就会添加一次 不是我们想要的结果
            // 定向到查询商品是否成功接口  就不会出现重复刷新的时候出现意外添加的情况、
            // 相当于第一次刷新后 就已经重新定向了  再刷新 url地址栏已经变成 重新定向过后的 url路径  不会再重复添加了
            res.redirect(`/cart/success?id=${id}&amount=${amount}`)
        }).catch(err=>{
            res.json([])
        })
    } else {
        // 把购物车信息放到cookie中
        // 约定存储信息的key 和value
        // key:pyg_cart_key
        // value:json格式的数组  [{id:'商品id',amount:'件数'},...]
        // s%3AkncT0FAJbZW5dyn9sh9rBZcIBqeoce0D.bao8ZBZpQryutthYRrKmowHlVG2GCR6%2B6NiOlHNsKsg
        // cookie-parser 中间件 把cookie字符串解析成 对象 键值对 方便操作
        // req.cookies 是客户端所有的cookie信息 是一个对象  只需要拿到名字为 pyg_cart_key 的cookie信息  里面存放的是 加入
        // 购物车的内容的 id 和 amount 
        console.log(req.cookies)
        // 为什么这样就能设置cookie
        // 第一次请求过来的时候是没有 config.cookie.cart_key 的  cookieStr 为一个空数组 执行下列语句把商品信息存到config.cookie.cart_key中 然后 res.cookie 返回给浏览器  再次请求的时候就有config.cookie.cart_key 了 可以再继续执行下列语句
        const cookieStr = req.cookies[config.cookie.cart_key] || '[]'   
        // 把字符串转化为数组
        const cartList = JSON.parse(cookieStr)    
        // 添加购物车数据
        // 添加之前要判断 cookie中是否已经存在该商品 有的话修改数量 没有的话追加
        // 数组的find方法 当数组中的元素在测试条件时返回 true 时, find() 返回符合条件的元素，之后的值不会再调用执行函数。此处 数组里存放的是没有符合条件的返回undefined
        const cart = cartList.find(item=>id == item.id)
        if(cart) {
            // 之前有商品 返回数量
            cart.amount += amount
        }else {
            cartList.push({id,amount})
        }

        // 把修改后的购物车数据 再次存放到cookie  cookie中只能存放字符串
        // 加上时间戳  为基于当前时间 往后推多少天为有限期
        const expires = new Date(Date.now()+config.cookie.cart_expires)
        // 第三个参数 {自定义名字} 为设置有效期  如果不传这个参数  关闭浏览器 cookie 就会消失
        res.cookie(config.cookie.cart_key,JSON.stringify(cartList),{expires})
        // 设置完cookie后 去拿当前商品的信息 渲染页面
        // productModel.getProduct(id,true).then(data=>{
        //     // 选择性拿取有用的给页面
        //     res.locals.cartInfo = {
        //         id:data.id,
        //         name:data.name,
        //         thumbnail: data.thumbnail,
        //         amount
        //     }
        //     res.render('cart-add.art')
        // }).catch(err => next(err))
        // 因为重定向后 上述逻辑已经实现了  所以在这里只要重定向到 /cart/success即可
        res.redirect(`/cart/success?id=${id}&amount=${amount}`)
    }  
}

// 登录成功后  添加购物车成功后 展示 
exports.addAfter = (req, res, next) => {
    const {id, amount} = req.query
    /*5. 获取当前添加的商品信息 渲染页面*/
    productModel.getProduct(id, true)
      .then(data => {
        /*6. 设置有用的给模版*/
        res.locals.cartInfo = {
          id: data.id,
          name: data.name,
          thumbnail: data.thumbnail,
          amount
        }
        res.render('cart-add.art')
      })
      .catch(err => next(err))
}
// 响应购物车页面
exports.index = (req,res,next) =>{
    res.render('cart.art')
}
// 查询列表响应json
exports.list = (req,res,next) =>{
    // 判断是否登录
    if(req.session.user) {
        // 登录状态
        cartModel.find(req.session.user.id).then(data=>{
            // console.log(data)
            res.json({list:data})
        }).catch(err=>{
            res.json([])
        })
    } else{
        // 未登录时  查看cookie里的商品信息
        const cookieStr = req.cookies[config.cookie.cart_key] || '[]'
        const cartList = JSON.parse(cookieStr)
        // 根据商品的id 获取对应的数据  cookie 中有几个对应商品的id 就像后台发送几次请求
        // 生成一个promise数组 有几个id 就生成几个 promise
        
        const promiseArr = cartList.map(item=>productModel.getProduct(item.id,true))

        // 去并行获取
        Promise.all(promiseArr).then(results=>{
            // results 正好是一个商品列表数据
            // res.json(results)
            // 数据太多 自己拼接拿回有用的信息
            const list = results.map((item,i)=>{
                return {
                    id: item.id,
                    name: item.name,
                    thumbnail: item.thumbnail,
                    price: item.price,
                    amount:cartList[i].amount //要的不是results中的amount 而是 你加入cookie中的amount
                } 
            })
            res.json({list})
            // res.json(list)

            // console.log(list)
        }).catch(err=>{
            res.json([])

        })
    }
}
// 编辑
exports.edit = (req,res,next) =>{
    let {id,amount} = req.body 
    // console.log(id,amount)
    amount = amount -0
    if(req.session.user) {
        // 登陆后的 业务
        cartModel.edit(req.session.user.id,id,amount).then(data=>{
            // console.log(data)
            // res.redirect('/cart')
            res.json({success:true})
        }).catch(err=>{
            res.json([])
        })
    } else {
        // 未登录时  查看cookie中的商品
        const cookieStr = req.cookies[config.cookie.cart_key] || '[]'
        const cartList = JSON.parse(cookieStr)
        // 遍历原有的cookie数组  找到与浏览器端传来的id值一样的 
        const cart = cartList.find(item=>item.id == id)
        // 更改数组中原有的amount 
        cart.amount = amount 
        // 更新客户端cookie
        const expires = new Date(Date.now()+config.cookie.cart_expires)
        res.cookie(config.cookie.cart_key,JSON.stringify(cartList),{expires})
        // 数据重新写入后 响应客户端是否操作成功 客户端要重新修改一次amount 后台只是告诉你 是否成功
        // 在客户端缓存 第一次查询得到的数据  做增删改的时候 在客户端 基于第一次查询到的数据去做修改 再重新加载模板
        res.json({success:true})
        
    }
}
// 删除
exports.remove = (req,res,next) =>{
    let id = req.body.id - 0
    if(req.session.user) {
        //登录状态
        cartModel.remove(req.session.user.id,id).then(data=>{
            // console.log(data)
            res.json({success:true})
        }).catch(err=>{
            res.json([])
        })
    } else {
        // 未登录状态
        const cookieStr = req.cookies[config.cookie.cart_key] || '[]'
        const cartList = JSON.parse(cookieStr)
        // 根据对应id找到该商品在数组中对应的索引 通过索引来删除
        const index = cartList.findIndex(item=>item.id == id)
        cartList.splice(index,1)
        const expires = new Date(Date.now()+config.cookie.cart_expires)
        res.cookie(config.cookie.cart_key,JSON.stringify(cartList),{expires})
        res.json({success: true})

    }
}