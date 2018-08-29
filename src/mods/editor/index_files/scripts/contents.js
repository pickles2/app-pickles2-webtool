$(window).load(function(){

	var params = window.main.parseUriParam(window.location.href);
	// console.log(params);

	var it79 = require('iterate79');
	var $canvas = $('#canvas');
	var serverConfig;
	var px2dtGitUi = new window.px2dtGitUi(window.main);
	var $msgBox = $('<div class="theme_ui_px_message">');
	$msgBox
		.css({
			'pointer-events': 'none'
		})
	;

	/**
	* window.resized イベントハンドラ
	*/
	var windowResized = function(callback){
		callback = callback || function(){};
		$canvas
			.height( $(window).height() - 0 )
		;
		callback();
		return;
	}

	it79.fnc({},[
		function(it1){
			$(window).on('beforeunload', function(){
				// chromeでは表示されない
				return "編集中の変更は記録されませんがよろしいですか？";
			});
			$(function(){
				$('body').append($msgBox);
			});
			it1.next();
		} ,
		function(it1){
			lock(function(lockResult){
				// console.log(lockResult);
				if( !lockResult.result ){
					$canvas
						.html('')
						.append($('<div class="container" style="margin-top:3em;">')
							.append('<h1>LOCKED</h1>')
							.append('<p>このコンテンツは編集中のためロックされています。</p>')
							.append($('<dl>')
								.append($('<dt>').text('編集中のユーザー'))
								.append($('<dd>').text(lockResult.lockInfo.user))
								.append($('<dt>').text('最終アクセス時刻'))
								.append($('<dd>').text(new Date(lockResult.lockInfo.time*1000)))
								.append($('<dt>').text('ロックが自動解除される時刻'))
								.append($('<dd>').text(new Date((lockResult.lockInfo.time + 60*10)*1000)))
							)
							.append('<p>ロックは、編集者が「完了」ボタンを押すか、最終アクセス時刻から 10分後 に自動解除されます。</p>')
						)
					;
					return;
				}
				it1.next();
			});
		} ,
		function(it1){

			var pickles2ContentsEditor = new Pickles2ContentsEditor();
			$.ajax({
				"url": "/apis/getServerConf",
				"type": 'get',
				'data': {},
				"success": function(_serverConfig){
					serverConfig = _serverConfig;

					windowResized(function(){
						pickles2ContentsEditor.init(
							{
								'page_path': params.page_path ,
								'elmCanvas': $canvas.get(0),
								'lang': 'ja',
								'preview':{
									'origin': serverConfig.px2server.origin
								},
								'gpiBridge': function(input, callback){
									// GPI(General Purpose Interface) Bridge
									// broccoliは、バックグラウンドで様々なデータ通信を行います。
									// GPIは、これらのデータ通信を行うための汎用的なAPIです。
									$.ajax({
										"url": "/apis/pickles2ContentsEditorGpi",
										"type": 'POST',
										'data': {'page_path':params.page_path, 'data':JSON.stringify(input)},
										"success": function(data){
											// console.log(data);
											callback(data);
										}
									});
									return;
								},
								'complete': function(){
									// progressの表示
									window.main.progress.start({'blindness': true, 'showProgressBar': true});

									// コミット
									px2dtGitUi.commit(
										'contents',
										{'page_path': params.page_path, 'comment':'新しいコミット：'},
										function(ret){
											switch (ret) {
												case 'commited':
													unlock(function(lockResult){
														// console.log(lockResult);
														if( !lockResult.result ){
															alert('[ERROR] 編集状態の解除に失敗しました。');
															return;
														}
														$(window).off('beforeunload');
														window.close();
													});
													break;
												case 'unchanged':
													$(window).off('beforeunload');
													window.close();
													break;
												case 'cancel':
													$(window).off('beforeunload');
													window.close();
													break;
												case 'error':
													// 画面は閉じない
													break;
												default:
													// 画面は閉じない
													break;
											}

											// プログレスの表示終了
											window.main.progress.close();
										}
									);
								},
								'onClickContentsLink': function( uri, data ){
									// alert('編集: ' + uri);
								},
								'onMessage': function( message ){
									// ユーザーへ知らせるメッセージを表示する
									console.info('message: '+message);
									showMessage( message );
									// alert(message);
								}
							},
							function(){

								$(window).resize(function(){
									// このメソッドは、canvasの再描画を行います。
									// ウィンドウサイズが変更された際に、UIを再描画するよう命令しています。
									windowResized(function(){
										pickles2ContentsEditor.redraw();
									});
								});

								it1.next();
							}
						);

					});
				}
			});
		} ,
		function(it1){
			console.info('standby!!');
			it1.next();
		}
	]);



	/**
	 * 編集を排他ロックする
	 */
	function lock(callback){
		callback = callback || function(){};
		$.ajax({
			"url": "/apis/applock",
			"type": 'post',
			'data': {
				"method": 'lock',
				"page_path": params.page_path
			},
			"success": function(lockResult){
				callback(lockResult);
			}
		});
	}

	/**
	 * 編集の排他ロックを解除する
	 */
	function unlock(callback){
		callback = callback || function(){};
		$.ajax({
			"url": "/apis/applock",
			"type": 'post',
			'data': {
				"method": 'unlock',
				"page_path": params.page_path
			},
			"success": function(lockResult){
				callback(lockResult);
			}
		});
	}

	/**
	 * メッセージ
	 */
	function showMessage( message, opt ){
		opt = opt || {};
		opt.complete = opt.complete || function(){};
		var $newMsg = $('<div>')
			.text(message)
			.css({
				'background': '#ffd',
				'text-align': 'center',
				'border': '1px solid #f93',
				'color': '#f93',
				'padding': 4,
				'margin': "10px 40px"
			})
			.hide()
		;
		$msgBox.append(
			$newMsg
				.hide()
				.fadeIn('slow', function(){
					setTimeout(function(){
						$newMsg
							.animate({
								"font-size": 0 ,
								"opacity": 0.5 ,
								"height": 0 ,
								'padding': 0,
								'margin-bottom': 0
							}, {
								duration: "slow",
								easing: "linear",
								complete: function(){
									$newMsg.remove();
									opt.complete();
								}
							})
						;
					}, 3000);
				})
		);
		return this;
	}

});
