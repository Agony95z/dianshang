const axios = require('./api')
// 购物车相关的数据操作
// 新增一个用户购物车记录
exports.add = (userId,productId,amount) =>{
    return axios.post(`users/${userId}/cart`,{
        id:productId,
        amount
    }).then(res=>res.data).catch(err=>Promise.reject(err))
}

// 获取指定 ID 对应用户的购物车信息。
exports.find = (userId) =>{
    return axios.get(`users/${userId}/cart`).then(res=>res.data).catch(err=>Promise.reject(err))
}

// 登陆后编辑购物车
exports.edit = (userId,productId,amount) =>{
    return axios.patch(`users/${userId}/cart/${productId}`,{amount}).then(res=>res.data).catch(err=>Promise.reject(err))
}

// 登陆后删除购物车
exports.remove = (userId,productId) =>{
    console.log(userId,productId)
    return axios.delete(`users/${userId}/cart/${productId}`).then(res=>res.data).catch(err=>Promise.reject(err))
}
