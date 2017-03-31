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
		px2proj.href(page_path, function(page_path){
			px2proj.query(page_path+'?PX=px2dthelper.get.navigation_info', {
				"output": "json",
				"userAgent": "Mozilla/5.0",
				"success": function(data){
					// console.log(data);
				},
				"complete": function(data, code){
					// console.log(data, code);
					var navigation_info;
					try {
						navigation_info = JSON.parse(data);
					} catch (e) {
						navigation_info = false;
					}
					// console.log(navigation_info);

					res.status(200);
					res.set('Content-Type', 'text/json')
					res.send(JSON.stringify(navigation_info)).end();

					return;
				}
			});
		});

		return;
	};


}
