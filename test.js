//引入express框架
const express = require('express');
//引入路径处理模块
const path = require('path')
const formidable = require('formidable');
const bodyParser = require('body-parser');
const fs = require('fs')
//创建web服务器
const app = express();
//静态资源访问服务器功能
app.use(express.static(path.join(__dirname, 'public')))

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
//上传图片,存到picture.txt里
app.post('/upload', (req, res) => {
	fs.writeFile("picture" + req.body.index + ".txt", req.body.src, (err, data) => {
		if (err) throw err;
		console.log("Pic"+req.body.index+"上传成功");
		fs.readFile("picture" + req.body.index + ".txt", 'utf-8', (err, data) => {
			if (err) throw err;
			console.log("Pic"+req.body.index+"返回成功");
			res.send({
				index: req.body.index,
				src: data,
			});
		});
	});
})
//读取文本框中的内容
app.get('/read', (req, res) => {
	fs.readFile("data.txt", 'utf-8', (err, data) => {
		if (err) throw err;
		res.send(data);
		console.log("文本读取成功");
	});
})
app.get('/deletePic', (req, res) => {
	fs.writeFile("picture1.txt", "", 'utf-8', (err, data1) => {
		if (err) throw err;
		fs.writeFile("picture2.txt", "", 'utf-8', (err, data2) => {
			if (err) throw err;
			res.send("ok");
		});
		console.log("Pic删除成功");
	});
})
app.get('/readPic', (req, res) => {
	fs.readFile("picture1.txt", 'utf-8', (err, data1) => {
		if (err) throw err;
		fs.readFile("picture2.txt", 'utf-8', (err, data2) => {
			if (err) throw err;
			res.send({
				src1: data1,
				src2: data2
			});
		});
		console.log("Pic查看成功");
	});
})
//写入并读取数据显示到控制台
app.post('/write', (req, res) => {
	fs.writeFile("data.txt", req.body.info, (err, data) => {
		if (err) throw err;
		res.send("ok")
		if (req.body.info === '')
			console.log("文本删除成功");
		else
			console.log("文本写入成功");
	});
})

//监听端口
app.listen(3000);

//控制台提示输出
console.log('服务器启动成功')



// const http = require('http');
// const net  = require('net');
// const util = require('util');
// //随便定义的一个函数，下面会用到
// function  a(){
//     console.log("dajiahao");
// }
// var server = new http.Server();
// server.on('request',(req,res)=>{
//     console.log(req.url);
//     //设置应答头信息
//     res.writeHead(200,{'Content-Type':'text/html'});
//     res.write('hello we are family<br>');
//     res.end('server already end\n');
// });
// //显示了三次这也证明了TCP的三次握手
// server.on('connection',()=>{
//     a();
// });
// server.on('close',()=>{
//     console.log('server will close');
// });
// //关闭服务为了触发close事件
// server.close();
// server.listen(3000);