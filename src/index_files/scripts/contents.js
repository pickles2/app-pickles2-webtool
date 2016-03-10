window.contApp = function(){}
$(window).load(function(){
	$('.login-form').submit(function(){
		var $this = $(this);
		var id = $this.find('input[type=text]').val();
		var pw = $this.find('input[type=password]').val();
		alert(id);
		alert(pw);
		$.ajax({
			'url': '/api/login'
			'data':{
				'id': id,
				'pw': pw
			}
		});
	});
});
