const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");
const { body, validationResult } = require("express-validator");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  // 并行获取书的详细信息、书实例、作者和体裁的数量
  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    Book.countDocuments({}).exec(),
    BookInstance.countDocuments({}).exec(),
    BookInstance.countDocuments({ status: "Available" }).exec(),
    Author.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Local Library Home",
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
  });
});

// exports.index = asyncHandler(async (req, res, next) => {
//   // res.send("NOT IMPLEMENTED:Site Home Page");
//   const [
//     numBooks,
//     numBookInstances,
//     numAvailableBookInstances,
//     numAuthors,
//     numGenres,//
//   ] = await Promise.all([//promise.all()实现对文档数量查询操作相互独立，并行查询请求
//     Book.countDocuments({}).exec(),//countDocuments获取每个实例个数，使用一组可选的条件进行匹配，返回一个Query对象，await等待完成
//     BookInstance.countDocuments({}).exec(),//紧接着调用exec()进行查询操作，返回一个Promise对象，要么兑现，要么在查询数据库错误被拒绝
//     BookInstance.countDocuments({status:"Available"}).exec(),
//     Author.countDocuments({}).exec(),
//     Genre.countDocuments({}).exec(),
//   ]);

//   res.render("index",{//res.render()指定名为index的视图模板，以及一个{}包含的数据，键值对的形式提供
//     title:"Local Library Home",
//     book_count:numBooks,
//     book_instance_count:numBookInstances,
//     book_instace_available_count:numAvailableBookInstances,
//     author_count:numAuthors,
//     genre:numGenres,
//   })
// });

// 显示所有的图书
// exports.book_list = asyncHandler(async (req, res, next) => {
//   const allBooks = await Book.find({},"title author")//第一个参数{}表示没有查询条件，第二个参数"title author"表示只选择title和author字段
//   .sort({title:1})//对查询结果进行排序，title:1表示按书，名title升序，-1表示降序（按字母表
//   .populate("author")//populate用于填充author字段相关的文档，
//                      //假设 author 字段是一个 ObjectId，指向 Author 模型，populate 会查询 Author 集合并将相关的作者信息填充到书籍文档中。
//   .exec()            //author在Book关联的book.js的定义中是一个必要的字段，在Book中 author ref：Author

//   res.render("book_list", { title: "Book_list", book_list: allBooks });
// });
exports.book_list = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec();

  res.render("book_list", { title: "Book List", book_list: allBooks });
});

// 显示特定图书的详情页面。
exports.book_detail = asyncHandler(async (req, res, next) => {
  try{
    const [book, bookInstances] = await Promise.all([
      Book.findById(req.params.id).populate("author").populate("genre").exec(),
      BookInstance.find({book:req.params.id}).exec(),//bookinstance关联book,所以需要匹配bookinstance中book的字段
    ]);

    //检测是否找到书籍
    if(!book){
      return res.status(404).send("书籍未找到");
    }

    //渲染书籍详情页面
    res.render("book_detail",{
      title:book.title,
      book:book,
      book_instances:bookInstances,
    });
  }catch(err){
    return next(err)
  }
});

// 通过 GET 显示创建图书。
exports.book_create_get = asyncHandler(async (req, res, next) => {
//验证并且清理字段
  try{
    const [authors, genres] = await Promise.all([
      Author.find({}).exec(),
      Genre.find({}).exec(),
    ]);
    res.render("book_form",{
      title:"Create Book",
      authors:authors,
      genres:genres,
    })
  }catch(err){
    return next(err);
  }

});
 

// 以 POST 方式处理创建图书。
exports.book_create_post = [
  //Convert the genre to an array
  (req, res, next) => {
    if(!(req.body.genre instanceof Array)){
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  //Validate and sanitize fields
  body("title","Title must not be empty.").trim().isLength({min:1}).escape(),
  body("author","Author must not be empty.").trim().isLength({min:1}).escape(),
  body("summary","Summary must not be empty.").trim().isLength({min:1}).escape(),
  body("isbn","ISBN must not be empty.").trim().isLength({min:1}).escape(),

  //Sanitize fields
  body("*").trim().escape(),//*表示所有字段
  body("genre.*").trim().escape(),//genre.*表示genre数组中的所有元素
  //处理验证后的req
  async (req, res, next) => {
    //提取验证错误
    const errors = validationResult(req);

    //创建Book实例，并保存到数据库
    var book = new Book({
      title:req.body.title,
      author:req.body.author,
      summary:req.body.summary,
      isbn:req.body.isbn,
      genre:req.body.genre,
    });
    //处理验证错误,如果存在错误，重新渲染表单
    if (!errors.isEmpty()) {

      try {
        const [authors, genres] = await Promise.all([
          Author.find({}).exec(),
          Genre.find({}).exec(),
        ]);
        //标记我们选中的genre都已经被检查,在模版中使用了check的打钩框，发生错误时，重新渲染表单且还原用户输入状态
        for (let i = 0;i<genres.length;i++){
          if(book.genre.indexOf(genres[i]._id) > -1){
            genres[i].checked = "true";
          }
        }
        res.render("book_form", {
          title: "Create Book",
          authors: authors,
          genres: genres,
        })
      } catch (err) {
        return next(err);
      }
    }else{
      //数据有效，保存到数据库
      await book.save();
      res.redirect(book.url);
    }
  }
  //处理关联的Genre
]
    // 在这里处理结果
    // 通过 GET 显示删除图书。
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  try{
    const [book, bookInstances] = await Promise.all([
      Book.findById(req.params.id).exec(),
      BookInstance.find({book:req.params.id}).exec(),
    ]);
    if (book == null){
      return res.status(404).send("书籍未找到");
    }
    res.render("book_delete",{
      title:"Delete Book",
      book:book,
      book_instances:bookInstances,
    });
  }catch(err){
    return next(err);
  }
});

// 以 POST 方式处理删除图书。
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  try{
    const book = await Book.findById(req.body.bookid).exec();
    if (book == null){
      return res.status(404).send("书籍未找到");
    }
    await Book.findByIdAndDelete(req.body.bookid);
    res.redirect("/catalog/books");
  }catch(err){
    return next(err);
  }
});

// 通过 GET 显示更新图书。
exports.book_update_get = asyncHandler(async (req, res, next) => {
  try{
    const [book,authors,genres] = await Promise.all([
      Book.findById(req.params.id).populate("author").populate("genre").exec(),
      Author.find({}).exec(),
      Genre.find({}).exec(),
    ]);
    if (book == null){
      return res.status(404).send("书籍未找到");
    }
    //标记我们选中的genre都已经被检查,在模版中使用了check的打钩框，发生错误时，重新渲染表单且还原用户输入状态
    for (let i = 0;i<genres.length;i++){
      if(book.genre.indexOf(genres[i]._id) > -1){
        genres[i].checked = "true";
      }
    }
    //渲染更新图书表单
    res.render("book_form",{
      title:"Update Book",
      authors:authors,
      genres:genres,
      book:book,
    });
  }catch(err){
    return next(err);
  }
});

// 处理 POST 时的更新图书。
exports.book_update_post = asyncHandler(async (req, res, next) => {
  try {
    const errors = validationResult(req);

    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id, // 需要保留原始 ID
    });

    if (!errors.isEmpty()) {
      const [authors, genres] = await Promise.all([
        Author.find({}).exec(),
        Genre.find({}).exec(),
      ]);

      for (let i = 0; i < genres.length; i++) {
        if (book.genre.indexOf(genres[i]._id) > -1) {
          genres[i].checked = "true";
        }
      }

      res.render("book_form", {
        title: "Update Book",
        authors: authors,
        genres: genres,
        book: book,
        errors: errors.array(),
      });
    } else {
      // 使用 await 进行更新
      const updatedBook = await Book.findByIdAndUpdate(req.params.id, book, { new: true });//new:true表示返回更新后的文档
      res.redirect(updatedBook.url);
    }
  } catch (err) {
    return next(err);
  }
});
