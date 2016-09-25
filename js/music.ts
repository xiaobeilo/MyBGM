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

var SIZE =64;

class Music{
    allSongData:getData;
    currentSong:number=0;
    list = $('#m-list');
    listLi:any;
    listBtn = $('#m-box h3');
    lyricContainer = $('.lyc-container');
    rateBar = $('#timeProgress .progress-bar');
    rate = $('#timeProgress');
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
    audio = null;
    constructor(type:string,count:number){
        var me = this;
        this.visualizer = new MusicVisualizer({
            size:SIZE,
            onended:function(){
                me.playTo('next');
            },visualizer:Render()
        });
        // this.theme.type = type;
        var theme = this.getTheme();
        if(theme){
            this.theme.type = theme[2];
            this.theme.count = theme[4];
        }else{
            this.theme.type = 'mayday';
            this.theme.count = 20;
        }
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
        this.lyricContainer.html('<div>正在载入...</div>');
        this.spePre.moved = 0;
        clearInterval(this.spePre.timer);
        this.spe.attr('src', `images/special/${this.theme.type}/${this.allSongData[this.currentSong].spe_en}.jpg`);
        let me = this;
        this.visualizer.play(this.allSongData[idx].qiniu_src,false);
        this.audio = this.visualizer.audio;
        this.audio.addEventListener('timeupdate',function(){
            if(me.lyricContainer.children().length===0){
                return;
            }
            var now:number = this.currentTime;
            var time:number = this.duration;
            var mTime:number = 0,sTime:number =0,mNow:number = 0,sNow:number = 0;
            var n:number = 0;
            let w:number = me.rateBar.parent().width();
            me.rateBar.width(now*w/time);
            if (!me.lyric) return;
            for (var i = 0, l = me.lyric.length; i < l; i++) {
                if (now > me.lyric[i][0] - 0.50) {
                    // var line = document.getElementById('line-' + i),
                    //     prevLine = document.getElementById('line-' + (i > 0 ? i - 1 : i));
                    var line1 = document.querySelectorAll('[data-line="'+i+'"]')[0];
                    var line2 = document.querySelectorAll('[data-line="'+i+'"]')[1];
                    var prevLine1 = line1.previousElementSibling;
                    var prevLine2 = line2.previousElementSibling;
                    if(prevLine1) prevLine1.className = '';
                    if(prevLine2) prevLine2.className = '';
                    line1.className = 'active';
                    line2.className = 'active';
                    me.lyricContainer.children().css('top',130 - line1.offsetTop + 'px');
                    me.lyricContainer.children().css('top',130 - line2.offsetTop + 'px');
                }
            }

        });
        this.audio.onended = function(){
            me.playTo('next');
        };
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
            },
            error:function () {
                me.lyricContainer.html('<div> sorry,暂未提供歌词</div>');
                me.lyric = null;
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
                // template += `
                // <li id="line-${i}">${lyric[i][1]}</li>
                // `;
                template += `
                <li data-line="${i}">${lyric[i][1]}</li>
                `;
            }
            me.lyricContainer.html('<ul>'+template+'</ul>');
        }
    }
    upState(){
        switch (this.status){
            case this.PLAY:
                    // this.audio.play();
                    MusicVisualizer.play(this.visualizer);
                    this.f_play.children().removeClass('glyphicon-play').addClass('glyphicon-pause');
                    this.speRoll();
                    this.upBg();
                    break;
                /*播放音频 转动专辑 滚动歌词*/
            case this.PAUSE:
                MusicVisualizer.stop(this.visualizer);
                // this.audio.pause();
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
        // let max: number = 360;
        // let min: number = 0;
        let moved = this.spePre.moved;
        if (this.status === this.PLAY) {
            this.spePre.timer = setInterval(()=> {
                this.spePre.moved = moved++;
                this.spe.css('transform', `rotate(${moved}deg)`);
                // if (moved === max) moved = min;
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
    getTheme():any{
        var str = window.location.hash.slice();
        var reg = /(#type=)([^&]+)(&count=)(\d+)/i;
        var result = str.match(reg);
        return result;
    }
    reset(){
        var theme = this.getTheme();
        if(this.theme.type === theme[2]){
            return;
        }else{
            this.theme.type = theme[2];
            this.theme.count = theme[4];
            $(document.body).css('backgroundImage',`url(images/bgs/${this.theme.type}/bg1.jpg)`);
            clearInterval(this.randomImg.timer);
            this.randomImg.timer = null;
            this.initList();
        }
    }
}

var canvas = $('canvas')[0];
//宽高暂时未设置
var ctx = canvas.getContext('2d');
var HEIGHT:number;
var WIDTH:number;
var cw:number;

var ARR = [];
ARR.dotMode = 'random';
function getArr(){
    ARR.length = 0;
    ARR.linearGradient = ctx.createLinearGradient(0,295,0,0);
    ARR.linearGradient.addColorStop(0,'#5435E8');
    ARR.linearGradient.addColorStop(0.8,'#8617F4');
    ARR.linearGradient.addColorStop(1,'#C62F2F');
    for(let i=0;i<SIZE;i++){
        var x = random(0,WIDTH),
            y = random(0,HEIGHT),
            color = `rgba(${random(100,250)},${random(50,250)},${random(50,100)},0)`,
            ran = random(1,8)*0.2;
        ARR.push({
            x:x,
            y:y,
            color:color,
            dx:ARR.dotMode == 'random' ? ran:0,
            dx2:ran,
            dy:random(1,5),
            cap:0,
            cheight:10
        });

    }
}
function init(){
    var winH = $(window).height();
    $('#mainc').height(winH*2/5).css('top',-winH*2/5);
    HEIGHT = $('#mainc').height();
    WIDTH = $('#mainc').width();
    SIZE = WIDTH>768?64:32;
    canvas.height = HEIGHT;
    canvas.width = WIDTH;
    getArr();
}
init();
$(window).resize(init);
Render.type = 'Column';
function random(min:number,max:number):number{
    min = min || 0;
    max = max || 1;
    return max >= min ? Math.round(Math.random()*(max - min)+min):0;
}
function Render(){
    var o = null;
    return function(del,ave){
        ctx.fillStyle = ARR.linearGradient;
        var w = Math.round(WIDTH / SIZE),
            cgap = Math.round(w*0.3);
            cw = w - cgap;
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        if(Render.type == 'Dot' && ((del>3 && ave>30) ||(ave >50 && del > 0) )){
            var d = Math.round(del * (ave-20)*0.01)+4;
            for(let i=0;i<d;i++){
                var y = random(-HEIGHT*2,3*HEIGHT);
                ctx.beginPath();
                ctx.moveTo(0,y);
                ctx.lineTo(WIDTH,HEIGHT-y);
                ctx.strokeStyle = `rgba(${random(100,250)},${random(50,250)},${random(50,100)})`;
                ctx.stroke();
            }
        }
        for(let i = 0;i < SIZE;i++){
            o = ARR[i];
            if(Render.type == 'Dot'){
                var x = o.x,
                    y = o.y,
                    r = Math.round( (this[i]/2+18)*(HEIGHT > WIDTH ? WIDTH :HEIGHT)/600 );/*这里省略了移动端的判断*/
                o.x+=o.dx;
                o.x>WIDTH && (o.x =0);
                //开始路径，绘画圆
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2, true);
                var gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
                gradient.addColorStop(0, "rgb(255,255,255)");
                ctx.fillStyle = gradient;
                ctx.fill();
            }
            if(Render.type == 'Column'){
                var h = this[i] / 280 * HEIGHT;
                ARR[i].cheight > cw && (ARR[i].cheight = cw);
                if(--ARR[i].cap < ARR[i].cheight){
                    ARR[i].cap = ARR[i].cheight;
                }
                if(h > 0 && (ARR[i].cap < h + 40)){
                    ARR[i].cap = h + 40 > HEIGHT ? HEIGHT : h + 40;
                }
                //console.log(ARR[i].cap);
                ctx.fillRect(w * i, HEIGHT - ARR[i].cap, cw, ARR[i].cheight);
                ctx.fillRect(w * i, HEIGHT - h, cw, h);
            }
        }
    }
}

var music = new Music('mayday',20);
$('#switch .dropdown-menu').delegate('a','click',function(){
    window.location.hash = $(this).attr('href');
    music.reset();
});