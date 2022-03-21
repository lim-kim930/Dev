//引入express框架
const express = require('express');
//引入路径处理模块
const path = require('path');
const formidable = require('formidable');
const bodyParser = require('body-parser');
const fs = require('fs');
const thenFs = require('then-fs');
const queryIp = require('node-ip2region').create();
//阿里云
const Core = require('@alicloud/pop-core');
const crypto = require('crypto');

//创建web服务器
const app = express();

//静态资源访问服务器功能
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json({ limit: '10mb' }));//防止图片过大报错
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));//防止图片过大报错

app.all("*", function (req, res, next) {
	//设置允许跨域的域名，*代表允许任意域名跨域
	res.header("Access-Control-Allow-Origin", "*");
	//允许的header类型
	res.header("Access-Control-Allow-Headers", "content-type");
	//跨域允许的请求方式 
	res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
	if (req.method.toLowerCase() == 'options')
		res.send(200);  //让options尝试请求快速结束
	else
		next();
})
//监听端口
app.listen(3000);

//控制台提示输出
console.log('服务器启动成功');
