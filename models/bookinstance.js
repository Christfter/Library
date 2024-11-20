const mongoose = require("mongoose");
const {DateTime} = require("luxon")

const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema({
  // 指向相关藏书的引用
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  // 出版项
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance",
  },
  due_back: { type: Date, default: Date.now },
});

// 虚拟属性'url'：藏书副本 URL
BookInstanceSchema.virtual("url").get(function () {
  return "/catalog/bookinstance/" + this._id;
});
BookInstanceSchema.virtual("due_back_formatted").get(function(){
  if (this.due_back) {
    const dt = DateTime.fromJSDate(this.due_back);//使用luxon的地方
    
    // 获取日期和年份
    const day = dt.day;
    const year = dt.year;
    
    // 处理序数后缀
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                   day === 2 || day === 22 ? 'nd' :
                   day === 3 || day === 23 ? 'rd' : 'th';

    // 返回格式化的日期字符串
    return `${dt.toFormat("MMM")} ${day}${suffix}, ${year}`;
  }
  return ""; // 如果 due_back 不存在，返回空字符串
})
// 导出 BookInstance 模型
module.exports = mongoose.model("BookInstance", BookInstanceSchema);
