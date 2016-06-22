/**
 * main.project.js
 */
module.exports = function( main ){
	var _this = this;
	var $ = require('jquery');

	/**
	 * プロジェクトのコンフィグ情報を取得する
	 */
	this.getConfig = function(callback){
		callback = callback || function(){};
		$.ajax({
			'type': 'POST',
			'url': '/apis/getProjectConf',
			'success': function(data, dataType){
				callback( data );
			},
			'complete': function(xhr, textStatus){
			}
		});
	}

	return this;
};
