/// <reference path="jquery.d.ts" />
interface data{
    song_name:string;
    artist:string;
    lrc_name:string;
    spe_zh:string;
    spe_en:string;
    oth_src:string;
    qiniu_src:string;
}
interface getData{
    [index:number]:data;
}
interface songInfo{
    idx:number;
    song_name:string;
}
class Music{
    allSongData:getData;
    currentSong:number=0;
    list = $('#m-list');
    listLi:any;
    listBtn = $('#m-box h3');
    lyricContainer = $('.lyc-container');
    rate = $('#mainc .progress-bar')
    f_play = $('#f-play');
    f_prev = $('#f-prev');
    f_next = $('#f-next');
    lyric:any[] = [];
    status:number;
    PLAY:number = 1;
    PAUSE:number = -1;
    STOP:number = 0;
    audio = $('#audio')[0];
    constructor(){
        var me = this;
        this.initList();
        this.listBtn.click(function(){
            $(this).next().toggle();
        });
        this.list.on('click','li',function(){
            me.currentSong = parseInt($(this).data('idx'));
            me.playNew(me.currentSong);
            me.upState();
        });
        $(document).on('click',function(e){
            e.target.nodeName!=='H3'&&me.list.hide();
        });
        this.f_play.click(function():void{
            let span = $(this).children();
            if(me.status === me.PLAY){
                me.status = me.PAUSE;
            }else{
                me.status = me.PLAY;
            }
            me.upState();
        });
        this.f_next.click(function(){
            me.playTo('next');
        });
        this.f_prev.click(function(){
            me.playTo('prev');
        });
        this.audio.addEventListener('timeupdate',function(){
            if(me.lyricContainer.children().length===0){
                return;
            }
            var now:number = this.currentTime;
                    var time:number = this.duration;
                    var mTime:number = 0,sTime:number =0,mNow:number = 0,sNow:number = 0;
                    var n:number = 0;
                    if (!me.lyric) return;
                    for (var i = 0, l = me.lyric.length; i < l; i++) {
                        if (now > me.lyric[i][0] - 0.50) {
                            var line = document.getElementById('line-' + i),
                                prevLine = document.getElementById('line-' + (i > 0 ? i - 1 : i));
                            prevLine.className = '';
                    line.className = 'active';
                    me.lyricContainer.children().css('top',130 - line.offsetTop + 'px');
                }
            }
            let w:number = me.rate.parent().width();
            me.rate.width(now*w/time);
        })
    }
    initList(){
        var me = this;
        $.ajax({
            type:'GET',
            url:'data/mayday.php',
            dataType:'json',
            success:function(data){
                me.allSongData = data;
                let template:string='';
                let arr = Array.prototype.slice.apply(me.allSongData);
                for(let i=0;i<arr.length;i++){
                    template+=`
                    <li data-idx='${i}'><a href="#"><i>${i+1}</i><span>${arr[i].song_name}-${arr[i].artist}</span></a></li>
                  `;
                }
                me.list.html(template);
                me.listLi = $('#m-list li');
                me.playTo();
            }
        });
    }
    playTo(dir?:string){
        let curIdx:number = 0;
        Array.prototype.forEach.call(this.listLi,function(v,i,a){
            if(v.className === 'current'){
                return curIdx = i;
            }
        });
       if(dir){
           switch (dir){
               case 'prev':
                   if(curIdx===0){
                       curIdx = this.allSongData.length-1;
                   }else{
                       curIdx--;
                   }
                   break;
               case 'next':
                   if(curIdx===this.allSongData.length-1){
                       curIdx = 0;
                   }else {
                       curIdx++;
                   }
                   break;
           }
       }
       this.upState();
       this.playNew(this.currentSong = curIdx);
    }
    playNew(idx:number):void{
        this.lyricContainer.html('正在载入...');
        /*初始化歌词
        切换封面
        * */
        let me = this;
        this.audio.src = this.allSongData[idx].qiniu_src;
        let lyricSrc:string = './data/songs_mayday/' + this.allSongData[idx].lrc_name + '.lrc';
        this.audio.oncanplay = function(){
            me.getLyric(lyricSrc);
            me.status = me.PLAY;
            me.upState();
        };
        this.audio.onerror = function (){
        //    提示
        }
    }
    getLyric(url:string):void{
        let me = this;
        $.ajax({
            url:url,
            type:'GET',
            success:function(data){
                parseLyric(data.trim());
            }
        });
        function parseLyric(text:string):void{
            let lines:string[] = text.split(/\n/g);//分割每行歌词
            let pattern = /\[\d{2}:\d{2}.\d{2}\]/g;
            let result:any[] = [];//声明一个空数组,存放歌词对象
            var offset:number = getOffset(text);
            while (!pattern.test(lines[0])) {
                lines = lines.slice(1);
            }
            lines[lines.length - 1].length === 0 && lines.pop();
            Array.prototype.forEach.call(lines,function(v, i, a) {
                var time = v.match(pattern),
                    value = v.replace(pattern, '');
                Array.prototype.forEach.call(time,function(v1, i1, a1) {
                    let t:string[] = v1.slice(1, -1).split(':');
                    result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]) + offset / 1000, value]);
                })
            });
            result.sort(function(a, b) {
                return a[0] - b[0];
            });
            appendLyric(result);
            me.lyric = result;
        }
        function getOffset(text:String):number{
            var offset = 0;
            try {
                var offsetPattern = /\[offset:\-?\+?\d+\]/g,
                    offset_line = text.match(offsetPattern)[0],
                    offset_str = offset_line.split(':')[1];
                offset = parseInt(offset_str);
            } catch (err) {
                offset = 0;
            }
            return offset;
        }
        function appendLyric(lyric:any[]):void{
            var ul = document.createElement('ul');
            let template:string = '';
            for(let i=0;i<lyric.length;i++){
                template += `
                <li id="line-${i}">${lyric[i][1]}</li>
                `;
            }
            me.lyricContainer.html('<ul>'+template+'</ul>');
        }
    }
    upState(){
        switch (this.status){
            case this.PLAY:
                    this.audio.play();
                    this.f_play.children().removeClass('glyphicon-play').addClass('glyphicon-pause');
                    break;
                /*播放音频 转动专辑 滚动歌词*/
            case this.PAUSE:
                this.audio.pause();
                this.f_play.children().removeClass('glyphicon-pause').addClass('glyphicon-play');
                break;
            case this.STOP:
        }
        this.listLi.eq(this.currentSong).addClass('current').find('i').text('').addClass('glyphicon glyphicon-music').end()
            .siblings('.current').removeClass('current').find('i').removeClass('glyphicon-music').text(function(){
            return parseInt($(this).parents('li').data('idx')) + 1;
        });
        this.listBtn.text(this.allSongData[this.currentSong].song_name);
    }
}
new Music();