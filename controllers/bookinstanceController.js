const BookInstance = require("../models/bookinstance");
const {body, validationResult} = require("express-validator");
var Book = require("../models/book");
const asyncHandler = require("express-async-handler");


// 呈现所有书本实例（BookInstance）的列表
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookinstance_list: allBookInstances,
  });
});

// 显示特定 BookInstance 的详情页
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  try{
    const bookinstance = await BookInstance.findById(req.params.id).populate("book").exec();

    if (bookinstance == null){
      //没有结果
      return res.status(404).send("这本书的副本未找到");
    }

    res.render("bookinstance_detail",{
      title:"BookInstance Detail",
      bookinstance:bookinstance,
    })
  }catch(err){
    return next(err);
  }
});

// 由 GET 显示创建 BookInstance 的表单
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  try{
    const books = await Book.find({}).exec();

    res.render("bookinstance_form",{
      title:"创建书本副本",
      book_list:books,
    });
  }catch(err){
    return next(err);
  }
});

// 由 POST 处理创建 BookInstance
exports.bookinstance_create_post = [
  body("book", "选择一本书").trim().isLength({min:1}).escape(),
  body("imprint", "印记").trim().isLength({min:1}).escape(),
  body("due_back", "归还日期").optional({checkFalsy:true}).isISO8601().toDate(),
  body("status").trim().escape(),

  asyncHandler(async(req, res, next) => {
    try{
      const errors = validationResult(req);

      const bookinstance = new BookInstance({
        book:req.body.book,
        imprint:req.body.imprint,
        status:req.body.status,
        due_back:req.body.due_back,
      });

      if(!errors.isEmpty()){
        const books = await Book.find({}).exec();
        res.render("bookinstance_form",{
          title: "创建书本副本",
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        });
      }else{
        await bookinstance.save();
        res.redirect(bookinstance.url);
      }
    }catch(err){
      return next(err);
    }
  }),
]

// 由 GET 显示删除 BookInstance 的表单
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  try{
    
    const bookinstance = await BookInstance.findById(req.params.id).populate("book").exec();
    if (bookinstance == null){
      return res.status(404).send("书本副本未找到");
    }

    res.render("bookinstance_delete",{
      title:"Delete BookInstance",
      bookinstance:bookinstance,
    });
  }catch(err){
    return next(err);
  }
});

// 由 POST 删除 BookInstance
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  try{
    // 查找要删除的书本副本
    const bookinstance = await BookInstance.findById(req.body.bookinstanceid).exec();

    if (bookinstance == null){
      return res.status(404).send("书本副本未找到");
    }else{
      await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
      res.redirect("/catalog/bookinstances");
    }
  }catch(err){
    return next(err);
  }
});

// 由 GET 显示更新 BookInstance 的表单
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  try{
    const [bookinstance, books] = await Promise.all([
      BookInstance.findById(req.params.id).populate("book").exec(),
      Book.find({}).exec(),
    ]);
    if (bookinstance == null){
      return res.status(404).send("书本副本未找到");
    }

    res.render("bookinstance_form",{
      title:"Update BookInstance",
      book_list:books,
      selected_book:bookinstance.book._id,
      bookinstance:bookinstance,
    });
  }catch(err){
    return next(err);
  } 
});

// 由 POST 处理更新 BookInstance
exports.bookinstance_update_post = [
  body("book", "选择一本书").trim().isLength({min:1}).escape(),
  body("imprint", "印记").trim().isLength({min:1}).escape(),
  body("due_back", "归还日期").optional({checkFalsy:true}).isISO8601().toDate(),
  body("status").trim().escape(),

  asyncHandler(async(req, res, next) => {
    const errors = validationResult(req);
    const bookinstance = new BookInstance({
      book:req.body.book,
      imprint:req.body.imprint,
      status:req.body.status,
      due_back:req.body.due_back,
      _id:req.params.id,
    });

    if(!errors.isEmpty()){
      const books = await Book.find({}).exec();
      res.render("bookinstance_form",{
        title:"Update BookInstance",
        book_list:books,
        selected_book:bookinstance.book._id,
        errors:errors.array(),
        bookinstance:bookinstance,
      });
      return;
    }else{
      const updatedBookInstance = await BookInstance.findByIdAndUpdate(req.params.id, bookinstance, { new: true });
      res.redirect(updatedBookInstance.url);
    }
  }),
]
