var Genre = require("../models/genre");
var Book = require("../models/book");
const { body, validationResult } = require("express-validator");

const asyncHandler = require("express-async-handler");


// 显示所有的流派。
exports.genre_list = asyncHandler(async (req, res, next) => {
  try {
    const list_genre = await Genre.find().sort({name:1});//name是我定义的genre的一个属性
    // list_genre.forEach(genre =>{
    //   genre.url = `/genre/${genre._id}`;
    // })
    res.render("genre_list", {//这里的author_list是view中模版的名称
      title: "Genre List",
      genre_list: list_genre,//author_list是传递给view中author_list的变量名，author_lists是获取到的数据
    });
  } catch (err) {
    return next(err);
  }
});

// 显示特定流派的详情页。
exports.genre_detail = asyncHandler(async (req, res, next) => {
  try {
    // 使用 findById() 方法查找流派
    const genre = await Genre.findById(req.params.id).exec();

    //根据id查找书
    const genre_books = await Book.find({'genre': req.params.id}).exec();
    // 检查是否找到流派
    if (!genre) {
      return res.status(404).send("流派未找到");
    }
   
    // 渲染流派详情页面
    res.render("genre_detail", {
      title: "流派详情",
      genre: genre,
      genre_books: genre_books,
    });
  } catch (err) {
    return next(err); // 处理错误
  }
});

// 通过 GET 显示创建流派。
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form",{
    title:"Create Genre",
  });
}

// 以 POST 方式处理创建流派。
exports.genre_create_post = [
  //验证及清理名称字段
  body("name","Genre name must contain at least 3 characters")
  .trim()
  .isLength({min:3})
  .escape(),

  asyncHandler(async(req, res, next) => {
    //使用经去除空白字符的转义处理处理的数据创建一个类型对象
    const  genre = new Genre({name: req.body.name});

    const errors = validationResult(req);

    //检查炎症错误
    if (!errors.isEmpty()){
      //出现炎症错误。使用清理后的值/错误信息重新渲染表单
      return res.render("genre_form",{
        title:"Create Genre",
        genre:genre,
        errors:errors.array(),
        
      })

      }
    try{
      //表格中的数据有效
      //检查是否存在同名的Genre，利用返回的字符串与用户请求的res.body.name进行比较，相同则genreExists=True，反之为False
      const genreExists = await Genre.findOne({name:req.body.name})//用于查找集合中第一个匹配查询条件的文档，找到匹配返回该文档，否则返回null
      .collation({locale:"en", strength:2})//collation 方法用于指定字符串比较的规则。在这里，locale: "en" 表示使用英语的比较规则，strength: 2 表示进行不区分大小写的比较。
      .exec();
      
      if(genreExists){
        //存在同名的Genre，则重定向到详情页面
        res.redirect(genreExists.url);
      }else{
        await genre.save();//函数开头创建的 const genre = new Genre，也就是一个新的Genre实例，数据库中不存在，在将这个实例保存仅数据库中。··········
        //保存新创建的Genre，然后重定向到类型的详情页面
        res.redirect(genre.url);
      }
    }
    catch(err){
      return next(err);
    }
  }),
  
]

// 通过 GET 显示流派删除表单。
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  try{
    const [genre, genre_books] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({genre:req.params.id}).exec(),
    ]);
    if(genre == null){
      res.redirect("/catalog/genres");
    }
    res.render("genre_delete",{
      title:"Delete Genre",
      genre:genre,
      genre_books:genre_books,
    });
  }catch(err){
    return next(err);
  }
});

// 处理 POST 时的流派删除。
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  try {
    const [genre, genre_books] = await Promise.all([
      Genre.findById(req.body.genreid).exec(),
      Book.find({ genre: req.body.genreid }).exec(),
    ]);
    if (genre_books.length > 0) {
      //流派仍有书籍，不能删除
      res.render("genre_delete", {
        title: "Delete Genre",
        genre: genre,
        genre_books: genre_books,
      })
    }else{
      try{
        await Genre.findByIdAndDelete(req.body.genreid);
      }catch(err){
        return next(err);
      }
      res.redirect("/catalog/genres");
    }
  }catch (err) {
  return next(err);
}
});

// 通过 GET 显示流派更新表单。
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  try{
    const genre = await Genre.findById(req.params.id).exec();

    if (genre == null){
      return res.status(404).send("流派未找到");
    }
    res.render("genre_form",{
      title:"Update Genre",
      genre:genre,
    });
  }catch(err){
    return next(err);
  }
});

// 处理 POST 上的流派更新。
exports.genre_update_post =[
  body("name","Genre name must contain at least 3 characters")
  .trim()
  .isLength({min:3})
  .escape(),

  asyncHandler(async(req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({
      name:req.body.name,
      _id:req.params.id//在form中，点击更新按钮时，会提交一个请求，请求中包含要更新的流派ID，这个ID通过req.params.id获取
    });

    if(!errors.isEmpty()){
      return res.render("genre_form",{
        title:"Update Genre",
        genre:genre,
        errors:errors.array(),
      });
    }else{
      const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, genre, { new: true });
      res.redirect(updatedGenre.url);
    }
  }),
]