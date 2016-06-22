(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * progress window
 */
module.exports.init = function( px, $ ) {
	// この機能は、画面全体をロックしてプログレス画面を表示します。
	// プログレス画面を表示している間は、キーボードやマウスの操作を受け付けません。
	// 見えないフォーム `$keycatcher` にフォーカスを当て、キーボード操作を拾って捨てています。

	var htmlProgress = ''
		+'<progress class="progress progress-striped progress-animated" value="100" max="100"></progress>'+"\n"
	;

	var _this = this;
	var $keycatcher = $('<input>');
	var $progress = $('<div>')
		.append( $keycatcher
			.css({
				'border':'none',
				'background':'transparent',
				'opacity':'0.1'
			})
			.bind( 'keydown', function(e){
				// console.log('keydown');
				px.message('キーボード操作をキャンセルしました。');

				e.preventDefault();
				e.stopPropagation();
				return false;
			} )
		)
		.bind( 'mousedown', function(e){stopKeyboard();} )
		.bind( 'mouseup', function(e){stopKeyboard();} )
		.bind( 'click', function(e){stopKeyboard();} )
		.append( $('<div class="px2dt-progress-bar">')
			.css({
				'width': '600px',
				'max-width': '80%',
				'margin': 'auto auto'
			})
			.append( $('<div>')
				.html(htmlProgress)
			)
			.append( $('<div>')
				.css({
					'color':'#fff',
					'text-align': 'center'
				})
				.html('しばらくお待ちください...')
			)
		)
	;

	function stopKeyboard(){
		$keycatcher.focus();
	}

	/**
	 * プログレス画面を表示
	 */
	this.start = function( options ){
		options = (options?options:{});
		$progress
			.css({
				'background': (options.blindness?'rgba(0, 0, 0, 0.5)':'rgba(0, 0, 0, 0)'),
				'width': $(window).width(),
				'height': $(window).height(),
				'position': 'fixed',
				'top': 0, 'left': 0,
				'z-index': 15000
			})
		;
		if( options.showProgressBar ){
			$progress.find('.px2dt-progress-bar').show();
		}else{
			$progress.find('.px2dt-progress-bar').hide();
		}
		$('body').append( $progress );
		stopKeyboard();
		return this;
	}

	/**
	 * プログレス画面を閉じる
	 */
	this.close = function(){
		$progress.remove();
		return this;
	}

	$(window).resize(function(){
		$progress
			.css({
				'width': $(window).width(),
				'height': $(window).height()
			})
		;
	});

	return this;
};

},{}]},{},[1])