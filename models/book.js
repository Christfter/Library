const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "Author", required: true },//Schema.Types.ObjectId表示该字段的类型是一个MongoDB的Objectid
  summary: { type: String, required: true },//而不是直接的字符串，这种类型通常用于建立不同模型之间的引用关系，Author是导出时的命名
  isbn: { type: String, required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
});

// 虚拟属性'url'：藏书 URL
BookSchema.virtual("url").get(function () {
  return "/catalog/book/" + this._id;
});

// 导出 Book 模块
module.exports = mongoose.model("Book", BookSchema);
