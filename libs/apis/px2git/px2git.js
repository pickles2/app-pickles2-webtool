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


	return function(options, method, userInfo, callback){
		var commentSuffix =
			"\n"
			+'-----------'+"\n"
			+'committer: ' + userInfo.name + ' ('+userInfo.id+')' +"\n"
		;
		if(method == 'commit_sitemaps'){
			options[0] += commentSuffix;
		}else if(method == 'commit_contents'){
			options[1] += commentSuffix;
		}

		switch( method ){
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
				var m = new apiGen(method);
				m(
					options,
					function(rtn, err, code){
						callback(rtn);
					}
				);
				return;
				break;
			default:
				break;
		}
		callback(false);
		return;
	};
};
