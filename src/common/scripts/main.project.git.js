/**
 * main.project.git
 */
module.exports = function( main ){
	var _this = this;
	var $ = require('jquery');

	function apiGen(apiName){
		return new (function(apiName){
			this.fnc = function(options, callback){
				if( arguments.length == 2 ){
					options = arguments[0];
					callback = arguments[1];
				}else{
					callback = arguments[0];
				}

				options = options||[];
				callback = callback||function(){};

				var param = {
					'method': apiName,
					// 'entryScript': entryScript,
					'options': options
				};

				// PHPスクリプトを実行する
				var rtn = '';
				var err = '';
				$.ajax({
					'url': '/apis/px2git/'+apiName,
					'data': param,
					'dataType': 'json',
					"success": function(data, dataType){
						rtn = data;
						// console.log(data);
					} ,
					"error": function(XMLHttpRequest, textStatus, errorThrown){
						console.error('AJAX ERROR.');
						console.error(XMLHttpRequest, textStatus, errorThrown);
					} ,
					"complete": function(XMLHttpRequest, textStatus){
						setTimeout(function(){
							console.log(rtn, err, XMLHttpRequest, textStatus);
							callback(rtn, err, XMLHttpRequest, textStatus);
						},500);
					}
				});
				return;
			}
		})(apiName).fnc;
	}

	/**
	 * サイトマップをコミットする
	 * @return {[type]} [description]
	 */
	this.commitSitemap = new apiGen('commit_sitemaps');

	/**
	 * ページのコンテンツをコミットする
	 * @return {[type]} [description]
	 */
	this.commitContents = new apiGen('commit_contents');

	/**
	 * git status
	 * @return {[type]} [description]
	 */
	this.status = new apiGen('status');

	/**
	 * git status (contents)
	 * @return {[type]} [description]
	 */
	this.statusContents = new apiGen('status_contents');

	/**
	 * サイトマップをロールバックする
	 * @return {[type]} [description]
	 */
	this.rollbackSitemaps = new apiGen('rollback_sitemaps');

	/**
	 * ページのコンテンツをロールバックする
	 * @return {[type]} [description]
	 */
	this.rollbackContents = new apiGen('rollback_contents');

	/**
	 * git log
	 * @return {[type]} [description]
	 */
	this.log = new apiGen('log');

	/**
	 * サイトマップのコミットログを取得する
	 * @return {[type]} [description]
	 */
	this.logSitemaps = new apiGen('log_sitemaps');

	/**
	 * コンテンツのコミットログを取得する
	 * @return {[type]} [description]
	 */
	this.logContents = new apiGen('log_contents');

	/**
	 * git show
	 * @return {[type]} [description]
	 */
	this.show = new apiGen('show');

	return this;
};
