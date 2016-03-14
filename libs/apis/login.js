/**
 * login.js
 */
module.exports = function(conf){

	return function(req, res, next){
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);
		var userInfo = req.userInfo;
		if( userInfo === false ){
			res.status(403);
			res.send('Forbidden').end();
			return;
		}
		res.status(200);
		res.send('OK').end();
		return;
	};


}
