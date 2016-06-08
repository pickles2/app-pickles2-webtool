(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
$(window).load(function(){
	$.get(
		'/apis/getSitemap',
		{},
		function(sitemap){
			// console.log(sitemap);
			var $ul = $('<table class="table">');
			$('.contents').html('').append($ul);
			$ul
				.append( $('<thead>')
					.append( $('<tr>')
						.append( $('<th>').text('id') )
						.append( $('<th>').text('title') )
						.append( $('<th>').text('path') )
						.append( $('<th>').text('assignee') )
						.append( $('<th>').text('editor type') )
					)
				)
			;
			for( var path in sitemap ){
				(function($ul, sitemap, path){
					var $spanAssignee = $('<span>');
					var $spanEditorType = $('<span>');
					var $li = $('<tr>');
					$li
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
									var $this = $(this);
									window.open( '/mods/editor/index.html?page_path='+encodeURIComponent( $this.attr('data-page-path') ) );
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
							$spanEditorType
								.text((editorType[result] || '---'))
							;
						}
					);

					$ul.append($li);

				})($ul, sitemap, path);

			}
		}
	);
});

},{}]},{},[1])