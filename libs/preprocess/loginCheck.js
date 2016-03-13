/**
 * loginCheck.js
 */
module.exports = function(){

	return function(req, res, next){
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);
		var userInfo = req.userInfo;
		// console.log( JSON.stringify(userInfo) );


		if( !userInfo ){
			res.status(403);
			res.set('Content-Type', 'text/plain')
			res.send('Forbidden').end();
			return;
		}

		next();
		return;
	};


}
