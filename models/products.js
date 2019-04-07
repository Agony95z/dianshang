// 操作产品相关的数据,向后台请求数据
const axios = require('./api')

// 猜你喜欢向后台拿数据的接口
exports.getLikeProducts = () =>{
    // return axios.get('products?type=like&limit=6').then(res=>{
    //     console.log(res.data)
    //     return res.data
    // }).catch(err=>Promise.reject(err))

    return axios.get('products?type=like&limit=6').then(res => {
        return res.data
      }).catch(err => {
        //不是 Promise.reject() 那么都是认为是一个成功的返回
        //抛给下一次调用 promise 对象 catch
        return Promise.reject(err)
      })
}

// 获取分类列表项中某一个分类下的数据
// 这个函数声明里面的形参要与调用者传递大的参数一一对应  形参对应着list.js中productsModel.getCateProducts(cateId,page,size,sort)中的实参
// 之前的错误写法 exports.getCateProducts = (cateId,size,page,sort) =>  导致size为1传给后台 所以只能拿到一条数据
exports.getCateProducts = (cateId,page,size,sort) =>{
    // https://ns-api.uieee.com/v1/categories/:id/products?page=1&per_page=10&limit=10&offset=0&sort=commend&include=introduce,category&q=电视  接口信息 后面参数可选 
    // const url = `categories/${cateId}/products?page=${page}&per_page=${size}&sort=${sort}`
    const url = `categories/${cateId}/products?page=${page}&sort=${sort}&per_page=${size}`
    return axios.get(url).then(res=>{
        //注意：这个接口的响应头中 x-total-pages 的属性  存储的是总条数数据
        // console.log('--------------------')
        // console.log(res.data)
        // console.log('--------------------')

        return {list:res.data,total:res.headers['x-total-pages']}
        // return res.data
    }).catch(err=>Promise.reject(err))

}


// 搜索框向后台请求数据的接口
exports.getSearchProducts = (q, page, sort,size) => {
  const url = `products?page=${page}&per_page=${size}&sort=${sort}&q=${q}`
  return axios.get(url).then(res => {
    //注意：这个接口的响应头中 x-total-pages 的属性  存储的是总条数数据
    console.log(res.data)
    return {list:res.data,total:res.headers['x-total-pages']}
  }).catch(err => Promise.reject(err))
}

// 商品详情向后台拿数据
exports.getProduct = (id,isBasic) =>{
  return axios.get(`products/${id}`+(isBasic?'':'?include=introduce,category,pictures')).then(res=>res.data)
  .catch(err=>Promise.reject(err))
}