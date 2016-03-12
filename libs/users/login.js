/**
 * login.js
 */
module.exports = function(){

	return function(req, res, next){
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);
		var id = req.body.id;
		var pw = req.body.pw;

		var findInCsv = new (require('find-in-csv'))(__dirname+'/../../data/users/userlist.csv');
		// console.log(findInCsv);

		findInCsv.get(
			{'id':id, 'pw':pw},
			function(userInfo){
				if( userInfo === false ){
					res.status(403);
					res.send('Forbidden').end();
					return;
				}
				res.status(200);
				res.send('OK').end();
				return;
			}
		);

		return;
	};


}
