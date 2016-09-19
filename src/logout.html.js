/**
 * logout.html.js
 */
module.exports = function(px2){
	var fs = require('fs');
	var twig = require('twig');

	return function(req, res, next){

		req.userInfo = undefined;
		req.session.destroy(function(err) {
			var templateSrc = fs.readFileSync(__dirname + '/logout_files/templates.ignore/index.html');
			var html = '';

			try {
				var html = new twig.twig({
					'data': templateSrc.toString()
				}).render({
					"px2": px2,
					"req": req
				});
			} catch (e) {
				console.log( 'TemplateEngine Rendering ERROR.' );
				html = '<div class="error">TemplateEngine Rendering ERROR.</div>'
			}

			res.set('Content-Type', 'text/html')
			res.status(200);
			res.send(html).end();
		})

		return;
	};


}
