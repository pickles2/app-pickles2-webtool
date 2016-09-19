/**
 * login.js
 */
module.exports = function(px2){

	return function(req, res, next){
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);

		req.userInfo = false;

		if(req.method.toLowerCase() == 'post'){
			if( typeof(req.body.id) == typeof('') && typeof(req.body.pw) == typeof('') ){
				px2.login(req.body.id, req.body.pw, function(userInfo){
					// console.log(userInfo);
					req.userInfo = req.session.userInfo = userInfo;
					if( userInfo === false ){
						res.status(403);
						res.send('Forbidden').end();
						return;
					}
					res.status(200);
					res.send('OK').end();
					return;
				});
				return;
			}
		}

		if(req.session.userInfo){
			req.userInfo = req.session.userInfo;
		}

		// console.log(req.userInfo);
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
