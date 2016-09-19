window.contApp = new (function(){
})();
$(window).load(function(){

	if( !$('.login-form').size() ){
		// ログイン済みの場合
		window.location.href = '/fncs/pages/';
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
