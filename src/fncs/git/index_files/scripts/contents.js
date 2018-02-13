window.cont = new (function(){
	var _this = this;
	var $cont = $('.cont-git-status');
	var ejs = require('ejs');

	var px2dtGitUi = new window.px2dtGitUi(window.main);
	
	/**
	 * 画面を初期化
	 */
	this.init = function(callback){
		callback = callback || function(){};

		$(window).load(function(){
			$('.btn-show-status').bind('click', function(){
				_this.updateStatus(function(){
					callback();
				});
			});
		});

	}

	/**
	 * git statusを更新する
	 */
	this.updateStatus = function(callback){
		callback = callback || function(){};

		$cont.html('');

		drawStatusListTree(function(){
			callback();
		});
		
		return;
	}

	/**
	 * git statusのリストを更新する
	 */
	function drawStatusListTree(callback){
		callback = callback || function(){};

		// ステータス表示
		px2dtGitUi.status(
			'contents',
			{},
			function(ret){
				$cont.append( ret );
				callback();
			}
		);

		return;
	}
})();
