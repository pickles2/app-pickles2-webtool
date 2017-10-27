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
				var stdout = '';
				var stderr = '';
				main.cmdQueue.addQueueItem(
					['px2git', apiName, JSON.stringify(param)],
					{
						'cdName': 'git',
						'tags': [
							'project-git'
						],
						'accept': function(queueId){
							// console.log(queueId);
						},
						'open': function(message){
						},
						'stdout': function(message){
							for(var idx in message.data){
								stdout += message.data[idx];
							}
						},
						'stderr': function(message){
							for(var idx in message.data){
								stdout += message.data[idx];
								stderr += message.data[idx];
								console.error(message.data[idx]);
							}
						},
						'close': function(message){
							setTimeout(function(){
								try {
									stdout = JSON.parse(stdout);
								} catch (e) {
									console.error('Failed to parse JSON string.');
									console.error(stdout);
									stdout = false;
								}
								var code = message.data;
								callback(stdout, stderr, code);
							},500);
							return;
						}
					}
				);
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
