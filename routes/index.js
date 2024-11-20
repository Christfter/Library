var express = require('express');
var router = express.Router();
//创建一个新的路由实例

/* GET home page. */
router.get('/', function(req, res, next) {
  //  '/'代表根目录
  res.redirect("/catalog");
});
// res.render('index', { title: 'Express' });：
// 使用 res.render 方法渲染名为 index 的视图，并传递一个对象 { title: 'Express' } 
// 作为视图的局部变量。这个对象中的 title 可以在视图模板中使用。


module.exports = router;
