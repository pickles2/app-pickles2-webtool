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
// console.log(conf);

var sslOption = {
	key: fs.readFileSync(conf.sslOption.key),
	cert: fs.readFileSync(conf.sslOption.cert),
	passphrase: conf.sslOption.passphrase
};

var express = require('express'),
	app = express();
var session = require('express-session');
var logger = new (require('./logger.js'))(conf);
var accessRestrictor = new (require('./accessRestrictor.js'))(conf);
var px2 = new (require('./pickles2.js'))(conf);
var server;
if( conf.originParsed.protocol == 'https' ){
	server = require('https').Server(sslOption, app);
}else{
	server = require('http').Server(app);
}
console.log('Application Server: port '+conf.originParsed.port);
console.log('Pickles 2 Preview Server: port '+conf.px2server.originParsed.port);
console.log('');


logger.setAccessLogger(app, 'access-px2wt');
accessRestrictor.setAccessRestriction(app);
app.use( require('body-parser')({"limit": "1024mb"}) );
var mdlWareSession = session({
	secret: "pickles2webtool",
	cookie: {
		httpOnly: false
	}
});
app.use( mdlWareSession );

// リソース系
app.use( '/resources/px2style/', express.static( __dirname+'/../node_modules/px2style/dist/' ) );
app.use( '/resources/bootstrap/', express.static( __dirname+'/../node_modules/bootstrap/dist/' ) );

// ログイン処理系
app.use( require('./preprocess/userInfo.js')(px2) );
app.use( require('./preprocess/applock.js')(px2) );

app.use( '/apis/login', require('./apis/login.js')(px2) );
app.use( '/apis/logout', require('./apis/logout.js')(px2) );
app.use( '/logout.html', require('./../src/logout.html.js')(px2) );
app.use( '/apis/getLoginUserInfo', require('./apis/getLoginUserInfo.js')(px2) );

app.use( '/fncs/*', require('./preprocess/loginCheck.js')(px2) );
app.use( '/mods/*', require('./preprocess/loginCheck.js')(px2) );
app.use( '/apis/*', require('./preprocess/loginCheck.js')(px2) );

// API系
app.use( '/apis/getProjectConf', require('./apis/getProjectConf.js')(conf) );
app.use( '/apis/getSitemap', require('./apis/getSitemap.js')(px2) );
app.use( '/apis/getNavigationInfo', require('./apis/getNavigationInfo.js')(px2) );
app.use( '/apis/getUserInfo', require('./apis/getUserInfo.js')(conf) );
app.use( '/apis/getUserList', require('./apis/getUserList.js')(conf) );
app.use( '/apis/pickles2ContentsEditorGpi', require('./apis/pickles2ContentsEditorGpi.js')(conf) );
app.use( '/apis/pxCommand', require('./apis/pxCommand.js')(conf) );
app.use( '/apis/px2git/:method', require('./apis/px2git/px2git.js')(conf) );
app.use( '/apis/getServerConf', require('./apis/getServerConf.js')(conf) );
app.use( '/apis/getPageInfo', require('./apis/getPageInfo.js')(conf) );
app.use( '/apis/checkEditorType', require('./apis/checkEditorType.js')(conf) );
app.use( '/apis/applock', require('./apis/applock.js')(conf) );

// 動的なページ生成
app.use( /^\/(?:index\.html)?/, require('./../src/index.html.js')(px2) );

app.use( express.static( __dirname+'/../dist/' ) );

// {conf.originParsed.port}番ポートでLISTEN状態にする
server.listen( conf.originParsed.port, function(){
	console.log('Application Server: Standby');
} );
console.log('');



// ----------------------------------------------------------------------------
// Pickles2 preview server
var expressPickles2 = require('express-pickles2');
var appPx2 = express();
var serverPx2;
if( conf.px2server.originParsed.protocol == 'https' ){
	serverPx2 = require('https').Server(sslOption, appPx2);
}else{
	serverPx2 = require('http').Server(appPx2);
}
logger.setAccessLogger(appPx2, 'access-preview');
accessRestrictor.setAccessRestriction(appPx2);
appPx2.use( require('body-parser')() );
appPx2.use( mdlWareSession );
appPx2.use( require('./preprocess/userInfo.js')(px2) );

appPx2.use( '/*', require('./preprocess/loginCheck.js')(px2) );

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
serverPx2.listen( conf.px2server.originParsed.port, function(){
	console.log('Preview Server: Standby');
} );
console.log('');
