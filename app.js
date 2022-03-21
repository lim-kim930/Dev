// 引入express框架
const express = require('express');
// 引入路径处理模块
const path = require('path');
const bodyParser = require('body-parser');
// 创建web服务器
const app = express();
// 静态资源访问服务器功能
app.use(express.static(path.join(__dirname, 'public')));
// 防止图片过大报错
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.all("*", function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "content-type");
	res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
	if (req.method.toLowerCase() == 'options')
		res.send(200);
	else
		next();
})
// 监听端口
app.listen(3000);
console.log('server is running at port 3000.');
