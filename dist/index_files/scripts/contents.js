(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.contApp = new (function(){
})();
$(window).load(function(){

	if( !$('.login-form').size() ){
		// ログイン済みの場合
		window.location.href = '/fncs/home/';
	}

	$('.login-form')
		.submit(function(){
			var $this = $(this);
			var data = {
				'id': $this.find('input[type=text]').val(),
				'pw': $this.find('input[type=password]').val()
			};

			$.ajax({
				'type': 'POST',
				'url': '/apis/login',
				'data': data,
				'success': function(data, dataType){
					// console.log(data, dataType);
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
		})
	;

});

},{}]},{},[1])