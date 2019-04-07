
var url = require('url');
var a = url.parse('http://example.com:8080/one?a=index&t=article&m=default');
var a1 = url.parse('http://example.com:8080/one?a=index&t=article&m=default',true);
a1.search = undefined
a1.query.page = 10
a.query.page = 10
console.log(url.format(a))
console.log(url.format(a1))
console.log('------------------')

console.log(a);
console.log(a1)