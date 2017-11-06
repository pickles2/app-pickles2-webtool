/**
 * getPageInfo.js
 */
module.exports = function(conf){

	var Px2CE = require('pickles2-contents-editor');
	var px2proj = require('px2agent').createProject(conf.px2server.path);
	var Promise = require('es6-promise').Promise;

	var rtn = {};

	return function(req, res, next){

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				px2proj.get_page_info(req.param('page_path'), function(page_info){
					// console.log(page_info);
					rtn.page_info = page_info;
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				var px2ce = new Px2CE();
				px2ce.init(
					{
						'page_path': req.param('page_path'),
						'appMode': 'web', // 'web' or 'desktop'. default to 'web'
						'entryScript': require('path').resolve(conf.px2server.path),
						'customFields': {
						} ,
						'log': function(msg){
						}
					},
					function(){
						px2ce.checkEditorType(function(value){
							rtn.editorType = value;
							// console.log(rtn);
							rlv();
						});
					}
				);

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
