$(window).load(function(){
	$.get(
		'/apis/getSitemap',
		{},
		function(sitemap){
			// console.log(sitemap);
			var $ul = $('<table>');
			$('.contents').html('').append($ul);
			$ul
				.append( $('<thead>')
					.append( $('<tr>')
						.append( $('<th>').text('id') )
						.append( $('<th>').text('title') )
						.append( $('<th>').text('path') )
					)
				)
			;
			for( var path in sitemap ){
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
				;
				$ul.append($li);
			}
		}
	);
});
