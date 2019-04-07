const Alipay = require('alipay-node-sdk')
const path = require('path')

//创建支付对象
const alipay = new Alipay({
  //应用ID
  appId: '2016092300579138',
  //通知地址  支付宝向自己的服务器发通知  自己的服务器需要外网 要不然支付宝不知道
  notifyUrl: 'http://localhost:3000/pay/notify',
  //商户的私钥
  rsaPrivate: path.join(__dirname, './rsa_private_key.pem'),
  //支付宝的公钥
  rsaPublic: path.join(__dirname, './rsa_public_key.pem'),
  //是否是沙箱环境
  sandbox: true,
  //加密使用什么算法 RSA RSA2
  signType: 'RSA2'
})

/*
* 参数订单对象
* */
// getPayUrl 生成一个支付链接
exports.getPayUrl = (order) => {
  const body = order.products.map(item => item.name).join('\n')
  //key=value&key=value 键值对字符串  拼在支付网关后面
  const params = alipay.pagePay({
    //支付标题
    subject: '【品优购】商品',
    //具体是什么商品  如果是多件  以\n换行拼接
    body: body,
    //订单编号
    outTradeId: order.order_number,
    //超时时间
    timeout: '10m',
    //支付金额
    amount: order.total_price,
    //商品类型  实物  虚拟
    goodsType: '1',
    //二维码的类型
    qrPayMode: 2,
    //回调的地址  付完钱以后的回跳地址 callback里会带有我们需要的信息
    return_url:'http://localhost:8080/pay/callback'
  })
// 支付网关加上你的 params 
  return 'https://openapi.alipaydev.com/gateway.do?' + params
}