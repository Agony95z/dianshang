// 常用配置信息
// 网站信息配置
const site = {
  description: '品优购PYG.COM-专业的综合网上购物商城，为您提供正品低价的购物选择、优质便捷的服务体验。商品来自全球数十万品牌商家，囊括家电、手机、电脑、服装、居家、母婴、美妆、个护、食品、生鲜等丰富品类，满足各种购物需求。',
  keywords: '网上购物,网上商城,家电,手机,电脑,服装,居家,母婴,美妆,个护,食品,生鲜,品优购',
  title: '品优购(PYG.COM)-正品低价、品质保障、配送及时、轻松购物！',
}

// 接口公用配置
const api = {
    baseURL:'http://127.0.0.1:8000/v1/',
    username:'newshop-frontend',
    password:'d8667837fce5a0270a35f4a8fa14be479fadc774'
}

const options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'newshop'
}

// 定义未登录的时候 商品放在cookie中的 具体
const cookie = {
  cart_key: 'pyg_cart_key',
  cart_expires: 30 * 24 * 60 * 60 * 1000  //一个月
}
module.exports = {site,api,options,cookie}