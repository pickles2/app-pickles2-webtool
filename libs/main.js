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
	conf.px2server.originParsed.port = (conf.px2server.originParsed.protocol=='https' ? 443 : 80);
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
var io = require('socket.io')(server);
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
app.use( '/resources/bootstrap/', express.static( __dirname+'/../node_modules/bootstrap/dist/' ) );
app.use( '/resources/ace-builds/src-noconflict/', express.static( __dirname+'/../node_modules/ace-builds/src-noconflict/' ) );
app.use( '/resources/px2style/', express.static( __dirname+'/../node_modules/px2style/dist/' ) );
app.use( '/resources/cmd-queue/', express.static( __dirname+'/../node_modules/cmd-queue/dist/' ) );
app.use( '/resources/pickles2-contents-editor/', express.static( __dirname+'/../node_modules/pickles2-contents-editor/dist/' ) );
app.use( '/resources/broccoli-html-editor/', express.static( __dirname+'/../node_modules/broccoli-html-editor/client/dist/' ) );

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
app.use( '/apis/getServerConf', require('./apis/getServerConf.js')(conf) );
app.use( '/apis/getPageInfo', require('./apis/getPageInfo.js')(conf) );
app.use( '/apis/checkEditorType', require('./apis/checkEditorType.js')(conf) );
app.use( '/apis/applock', require('./apis/applock.js')(conf) );
app.use( '/apis/cmdQueue', require('./apis/cmdQueue.js')(conf, io) );

// 動的なページ生成
app.use( /^\/(?:index\.html)?/, require('./../src/index.html.js')(px2) );

app.use( express.static( __dirname+'/../dist/' ) );

// {conf.originParsed.port}番ポートでLISTEN状態にする
server.listen( conf.originParsed.port, function(){
	console.log('Application Server: Standby');
} );
console.log('');



if(conf.px2server.useExternalPreviewServer){
	console.log('Preview Server: Using External: '+conf.px2server.origin);
}else{
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

	/**
	 * broccoli-html-editor が要求するコードを取得
	 */
	function getBroccoliScript(){
		var scriptSrc = fs.readFileSync(__dirname+'/../node_modules/broccoli-html-editor/client/dist/broccoli-preview-contents.js').toString('utf-8');
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
	}

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
			'processor': function(html, ext, callback, response){
				if( ext == 'html' ){
					if( html.match('<script data-broccoli-receive-message="yes">') ){
						// すでに挿入済みの場合はスキップする。
						// `external_preview_server_origin` が導入された際に、
						// px2-px2dthelper にこのタグを挿入する機能が追加された。
						// ただしこれはオプションなので、適用される場合とされない場合がある。
						// なのでここでは、有無をチェックし、挿入されていない場合にのみ、挿入する。
					}else{
						html += getBroccoliScript();

						var errorHtml = '';
						if( response.status != 200 ){
							errorHtml += '<ul style="background-color: #fee; border: 3px solid #f33; padding: 10px; margin: 0.5em; border-radius: 5px;">';
							errorHtml += '<li style="color: #f00; list-style-type: none;">STATUS: '+response.status+' '+response.message+'</li>';
							errorHtml += '</ul>';
						}
						if( response.errors.length ){
							errorHtml += '<ul style="background-color: #fee; border: 3px solid #f33; padding: 10px; margin: 0.5em; border-radius: 5px;">';
							for( var idx in response.errors ){
								errorHtml += '<li style="color: #f00; list-style-type: none;">'+response.errors[idx]+'</li>';
							}
							errorHtml += '</ul>';
						}
						if( errorHtml.length ){
							html += '<div style="position: fixed; top: 10px; left: 5%; width: 90%; font-size: 14px; opacity: 0.8; z-index: 2147483000;" onclick="this.style.display=\'none\';">';
							html += errorHtml;
							html += '</div>';
						}
					}
				}
				callback(html);
				return;
			}
		}
	) );
	serverPx2.listen( conf.px2server.originParsed.port, function(){
		console.log('Preview Server: Standby');
	} );
}
console.log('');
