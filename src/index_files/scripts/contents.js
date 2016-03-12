window.contApp = function(){}
$(window).load(function(){
	$('.login-form').submit(function(){
		var $this = $(this);
		var id = $this.find('input[type=text]').val();
		var pw = $this.find('input[type=password]').val();

		$.ajax({
			'type': 'POST',
			'url': '/api/login',
			'data': {
				'id': id,
				'pw': pw
			},
			'success': function(data, dataType){
				console.log(data, dataType);
			},
			'complete': function(xhr, textStatus){
				if(xhr.status == 200){
					alert('OK');
				}else if(xhr.status == 403){
					alert('FAILED');
				}else{
					alert('unknown code: '+xhr.status);
				}
			}
		});
	});
});
