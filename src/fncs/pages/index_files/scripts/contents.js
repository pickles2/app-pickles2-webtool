window.cont = new (function(){
	var _this = this;
	var it79 = require('iterate79');
	var $cont = $('.contents');
	var ejs = require('ejs');

	var px2dtGitUi = new window.px2dtGitUi(window.main);
	var timerFilter;
	var keyword = '';
	var current_page = '';
	_this.sitemap = false;
	_this.userList = false;

	/**
	 * 画面を初期化
	 */
	this.init = function(callback){
		callback = callback || function(){};

		$(window).load(function(){
			// ページ検索フォーム
			$('.px2dt-pages-filter').bind('change keyup', function(){
				var $this = $(this);
				clearTimeout(timerFilter);
				timerFilter = setTimeout(function(){
					if( keyword == $this.val() ){
						// 変更されていなかったらスキップ
						return;
					}
					keyword = $this.val();
					_this.redrawPageList( function(){
						console.log('refreshed.');
					} );
				}, 500);
			});

			_this.updateUserList(function(){
				_this.redrawPageList( function(){
					callback();
				} );
			});
		});

	}

	/**
	 * エディタを開く
	 */
	function openEditor(path){
		window.open( '/mods/editor/index.html?page_path='+encodeURIComponent( path ) );
		return;
	}

	/**
	 * ページリストを更新する
	 */
	this.updateSitemap = function(callback){
		callback = callback || function(){};
		$cont.html('<div class="px2-loading"></div>');
		$.get(
			'/apis/getSitemap',
			{},
			function(sitemap){
				_this.sitemap = sitemap;
				// console.log(sitemap);
				callback();
			}
		);
		return;
	}

	/**
	 * ユーザーリストを更新する
	 */
	this.updateUserList = function(callback){
		callback = callback || function(){};
		$cont.html('<div class="px2-loading"></div>');
		$.get(
			'/apis/getUserList',
			{},
			function(userList){
				_this.userList = {};
				for(var idx in userList){
					_this.userList[userList[idx].id] = userList[idx];
				}
				// console.log(_this.userList);
				callback();
			}
		);
		return;
	}

	/**
	 * ページリストを再描画する
	 */
	this.redrawPageList = function(callback){
		callback = callback || function(){}
		keyword = keyword || '';

		$cont.html('<div class="px2-loading"></div>');// コンテンツエリアを一旦消去

		if( keyword.length ){
			// キーワードが指定されていたら、検索結果を表示する。
			drawPageListSearch( function(){
				callback();
			} );
		}else{
			// キーワードがなければ、 パンくずの階層構造をツリーで表示する
			drawPageListTree( function(){
				callback();
			} );
		}
		return;
	}

	/**
	 * キーワードがなければ、 パンくずの階層構造をツリーで表示する。
	 */
	function drawPageListTree(callback){

		// console.log('/apis/getNavigationInfo?page_path='+encodeURIComponent(current_page));

		$.get(
			'/apis/getNavigationInfo?page_path='+encodeURIComponent(current_page),
			{},
			function(navigationInfo){
				// console.log(navigationInfo);
				current_page = navigationInfo.page_info.path;

				var templateSrc = document.getElementById('template-treeview').innerHTML;
				var data = {
					"navigationInfo": navigationInfo
				};
				var template = ejs.compile(templateSrc.toString(), {});
				var html = template(data);

				$cont.html('').append( html );
				$cont.find('a[data-method],button[data-method]').on('click', function(e){
					var $this = $(this);
					var method = $this.attr('data-method');
					if( method == 'edit' ){
						// 編集ボタン
						openEditor( $(this).attr('data-page-path') );
						return false;

					}else if( method == 'commit' ){
						// コミットボタン
						px2dtGitUi.commit(
							'contents',
							{'page_path': $this.attr('data-page-path')},
							function(){
								// alert('complete');
							}
						);
						return false;

					}else if( method == 'log' ){
						// ログボタン
						px2dtGitUi.log(
							'contents',
							{'page_path': $this.attr('data-page-path')},
							function(){
								// alert('complete');
							}
						);
						return false;

					}else if( method == 'preview' ){
						// 見るボタン
						window.open( window.config.urlPreview + $this.attr('data-page-path') );
						return false;

					}else if( method == 'goto' ){
						keyword = '';
						current_page = $this.attr('data-page-path');
						_this.redrawPageList();
						return false;
					}
				});

				var $dropdownMenu = $('.cont_page-dropdown-menu');
				$dropdownMenu.append($('<li>')
					.append($('<a>')
						.text('他のページから複製して取り込む')
						.attr({
							'data-path': current_page ,
							'href':'javascript:;'
						})
						.on('click', function(e){
							$cont.find('.dropdown-toggle').click();
							if( !confirm('現状のコンテンツを破棄し、他のページを複製して取り込みます。よろしいですか？') ){
								return false;
							}

							var $this = $(this);
							var $body = $('<div>')
								.append( $('#template-copy-from-other-page').html() )
							;
							var $input = $body.find('input');
							var $list = $body.find('.cont_sample_list')
								.css({
									'overflow': 'auto',
									'height': 200,
									'background-color': '#f9f9f9',
									'border': '1px solid #bbb',
									'padding': 10,
									'margin': '10px auto',
									'border-radius': 5
								})
							;
							$input.on('change', function(){
								var val = $input.val();
								$list.html('<div class="px2-loading"></div>');
								main.project.pxCommand(
									'/',
									'px2dthelper.search_sitemap',
									{
										'keyword': val
									},
									function(page_list){
										var $ul = $('<ul>')
										for(var i in page_list){
											var $li = $('<li>')
											$li.append( $('<a>')
												.text(page_list[i].path)
												.attr({
													'href': 'javascript:;',
													'data-path': page_list[i].path
												})
												.on('click', function(e){
													var path = $(this).attr('data-path');
													$input.val(path);
												})
											);
											$ul.append($li);
										}
										$list.html('').append($ul);
									}
								);
							});

							px2style.modal(
								{
									'title': '他のページから複製',
									'body': $body,
									'buttons': [
										$('<button>')
											.text('OK')
											.addClass('px2-btn')
											.addClass('px2-btn--primary')
											.on('click', function(){
												var page_path = $input.val();
												console.log(page_path);

												main.project.pxCommand(
													page_path,
													'px2dthelper.get.all',
													{},
													function(pageAllInfo){
														var pageinfo = pageAllInfo.page_info;
														// console.log(pageAllInfo);
														if( !pageinfo ){
															alert('存在しないページです。');
															return false;
														}
														// console.log($this.attr('data-path'));
														// console.log(pageinfo.path);
														main.project.pxCommand(
															'/',
															'px2dthelper.copy_content',
															{
																'from': pageinfo.path,
																'to': $this.attr('data-path')
															},
															function(result){
																console.log(result);

																if( !result[0] ){
																	alert('コンテンツの複製に失敗しました。'+result[1]);
																	return;
																}
																_this.redrawPageList( function(){
																	px2style.closeModal();
																} );
															}
														);
													}
												);

											}),
										$('<button>')
											.text('Cancel')
											.addClass('px2-btn')
											.on('click', function(){
												px2style.closeModal();
											})
									]
								},
								function(){
									console.log('done.');
								}
							);
						})
					)
				);

				callback();
				return;
			}
		);
		return;
	}

	/**
	 * キーワードが指定されていたら、検索結果を表示する。
	 */
	function drawPageListSearch(callback){
		var listMaxCount = 100;
		it79.fnc({},[
			function(it1, arg){
				if( _this.sitemap !== false ){
					// すでにサイトマップがロードされていたらスキップ
					it1.next(arg);
					return;
				}
				_this.updateSitemap(function(){
					it1.next(arg);
				});
				return;
			},
			function(it1, arg){
				var sitemap = _this.sitemap;
				// console.log(sitemap);
				var $ul = $('<table class="table table-striped table-sm table-hover cont_pagelist">');
				$cont.html('').append( $('<div>')
					.addClass('table-responsive')
					.append($ul)
				);
				$ul
					.append( $('<thead>')
						.append( $('<tr>')
							.append( $('<th>').text('ページID') )
							.append( $('<th>').text('タイトル') )
							.append( $('<th>').text('ページのパス') )
							// .append( $('<th>').text('編集モード') )
							.append( $('<th>').text('-') )
							.append( $('<th>').text('-') )
							.append( $('<th>').text('プレビュー') )
						)
					)
				;

				function isMatchKeywords(target){
					if( typeof(target) != typeof('') ){
						return false;
					}
					if( target.match(keyword) ){
						return true;
					}
					return false;
				}

				var hitCount = 0;
				it79.ary(
					sitemap,
					function(it2, page_info, path){

						(function($ul, sitemap, path){
							if( keyword.length ){
								if(
									!isMatchKeywords(sitemap[path].id) &&
									!isMatchKeywords(sitemap[path].path) &&
									!isMatchKeywords(sitemap[path].content) &&
									!isMatchKeywords(sitemap[path].title) &&
									!isMatchKeywords(sitemap[path].title_breadcrumb) &&
									!isMatchKeywords(sitemap[path].title_h1) &&
									!isMatchKeywords(sitemap[path].title_label) &&
									!isMatchKeywords(sitemap[path].title_full)
								){
									console.log('=> skiped.');
									return;
								}
							}

							hitCount ++;
							if( hitCount > listMaxCount ){
								return;
							}

							var $spanEditorType = $('<span>');
							var $li = $('<tr>');
							$li
								.attr({
									'data-page-path': path
								})
								.css({
									'cursor': 'default'
								})
								.on('dblclick', function(e){
									openEditor( $(this).attr('data-page-path') );
									return false;
								})
								.append( $('<th>')
									// ページID
									.append( $('<span>')
										.text(sitemap[path].id)
									)
								)
								.append( $('<td>')
									// タイトル
									.append( $('<a>')
										.text(sitemap[path].title)
										.attr({
											'href': 'javascript:;',
											'data-page-path': path
										})
										.on('click', function(){
											keyword = '';
											current_page = $(this).attr('data-page-path');
											_this.redrawPageList();
											return false;
											// openEditor( $(this).attr('data-page-path') );
											// return false;
										})
									)
								)
								.append( $('<td>')
									// パス
									.append( $('<span>')
										.text(sitemap[path].path)
									)
								)
								// .append( $('<td>')
								// 	// 編集モード
								// 	.append( $spanEditorType.html((function(editorType){
								// 		var editorTypeId = {
								// 			'html' : 'html',
								// 			'md' : 'md',
								// 			'txt' : 'txt',
								// 			'jade' : 'jade',
								// 			'html.gui' : 'html-gui',
								// 			'.not_exists' : 'not-exists',
								// 			'.page_not_exists' : 'page-not-exists'
								// 		};
								// 		var src = '<span class="px2-editor-type__'+editorTypeId[editorType]+' px2-editor-type--fullwidth"></span>';
								// 		return (editorTypeId[editorType] ? src : '---');
								// 	})( sitemap[path].editorType )) )
								// )
								.append( $('<td>')
									// コミットボタン
									.append( $('<a>')
										.attr({'href':'javascript:;'})
										.on('click', function(){
											px2dtGitUi.commit(
												'contents',
												{'page_path': path},
												function(){
													// alert('complete');
												}
											);
										})
										.text('コミット')
									)
								)
								.append( $('<td>')
									// ログボタン
									.append( $('<a>')
										.attr({'href':'javascript:;'})
										.on('click', function(){
											px2dtGitUi.log(
												'contents',
												{'page_path': path},
												function(){
													// alert('complete');
												}
											);
										})
										.text('ログ')
									)
								)
								.append( $('<td>')
									// プレビューボタン
									.append( $('<a>')
										.attr({'href':'javascript:;'})
										.on('click', function(){
											window.open( window.config.urlPreview+path );
											return false;
										})
										.append( $('<span class="icn-preview">')
											.text('見る')
										)
									)
								)
							;

							$ul.append($li);

						})($ul, sitemap, path);

						if( hitCount > listMaxCount ){
							$cont.append( $('<p>')
								.text(listMaxCount+'件までのページを表示しています。 条件を追加して検索結果を絞ってください。')
							);
							it1.next(arg);
							return;
						}
						it2.next();
					},
					function(){
						it1.next(arg);
					}
				);
				return;
			},
			function(it1, arg){
				callback();
			}
		]);



	}

})();
