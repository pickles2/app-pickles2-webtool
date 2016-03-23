/**
 * getServerConf.js
 */
module.exports = function(conf){

	return function(req, res, next){
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);

		// console.log(conf);
		var config = {};
		config.origin = conf.origin;
		config.originParsed = conf.originParsed;
		config.px2server = {};
		config.px2server.origin = conf.px2server.origin;
		config.px2server.originParsed = conf.px2server.originParsed;
		res.status(200);
		res.set('Content-Type', 'text/json')
		res.send(JSON.stringify(config)).end();
		return;
	};


}
