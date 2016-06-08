/**
 * getUserInfo.js
 */
module.exports = function(conf){

	return function(req, res, next){
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);
		// console.log(req.session);
		req.userInfo = {};

		if(req.method.toLowerCase() == 'get'){
			if( typeof(req.param('id')) == typeof('') ){
				getUserInfo(req.param('id'), function(userInfo){
					// console.log(userInfo);
					delete(userInfo.pw);//パスワードは忘れる
					res.status(200);
					res.set('Content-Type', 'text/json')
					res.send(JSON.stringify(userInfo)).end();
					return;
				});
				return;
			}
		}

		res.status(401);
		res.set('Content-Type', 'text/json')
		res.send(JSON.stringify({'error':'パラメーターが不正です'})).end();
		return;
	};

	function getUserInfo(id, callback){
		callback = callback || function(){};
		var pathCsv = require('path').resolve(__dirname, '../../config/userlist.csv');
		// console.log(pathCsv);
		var findInCsv = new (require('find-in-csv'))(
			pathCsv ,
			{
				"require": ['id']
			}
		);
		// console.log(id);
		// console.log(pw);
		// console.log(findInCsv);

		findInCsv.get(
			{'id':id},
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
