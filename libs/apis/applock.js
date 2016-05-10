/**
 * applock.js
 */
module.exports = function(conf){

	return function(req, res, next){
		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);

		if( req.body.method == 'lock' ){
			var result = req.applock.lock( req.body.page_path );
			res
				.status(200)
				.set('Content-Type', 'text/json')
				.send( JSON.stringify({
					"method": req.body.method,
					"result": result.result,
					"lockInfo": result.lockInfo
				}) )
				.end();
			return;
		}
		if( req.body.method == 'unlock' ){
			var result = req.applock.unlock(req.body.page_path);
			res
				.status(200)
				.set('Content-Type', 'text/json')
				.send( JSON.stringify({
					"method": req.body.method,
					"result": result
				}) )
				.end();
			return;
		}

		res
			.status(200)
			.set('Content-Type', 'text/json')
			.send( JSON.stringify({
				"method": 'unknown',
				"result": false
			}) )
			.end();
		return;
	};


}
