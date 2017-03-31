/**
 * getNavigationInfo.js
 */
module.exports = function(px2){
	var utils79 = require('utils79');
	var it79 = require('iterate79');
	var Promise = require('es6-promise').Promise;
	// var Px2CE = require('pickles2-contents-editor');
	var conf = px2.conf();
	var px2proj = px2.getPx2Project();

	return function(req, res, next){
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);

		var page_path = req.param('page_path');
		if( !page_path ){ page_path = '/'; }
		// console.log( page_path+'?PX=px2dthelper.get.navigation_info' );

		var navigation_info;
		var pjInfo;

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				// エイリアスやダイナミックパスを実際のパスに置き換えるため、
				// 一度 `$px->href()` を通す。
				px2proj.href(page_path, function(_page_path){
					page_path = _page_path;
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				px2proj.query(page_path+'?PX=px2dthelper.get.all', {
					"output": "json",
					"userAgent": "Mozilla/5.0",
					"success": function(data){
						// console.log(data);
					},
					"complete": function(data, code){
						// console.log(data, code);
						try {
							pjInfo = JSON.parse(data);
							navigation_info = pjInfo.navigation_info;
						} catch (e) {
							navigation_info = false;
						}
						// console.log(navigation_info);

						rlv();
						return;
					}
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log('checking assignee info ...');
				navigation_info.user_info = {'name': '---', 'assignee': '---'};

				// console.log(req.method.toLowerCase());
				if( req.method.toLowerCase() != 'get' ){
					console.log('method is not GET: '+req.method);
					rlv();
					return;
				}
				// console.log(navigation_info.page_info.assignee);
				if( typeof(navigation_info.page_info.assignee) != typeof('') ){
					console.log('no assignee');
					rlv();
					return;
				}

				px2.getUserInfo(navigation_info.page_info.assignee, function(userInfo){
					// console.log(userInfo);
					delete(userInfo.pw);//パスワードは忘れる
					navigation_info.user_info = userInfo;
					rlv();
					return;
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log('checking editorType...');
				navigation_info.editorType = '---';

				var realpathDataDir = pjInfo.realpath_data_dir;
				try {
					var rtn = '.not_exists';
					if( navigation_info.page_info === null ){
						callback('.page_not_exists');
						return;
					}
					if( utils79.is_file( pjInfo.realpath_docroot + pjInfo.path_controot + navigation_info.page_info.content ) ){
						rtn = 'html';
						if( utils79.is_file( realpathDataDir + '/data.json' ) ){
							rtn = 'html.gui';
						}

					}else if( utils79.is_file( pjInfo.realpath_docroot + pjInfo.path_controot + navigation_info.page_info.content + '.md' ) ){
						rtn = 'md';
					}

					navigation_info.editorType = rtn;
				} catch (e) {
				}
				rlv();

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				res.status(200);
				res.set('Content-Type', 'text/json')
				res.send(JSON.stringify(navigation_info)).end();
				rlv();
			}); })
		;

		return;
	};


}
