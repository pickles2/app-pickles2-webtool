window.cont = new (function(){
	var _this = this;
	var $cont = $('.contents');

	var px2dtGitUi = new window.px2dtGitUi(window.main);
	var timerFilter;

	/**
	 * 画面を初期化
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	this.init = function(callback){
		callback = callback || function(){};

		$(window).load(function(){
			$('.px2dt-pages-filter').bind('change keyup', function(){
				var $this = $(this);
				clearTimeout(timerFilter);
				timerFilter = setTimeout(function(){
					_this.redrawPageList( $this.val(), function(){
						console.log('refreshed.');
					} );
				}, 500);
			});
			_this.updatePageList();
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
		$cont.html('');
		$.get(
			'/apis/getSitemap',
			{},
			function(sitemap){
				_this.sitemap = sitemap;
				_this.redrawPageList( '', function(){
					callback();
				} );

			}
		);

	}

	/**
	 * ページリストを再描画する
	 */
	this.redrawPageList = function(keyword, callback){
		keyword = keyword || '';
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
							.click(function(){
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
						.append( $spanAssignee.text(sitemap[path].assignee) )
					)
					.append( $('<td>')
						// 編集モード
						.append( $spanEditorType.text('...') )
					)
					.append( $('<td>')
						// コミットボタン
						.append( $('<a>')
							.attr({'href':'javascript:;'})
							.click(function(){
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
							.click(function(){
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
							.click(function(){
								window.open( window.config.urlPreview+path );
								return false;
							})
							.append( $('<span class="icn-preview">')
								.text('見る')
							)
						)
					)
				;

				$.get(
					'/apis/getPageInfo',
					{'page_path': sitemap[path].path},
					function(pageInfo){
						// console.log(pageInfo);
						$spanAssignee
							.text((pageInfo.user_info.name + ' (' +  pageInfo.page_info.assignee + ')' || '---'))
						;

						var editorType = {
							'html' : 'HTML',
							'md' : 'Markdown',
							'html.gui' : 'GUI',
							'.not_exists' : 'not exists',
							'.page_not_exists' : 'page not exists'
						};
						var editorTypeId = {
							'html' : 'html',
							'md' : 'md',
							'txt' : 'txt',
							'jade' : 'jade',
							'html.gui' : 'html-gui',
							'.not_exists' : 'not-exists',
							'.page_not_exists' : 'page-not-exists'
						};
						var src = '<span class="px2-editor-type__'+editorTypeId[pageInfo.editorType]+' px2-editor-type--fullwidth"></span>';
						$spanEditorType
							.html((src || '---'))
						;
					}
				);

				$ul.append($li);

			})($ul, sitemap, path);

		}
		callback();

	}

})();
