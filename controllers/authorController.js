const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const {body, validationResult} = require("express-validator");

//显示完整的作者列表
exports.author_list = asyncHandler(async (req, res, next) => {//这里的exports.author_list有点类似传递变量名，导出一个名为author_list的函数
  try {
    const list_authors = await Author.find().sort([["family_name", "ascending"]]);
    res.render("author_list", {//这里的author_list是view中模版的名称
      title: "Author List",
      author_list: list_authors,//author_list是传递给view中author_list的变量名，author_lists是获取到的数据
    });
  } catch (err) {
    return next(err);
  }
});

//为每位作者显示详细信息的页面
exports.author_detail = asyncHandler(async(req, res, next) => {
  try{
    const [author, allBooksByAuthor ] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({author:req.params.id},"title summary").exec(),//选择所有author=req.id（根据id匹配���的author，选取title summary字段即可。
    ]);

    if (author == null){
      //没有结果
      res.status(404).send("没有这个作者");
    }

    res.render("author_detail",{
      title:"author Detail",
      author:author,
      author_books:allBooksByAuthor,
    });
  }catch(err){
    return next(err);
  }
  
});

//由GET显示创建作者的表单
exports.author_create_get = asyncHandler(async (req, res, next) =>{
  res.render("author_form",{
    title:"Create Author",
  });
});

//由POST处理作者创建操作
exports.author_create_post = [
  //验证并且清理字段
  body("first_name")
  .trim()
  .isLength({min:1})
  .escape()
  .withMessage("First name must be specified")
  .isAlphanumeric()
  .withMessage("First name has non-alphanumeric characters."),

  body("family_name")
  .trim()
  .isLength({min:1})
  .escape()
  .withMessage("Family name must be specified")//withMessage 方法用于在验证失败时提供自定义的错误消息。
  .isAlphanumeric()
  .withMessage("Family name has non-alphanumeric characters."),

  body("date_of_birth", "Invalid date of birth")
  .optional({values:"falsy"})
  .isISO8601()
  .toDate(),

  body("date_of_death", "Invalid date of death")
  .optional({values:"falsy"})//optional({values:"falsy"}) 方法用于指定可选字段。如果字段值为 falsy（如 false、0、null、undefined 或空字符串），则该字段将被忽略。接受空字符串或null作为空值
  .isISO8601()
  .toDate(),

  asyncHandler(async(req, res, next) => {
    //验证并且清理字段
    const errors = validationResult(req);

    //使用经去除空白字符的转义处理处理的数据创建一个类型对象
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty()){
      //出现炎症错误。使用清理后的值/错误信息重新渲染表单
      return res.render("author_form",{
        title:"Create Author",
        author:author,
        errors:errors.array(),
      });
      return;
    }else{
      //表格中的数据有效
      await author.save();
      res.redirect(author.url);
    }
  })
]
  

//由GET显示删除作者的表单
exports.author_delete_get = asyncHandler(async (req, res, next) =>{
  try{
    const [author, author_books] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({author:req.params.id}).exec(),
    ]);

    if(author == null){
      //没有找到作者
      console.log("没有找到作者");
      return res.redirect("/catalog/authors");
    }

    res.render("author_delete",{
      title:"Delete Author",
      author:author,
      author_books:author_books,
    });
  }catch(err){
    return next(err);
  }
});

// 由 POST 处理作者删除操作
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  try {
    const [author, author_books] = await Promise.all([
      Author.findById(req.body.authorid).exec(),
      Book.find({ author: req.body.authorid }).exec(),
    ]);

    if (author_books.length > 0) {
      // 作者仍有书籍，不能删除
      res.render("author_delete", {
        title: "Delete Author",
        author: author,
        author_books: author_books,
      });
      return;
    } else {
      // 作者没有书籍，可以删除
      try {
        await Author.findByIdAndDelete(req.body.authorid);
        console.log(`Author with ID ${req.body.authorid} deleted successfully.`);
        res.redirect("/catalog/authors");
      } catch (err) {
        console.error("Error deleting author:", err);
        return next(err);
      }
      
    }
  } catch (err) {
    console.error("Error in author deletion process:", err);
    return next(err);
  }
});

// 由 GET 显示更新作者的表单
exports.author_update_get = asyncHandler(async (req, res, next) => {
  try{
    const author = await Author.findById(req.params.id).exec();
    if (author == null){
      res.status(404).send("没有找到作者");
    }

    res.render("author_form",{
      title:"Update Author",
      author:author,
    });
  }catch(err){
    return next(err);
  }
});

// 由 POST 处理作者更新操作
exports.author_update_post = [
  body("first_name")
  .trim()
  .isLength({min:1})
  .escape()
  .withMessage("First name must be specified")
  .isAlphanumeric()
  .withMessage("First name has non-alphanumeric characters."),
  body("family_name","Family name must be specified")
  .trim()
  .isLength({min:1})
  .escape()
  .withMessage("Family name must be specified")
  .isAlphanumeric()
  .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth","Invalid date of birth")
  .optional({values:"falsy"})
  .isISO8601()
  .toDate(),
  body("date_of_death","Invalid date of death")
  .optional({values:"falsy"})
  .isISO8601()
  .toDate(),

  asyncHandler(async(req, res, next) => {
    //验证并且清理字段
    const errors = validationResult(req);

    //使用经去除空白字符的转义处理处理的数据创建一个类型对象
    const author = new Author({
      first_name:req.body.first_name,
      family_name:req.body.family_name,
      date_of_birth:req.body.date_of_birth,
      date_of_death:req.body.date_of_death,
      _id:req.params.id,//更新时需要保留原始ID
    });

    if (!errors.isEmpty()){
      //出现炎症错误。使用清理后的值/错误信息重新渲染表单
      

      return res.render("author_form",{
        title:"Update Author",
        author:author,
        errors:errors.array(),
      });
      return;
    }else{
      //表格中的数据有效
      const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, author, { new: true }); //new:true表示返回更新后的文档
      res.redirect(updatedAuthor.url);
    }
  })
]