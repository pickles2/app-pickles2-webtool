/**
 * applock.js
 */
module.exports = function(conf){
	var memory = {};

	return function(req, res, next){

		req.applock = new(function(){
			this.lock = function(path){
				console.log(memory);
				var now = Math.floor( (new Date()).getTime()/1000 );
				// console.log(now);
				if(memory[path] && req.userInfo.id != memory[path].user){
					if( memory[path].time > now - 60*5 ){
						return false;
					}
				}
				memory[path] = {
					'user': req.userInfo.id,
					'time': now
				};
				return true;
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
