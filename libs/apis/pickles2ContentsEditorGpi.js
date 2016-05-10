/**
 * pickles2ContentsEditorGpi.js
 */
module.exports = function(conf){

	var Px2CE = require('pickles2-contents-editor');

	return function(req, res, next){
		var lockResult = req.applock.lock( req.body.page_path );
		if( !lockResult ){
			res
				.status(200)
				.set('Content-Type', 'text/json')
				.send( JSON.stringify({}) )
				.end();
			return;
		}

		var px2ce = new Px2CE();
		px2ce.init(
			{
				'page_path': req.body.page_path,
				'appMode': 'web', // 'web' or 'desktop'. default to 'web'
				'entryScript': require('path').resolve(conf.px2server.path),
				'customFields': {
					// 'href': require('./../common/broccoli/broccoli-field-href/server.js'),
					// 'psd': require('broccoli-field-psd'),
					// 'table': require('broccoli-field-table')
				} ,
				'log': function(msg){
					console.log(msg);
				}
			},
			function(){
				px2ce.gpi(JSON.parse(req.body.data), function(value){
					res
						.status(200)
						.set('Content-Type', 'text/json')
						.send( JSON.stringify(value) )
						.end();
				});
			}
		);

		return;
	};

}
