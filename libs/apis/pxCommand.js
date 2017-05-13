/**
 * pxCommand.js
 */
module.exports = function(conf){

	var Px2CE = require('pickles2-contents-editor');
	var px2proj = require('px2agent').createProject(conf.px2server.path);
	var Promise = require('es6-promise').Promise;
	var utils79 = require('utils79');

	var rtn = {};

	return function(req, res, next){
		var query = '';

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				query += req.param('page_path');
				query += '?PX=' + req.param('PX');
				query += '&' + req.param('params');
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log(query);
				px2proj.query(query, {
					'output': 'json',
					"userAgent": "Mozilla/5.0",
					"success": function(data){
						// console.log(data);
					},
					"complete": function(data, code){
						// console.log(data);
						try {
							// console.log(data);
							rtn = JSON.parse(data);
							// console.log(rtn);
						} catch (e) {
							rtn = false;
						}
						rlv();
					}
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// 返却
				// console.log(rtn);
				res
					.status(200)
					.set('Content-Type', 'text/json')
					.send( JSON.stringify(rtn) )
					.end();
				rlv();
			}); })
		;

		return;
	};

}
