/**
 * accessRestrictor.js
 */
module.exports = function(conf){
	var allowFrom = false;
	try {
		allowFrom = conf.allowFrom;
		if( allowFrom === null || allowFrom === undefined ){
			allowFrom = false;
		}
		if( typeof(allowFrom)===typeof('') && allowFrom.length ){
			allowFrom = [allowFrom];
		}
		if( typeof(allowFrom)!==typeof([]) || !allowFrom.length ){
			// 制限をかけない
			allowFrom = false;
		}
	} catch (e) {
	}
	// console.log(allowFrom);

	/**
	 * IPアクセス制限
	 * @param {[type]} app [description]
	 */
	this.setAccessRestriction = function(app){
		console.log('--- Set Access Restriction:');

		if( !allowFrom ){
			// 制限をかけない
			console.log('AllowFrom: All');
			return;
		}
		console.log('AllowFrom:', allowFrom);

		app.set('trust proxy', allowFrom);
		app.use('/*', function(req, res, next){
			// console.log(req.ip);
			// console.log(req.connection.remoteAddress);

			var isAllowed = false;
			for(var idx in allowFrom){
				if(allowFrom[idx] == req.ip){
					isAllowed = true;
					break;
				}
			}

			if( !isAllowed ){
				res
					.set('Content-Type', 'text/html')
					.status(403)
					.type('html')
					.send('Not allowed IP address. (' + req.ip + ')')
					.end()
				;
				return;
			}

			next();
			return;
		} );
	}

}
