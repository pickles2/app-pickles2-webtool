/**
 * broccoliApi.js
 */
module.exports = function(conf){

	return function(req, res, next){

		// console.log(req);
		// console.log(req.method);
		// console.log(req.body);
		// console.log(req.originalUrl);
		// console.log( JSON.stringify(userInfo) );
		// console.log(req.body);
		// console.log(req.query);

		var px2proj = require('px2agent').createProject(conf.px2server.path);
		px2proj.get_config(function(px2conf){
			// console.log(px2conf);
			px2proj.get_page_info('/', function(pageInfo){
				// console.log(pageInfo);

				px2proj.get_path_docroot(function(documentRoot){
					// res.status(200);
					// res.set('Content-Type', 'text/json')
					// res.send(JSON.stringify(px2conf)).end();
					// return;

					broccoliStandby(px2conf, pageInfo, documentRoot, JSON.parse(req.body.api), JSON.parse(req.body.options), function(bin){
						res.status(200);
						res.set('Content-Type', 'text/json')
						res.send(JSON.stringify(bin)).end();
					});
				});

			});
		});

		return;
	};

	function broccoliStandby(px2conf, pageInfo, documentRoot, api, options, callback){
		var Broccoli = require('broccoli-html-editor');
		var broccoli = new Broccoli();
		for( var idx in px2conf.plugins.px2dt.paths_module_template ){
			px2conf.plugins.px2dt.paths_module_template[idx] = require('path').resolve( conf.px2server.path, '..', px2conf.plugins.px2dt.paths_module_template[idx] )+'/';
		}
		console.log(px2conf.plugins.px2dt.paths_module_template);

		broccoli.init(
			{
				'paths_module_template': px2conf.plugins.px2dt.paths_module_template ,
				'documentRoot': documentRoot,// realpath
				'pathHtml': '/sample_pages/page3/index.html',
				'pathResourceDir': '/sample_pages/page3/index_files/resources/',
				'realpathDataDir':  documentRoot + '/sample_pages/page3/index_files/guieditor.ignore/',
				'contents_bowl_name_by': px2conf.plugins.px2dt.contents_bowl_name_by,
				'customFields': {
					// 'custom1': function(broccoli){
					// 	// カスタムフィールドを実装します。
					// 	// この関数は、fieldBase.js を基底クラスとして継承します。
					// 	// customFields オブジェクトのキー(ここでは custom1)が、フィールドの名称になります。
					// }
				} ,
				'bindTemplate': function(htmls, callback){
					var fin = '';
					for( var bowlId in htmls ){
						if( bowlId == 'main' ){
							fin += htmls['main'];
						}else{
							fin += "\n";
							fin += "\n";
							fin += '<?php ob_start(); ?>'+"\n";
							fin += htmls[bowlId]+"\n";
							fin += '<?php $px->bowl()->send( ob_get_clean(), '+JSON.stringify(bowlId)+' ); ?>'+"\n";
							fin += "\n";
						}
					}
					callback(fin);
					return;
				},
				'log': function(msg){
					// エラー発生時にコールされます。
					// msg を受け取り、適切なファイルへ出力するように実装してください。
					console.log(msg);
					// fs.writeFileSync('/path/to/error.log', {}, msg);
				}
			},
			function(){
				console.log('standby!');

				console.log('GPI called');
				console.log(api);
				console.log(options);
				broccoli.gpi(
					api,
					options,
					function(rtn){
						// console.log(rtn);
						// console.log('GPI responced');
						callback(rtn);
					}
				);

			}
		);
		return;
	}

}
