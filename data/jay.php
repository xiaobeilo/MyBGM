<?php

header('Content-type:application/json');

$jay = [];

$jay[] =["song_name"=>"以父之名","artist"=>"周杰伦","lrc_name"=>"yi_fu_zhi_ming","spe_zh"=>"叶惠美","spe_en"=>"ye_hui_mei","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://oe03ccyz6.bkt.clouddn.com/01%20-%20%E4%BB%A5%E7%88%B6%E4%B9%8B%E5%90%8D.mp3"];

$jay[] =["song_name"=>"可爱女人","artist"=>"周杰伦","lrc_name"=>"ke_ai_nv_ren","spe_zh"=>"jay","spe_en"=>"jay","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://oe03ccyz6.bkt.clouddn.com/01%20-%20%E5%8F%AF%E7%88%B1%E5%A5%B3%E4%BA%BA.mp3"];

$jay[] =["song_name"=>"夜曲","artist"=>"周杰伦","lrc_name"=>"ye_qu","spe_zh"=>"十一月的萧邦","spe_en"=>"shi_yi_yue_de_xiao_bang","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://oe03ccyz6.bkt.clouddn.com/01%20-%20%E5%A4%9C%E6%9B%B2.mp3"];

$jay[] =["song_name"=>"夜的第七章","artist"=>"周杰伦","lrc_name"=>"ye_de_di_qi_zhang","spe_zh"=>"依然范特西","spe_en"=>"yi_ran_fan_te_xi","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://oe03ccyz6.bkt.clouddn.com/01%20-%20%E5%A4%9C%E7%9A%84%E7%AC%AC%E4%B8%83%E7%AB%A0.mp3"];

$jay[] =["song_name"=>"床边故事","artist"=>"周杰伦","lrc_name"=>"chuang_bian_gu_shi","spe_zh"=>"床边故事","spe_en"=>"chuang_bian_gu_shi","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://oe03ccyz6.bkt.clouddn.com/01%20-%20%E5%BA%8A%E8%BE%B9%E6%95%85%E4%BA%8B.mp3"];

$jay[] =["song_name"=>"爱在西元前","artist"=>"周杰伦","lrc_name"=>"ai_zai_xi_yuan_qian","spe_zh"=>"范特西","spe_en"=>"fan_te_xi","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://oe03ccyz6.bkt.clouddn.com/01%20-%20%E7%88%B1%E5%9C%A8%E8%A5%BF%E5%85%83%E5%89%8D.mp3"];

$jay[] =["song_name"=>"轨迹","artist"=>"周杰伦","lrc_name"=>"gui_ji","spe_zh"=>"寻找周杰伦","spe_en"=>"xun_zhao_zhou_jie_lun","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://oe03ccyz6.bkt.clouddn.com/01%20-%20%E8%BD%A8%E8%BF%B9.mp3"];

$jay[] =["song_name"=>"七里香","artist"=>"周杰伦","lrc_name"=>"qi_li_xiang","spe_zh"=>"七里香","spe_en"=>"qi_li_xiang","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://oe03ccyz6.bkt.clouddn.com/02%20-%20%E4%B8%83%E9%87%8C%E9%A6%99.mp3"];


$jay[] =["song_name"=>"半岛铁盒","artist"=>"周杰伦","lrc_name"=>"ban_dao_tie_he","spe_zh"=>"八度空间","spe_en"=>"ba_du_kong_jian","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://oe03ccyz6.bkt.clouddn.com/02%20-%20%E5%8D%8A%E5%B2%9B%E9%93%81%E7%9B%92.mp3"];

$jay[] =["song_name"=>"听妈妈的话","artist"=>"周杰伦","lrc_name"=>"ting_ma_ma_de_hua","spe_zh"=>"依然范特西","spe_en"=>"yi_ran_fan_te_xi","oth_src"=>"http://api.itwusun.com/music,/songurl/xm_128_373959.mp3?sign=fd740029edad8f680e2a1d6b7eb407be","qiniu_src"=>"http://oe03ccyz6.bkt.clouddn.com/02%20-%20%E5%90%AC%E5%A6%88%E5%A6%88%E7%9A%84%E8%AF%9D.mp3"];
echo json_encode($jay);