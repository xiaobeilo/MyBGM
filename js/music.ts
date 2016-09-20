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
interface spePre{
    timer : any;
    spe_en:string;
    moved:number;
}
interface bgImg{
    timer:any;
    inter:number;
}
interface theme{
    type:string;
    count:number;
}
class Music{
    allSongData:getData;
    currentSong:number=0;
    list = $('#m-list');
    listLi:any;
    listBtn = $('#m-box h3');
    lyricContainer = $('.lyc-container');
    rateBar = $('#mainc .progress-bar');
    rate = $('#mainc .progress');
    volBar = $('#vol .progress-bar');
    vol = $('#vol .progress');
    f_play = $('#f-play');
    f_prev = $('#f-prev');
    f_next = $('#f-next');
    spe = $('.spe>img');
    spePre:spePre={};
    randomImg:bgImg = {};
    theme:theme = {};
    lyric:any[] = [];
    status:number;
    PLAY:number = 1;
    PAUSE:number = -1;
    STOP:number = 0;
    audio = $('#audio')[0];
    constructor(type:string,count:number){
        var me = this;
        this.theme.type = type;
        this.theme.count = count;
        this.initList();
        this.listBtn.click(function(){
            $(this).next().toggle();
        });
        this.list.on('click','li',function(){
            me.currentSong = parseInt($(this).data('idx'));
            me.playNew(me.currentSong);
        });
        $(document).on('click',function(e){
            e.target.nodeName!=='H3'&&me.list.hide();
        });
        this.f_play.click(function():void{
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
            let w:number = me.rateBar.parent().width();
            me.rateBar.width(now*w/time);
        });
        this.rate.click(function(e){
            let r = e.offsetX/me.rate.width();
            me.audio.currentTime = r*me.audio.duration;
        });
        this.vol.click(function(e){
            let w = me.vol.width();
            let r = e.offsetX/w;
            me.audio.volume = r;
            me.volBar.width(r*w);
        });
        this.audio.onended = function(){
            me.playTo('next');
        };
    }
    initList(){
        var me = this;
        $.ajax({
            type:'GET',
            url:'data/'+this.theme.type+'.php',
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
        this.listLi.each(function(idx,ele){
            if(ele.className === 'current'){
                curIdx = idx;
                return false;
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
       this.playNew(this.currentSong = curIdx);
    }
    playNew(idx:number):void{
        this.lyricContainer.html('正在载入...');
        this.spePre.moved = 0;
        clearInterval(this.spePre.timer);
        this.spe.attr('src', `images/special/${this.theme.type}/${this.allSongData[this.currentSong].spe_en}.jpg`);
        let me = this;
        // load(this.allSongData[idx].qiniu_src);
        mv.play(this.allSongData[idx].qiniu_src);
        // this.audio.src = this.allSongData[idx].qiniu_src;
        let lyricSrc:string = `./data/${this.theme.type}/${this.allSongData[idx].lrc_name}.lrc`;
        me.getLyric(lyricSrc);
        me.status = me.PLAY;
        me.upState();
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
                    this.speRoll();
                    this.upBg();
                    break;
                /*播放音频 转动专辑 滚动歌词*/
            case this.PAUSE:
                this.audio.pause();
                this.speRoll();
                this.upBg();
                this.f_play.children().removeClass('glyphicon-pause').addClass('glyphicon-play');
                break;
        }
        if($('#m-list li.current').data('idx')!==this.currentSong){/*检测当前播放列表歌曲是否和真是播放歌曲一致*/
            this.listLi.eq(this.currentSong).addClass('current').find('i').text('').addClass('glyphicon glyphicon-music').end()
                .siblings('.current').removeClass('current').find('i').removeClass('glyphicon-music').text(function(){
                return parseInt($(this).parents('li').data('idx')) + 1;
            });
        }
        this.listBtn.text(this.allSongData[this.currentSong].song_name);
    }
    speRoll(){
        let interval: number = 100;
        let max: number = 360;
        let min: number = 0;
        let moved = this.spePre.moved;
        if (this.status === this.PLAY) {
            this.spePre.timer = setInterval(()=> {
                this.spePre.moved = moved++;
                this.spe.css('transform', `rotate(${moved}deg)`);
                if (moved === max) moved = min;
            }, interval);
        } else if (this.status === this.PAUSE) {
            clearInterval(this.spePre.timer);
        }
    }
    upBg(){
        let me = this;
        this.randomImg.inter = 5000;
        if(!this.randomImg.timer){
            this.randomImg.timer = setInterval(function(){
                var r = Math.floor(Math.random()*me.theme.count)+1;
                var img = new Image();
                img.src = `images/bgs/${me.theme.type}/bg${r}.jpg`;
                img.onload = function() {
                    var url = `url(images/bgs/${me.theme.type}/bg${r}.jpg)`;
                    $(document.body).css('backgroundImage', url);
                }
            },me.randomImg.inter);
        }else{
            clearInterval(this.randomImg.timer);
            this.randomImg.timer = null;
        }
    }
    reset(type:string,count:number){
        if(this.theme.type === type){
            return;
        }else{
            this.theme.type = type;
            this.theme.count = count;
            $(document.body).css('backgroundImage',`url(images/bgs/${this.theme.type}/bg1.jpg)`);
            clearInterval(this.randomImg.timer);
            this.randomImg.timer = null;
            this.initList();
        }
    }
}
var size = 128;
var mv = new MusicVisualizer({
    size:size,
    visualizer:draw
});


$('#volume').change(function(){
    mv.changeVolume(this.value/this.max);
});
var ctx = $('canvas')[0].getContext('2d');
function resize(){
    $('canvas').width($('#mainc').width()).height($('#mainc').height()-5);
    var line = ctx.createLinearGradient(0,0,0,295);
    line.addColorStop(0,'red')
    line.addColorStop(0.5,'yellow')
    line.addColorStop(1,'green');
    ctx.fillStyle = line;
}
$(window).resize(function(){
    resize();
});
function draw(arr){
    ctx.clearRect(0,0,1920,295);
    var w = $('canvas').width()/size;
    for(let i=0;i<size;i++){
        let h = arr[i] / 256 * $('canvas').height();
        ctx.fillRect(w*i,$('canvas').height()-h,w*0.6,h);
    }
}
var music = new Music('mayday',20);
$('#switch .dropdown-menu').delegate('a','click',function(){
    let v = $(this).attr('href').slice(1);
    switch (v){
        case 'dianyin':
            music.reset('dianyin',4);
            break;
        case 'mayday':
            music.reset('mayday',20);
            break;
        case 'xzz':
            music.reset('xzz',4);
            break;
        case 'jay':
            music.reset('jay',10);
            break;
    }
});