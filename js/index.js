var mySwipe = Swipe($('#mySwipe')[0],{
/*参数未定*/
});
$('#mySwipe').click(function(){
    mySwipe.next();
})
$(window).load(function(){
    $('body').height($(this).innerHeight());
    $('#mySwipe').animate({
        'top':$(window).innerHeight()/2-150
    },1000)
}).resize(function(){
    $('#mySwipe').css('top',$(this).innerHeight()/2-150);
    $('body').height($(this).innerHeight());

})
// $('li.current').find('span').text('').addClass('glyphicon glyphicon-music');
/*记得设置data-i属性*/