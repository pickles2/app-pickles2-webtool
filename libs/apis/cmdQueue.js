/**
 * cmdQueue.js
 */
module.exports = function(conf, io){
	var px2git = require('./px2git/px2git.js')(conf);

	var CmdQueue = require('cmd-queue');
	var cmdQueue = new CmdQueue({
		'cd': {
			'default': process.cwd(),
			'git': process.cwd(),
			'composer': process.cwd()
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
				px2git(msg.options, msg.method, function(result){
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

		// クライアントから受け取ったメッセージをGPIへ送る
		cmdQueue.gpi(req.query.message, function(result){
			res.write( JSON.stringify(result) );
			res.flushHeaders();
			res.end();
		});
		return;
	};


}
