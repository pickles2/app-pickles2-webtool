# Pickles 2 Web Tool を AWS にセットアップする手順

## AWSインスタンスを生成する

- Amazon Linux AMI を選択
- `t2.2xlarge` 以上のスペックが推奨
- セキュリティグループで、 TCPポート 8080, 8081 を開ける (`config/default.json` の設定とあわせて変更可能)

## AWSインスタンスにログインする

```
$ ssh -i "/path/to/hogefuga.pem" xxxxxxxxxxxxxxxxxx.amazonaws.com
```

## 環境構築

```
## -------------------------
## SETUP

$ sudo yum update
$ sudo yum install git gcc-c++ make openssl-devel


## -------------------------
## NodeJS インストール

$ git clone git://github.com/creationix/nvm.git .nvm
$ source ~/.nvm/nvm.sh
$ nvm install v6.9.1
$ node -v
v6.9.1
$ nvm alias default v6.9.1
$ npm -v
3.10.8
$ npm install -g gulp forever


## -------------------------
## php をインストール

$ sudo yum install -y libxml2 libxml2-devel

$ mkdir ~/php-install; cd ~/php-install
$ curl -Lso php-5.6.8.tar.gz http://jp2.php.net/get/php-5.6.8.tar.gz/from/this/mirror
$ tar xfz php-5.6.8.tar.gz
$ cd php-5.6.8
$ ./configure \
--enable-mbstring=all \
--enable-mbregex \
--enable-zip \
--with-openssl \
--without-iconv \
--prefix=/usr \
--sysconfdir=/private/etc \
--with-config-file-path=/etc
$ make
$ sudo make install
$ php -v
PHP 5.6.8 (cli) (built: Sep 12 2017 11:31:20)
Copyright (c) 1997-2015 The PHP Group
Zend Engine v2.6.0, Copyright (c) 1998-2015 Zend Technologies



## -------------------------
## composer をインストール

$ cd ~
$ php -r "readfile('https://getcomposer.org/installer');" > composer-setup.php
$ php composer-setup.php
$ sudo mv composer.phar /usr/local/bin/composer
$ php -r "unlink('composer-setup.php');"
```

## Pickles 2 Web Tool をインストール

```
$ mkdir ~/www; cd ~/www
$ git clone -b develop https://github.com/pickles2/app-pickles2-webtool.git
$ cd app-pickles2-webtool
$ git submodule update --init --recursive --force
$ composer install; npm install;

## -------------------------
## SSL証明書更新
$ npm run ssl-key-gen

## -------------------------
## Pickles 2 Web Tool をセットアップ
$ git branch webtool
$ git checkout webtool
$ vim config/default.json
{
        "app":{
                "name": "Pickles 2 Web Tool",
                "copyright": "(C) Pickles 2 Project"
        },
        "origin": "https://xxxxxxxxxxxxxxxxxx.amazonaws.com:8080",
        "px2server":{
                "useExternalPreviewServer": false,
                "path":"submodules/preset-pickles2-webtool-develop/.px_execute.php",
                "origin": "https://xxxxxxxxxxxxxxxxxx.amazonaws.com:8081"
        },
        "sslOption":{
                "key": "./config/ssl/server.key",
                "cert": "./config/ssl/server.crt",
                "passphrase": "pickles2"
        },
        "logs":{
                "accesslog":"./logs/"
        },
        "allowFrom":[
        ]
}
$ gulp

## -------------------------
## プロジェクトのセットアップ

$ cd ~/www/app-pickles2-webtool/submodules/preset-pickles2-webtool-develop/
$ composer install
```

## 起動する手順

```
$ cd ~/www/app-pickles2-webtool/;
$ forever start ./libs/main.js
```

## シャットダウンする手順

```
$ forever stopall
```

## 課題

- TODO: 自動起動されるようにする
