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
					keyword = $this.val();
					_this.redrawPageList( function(){
						console.log('refreshed.');
					} );
				}, 500);
			});
			_this.redrawPageList( function(){
				callback();
			} );
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
	this.updatePageList = function(callback){
		callback = callback || function(){};
		$cont.html('<div class="px2-loading"></div>');
		$.get(
			'/apis/getSitemap',
			{},
			function(sitemap){
				_this.sitemap = sitemap;
				// console.log(sitemap);
				_this.redrawPageList( function(){
					callback();
				} );

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

		console.log('/apis/getNavigationInfo?page_path='+encodeURIComponent(current_page));

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
				$cont.find('a,button').on('click', function(e){
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

					}else{
						current_page = $this.attr('data-page-path');
						_this.redrawPageList();
						return false;
					}
				});

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
		it79.fnc({},[
			function(it1, arg){
				if( _this.sitemap !== false ){
					// すでにサイトマップがロードされていたらスキップ
					it1.next(arg);
					return;
				}
				_this.updatePageList(function(){
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
							.append( $('<th>').text('担当者') )
							.append( $('<th>').text('編集モード') )
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

				for( var path in sitemap ){
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
								!isMatchKeywords(sitemap[path].title_full) &&
								!isMatchKeywords(sitemap[path].assignee)
							){
								console.log('=> skiped.');
								return;
							}
						}


						var $spanAssignee = $('<span>');
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
										openEditor( $(this).attr('data-page-path') );
										return false;
									})
								)
							)
							.append( $('<td>')
								// パス
								.append( $('<span>')
									.text(sitemap[path].path)
								)
							)
							.append( $('<td>')
								// 担当者
								.append( $spanAssignee.text((function(pageInfo){
									// console.log(pageInfo);
									var rtn = (pageInfo.assignee ? pageInfo.assignee : '---');
									try {
										rtn = (pageInfo.user_info.name + ' (' +  pageInfo.assignee + ')' || '---')
									} catch (e) {
									}
									return rtn;
								})( sitemap[path] )) )
							)
							.append( $('<td>')
								// 編集モード
								.append( $spanEditorType.html((function(editorType){
									var editorTypeId = {
										'html' : 'html',
										'md' : 'md',
										'txt' : 'txt',
										'jade' : 'jade',
										'html.gui' : 'html-gui',
										'.not_exists' : 'not-exists',
										'.page_not_exists' : 'page-not-exists'
									};
									var src = '<span class="px2-editor-type__'+editorTypeId[editorType]+' px2-editor-type--fullwidth"></span>';
									return (editorTypeId[editorType] ? src : '---');
								})( sitemap[path].editorType )) )
							)
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

				}
				it1.next(arg);
				return;
			},
			function(it1, arg){
				callback();
			}
		]);



	}

})();
