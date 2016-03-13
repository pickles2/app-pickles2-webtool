/**
 * getLoginUserInfo.js
 */
module.exports = function(){

	return function(req, res, next){
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);
		var userInfo = req.userInfo;
		// console.log( JSON.stringify(userInfo) );

		res.status(200);

		if( !userInfo ){
			res.set('Content-Type', 'text/json')
			res.send('false').end();
			return;
		}

		res.set('Content-Type', 'text/json')
		res.send(JSON.stringify(userInfo)).end();
		return;
	};


}
