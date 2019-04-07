const axios = require('./api')

// 轮播图向后台请求数据的接口
exports.getSlider = ()=>{
   // Promise实例生成以后，可以用then方法分别指定resolved状态和rejected状态的回调函数。   
   // then方法可以接受两个回调函数作为参数。第一个回调函数是Promise对象的状态变为resolved时调用，第二个回调函数是Promise对象的状态变为rejected时调用。其中，第二个函数是可选的，不一定要提供。这两个函数都接受Promise对象传出的值作为参数。
   return axios.get('/settings/home_slides')
   .then(res=>res.data)
   .catch(err=>Promise.reject(err))
}
