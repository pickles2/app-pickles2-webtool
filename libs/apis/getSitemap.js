/**
 * getSitemap.js
 */
module.exports = function(conf){

	return function(req, res, next){
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);
		var px2proj = require('px2agent').createProject(conf.px2server.path);
		px2proj.get_sitemap(function(sitemap){
			// console.log(sitemap);
			res.status(200);
			res.set('Content-Type', 'text/json')
			res.send(JSON.stringify(sitemap)).end();
		});
		return;
	};


}
