(function(module){
	var $ = require('jquery');
	var $dialog;

	module.exports = function(px){

		/**
		 * ダイアログを表示する
		 */
		px.dialog = function(opt){
			px.closeDialog();

			opt = opt||{};
			opt.title = opt.title||'command:';
			opt.body = opt.body||$('<div>');
			opt.buttons = opt.buttons||[
				$('<button class="btn btn-primary">').text('OK').click(function(){
					px.closeDialog();
				})
			];

			for( var i in opt.buttons ){
				var $btnElm = $(opt.buttons[i]);
				$btnElm.each(function(){
					if(!$(this).hasClass('btn')){
						$(this).addClass('btn').addClass('btn-secondary');
					}
				});
				opt.buttons[i] = $btnElm;
			}

			var $dialogButtons = $('<div class="dialog-buttons">').append(opt.buttons);

			$dialog = $('<div>')
				.addClass('contents')
				.css({
					'position':'fixed',
					'left':0, 'top':0,
					'width': $(window).width(),
					'height': $(window).height(),
					'overflow':'hidden',
					'z-index':10000
				})
				.append( $('<div>')
					.css({
						'position':'fixed',
						'left':0, 'top':0,
						'width':'100%', 'height':'100%',
						'overflow':'hidden',
						'background':'#000',
						'opacity':0.5
					})
				)
				.append( $('<div>')
					.css({
						'position':'absolute',
						'left':0, 'top':0,
						'padding-top':'4em',
						'overflow':'auto',
						'width':"100%",
						'height':"100%"
					})
					.append( $('<div>')
						.addClass('dialog_box')
						.css({
							'width':'80%',
							'margin':'3em auto'
						})
						.append( $('<h1>')
							.text(opt.title)
						)
						.append( $('<div>')
							.append(opt.body)
						)
						.append( $dialogButtons )
					)
				)
			;

			$('body')
				.append($dialog)
			;
			$('body .theme_wrap')
				// .addClass('filter')
				// .addClass('filter-blur')//描画がおかしくなるから一旦やめ。
			;
			return $dialog;
		}//dialog()

		/**
		 * ダイアログを閉じる
		 */
		px.closeDialog = function(){
			if( $dialog ){
				$dialog.remove();
				$('body .theme_wrap')
					.removeClass('filter-blur')
				;
			}
			return $dialog;
		}//closeDialog()
	}



	/**
	 * イベントリスナー
	 */
	$(window).on( 'resize', function(e){
		if( typeof($dialog) !== typeof( $('<div>') ) ){return;}
		$dialog
			.css({
				'width': $(window).width(),
				'height': $(window).height()
			})
		;
	} );

})(module);
