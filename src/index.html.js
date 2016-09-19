/**
 * index.html.js
 */
module.exports = function(px2){
	var fs = require('fs');
	var ejs = require('ejs');

	return function(req, res, next){
		var templateSrc = fs.readFileSync(__dirname + '/index_files/templates.ignore/index.html');
		var html = '';

		try {
			var data = {
				"px2": px2,
				"conf": px2.conf(),
				"req": req
			};
			var template = ejs.compile(templateSrc.toString(), {"filename": __dirname + '/index.html'});
			html = template(data);
		} catch (e) {
			console.log( 'TemplateEngine Rendering ERROR.' );
			html = '<div class="error">TemplateEngine Rendering ERROR.</div>'
		}

		res.set('Content-Type', 'text/html')
		res.status(200);
		res.send(html).end();
		return;
	};


}
