/**
 * pickles2ContentsEditorGpi.js
 */
module.exports = function(conf){

	var Px2CE = require('pickles2-contents-editor');

	return function(req, res, next){

		var px2ce = new Px2CE();
		px2ce.init(
			{
				'entryScript': require('path').resolve(conf.px2server.path)
			},
			function(){
				px2ce.gpi(req.body.data, function(value){
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
