/**
 * pickles2.js - application main
 */
module.exports = function(conf){
	var _this = this;
	var Promise = require('es6-promise').Promise;
	var it79 = require('iterate79');
	this.px2proj = require('px2agent').createProject( require('path').resolve(conf.px2server.path) );

	/** コンフィグを取得 */
	this.conf = function(){
		return conf;
	}

	/** px2proj を取得する */
	this.getPx2Project = function(){
		return this.px2proj;
	}

	/**
	 * プロジェクト情報をまとめて取得する
	 */
	this.getProjectInfo = function(callback){
		callback = callback || function(){};
		var pjInfo = {};
		_this.px2proj.query('/?PX=px2dthelper.get.all&filter=false', {
			"output": "json",
			"userAgent": "Mozilla/5.0",
			"success": function(data){
				// console.log(data);
			},
			"complete": function(data, code){
				// console.log(data, code);
				try {
					pjInfo = JSON.parse(data);
				} catch (e) {
					pjInfo = false;
				}
				// console.log(pjInfo);
				callback(pjInfo);
			}
		});
		return;
	}

	/**
	 * ユーザー情報を得る
	 * @param  {[type]}   id       [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	this.getUserInfo = function(id, callback){
		callback = callback || function(){};
		var pathCsv = require('path').resolve(__dirname, '../config/userlist.csv');
		// console.log(pathCsv);
		var findInCsv = new (require('find-in-csv'))(
			pathCsv ,
			{
				"require": ['id']
			}
		);
		// console.log(findInCsv);

		findInCsv.get(
			{'id':id},
			function(userInfo){
				// console.log(findInCsv);
				// console.log(userInfo);
				callback(userInfo);
				return;
			}
		);
		return;
	}


	/**
	 * ログインする
	 * @param  {String}   id	   ログインユーザーID(アカウント名)
	 * @param  {String}   pw	   パスワード
	 * @param  {Function} callback callback function.
	 * @return {void}			void
	 */
	this.login = function(id, pw, callback){
		callback = callback || function(){};
		var pathCsv = require('path').resolve(__dirname, '../config/userlist.csv');
		// console.log(pathCsv);
		var findInCsv = new (require('find-in-csv'))(
			pathCsv ,
			{
				"require": ['id', 'pw'],
				"encrypted": {
					"pw": "sha1"
				}
			}
		);
		// console.log(id);
		// console.log(pw);
		// console.log(findInCsv);

		findInCsv.get(
			{'id':id, 'pw':pw},
			function(userInfo){
				// console.log(findInCsv);
				// console.log(userInfo);
				userInfo.pw = undefined;
				delete(userInfo.pw); // <= パスワードは忘れる
				callback(userInfo);
				return;
			}
		);
		return;

	}

}
