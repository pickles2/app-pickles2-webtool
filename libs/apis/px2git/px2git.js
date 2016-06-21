/**
 * px.project.git
 */
module.exports = function(conf){
	var _this = this;

	var nodePhpBin = require('node-php-bin').get();
	var utils79 = require('utils79');
	var path_px2git = require('path').resolve( __dirname+'/php/px2-git.php' );
	var entryScript = require('path').resolve( conf.px2server.path );

	function apiGen(apiName){
		return new (function(apiName){
			this.fnc = function(options, callback){
				if( arguments.length == 2 ){
					options = arguments[0];
					callback = arguments[1];
				}else{
					callback = arguments[0];
				}

				options = options||[];
				callback = callback||function(){};

				var param = {
					'method': apiName,
					'entryScript': entryScript,
					'options': options
				};

				// PHPスクリプトを実行する
				var rtn = '';
				var err = '';
				nodePhpBin.script(
					[
						path_px2git,
						utils79.base64_encode(JSON.stringify(param))
					],
					{
						"success": function(data){
							rtn += data;
							// console.log(data);
						} ,
						"error": function(data){
							rtn += data;
							err += data;
							// console.log(data);
						} ,
						"complete": function(data, error, code){
							setTimeout(function(){
								try {
									rtn = JSON.parse(rtn);
								} catch (e) {
									console.error('Failed to parse JSON string.');
									console.error(rtn);
									rtn = false;
								}
								// console.log(rtn, err, code);
								callback(rtn, err, code);
							},500);
						}
					}
				);
				return;
			}
		})(apiName).fnc;
	}


	return function(req, res, next){
		// console.log(req.params);
		// console.log(req.params.method);
		// console.log(req.param('method'));
		// console.log(req.param('options'));
		// console.log(req.userInfo);

		var options = req.param('options');
		var commentSuffix =
			"\n"
			+'-----------'+"\n"
			+'committer: ' + req.userInfo.name + ' ('+req.userInfo.id+')' +"\n"
		;
		if(req.params.method == 'commit_sitemaps'){
			options[0] += commentSuffix;
		}else if(req.params.method == 'commit_contents'){
			options[1] += commentSuffix;
		}
		// console.log(options);

		switch( req.params.method ){
			case 'commit_sitemaps':
			case 'commit_contents':
			case 'status':
			case 'status_contents':
			case 'rollback_sitemaps':
			case 'rollback_contents':
			case 'log':
			case 'log_sitemaps':
			case 'log_contents':
			case 'show':
				var m = new apiGen(req.params.method);
				m(
					options,
					function(rtn, err, code){
						// console.log(JSON.stringify(rtn));
						res.status(200);
						res.set('Content-Type', 'text/json')
						res.send(JSON.stringify(rtn)).end();
					}
				);
				return;
				break;
			default:
				break;
		}
		next();
		return;
	};
};
