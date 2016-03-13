/**
 * pickles2webtool main.js
 */
var fs = require('fs');
var path = require('path');
var conf = require('config');
// console.log(conf);
var express = require('express'),
	app = express();
var session = require('express-session');
var server = require('http').Server(app);
if(!conf.port){
	conf.port = 8080;
}
console.log('port number is '+conf.port);


app.use(require('body-parser')());
app.use(session({
	secret: "pickles2webtool",
	cookie: {
		httpOnly: false
	}
}));
app.use(require('./preprocess/userInfo.js')());

app.use( '/apis/getLoginUserInfo', require('./apis/getLoginUserInfo.js')() );
app.use( '/apis/login', require('./apis/login.js')() );
app.use( express.static( __dirname+'/../dist/' ) );

// {$_port}番ポートでLISTEN状態にする
server.listen( conf.port, function(){
	console.log('server-standby');
} );
