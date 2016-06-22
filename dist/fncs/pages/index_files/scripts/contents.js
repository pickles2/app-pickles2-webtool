(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.cont = new (function(){
	var _this = this;
	var $cont = $('.contents');

	var px2dtGitUi = new window.px2dtGitUi(window.main);

	/**
	 * 画面を初期化
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	this.init = function(callback){
		callback = callback || function(){};

		$(window).load(function(){
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
				for( var path in sitemap ){
					(function($ul, sitemap, path){
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
								.append( $('<span>')
									.text(sitemap[path].id)
								)
							)
							.append( $('<td>')
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
								.append( $('<span>')
									.text(sitemap[path].path)
								)
							)
							.append( $('<td>')
								.append( $spanAssignee )
							)
							.append( $('<td>')
								.append( $spanEditorType )
							)
							.append( $('<td>')
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
							'/apis/getUserInfo',
							{'id': sitemap[path].assignee},
							function(userInfo){
								$spanAssignee
									.text((userInfo.name || '---'))
								;
							}
						);
						$.get(
							'/apis/checkEditorType',
							{'page_path': sitemap[path].path},
							function(result){
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
								var src = '<span class="px2-editor-type__'+editorTypeId[result]+' px2-editor-type--fullwidth"></span>';
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
		);

	}

})();

},{}]},{},[1])