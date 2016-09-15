/**
 * logger.js
 */
module.exports = function(conf){
	var morgan = require('morgan');
	var FileStreamRotator = require('file-stream-rotator');
	var utils79 = require('utils79');
	var fs = require('fs');
	var path = require('path');
	try {
		var _path_access_log = conf.logs.accesslog;
		fs.existsSync(_path_access_log) || fs.mkdirSync(_path_access_log); // ensure log directory exists
	} catch (e) {
	}
	if( !utils79.is_dir(_path_access_log) ){
		console.error(
			"\n"
			+'    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-='+"\n"
			+'      [Notice] accesslog directory is '+(!_path_access_log ? 'noset' : 'not exists ('+_path_access_log+')')+'.'+"\n"
			+'    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-='+"\n"
		);
	}

	this.setAccessLogger = function(app, filenamePrefix){
		if( !utils79.is_dir(_path_access_log) ){return;}
		try{
			var realpathLog = path.join(_path_access_log, filenamePrefix + '-%DATE%.log');

			// create a rotating write stream
			var accessLogStream = FileStreamRotator.getStream({
				'date_format': 'YYYYMMDD',
				'filename': realpathLog,
				'frequency': 'daily',
				'verbose': false
			});

			// setup the logger
			app.use(
				morgan(
					'combined',
					{
						'stream': accessLogStream
					}
				)
			);
		}catch(e){
			console.error(
				"\n"
				+'    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-='+"\n"
				+'      [ERROR] FAILED to set accesslogger - dir: ' + realpathLog+"\n"
				+'    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-='+"\n"
			);
		}
		return;
	}

}
