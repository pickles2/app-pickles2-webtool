(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * globamenu.js
 *
 * `px.lb` は、多言語対応機能です。
 * `app/common/language/language.csv` にある言語ファイルから、
 * ユーザーが選択した言語コードに対応するテキストを取り出します。
 */
module.exports = function(main){
	var _menu = [];
	_menu.push({
		"label":'ホーム',
		"cond":"projectSelected",
		"area":"mainmenu",
		"app":"fncs/home/index.html",
		"click": function(){
			main.subapp();
		}
	});
	_menu.push({
		"label":'コンテンツ',
		"cond":"pxStandby",
		"area":"mainmenu",
		"app":"fncs/pages/index.html",
		"click": function(){
			main.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":'ヘルプ',
		"cond":"always",
		"area":"shoulder",
		"app":null,
		"click": function(){
			main.openHelp();
		}
	});
	_menu.push({
		"label":'ログアウト',
		"cond":"always",
		"area":"shoulder",
		"app":null,
		"click": function(){
			main.logout();
		}
	});

	/**
	 * グローバルメニューの定義を取得
	 */
	this.getGlobalMenuDefinition = function(){
		return _menu;
	}

	/**
	 * グローバルメニューを描画
	 */
	this.drawGlobalMenu = function($shoulderMenu, _current_app){
		$shoulderMenu.find('ul').html('');

		_current_app = _current_app.replace(/^\//, '');
		_current_app = _current_app.replace(/\/$/, '/index.html');

		for( var i in _menu ){
			if( _menu[i].cond == 'projectSelected' ){
			}else if( _menu[i].cond == 'composerJsonExists' ){
			}else if( _menu[i].cond == 'homeDirExists' ){
			}else if( _menu[i].cond == 'pxStandby' ){
			}else if( _menu[i].cond != 'always' ){
			}

			var $tmpMenu = $('<a>')
				.attr({"href":"javascript:;"})
				.on('click', _menu[i].click)
				.text(_menu[i].label)
				.data('app', _menu[i].app)
				.addClass( ( _current_app==_menu[i].app ? 'current' : '' ) )
			;

			switch( _menu[i].area ){
				case 'shoulder':
					$shoulderMenu.find('ul').append( $('<li>')
						.append( $tmpMenu )
					);
					break;
				default:
					$('.theme-header__gmenu ul').append( $('<li>')
						.append( $tmpMenu )
					);
					break;
			}
		}

		var $tmpMenu = $('<span>')
			.text(''+main.getLoginUserInfo().name+' さん')
			.addClass('theme-header__gmenu__login-user')
		;
		$('.theme-header__gmenu ul').append( $('<li>')
			.append( $tmpMenu )
		);

		return;
	}

}

},{}]},{},[1])