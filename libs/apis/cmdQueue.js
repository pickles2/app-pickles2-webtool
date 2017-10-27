/**
 * cmdQueue.js
 */
module.exports = function(conf, io){
	var px2git = require('./px2git/px2git.js')(conf);

	var CmdQueue = require('cmd-queue');
	var cmdQueue = new CmdQueue({
		'cd': {
			'default': require('path').resolve(conf.px2server.path, '../'),
			'git': require('path').resolve(conf.px2server.path, '../'),
			'composer': require('path').resolve(conf.px2server.path, '../')
		},
		'allowedCommands': [
			'git',
			'php'
		],
		'preprocess': function(cmd, callback){
			if(cmd.command[0] == 'px2git'){
				// --------------------------------------
				// gitコマンドの仲介処理

				var msg = JSON.parse(cmd.command[2]);
				px2git(msg.options, msg.method, cmd.extra.userInfo, function(result){
					console.log(result);
					cmd.stdout(JSON.stringify(result));
					cmd.complete(0);
					callback(false);
					return;
				});
				return;
			}
			callback(cmd);
			return;
		},
		'gpiBridge': function(message, done){
			io.emit('cmd-queue-message', message);
			done();
			return;
		}
	});

	return function(req, res, next){

		res
			.status(200)
			.set('Content-Type', 'text/json')
		;

		// 拡張： ログインユーザーの情報をキューに記憶する
		req.query.message.extra = req.query.message.extra || {};
		req.query.message.extra.userInfo = req.userInfo;

		// クライアントから受け取ったメッセージをGPIへ送る
		cmdQueue.gpi(req.query.message, function(result){
			res.write( JSON.stringify(result) );
			res.flushHeaders();
			res.end();
		});
		return;
	};


}
