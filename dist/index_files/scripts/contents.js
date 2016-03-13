(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.contApp = function(){}
$(window).load(function(){
	$.ajax({
		'type': 'GET',
		'url': '/apis/getLoginUserInfo',
		'success': function(data, dataType){
			console.log(data, dataType);
			if( !data ){
				var html = $('#template-login-form').html();
				$('.contents').html(html);
				notLogin();
			}else{
				var html = $('#template-login').html();
				$('.contents').html(html);
				login();
			}
		},
		'error': function(data, dataType){
			// console.log(data, dataType);
		},
		'complete': function(xhr, textStatus){
		}
	});
	function login(){
		$('.logout-button').click(function(){
			var $this = $(this);

			$.ajax({
				'type': 'POST',
				'url': '/apis/logout',
				'success': function(data, dataType){
					window.location.reload();
				},
				'complete': function(xhr, textStatus){
				}
			});
		});
	}
	function notLogin(){
		$('.login-form').submit(function(){
			var $this = $(this);
			var id = $this.find('input[type=text]').val();
			var pw = $this.find('input[type=password]').val();

			$.ajax({
				'type': 'POST',
				'url': '/apis/login',
				'data': {
					'id': id,
					'pw': pw
				},
				'success': function(data, dataType){
					console.log(data, dataType);
				},
				'complete': function(xhr, textStatus){
					if(xhr.status == 200){
						// alert('OK');
						window.location.reload();
					}else if(xhr.status == 403){
						alert('FAILED');
					}else{
						alert('unknown code: '+xhr.status);
					}
				}
			});
		});
	}

});

},{}]},{},[1])