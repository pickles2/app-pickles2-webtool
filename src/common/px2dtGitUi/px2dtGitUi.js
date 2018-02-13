window.px2dtGitUi = function(main){
	var _this = this;
	this.main = main;
	this.git = main.git();
	var it79 = require('iterate79');
	var divDb = {
		'sitemaps':{
			'label':'サイトマップ'
		},
		'contents':{
			'label':'コンテンツ'
		},
		'rollback':{
			'label':'ロールバックの内容'
		}
	};

	/**
	 * コミットログの日付表現の標準化
	 */
	function dateFormat(date){
		var tmpDate = new Date(date);
		var fillZero = function( int ){
			return ('00000' + int).slice( -2 );
		}
		return tmpDate.getFullYear() + '-' + fillZero(tmpDate.getMonth()+1) + '-' + fillZero(tmpDate.getDate()) + ' ' + fillZero(tmpDate.getHours()) + ':' + fillZero(tmpDate.getMinutes()) + ':' + fillZero(tmpDate.getSeconds());
	} // dateFormat()

	/**
	 * ファイルの状態を判定する
	 */
	function fileStatusJudge(fileInfo){
		if(fileInfo.work_tree == '?' && fileInfo.index == '?'){
			return 'untracked';
		}else if(fileInfo.work_tree == 'A' || fileInfo.index == 'A'){
			return 'added';
		}else if(fileInfo.work_tree == 'M' || fileInfo.index == 'M'){
			return 'modified';
		}else if(fileInfo.work_tree == 'D' || fileInfo.index == 'D'){
			return 'deleted';
		}
		console.error('unknown status type;');
		console.error(fileInfo);
		return 'unknown';
	} // fileStatusJudge()

	/**
	 * コミットする
	 */
	this.commit = function( div, options, callback ){
		callback = callback || function(){};
		var $body = $('<div class="px2dt-git-commit">');
		var $ul = $('<ul class="list-group">');
		var $commitLabel = $('<p>').text('コミットコメント（※バージョン管理するためのコメントです。ページ内には反映されません）');
		var $commitComment = $('<textarea>').val(options.comment);

		main.progress.start({'blindness': true, 'showProgressBar': true});


		function getGitStatus(div, options, callback){
			switch( div ){
				case 'contents':
				case 'rollback':
					_this.git.statusContents([options.page_path], function(result, err, code){
						callback(result, err, code);
					});
					break;
				default:
					_this.git.status(function(result, err, code){
						callback(result, err, code);
					});
					break;
			}
			return;
		}

		function gitCommit(div, options, commitComment, callback){
			switch( div ){
				case 'contents':
				case 'rollback':
					_this.git.commitContents([options.page_path, commitComment], function(rtn, err, XMLHttpRequest, textStatus){
						callback(rtn, err, XMLHttpRequest, textStatus);
					});
					break;
				case 'sitemaps':
					_this.git.commitSitemap([commitComment], function(rtn, err, XMLHttpRequest, textStatus){
						callback(rtn, err, XMLHttpRequest, textStatus);
					});
					break;
				default:
					callback(false, 'unknown div', null, false);
					break;
			}
			return;
		}

		getGitStatus(div, options, function(result, err, code){
			// console.log(result, err, code);
			if( result === false ){
				alert('ERROR: '+err);
				main.progress.close();
				callback('error');
				return;
			}
			$body.html('');
			$body.append( $('<p>').text('branch: ').append( $('<code>').text( result.branch ) ) );
			var list = [];
			if( div == 'contents' || div == 'rollback' ){
				list = result.changes;
			}else{
				list = result.div[div];
			}
			if( !list.length ){
				// alert('コミットできる変更がありません。');
				main.progress.close();
				main.closeDialog();
				callback('unchanged');
				return;
			}
			for( var idx in list ){
				var fileStatus = fileStatusJudge(list[idx]);
				var $li = $('<li class="list-group-item">')
					.text( '['+fileStatus+'] '+list[idx].file )
					.addClass('px2dt-git-commit__stats-'+fileStatus)
				;
				$ul.append( $li );
			}
			$body.append( $ul );
			$body.append( $commitLabel );
			$body.append( $commitComment );

			main.dialog({
				'title': divDb[div].label+'をコミットする',
				'body': $body,
				'buttons':[
					$('<button>')
						.text('コミット')
						.attr({'type':'submit'})
						.addClass('px2-btn px2-btn--primary')
						.click(function(){
							main.progress.start({'blindness': true, 'showProgressBar': true});
							var commitComment = $commitComment.val();
							var cbRet;
							// console.log(commitComment);
							gitCommit(div, options, commitComment, function(rtn, err, XMLHttpRequest, textStatus){
								// console.log('=-=-=-=-=-=-=-=-=-=-=-=-= gitCommit result');
								// console.log(rtn, err, XMLHttpRequest, textStatus);
								if( rtn ){
									if( div == 'rollback' ){
										alert('ロールバックを完了しました。');
									} else {
										alert('コミットしました。');	
									}
									cbRet = 'commited';
								}else{
									alert('コミットに失敗しました。 もう一度お試しください。');
									cbRet = 'error';
								}
								main.progress.close();
								main.closeDialog();
								callback(cbRet);
							});
						}),
					$('<button>')
						.text('キャンセル')
						.addClass('px2-btn px2-btn-secondary')
						.click(function(){
							main.closeDialog();
							callback('cancel');
						})
				]
			});
			main.progress.close();

		});


		return this;
	} // commit()

	/**
	 * コミットログを表示する
	 */
	this.log = function( div, options, callback ){
		callback = callback || function(){};

		var $body = $('<div class="px2dt-git-commit">');
		var $ul = $('<ul class="list-group">');

		main.progress.start({'blindness': true, 'showProgressBar': true});

		function getGitLog(div, options, callback){
			switch( div ){
				case 'contents':
					_this.git.logContents([options.page_path], function(result, err, code){
						callback(result, err, code);
					});
					break;
				case 'sitemaps':
					_this.git.logSitemaps(function(result, err, code){
						callback(result, err, code);
					});
					break;
				default:
					break;
			}
			return;
		}

		function getGitRollback(div, options, hash, callback){
			switch( div ){
				case 'contents':
					_this.git.rollbackContents([options.page_path, hash], function(result, err, code){
						callback(result, err, code);
					});
					break;
				case 'sitemaps':
					_this.git.rollbackSitemaps([hash], function(result, err, code){
						callback(result, err, code);
					});
					break;
				default:
					break;
			}
			return;
		}

		getGitLog(div, options, function(result, err, code){
			// console.log(result, err, code);
			if( result === false ){
				alert('ERROR: '+err);
				main.progress.close();
				callback('error');
				return;
			}

			$body.html('');
			for( var idx in result ){
				(function(){
					var $li = $('<li class="list-group-item px2dt-git-commit__loglist">');
					var $row = $('<div class="px2dt-git-commit__loglist-row">');
					$row.append( $('<div class="px2dt-git-commit__loglist-row-date">').text( dateFormat(result[idx].date) ) );
					$row.append( $('<div class="px2dt-git-commit__loglist-row-title">').text( result[idx].title ) );
					$row.append( $('<div class="px2dt-git-commit__loglist-row-name">').text( result[idx].name + ' <'+result[idx].email+'>' ) );
					$row.append( $('<div class="px2dt-git-commit__loglist-row-hash">').text( result[idx].hash ) );
					var $detail = $('<div class="px2dt-git-commit__loglist-detail">')
						.hide()
						.attr({
							'data-px2dt-hash': result[idx].hash
						})
						.click(function(e){
							e.stopPropagation();
						})
					;
					$li.click(function(){
						$detail.toggle('fast', function(){
							var hash = $(this).attr('data-px2dt-hash');
							if( $detail.is(':visible') ){
								$detail.html( '<div class="px2-loading"></div>' );
								_this.git.show([hash], function(res){
									if( res.plain.length > 2000 ){
										// 内容が多すぎると固まるので、途中までで切る。
										res.plain = res.plain.substr(0, 2000-3) + '...';
									}
									// console.log(res);
									$detail
										.html( '' )
										.append( $('<pre>')
											.text(res.plain)
											.css({
												'max-height': 300,
												'overflow': 'auto'
											})
										)
										.append( $('<button>')
											.addClass('px2-btn')
											.addClass('px2-btn--primary')
											.text('このバージョンまでロールバックする')
											.click(function(){
												var cbRet;
												if( !confirm('この操作は現在の ' + divDb[div].label + ' の変更を破棄します。よろしいですか？') ){
													callback('cancel');
													return;
												}
												main.progress.start({
													'blindness':true,
													'showProgressBar': true
												});
												getGitRollback(div, options, hash, function(result, err, code){
													if( result ){
														// alert('ロールバックを完了しました。');
														cbRet = 'rollbacked';
													}else{
														alert('[ERROR] ロールバックは失敗しました。');
														alert(err);
														console.error('ERROR: ' + err);
														cbRet = 'error';
													}
													main.progress.close();
													main.closeDialog();
													callback(cbRet);
												});
												return;
											})
										)
									;
								});
							}else{
								$detail.html( '' );
							}
						});
					});
					$ul.append( $li.append($row).append($detail) );
				})();
			}
			$body.append( $ul );

			main.dialog({
				'title': divDb[div].label + 'のコミットログ',
				'body': $body,
				'buttons':[
					$('<button>')
						.text('閉じる')
						.attr({'type':'submit'})
						.addClass('px2-btn px2-btn--primary')
						.click(function(){
							main.closeDialog();
							callback('log');
						})
				]
			});
			main.progress.close();

		});


		return this;
	} // log()

	/**
	 * ステータスを表示する
	 */
	this.status = function( div, options, callback ){
		callback = callback || function(){};

		var $ul = $('<ul class="list-group">');
		main.progress.start({'blindness': true, 'showProgressBar': true});

		function getGitStatus(div, options, callback){
			switch( div ){
				case 'contents':
					_this.git.status(function(result, err, code){
						callback(result, err, code);
					});
					break;
				default:
					_this.git.status(function(result, err, code){
						callback(result, err, code);
					});
					break;
			}
			return;
		}

		getGitStatus(div, options, function(result, err, code){
			// console.log(result, err, code);
			if( result === false ){
				alert('ERROR: '+err);
				main.progress.close();
				return;
			}
			
			var list = [];
			if( div == 'contents' ){
				list = result.changes;
			}else{
				list = result.div[div];
			}

			if( !list.length ){
				// 変更なし
				alert('変更がありません。');
				main.progress.close();
				callback();
				return;
			}

			var statusList = [];
			$.get(
				'/apis/getSitemap',
				{},
				function(sitemap){
					
					/* ファイルリストを「.htmlファイル」とそれ以外に分ける */
					var htmlFiles = $.grep(list,
						function(elem, index){
							// .htmlのファイルのみ
							return (elem.file.indexOf('.html') != -1);
						}
					);
					var resFiles = $.grep(list,
						function(elem, index){
							// .htmlのファイル以外
							return (elem.file.indexOf('.html') != -1);
						}, true
					);

					it79.fnc({},[
						function(it1, arg){
							
							$.each(htmlFiles, function(i, el){
								main.project.pxCommand(
									'/'+el.file,
									'api.get.path_files',
									{
										// 'path_resource': "/test/data.json"
									},
									function(result){
										var fileName = "/"+el.file;
										var fileStatus = fileStatusJudge(el);

										$.each(sitemap, function(i2, el2){
											var path = ( el2.content ? el2.content : el2.path );
											if (path == fileName) {
												statusList[fileName] = {
													title: sitemap[fileName].title,
													path_files: result,
													list: ['['+fileStatus+'] '+el.file],
													status: [fileStatus]
												};
											}
										});

										if (i >= htmlFiles.length - 1) {
											it1.next(arg);
										}
									}
								);
							});
							
							return;
						},
						function(it1, arg){
							
							for (var i in resFiles) {
								var fileStatus = fileStatusJudge(resFiles[i]);
								for (path in statusList) {
									var path_file = statusList[path].path_files.slice(1, statusList[path].path_files.length);
									var len = path_file.length;
									var file = resFiles[i].file.slice(0, len);
									if (file == path_file) {
										statusList[path].list.push('['+fileStatus+'] '+resFiles[i].file);
										statusList[path].status.push(fileStatus);
									}
								}
							}

							it79.ary(
								statusList,
								function(it2, file_info, path){

									(function($ul, statusList, path){

										var $li = $('<li class="list-group-item">');
										$li.text(statusList[path].title);

										var $inner_ul = $('<ul>');
										for ( var idx in statusList[path].list ) {
											var $inner_li = $('<li>')
												.text(statusList[path].list[idx])
												.addClass('px2dt-git-commit__stats-'+statusList[path].status[idx]);
											;
											$inner_ul.append($inner_li);
										}
										$li.append($inner_ul);
										$ul.append($li);

									})($ul, statusList, path);
									
									it2.next();
								},
								function(){
									it1.next();
								}
							);

							return;
						},
						function(it1, arg){
							callback($ul);
							main.progress.close();
						}
					]);
				}
			);
		});

		
		return this;
	} // status()

}
