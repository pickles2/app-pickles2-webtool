/**
 * cmdQueue.js
 */
module.exports = function(conf, io){

	var CmdQueue = require('cmd-queue');
	var cmdQueue = new CmdQueue({
		'cd': {
			'default': process.cwd()
		},
		'allowedCommands': [
			'git',
			'php'
		],
		'preprocess': function(cmd, callback){
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
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);

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
