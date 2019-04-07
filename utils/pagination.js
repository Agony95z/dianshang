// 因此如果是想要键值对象的这种格式, exports.text = …; 是可以的. 最终exports.属性的这个属性 会挂载到module.exports的属性中 如home.js中的 exports.index 这个属性  也可以写为 module.exports.index 
// 但如果是一个数组或者是函数. 只有module.exports = function(){ }有效.
// 路由里挂载的list.search 导出的是一个属性  该属性是方法  只有通过导出list.js这个模块  再通过list.search的方法去调用这个search

// 而这里分页是一个函数  需要通过module.exports去创建  其他模块中导入pagination.js 就是直接导入了一个函数  能够直接使用
// 如果导出的是一个对象  想要调用对象中的某个方法 需要先导入该模块 再new出来一个实例对象  通过这个实例对象.这个方法  才能去调用这个对象中的方法
const template = require('art-template')
const path = require('path')
const url = require('url')
// 生成分页的工具
module.exports = (options) =>{
    const total = options.total  //为后台传过来的数据一共有多少页
    // 如果 后台传过来的总页码数小于 2 那么也就不需要分页处理工具了 直接 return
    if(total<2) {
        return ''
    }
    const page = options.page   //显示当前页码
    // 按钮个数
    const count = options.count || 5  //默认5个
    const req = options.req   // 客户端发送的请求  需要用到url-parser 去解析  拿到里面的 query  增加page属性
    // console.log(req)

    // 关于分页后 怎样点击实现跳转的思路 
    // 因为url地址栏中可能不止存在一个键值对  还有可能有其它键值对 比如排序 sort=xxx 而我们实现点击分页按钮实现跳转的思路为只改变 page 而不去改变 其它键值对  保证向后台请求数据的 最初的目的  只是想看下一页  我的排序效果不变 
    // 所以用到 url模块  
    // 第二个参数 默认为false  
    //  var a = url.parse('http://example.com:8080/one?a=index&t=article&m=default');
    // 为 false的时候  返回的urlObject中的 query 属性 为 query: 'a=index&t=article&m=default',
    
    // 为true的时候将使用查询模块分析查询字符串
    // var a = url.parse('http://example.com:8080/one?a=index&t=article&m=default',true);
    // 为true的时候 返回的urlObject 中的 query属性 为   query: { a: 'index', t: 'article', m: 'default' },

    const urlObject = url.parse(req.originalUrl,true)
    const getUrl = (currPage) =>{
        // 传入第二个参数 true 导致query 属性变为一个对象 如果query中没有page的属性  通过点的方式 加入page属性并赋值 
        // 如果有 page 属性 当调用getUrl函数的时候 通过传入 currPage 来修改当前page值来实现修改 
        // 不过这个时候设计到 urlObject 中的 search 属性 
        urlObject.query.page = currPage
        // .search 属性 设置为 undefined 是为了保证我们修改page值后能成功返回 要不然会使用urlObject 自带的 query属性中的默认值  并且不能为query添加 任何属性
        // 如果 urlObject.search 属性为 undefined 且 urlObject.query 属性是一个 Object，则 ? 会被添加到 result，后面跟上把 urlObject.query 的值传入 querystring 模块的 stringify() 方法的调用结果。
        // 如果 urlObject.search 不是 undefined 也不是一个字符串，则抛出 Error。 不为undefined的时候 会使用自己原始的值
        urlObject.search = undefined
        //url.format(urlObj)  将json对象格式化成字符串 也就是将你 之前url.parser解析成的Url 对象 格式化成字符串  包括后来自己传入的属性键值
        // getUrl 将url.format(urlObj) 格式化成字符串后 返回  正好满足我们只改变page 而其他 键值 例如 sort=xxx 不变 的需求
        return url.format(urlObject)
    }


      // 要知道起始页码和结束页码 是为了 后期动态生成 页码 循环开始到结束的长度  动态生成对应的页码 而不是写死 保证了灵活性
    // 起始页码 为  当前页码 - 页码总个数/2 向下取整 
    // 理想情况下
    let begin = page - Math.floor(count/2)
    // 当页面小于1的时候
    begin = begin < 1 ? 1 : begin
    // 结束页码 为  开始页码 + 按钮个数 -1
    let end = begin + count - 1
    // 当 页码总数大于实际数据的页码的时候
    end = end > total ? total : end
    // 应当考虑  当你的页码足够多的时候 例如 总页码数为 8  但是 你的开始页是基于 当前页 page = 7 算出 begin = 5 从而得出 end = 5+5-1 = 9  但是你实际的页码总数为8 经过上面end 判断之后为 8  这时候导致你的页面按钮个数只有 4 个  而应该显示 5 个 所以应该在前面追加一个按钮  所以这时候的开始页码为
    begin = end - count + 1  //8-5+1 ==> 4,5,6,7,8 还是 5个按钮
    // 但是此时又出现一种情况 假如 数据总共有 4 页  按照上述计算 为  4 - 5 + 1 = 0 不符合实际情况
    // 所以需要再做一次判断
    begin = begin < 1 ? 1 : begin  

    


    // 当按钮逻辑写好后 需要渲染按钮 
    // 渲染按钮要基本模板和数据 所以要引包
    const urlTemplate = path.join(__dirname,'../views/components/pagination.art')
    // 传入 urlObject.query 是为了 form 提交按钮中 除了修改page值外 保持其他键值不变 
    return template(urlTemplate,{page,begin,end,total,getUrl,query:urlObject.query})

}