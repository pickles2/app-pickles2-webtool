window.jQuery = window.$ = require('jquery');
window.ejs = require('ejs');

window.main = new (function(){
	var _this = this;
	var _it79 = require('iterate79');

	this.progress = new (require('../../common/scripts/main.progress.js')).init(this, $);
	this.message = require('../../common/scripts/main.message.js');
	require('../../common/scripts/main.dialog.js')(this);
	this.project = new (require('../../common/scripts/main.project.js'))(this);
	this.git = function(){
		return new (require('../../common/scripts/main.project.git.js'))(this);
	}

	var $header, $contents, $footer, $shoulderMenu;

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

	$(function(){
		_it79.fnc({}, [
			function(it, arg){
				_this.project.getConfig(function(conf){
					// console.log(conf);

					$('header.theme-header .theme-header__id a').text(conf.name);
					it.next(arg);
				});
			} ,
			function(it, arg){

				// DOMスキャン
				$header   = $('.theme-header');
				$contents = $('.contents');
				$footer   = $('.theme-footer');
				$shoulderMenu = $('.theme-header__shoulder-menu');

				it.next(arg);

			} ,
			function(it, arg){
				var $ul = $shoulderMenu.find('ul').hide();
				$shoulderMenu
					.css({
						'width': 50,
						'height': $header.height()
					})
					.on('click', function(){
						if( $ul.css('display') == 'block' ){
							$ul.hide();
							$shoulderMenu
								.css({
									'width':50 ,
									'height':$header.height()
								})
							;

						}else{
							$ul.show().height( $(window).height()-$header.height() );
							$shoulderMenu
								.css({
									'width':'100%' ,
									'height':$(window).height()
								})
							;

						}
					}
				);
				it.next(arg);
			}
		]);

		window.focus();
	});

})();
