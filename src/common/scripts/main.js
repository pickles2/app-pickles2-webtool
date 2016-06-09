window.jQuery = window.$ = require('jquery');

window.main = new (function(){

	this.progress = new (require('../scripts/main.progress.js')).init(this, $);
	this.message = require('../scripts/main.message.js');
	this.git = function(){
		return new (require('../scripts/main.project.git.js'))(this);
	}

	/**
	 * ログアウトする
	 */
	this.logout = function(){
		var $this = $(this);

		$.ajax({
			'type': 'POST',
			'url': '/apis/logout',
			'success': function(data, dataType){
				window.location.href = '/';
			},
			'complete': function(xhr, textStatus){
			}
		});
	} // logout()

	/**
	 * GETパラメータをパースする
	 */
	this.parseUriParam = function(url){
		var paramsArray = [];
		parameters = url.split("?");
		if( parameters.length > 1 ) {
			var params = parameters[1].split("&");
			for ( var i = 0; i < params.length; i++ ) {
				var paramItem = params[i].split("=");
				for( var i2 in paramItem ){
					paramItem[i2] = decodeURIComponent( paramItem[i2] );
				}
				paramsArray.push( paramItem[0] );
				paramsArray[paramItem[0]] = paramItem[1];
			}
		}
		return paramsArray;
	}

})();
