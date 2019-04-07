// 获取分类相关的数据 因为分类相关的数据在很多页面都会使用 所以把拿到的数据放到中间件中

// 获取分类列表项的数据
const axios = require('./api')
exports.getCategoryTree = () =>{
    return axios.get('categories?format=tree')
    .then(res=>res.data)
    .catch(err=>Promise.reject(err))
}

// 获取指定 ID 的单个分类信息 包含它的上一级  面包屑
// https://ns-api.uieee.com/v1/categories/:id?include=parent
exports.getCategoryParent = (cateId) =>{
    return axios.get(`categories/${cateId}?include=parent`).then(res=>res.data).catch(err=>Promise.reject(err))
}
