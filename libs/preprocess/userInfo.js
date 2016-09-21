/**
 * userInfo.js
 */
module.exports = function(px2){

	return function(req, res, next){
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);
		// console.log(req.session);
		req.userInfo = false;
		if(req.session.userInfo){
			req.userInfo = req.session.userInfo;
		}
		next();
		return;
	};

}
