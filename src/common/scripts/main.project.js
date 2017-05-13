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

	/**
	 * PXコマンドを実行する
	 */
	this.pxCommand = function(page_path, command, params, callback){
		callback = callback || function(){};

		var strParam = '';
		var aryParams = [];
		for(var key in params){
			aryParams.push( encodeURIComponent(key)+'='+encodeURIComponent(params[key]) );
		}
		strParam = aryParams.join('&');

		var rtn = false;
		$.ajax({
			'type': 'POST',
			'url': '/apis/pxCommand',
			'data': {
				'page_path': page_path,
				'PX': command,
				'params': strParam
			},
			"success": function(data, dataType){
				// console.log(data);
				rtn = data;
			},
			"complete": function(XMLHttpRequest, textStatus){
				callback(rtn);
			}
		});
	}

	return this;
};
