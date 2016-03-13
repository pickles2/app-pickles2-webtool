/**
 * userInfo.js
 */
module.exports = function(){

	return function(req, res, next){
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);
		// console.log(req.session);
		req.userInfo = {};

		if(req.method.toLowerCase() == 'post'){
			if( typeof(req.body.id) == typeof('') && typeof(req.body.pw) == typeof('') ){
				login(req.body.id, req.body.pw, function(userInfo){
					// console.log(userInfo);
					delete(userInfo.pw);//パスワードは忘れる
					req.userInfo = req.session.userInfo = userInfo;
					next();
					return;
				});
				return;
			}
		}

		req.userInfo = req.session.userInfo;
		next();
		return;
	};

	function login(id, pw, callback){
		callback = callback || function(){};
		var pathCsv = require('path').resolve(__dirname, '../../data/users/userlist.csv');
		// console.log(pathCsv);
		var findInCsv = new (require('find-in-csv'))(pathCsv);
		// console.log(id);
		// console.log(pw);
		// console.log(findInCsv);

		findInCsv.get(
			{'id':id, 'pw':pw},
			function(userInfo){
				// console.log(findInCsv);
				// console.log(userInfo);
				callback(userInfo);
				return;
			}
		);
		return;

	}

}
