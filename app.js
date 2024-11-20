var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');

var app = express();
//设置Mongoose连接
// 设置 Mongoose 连接
const mongoose = require("mongoose");
const mongoDB = "mongodb+srv://xsf:fafa23333.@cluster0.ge8a6.mongodb.net/";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>{
    console.log("数据库连接成功");
  })
  .catch((err)=>{
    console.log("数据库连接失败：",err)
  });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB 连接错误："));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));//托管public目录下的所有文件到当前目录

app.use('/', indexRouter);//为网站的不同部分定义具体的路由
app.use('/users', usersRouter);
app.use('/catalog',catalogRouter);

// catch 404 and forward to error handler
// 404 处理器
app.use(function(req, res, next) {
  next(createError(404)); // 创建 404 错误并传递给下一个中间件
});

// 错误处理器
app.use(function(err, req, res, next) {
  // 设置本地变量，仅在开发环境中提供错误信息
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // 根据环境设置错误信息
  // 1. res.locals：
  // res.locals 是一个对象，用于存储响应中本地变量。这些变量可以在渲染视图时使用。它们的作用范围仅限于当前请求。
  // 2. req.app.get('env')：
  // req.app 是对当前 Express 应用实例的引用。通过 get('env') 方法，可以获取当前应用的运行环境。
  // Express 默认有几个环境设置，最常见的是：
  // development：开发环境，通常用于本地开发和调试。
  // production：生产环境，通常用于部署到服务器。
  // test：测试环境，通常用于运行测试。
  // === 'development'：
  // 这部分检查当前环境是否为 development。如果是开发环境，条件为真。
  // 渲染错误页面
  res.status(err.status || 500); // 设置响应状态码
  res.render('error'); // 渲染错误页面
});

module.exports = app;
