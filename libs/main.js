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
console.log('Pickles2 preview server port number is '+conf.px2server.port);


app.use( require('body-parser')() );
var mdlWareSession = session({
	secret: "pickles2webtool",
	cookie: {
		httpOnly: false
	}
});
app.use( mdlWareSession );
app.use( require('./preprocess/userInfo.js')(conf) );

app.use( '/apis/getLoginUserInfo', require('./apis/getLoginUserInfo.js')(conf) );
app.use( '/apis/login', require('./apis/login.js')(conf) );
app.use( '/apis/logout', require('./apis/logout.js')(conf) );
app.use( '/apis/getSitemap', require('./apis/getSitemap.js')(conf) );

app.use( '/fncs/*', require('./preprocess/loginCheck.js')(conf) );

app.use( express.static( __dirname+'/../dist/' ) );

// {conf.port}番ポートでLISTEN状態にする
server.listen( conf.port, function(){
	console.log('server-standby');
} );



// Pickles2 preview server
var expressPickles2 = require('express-pickles2');
var appPx2 = express();
appPx2.use( require('body-parser')() );
appPx2.use( mdlWareSession );
appPx2.use( require('./preprocess/userInfo.js')(conf) );
appPx2.use( '/*', require('./preprocess/loginCheck.js')(conf) );
appPx2.use( '/*', expressPickles2(conf.px2server.path, {}) );
appPx2.listen(conf.px2server.port);
