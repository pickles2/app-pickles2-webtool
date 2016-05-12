/**
 * pickles2webtool main.js
 */
var fs = require('fs');
var path = require('path');
var conf = require('config');
var urlParse = require('url-parse');
conf.originParsed = new urlParse(conf.origin);
conf.originParsed.protocol = conf.originParsed.protocol.replace(':','');
if(!conf.originParsed.port){
	conf.originParsed.port = (conf.originParsed.protocol=='https' ? 443 : 80);
}
conf.px2server.originParsed = new urlParse(conf.px2server.origin);
conf.px2server.originParsed.protocol = conf.px2server.originParsed.protocol.replace(':','');
if(!conf.px2server.originParsed.port){
	conf.px2server.originParsed.port = (conf.originParsed.protocol=='https' ? 443 : 80);
}
console.log(conf);

var sslOption = {
	key: fs.readFileSync(conf.sslOption.key),
	cert: fs.readFileSync(conf.sslOption.cert),
	passphrase: conf.sslOption.passphrase
};

var express = require('express'),
	app = express();
var session = require('express-session');
var server;
if( conf.originParsed.protocol == 'https' ){
	server = require('https').Server(sslOption, app);
}else{
	server = require('http').Server(app);
}
console.log('port number is '+conf.originParsed.port);
console.log('Pickles2 preview server port number is '+conf.px2server.originParsed.port);


app.use( require('body-parser')({"limit": "1024mb"}) );
var mdlWareSession = session({
	secret: "pickles2webtool",
	cookie: {
		httpOnly: false
	}
});
app.use( mdlWareSession );
app.use( require('./preprocess/userInfo.js')(conf) );
app.use( require('./preprocess/applock.js')(conf) );

app.use( '/apis/getLoginUserInfo', require('./apis/getLoginUserInfo.js')(conf) );
app.use( '/apis/login', require('./apis/login.js')(conf) );
app.use( '/apis/logout', require('./apis/logout.js')(conf) );

app.use( '/fncs/*', require('./preprocess/loginCheck.js')(conf) );
app.use( '/mods/*', require('./preprocess/loginCheck.js')(conf) );
app.use( '/api/*', require('./preprocess/loginCheck.js')(conf) );

app.use( '/apis/getProjectConf', require('./apis/getProjectConf.js')(conf) );
app.use( '/apis/getSitemap', require('./apis/getSitemap.js')(conf) );
app.use( '/apis/pickles2ContentsEditorGpi', require('./apis/pickles2ContentsEditorGpi.js')(conf) );
app.use( '/apis/getServerConf', require('./apis/getServerConf.js')(conf) );
app.use( '/apis/applock', require('./apis/applock.js')(conf) );

app.use( express.static( __dirname+'/../dist/' ) );

// {conf.originParsed.port}番ポートでLISTEN状態にする
server.listen( conf.originParsed.port, function(){
	console.log('server-standby');
} );



// Pickles2 preview server
var expressPickles2 = require('express-pickles2');
var appPx2 = express();
var serverPx2;
if( conf.px2server.originParsed.protocol == 'https' ){
	serverPx2 = require('https').Server(sslOption, appPx2);
}else{
	serverPx2 = require('http').Server(appPx2);
}
appPx2.use( require('body-parser')() );
appPx2.use( mdlWareSession );
appPx2.use( require('./preprocess/userInfo.js')(conf) );

appPx2.use( '/*', require('./preprocess/loginCheck.js')(conf) );

appPx2.use( '/*', expressPickles2(
	conf.px2server.path,
	{
		// 'liveConfig': function(callback){
		// 	var pj = px.getCurrentProject();
		// 	var realpathEntryScript = path.resolve(pj.get('path'), pj.get('entry_script'));
		// 	callback(
		// 		realpathEntryScript,
		// 		{}
		// 	);
		// },
		'processor': function(bin, ext, callback){
			if( ext == 'html' ){
				bin += (function(){
					var scriptSrc = fs.readFileSync(__dirname+'/../dist/common/pickles2-contents-editor/dist/libs/broccoli-html-editor/client/dist/broccoli-preview-contents.js').toString('utf-8');
					var fin = '';
						fin += '<script data-broccoli-receive-message="yes">'+"\n";
						// fin += 'console.log(window.location);'+"\n";
						fin += 'window.addEventListener(\'message\',(function() {'+"\n";
						fin += 'return function f(event) {'+"\n";
						// fin += 'console.log(event.origin);'+"\n";
						// fin += 'console.log(event.data);'+"\n";
						fin += 'if(window.location.hostname!=\''+conf.px2server.originParsed.hostname+'\'){alert(\'Unauthorized access.\');return;}'+"\n";
						fin += 'if(!event.data.scriptUrl){return;}'+"\n";
						// fin += 'var s=document.createElement(\'script\');'+"\n";
						// fin += 'document.querySelector(\'body\').appendChild(s);s.src=event.data.scriptUrl;'+"\n";
						fin += scriptSrc+';'+"\n";
						fin += 'window.removeEventListener(\'message\', f, false);'+"\n";
						fin += '}'+"\n";
						fin += '})(),false);'+"\n";
						fin += '</script>'+"\n";
					return fin;
				})();
			}
			callback(bin);
			return;
		}
	}
) );
serverPx2.listen(conf.px2server.originParsed.port);
