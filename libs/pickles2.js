/**
 * pickles2.js - application main
 */
module.exports = function(conf){
	var _this = this;
	var Promise = require('es6-promise').Promise;
	var it79 = require('iterate79');

	/** コンフィグを取得 */
	this.conf = function(){
		return conf;
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
