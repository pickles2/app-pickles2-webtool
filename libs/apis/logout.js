/**
 * logout.js
 */
module.exports = function(){

	return function(req, res, next){
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);
		req.userInfo = undefined;
		req.session.destroy(function(err) {
			res.status(200);
			res.send('Logout OK').end();
		})
		return;
	};


}
