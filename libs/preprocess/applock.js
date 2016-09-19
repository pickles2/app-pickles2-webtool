/**
 * applock.js
 */
module.exports = function(px2){
	var memory = {};

	return function(req, res, next){

		req.applock = new(function(){
			this.lock = function(path){
				// console.log(memory);
				var now = Math.floor( (new Date()).getTime()/1000 );
				// console.log(now);
				if(memory[path] && req.userInfo.id != memory[path].user){
					if( memory[path].time > now - 60*10 ){
						return {
							"result": false,
							"lockInfo": memory[path]
						};
					}
				}
				memory[path] = {
					'user': req.userInfo.id,
					'time': now
				};
				return {
					"result": true,
					"lockInfo": memory[path]
				};
			}
			this.unlock = function(path){
				memory[path] = undefined;
				delete(memory[path]);
				return true;
			}
		})();

		next();
		return;
	};

}
