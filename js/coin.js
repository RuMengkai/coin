var http = require('http');
var querystring = require('querystring');
var nodemailer = require('nodemailer');

var sendTime = new Date().getTime()-1000*60*30

var likeCoin = []
var likeCoinHtml = []

/* 关注的交易对 */
var likeCionArr = [
	{
		'name': 'ETH/USDT',
		'range': 5
	}, {
		'name': 'TTT/USDT',
		'range': 10
	}, {
		'name': 'MOAC/USDT',
		'range': 5
	}, {
		'name': 'NULS/USDT',
		'range': 6
	}, {
		'name':'EOS/USDT',
		'range': 5
	}
]

var config = (data)=>{
	if (!!likeCionArr.find((item)=>{return item.name==data})) {
		return true
	}else{
		return false
	}
}


/* 请求成功后处理函数 */
var successFun = (data) => {
	console.log('\r\ndata分隔线---------------------------------\r\n');
	data = JSON.parse(data)
	likeCoin =[]
	likeCoinHtml = ''
	var flag = false
	data.dayPrices.map((item,index)=>{
		if (config(item.name)) {
			likeCoinHtml += '<tr><td>'+item.chineseName+'</td><td>'+item.name+'</td><td>'+item.percent+'</td><td>'+item.price_USDT+'</td></tr>' 
			likeCoin.push(item)
		}
	})
	likeCoin.map((item,index)=>{
		console.log(item.chineseName+' | '+item.name+' | '+'涨跌幅：'+item.percent+'%'+' | '+'现价：'+item.price_USDT+'\r\n')
		if (Math.abs(item.percent)>likeCionArr[index]) {
			flag = true 
		}
	})
	if (flag) {
		sendEmail(likeCoin)
	}
}

//发送 http Post 请求
var post = ()=>{
	var postData = querystring.stringify({
			// msg:'12344'
	});
	var options = {
			hostname: 'www.manbiwang.com',
			port: 80,
			path: '/api/service/006-001',
			method: 'POST',
			headers: {
				// 'Content-Type':'application/x-www-form-urlencoded',
				// 'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
				// 'Content-Length':Buffer.byteLength(postData)
			}
	}
	var req = http.request(options, function (res) {
		console.log('Status:', res.statusCode);
		console.log('headers:', JSON.stringify(res.headers));
		if (res.statusCode!=200) {
			errorFun(res)
		}
		res.setEncoding('utf-8');
		var html = ''
		res.on('data', function (data) {
				html += data;
		});
		res.on('end', function () {
				successFun(html)
		});
	});
	req.on('error', function (err) {
			console.error(err);
	});
	req.end();
}
//发送 http get 请求
var get = ()=>{
	// http://www.manbiwang.com/api/service/006-001 get 请求外网
	http.get('http://www.manbiwang.com/api/service/006-001', function (req, res) {
			var html = '';
			req.on('data', function (data) {
					html += data;
			});
			req.on('end', function () {
					console.info(html);
			});
	});
}


var sendEmail = (data)=>{
	var transporter = nodemailer.createTransport({
		host: "smtp.qq.com",
		auth: {
				user: '874968552@qq.com',
				pass: 'azlbofebaibgbdjh' //azlbofebaibgbdjh    mkaloibqrvdwbfib
		}
	});
	var t = new Date().getTime()
	if ((t-sendTime)<1000*60*30) {
		console.log('发送邮件未超过30分钟')
	}else{
		console.log('发送邮件时间：' + new Date())
		transporter.sendMail({
			from: '874968552@qq.com',
			// to: 'rumengkai@aliyun.com',
			to: '874968552@qq.com',
			subject: '币行情波动',
			html: '<table style="border: 1px solid #666;"><tr><td>币种</td><td>交易对</td><td>涨跌幅</td><td>现价</td></tr>'+likeCoinHtml+'</table><p>查看详情<a href="http://www.manbiwang.com">满币网</a></p>'
		}, function (err, response) {
			var date = new Date()
			sendTime = date.getTime()
			console.log('send mail err is ', err, response);
		});
	}
	transporter.close();
}

var errorFun = (data)=>{
	var transporter = nodemailer.createTransport({
		host: "smtp.qq.com",
		auth: {
				user: '874968552@qq.com',
				pass: 'azlbofebaibgbdjh' //azlbofebaibgbdjh    mkaloibqrvdwbfib
		}
	});
	if (new Date().getTime()-sendTime<1000*60*30) {
		console.log('发送邮件未超过30分钟')
	}else{
		console.log('发送邮件时间：' + new Date())
		transporter.sendMail({
			from: '874968552@qq.com',
			to: 'rumengkai@aliyun.com',
			subject: '币行情接口出错',
			html: data+'<table border="1"><tr><td>币种</td><td>交易对</td><td>涨跌幅</td><td>现价</td></tr>'+likeCoinHtml+'</table><p>查看详情<a href="http://www.manbiwang.com">满币网</a></p>'
		}, function (err, response) {
			console.log('send mail err is ', err, response);
			var date = new Date()
			sendTime = date.getTime()
		});
	}
	transporter.close();
}

var coin = () => {
	setInterval(() => {
		post()
	}, 1000*5)
};

module.exports = coin