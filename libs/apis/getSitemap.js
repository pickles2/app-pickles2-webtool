/**
 * getSitemap.js
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
		px2proj.get_sitemap(function(sitemap){
			// console.log(sitemap);

			px2.getProjectInfo(function(pjInfo){
				// console.log(pjInfo);

				it79.ary(
					sitemap ,
					function(it1, row, idx){
						new Promise(function(rlv){rlv();})
							.then(function(){ return new Promise(function(rlv, rjt){
								// console.log(idx + ': ' + row.title);
								rlv();
							}); })
							.then(function(){ return new Promise(function(rlv, rjt){
								// console.log('checking editorType...');
								row.editorType = '---';

								px2proj.realpath_files(row.path, '', function(realpathDataDir){
									try {
										realpathDataDir = require('path').resolve(realpathDataDir, 'guieditor.ignore')+'/';

										var rtn = '.not_exists';
										if( row === null ){
											callback('.page_not_exists');
											return;
										}
										if( utils79.is_file( pjInfo.realpath_docroot + pjInfo.path_controot + row.content ) ){
											rtn = 'html';
											if( utils79.is_file( realpathDataDir + '/data.json' ) ){
												rtn = 'html.gui';
											}

										}else if( utils79.is_file( pjInfo.realpath_docroot + pjInfo.path_controot + row.content + '.md' ) ){
											rtn = 'md';
										}

										row.editorType = rtn;
									} catch (e) {
									}
									rlv();
								});

							}); })
							.then(function(){ return new Promise(function(rlv, rjt){
								// console.log('checking assignee info ...');
								row.user_info = {'name': '---', 'assignee': '---'};
								function getUserInfo(id, callback){
									callback = callback || function(){};
									var pathCsv = require('path').resolve(__dirname, '../../config/userlist.csv');
									// console.log(pathCsv);
									var findInCsv = new (require('find-in-csv'))(
										pathCsv ,
										{
											"require": ['id']
										}
									);
									// console.log(findInCsv);

									findInCsv.get(
										{'id':id},
										function(userInfo){
											// console.log(findInCsv);
											// console.log(userInfo);
											callback(userInfo);
											return;
										}
									);
									return;

								}

								// console.log(req.method.toLowerCase());
								if( req.method.toLowerCase() != 'get' ){
									console.log('method is not GET: '+req.method);
									rlv();
									return;
								}
								// console.log(rtn.page_info.assignee);
								if( typeof(row.assignee) != typeof('') ){
									console.log('no assignee');
									rlv();
									return;
								}

								getUserInfo(row.assignee, function(userInfo){
									// console.log(userInfo);
									delete(userInfo.pw);//パスワードは忘れる
									row.user_info = userInfo;
									rlv();
									return;
								});
								return;
							}); })
							.then(function(){ return new Promise(function(rlv, rjt){
								// console.log('done.');
								it1.next();
								rlv();
							}); })
						;

					} ,
					function(){
						res.status(200);
						res.set('Content-Type', 'text/json')
						res.send(JSON.stringify(sitemap)).end();
					}
				);
				return;
			});
			return;

		});
		return;
	};


}
