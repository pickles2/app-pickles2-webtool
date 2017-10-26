window.jQuery = window.$ = require('jquery');
window.ejs = require('ejs');

window.main = new (function(){
	var _this = this;
	var it79 = require('iterate79');
	var socket = io();
	this.cmdQueue = new CmdQueue(
		{
			'gpiBridge': function(message, done){
				// クライアントからサーバーへのメッセージ送信を仲介

				var data = '';
				$.ajax({
					'url': '/apis/cmdQueue',
					'data': {
						'message': message
					},
					'success': function(result){
						data += result;
					},
					'complete': function(){
						var result = JSON.parse(data);
						done(result);
					}
				});
			}
		}
	);
	socket.on('cmd-queue-message', function(message){
		cmdQueue.gpi(message);
	});

	this.progress = new (require('../../common/scripts/main.progress.js')).init(this, $);
	this.message = require('../../common/scripts/main.message.js');
	require('../../common/scripts/main.dialog.js')(this);
	this.project = new (require('../../common/scripts/main.project.js'))(this);
	this.git = function(){
		return new (require('../../common/scripts/main.project.git.js'))(this);
	}
	var loginUserInfo;

	var $header, $contents, $footer, $shoulderMenu;
	var _menu;

	/**
	 * ログアウトする
	 */
	this.logout = function(){
		var $this = $(this);

		$.ajax({
			'type': 'POST',
			'url': '/apis/logout',
			'success': function(data, dataType){
				window.location.href = '/logout.html';
			},
			'complete': function(xhr, textStatus){
			}
		});
	} // logout()

	/**
	 * ヘルプページへ遷移する
	 */
	this.openHelp = function(){
		window.open('http://pickles2.pxt.jp/manual/');
		return;
	}

	/**
	 * サブアプリケーション
	 */
	this.subapp = function(appName){
		if(!appName){
			appName = 'fncs/home/index.html';
		}
		window.location.href = '/'+appName;
	}

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

	/**
	 * ログインユーザーの情報を取得する
	 */
	this.getLoginUserInfo = function(){
		return loginUserInfo;
	}

	$(function(){
		it79.fnc({}, [
			function(it, arg){
				_this.project.getConfig(function(conf){
					// console.log(conf);

					$('header.theme-header .theme-header__id div').text(conf.name);
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

				// ログインユーザー情報取得
				$.ajax({
					'type': 'POST',
					'url': '/apis/getLoginUserInfo',
					'success': function(data, dataType){
						loginUserInfo = data;
					},
					'complete': function(xhr, textStatus){
						it.next(arg);
					}
				});

			} ,
			function(it, arg){
				// メニュー設定
				var gmenu = require('../../common/scripts/globalmenu.js');
				_menu = new gmenu(_this);
				it.next(arg);
			} ,
			function(it, arg){
				// メニュー設定
				$('.theme-header__gmenu').html( $('<ul>')
					.append( $('<li>')
						.append( '<span>&nbsp;</span>' )
					)
				);
				_menu.drawGlobalMenu($shoulderMenu, window.location.pathname);
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
