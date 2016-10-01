var SIZE = 128;
var rang = 2;
var canvas = $('canvas')[0];
//宽高暂时未设置
var ctx = canvas.getContext('2d');
var HEIGHT =0 ;
var WIDTH = 0;
var cw =0 ;

var ARR = [];
ARR.dotMode = 'random';
function getArr(){
    ARR.length = 0;
    ARR.linearGradient = ctx.createLinearGradient(0,295,0,0);
    ARR.linearGradient.addColorStop(0,'#5435E8');
    ARR.linearGradient.addColorStop(0.8,'#8617F4');
    ARR.linearGradient.addColorStop(1,'#C62F2F');
    for(var i=0;i<SIZE;i++){
        var x = random(0,WIDTH),
            y = random(0,HEIGHT),
            color = 'rgba('+random(100,250)+','+random(50,250)+','+random(50,100)+','+'0)',
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
    rang = WIDTH>768?2:8;
    canvas.height = HEIGHT;
    canvas.width = WIDTH;
    getArr();
}
init();
// $(window).resize(init);
Render.type = 'Column';
function random(min,max){
    min = min || 0;
    max = max || 1;
    return max >= min ? Math.round(Math.random()*(max - min)+min):0;
}
function Render(){
    var o = null;
    return function(del,ave){
        ctx.fillStyle = ARR.linearGradient;
        var w = Math.round(WIDTH / (SIZE/rang)),
            cgap = Math.round(w*0.3);
        cw = w - cgap;
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        if(Render.type == 'Dot' && ((del>3 && ave>30) ||(ave >50 && del > 0) )){
            var d = Math.round(del * (ave-20)*0.01)+4;
            for(var i=0;i<d;i++){
                var y = random(-HEIGHT*2,3*HEIGHT);
                ctx.beginPath();
                ctx.moveTo(0,y);
                ctx.lineTo(WIDTH,HEIGHT-y);
                ctx.strokeStyle = 'rgba('+random(100,250)+','+random(50,250)+','+random(50,100)+')';
                ctx.stroke();
            }
        }
        for(var i = 0;i < SIZE;i+=rang){
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
                ctx.fillRect(w * i/rang, HEIGHT - ARR[i].cap, cw, ARR[i].cheight);
                ctx.fillRect(w * i/rang, HEIGHT - h, cw, h);
            }
        }
    }
}


var mySwipe = Swipe($('#mySwipe')[0],{
    /*参数未定*/
});
$('#mySwipe').click(function(){
    mySwipe.next();
})
var mySwipeH = $('#mySwipe').height();
$(window).load(function(){
    $('body').height($(this).innerHeight());
    $('#mySwipe').animate({
        'top':$(window).innerHeight()/2-mySwipeH*3/4
    },1000)
}).resize(function(){
    $('#mySwipe').css('top',$(this).innerHeight()/2-mySwipeH*3/4);
    $('body').height($(this).innerHeight());
    init();
});

var music = new Music('mayday',20);
$('#switch .dropdown-menu').delegate('a','click',function(){
    window.location.hash = $(this).attr('href');
    music.reset();
});
if(isApple){
    $("#playMark").show();
    $('#playBtn').hide();
    $(".wrapper").show();
    music.visualizer.addinit(function(){
        $(".wrapper").hide();
        $("#playBtn").show();
    });
    $("#playBtn").click(function(){
        $("#playMark").hide();
        $(this).hide();
        music.visualizer.start();
    })
};