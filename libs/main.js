/**
 * pickles2webtool main.js
 */
var fs = require('fs');
var path = require('path');
var express = require('express'),
	app = express();
var server = require('http').Server(app);
var _port = 8080;
console.log('port number is '+_port);


// middleware - frontend documents
app.use( '/api/login', require('./users/login.js')() );
app.use( express.static( __dirname+'/../dist/' ) );

// {$_port}番ポートでLISTEN状態にする
server.listen( _port, function(){
	console.log('message: server-standby');
} );
