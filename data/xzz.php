<?php

header('Content-type:application/json');

$xzz = [];

$xzz[] =["song_name"=>"Stay Here","artist"=>"薛之谦","lrc_name"=>"stay_here","spe_zh"=>"初学者","spe_en"=>"beginner","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://odoxg4iz7.bkt.clouddn.com/%E8%96%9B%E4%B9%8B%E8%B0%A6%20-%20Stay%20Here.mp3"];

$xzz[] =["song_name"=>"我好像在哪见过你","artist"=>"薛之谦","lrc_name"=>"wo_hao_xiang_zai_na_jian_guo_ni","spe_zh"=>"初学者","spe_en"=>"beginner","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://odoxg4iz7.bkt.clouddn.com/%E8%96%9B%E4%B9%8B%E8%B0%A6%20-%20%E6%88%91%E5%A5%BD%E5%83%8F%E5%9C%A8%E5%93%AA%E8%A7%81%E8%BF%87%E4%BD%A0.mp3"];

$xzz[] =["song_name"=>"刚刚好","artist"=>"薛之谦","lrc_name"=>"gang_gang_hao","spe_zh"=>"初学者","spe_en"=>"beginner","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://odoxg4iz7.bkt.clouddn.com/%E8%96%9B%E4%B9%8B%E8%B0%A6%20-%20%E5%88%9A%E5%88%9A%E5%A5%BD.mp3"];

$xzz[] =["song_name"=>"绅士","artist"=>"薛之谦","lrc_name"=>"shen_shi","spe_zh"=>"初学者","spe_en"=>"beginner","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://odoxg4iz7.bkt.clouddn.com/%E8%96%9B%E4%B9%8B%E8%B0%A6%20-%20%E7%BB%85%E5%A3%AB.mp3"];

echo json_encode($xzz);