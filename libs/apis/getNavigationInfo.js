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
		// console.log( page_path+'?PX=px2dthelper.get.navigation_info&filter=false' );

		var navigation_info;
		var pjInfo;

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				px2proj.query('/?PX=px2dthelper.get.all&path='+encodeURIComponent(page_path)+'&filter=false', {
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
						// console.log(pjInfo.path_type);

						rlv();
						return;
					}
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log('checking editorType...');
				navigation_info.editorType = '---';

				var realpathDataDir = pjInfo.realpath_data_dir;
				try {
					var rtn = '.not_exists';
					
					if( pjInfo.path_type === 'alias' ) {
						rtn = 'alias';
					} else {
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
