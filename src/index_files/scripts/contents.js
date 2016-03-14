window.contApp = new (function(){
})();
$(window).load(function(){

	$.ajax({
		'type': 'GET',
		'url': '/apis/getLoginUserInfo',
		'success': function(data, dataType){
			// console.log(data, dataType);
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

	/**
	 * ログイン状態のとき
	 */
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

	/**
	 * 非ログイン状態のとき
	 */
	function notLogin(){
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
	}

});
