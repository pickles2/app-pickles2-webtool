<?php ob_start(); ?><link rel="stylesheet" href="./index_files/style.css" /><?php $px->bowl()->send( ob_get_clean(), 'head' );?>
<?php ob_start(); ?><script src="./index_files/script.js"></script><?php $px->bowl()->send( ob_get_clean(), 'foot' );?>
## markdown編集モード

このコンテンツは、markdown記法で編集するサンプルです。

- list 1
- list 2