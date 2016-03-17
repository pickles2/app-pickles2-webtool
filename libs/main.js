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

app.use( '/fncs/*', require('./preprocess/loginCheck.js')(conf) );
app.use( '/mods/*', require('./preprocess/loginCheck.js')(conf) );
app.use( '/api/*', require('./preprocess/loginCheck.js')(conf) );

app.use( '/apis/getProjectConf', require('./apis/getProjectConf.js')(conf) );
app.use( '/apis/getSitemap', require('./apis/getSitemap.js')(conf) );
app.use( '/apis/pickles2ContentsEditorGpi', require('./apis/pickles2ContentsEditorGpi.js')(conf) );

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
					var scriptSrc = fs.readFileSync(__dirname+'/../dist/common/broccoli-html-editor/client/dist/broccoli-preview-contents.js').toString('utf-8');
					var fin = '';
						fin += '<script data-broccoli-receive-message="yes">'+"\n";
						// fin += 'console.log(window.location);'+"\n";
						fin += 'window.addEventListener(\'message\',(function() {'+"\n";
						fin += 'return function f(event) {'+"\n";
						// fin += 'console.log(event.origin);'+"\n";
						// fin += 'console.log(event.data);'+"\n";
						fin += 'if(window.location.hostname!=\'127.0.0.1\'){alert(\'Unauthorized access.\');return;}'+"\n";
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
appPx2.listen(conf.px2server.port);
