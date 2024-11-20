mongoDB:

xsf

fafa23333.

查询数据库排错：express-async-handler 通过npm获取

运行BASH：* & npm start

![image-20241114111950539](C:\Users\xsf\AppData\Roaming\Typora\typora-user-images\image-20241114111950539.png)

![image-20241114111958260](C:\Users\xsf\AppData\Roaming\Typora\typora-user-images\image-20241114111958260.png)

在扩展中找到左边的这些连接，同一个连接在这里选择连接而不是新输入connection url连接

右键可以复制链接url

此处的回调对响应对象调用 [`send()`](https://expressjs.com/en/4x/api.html#res.send)，当收到带有路径（`/about`）的 GET 请求时将返回字符串“关于此维基”。还有许多其他可以结束请求/响应周期[响应方法](https://expressjs.com/en/guide/routing.html#response-methods)，例如，可调用 [`res.json()`](https://expressjs.com/en/4x/api.html#res.json) 来发送 JSON 响应，或调用 [`res.sendFile()`](https://expressjs.com/en/4x/api.html#res.sendFile) 来发送文件。构建本地图书馆最常使用的响应方法是 [`render()`](https://expressjs.com/en/4x/api.html#res.render)，它使用模板和数据创建并返回 HTML 文件。我们将在后续章节进一步讨论。

router.还有很多方法，比如post，只回应http的post请求。

匹配路由路径可以使用正则表达式https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions：mdn官方介绍

**Pug**

#{title} 代表转义数据，也就是http传过来的title，!{'`<em>` is emphasised`</em>`'} 非转义，也就是文本本身，使用html格式的em将内容变为斜体。

具体查看教程：

https://developer.mozilla.org/zh-CN/docs/Learn/Server-side/Express_Nodejs/Displaying_data/Template_primer

**luxon**


使用**luxon**做日期格式化：npm install luxon

```JavaScript
const { DateTime } = require("luxon")；
```

**moment**

处理日期？

#### express-validator

使用express-validator处理表单：

```bash
npm install express-validator --save
```

post 提交，给大家推荐一款中间件：body-parser。它能让你轻松地处理 body 数据。

哦，如果你涉及文件上传，那么你可能需要“[multer](https://blog.csdn.net/qq_43624878/article/details/103607944)”中间件，你大概听说过“formidable”，但 multer 比它更强大！

body方法：const { body, validationResult } = require("express-validator");

用于验证和清理字段，使用trim()删除所有的首尾部空白。使用escape()删除任何危险的HTML字符。

req.params.id:来源是URL路径参数，在路由定义中使用了路径参数，req.params用于获取这些参数的值

req.body.bookinstanceid：来源是请求体（通常是POST请求），当通过表单或AJAX请求发送数据到服务器是，req.body获取请求体中的数据。
