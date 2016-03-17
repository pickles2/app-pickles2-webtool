$(window).load(function(){
	$.get(
		'/apis/getSitemap',
		{},
		function(sitemap){
			// console.log(sitemap);
			var $ul = $('<ul>');
			$('.contents').html('').append($ul);
			for( var path in sitemap ){
				var $li = $('<li>');
				$li
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
				);
				$ul.append($li);
			}
		}
	);
});
