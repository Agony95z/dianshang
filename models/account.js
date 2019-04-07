// 向后台拿用户信息
const axios = require('./api')
exports.login = (username,password) =>{
    return axios.post('users/login',{username,password}).then(res=>res.data).catch(err=>Promise.reject(err))
}

