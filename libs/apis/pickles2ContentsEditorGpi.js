/**
 * pickles2ContentsEditorGpi.js
 */
module.exports = function(conf){

	var Px2CE = require('pickles2-contents-editor');
	var px2proj = require('px2agent').createProject(conf.px2server.path);
	var Promise = require('es6-promise').Promise;
	var utils79 = require('utils79');
	var fs = require('fs');
	var pjConfig,
		guiEngine,
		realpathDataDir;

	return function(req, res, next){


		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				// プロジェクト設定(config.php)を取得する
				px2proj.get_config(function(_pjConf){
					pjConfig = _pjConf;
					try{
						guiEngine = pjConfig.plugins.px2dt.guiEngine;
					}catch(e){
						guiEngine = 'broccoli-html-editor';
					}
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){

				// 編集権を排他ロックする
				var lockResult = req.applock.lock( req.body.page_path );
				if( !lockResult.result ){
					res
						.status(200)
						.set('Content-Type', 'text/json')
						.send( JSON.stringify({
							"message": "このコンテンツは編集中のためロックされています。",
							"lockInfo": lockResult.lockInfo
						}) )
						.end();
					return;
				}

				rlv();

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){

				// realpathDataDir を取得する
				px2proj.get_realpath_homedir(function(_data){
					realpathDataDir = _data+'_sys/ram/data/';
					rlv();
				});

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){

				if(guiEngine == 'broccoli-html-editor-php'){
					// --------------------------------------
					// GPI実行(PHP版)
					var tmpFileName = '__tmp_'+utils79.md5( Date.now() )+'.json';
					fs.writeFileSync( realpathDataDir+tmpFileName, req.body.data );

					px2proj.query(
						req.body.page_path+'?PX=px2dthelper.px2ce.gpi&appMode=web&data_filename='+encodeURIComponent( tmpFileName ),
						{
							complete: function(rtn, code){
								// console.log('--- returned(millisec)', (new Date()).getTime() - testTimestamp);
								try{
									rtn = JSON.parse(rtn);
								}catch(e){
									console.error('Failed to parse JSON String -> ' + rtn);
								}
								fs.unlinkSync( realpathDataDir+tmpFileName );

								res
									.status(200)
									.set('Content-Type', 'text/json')
									.send( JSON.stringify(rtn) )
									.end();
							}
						}
					);

				}else{
					// --------------------------------------
					// GPI実行(NodeJS版)
					var px2ce = new Px2CE();
					px2ce.init(
						{
							'page_path': req.body.page_path,
							'appMode': 'web', // 'web' or 'desktop'. default to 'web'
							'entryScript': require('path').resolve(conf.px2server.path),
							'customFields': {
								// 'href': require('./../common/broccoli/broccoli-field-href/server.js'),
								// 'psd': require('broccoli-field-psd'),
								// 'table': require('broccoli-field-table')
							} ,
							'log': function(msg){
								console.log(msg);
							}
						},
						function(){
							px2ce.gpi(JSON.parse(req.body.data), function(value){
								res
									.status(200)
									.set('Content-Type', 'text/json')
									.send( JSON.stringify(value) )
									.end();
							});
						}
					);

				}

			}); })
		;

		return;
	};

}
