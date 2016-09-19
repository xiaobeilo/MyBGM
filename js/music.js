/// <reference path="jquery.d.ts" />
var Music = (function () {
    function Music(type, count) {
        this.currentSong = 0;
        this.list = $('#m-list');
        this.listBtn = $('#m-box h3');
        this.lyricContainer = $('.lyc-container');
        this.rateBar = $('#mainc .progress-bar');
        this.rate = $('#mainc .progress');
        this.volBar = $('#vol .progress-bar');
        this.vol = $('#vol .progress');
        this.f_play = $('#f-play');
        this.f_prev = $('#f-prev');
        this.f_next = $('#f-next');
        this.spe = $('.spe>img');
        this.spePre = {};
        this.randomImg = {};
        this.theme = {};
        this.lyric = [];
        this.PLAY = 1;
        this.PAUSE = -1;
        this.STOP = 0;
        this.audio = $('#audio')[0];
        var me = this;
        this.theme.type = type;
        this.theme.count = count;
        this.initList();
        this.listBtn.click(function () {
            $(this).next().toggle();
        });
        this.list.on('click', 'li', function () {
            me.currentSong = parseInt($(this).data('idx'));
            me.playNew(me.currentSong);
        });
        $(document).on('click', function (e) {
            e.target.nodeName !== 'H3' && me.list.hide();
        });
        this.f_play.click(function () {
            if (me.status === me.PLAY) {
                me.status = me.PAUSE;
            }
            else {
                me.status = me.PLAY;
            }
            me.upState();
        });
        this.f_next.click(function () {
            me.playTo('next');
        });
        this.f_prev.click(function () {
            me.playTo('prev');
        });
        this.audio.addEventListener('timeupdate', function () {
            if (me.lyricContainer.children().length === 0) {
                return;
            }
            var now = this.currentTime;
            var time = this.duration;
            var mTime = 0, sTime = 0, mNow = 0, sNow = 0;
            var n = 0;
            if (!me.lyric)
                return;
            for (var i = 0, l = me.lyric.length; i < l; i++) {
                if (now > me.lyric[i][0] - 0.50) {
                    var line = document.getElementById('line-' + i), prevLine = document.getElementById('line-' + (i > 0 ? i - 1 : i));
                    prevLine.className = '';
                    line.className = 'active';
                    me.lyricContainer.children().css('top', 130 - line.offsetTop + 'px');
                }
            }
            var w = me.rateBar.parent().width();
            me.rateBar.width(now * w / time);
        });
        this.rate.click(function (e) {
            var r = e.offsetX / me.rate.width();
            me.audio.currentTime = r * me.audio.duration;
        });
        this.vol.click(function (e) {
            var w = me.vol.width();
            var r = e.offsetX / w;
            me.audio.volume = r;
            me.volBar.width(r * w);
        });
        this.audio.onended = function () {
            me.playTo('next');
        };
    }
    Music.prototype.initList = function () {
        var me = this;
        $.ajax({
            type: 'GET',
            url: 'data/' + this.theme.type + '.php',
            dataType: 'json',
            success: function (data) {
                me.allSongData = data;
                var template = '';
                var arr = Array.prototype.slice.apply(me.allSongData);
                for (var i = 0; i < arr.length; i++) {
                    template += "\n                    <li data-idx='" + i + "'><a href=\"#\"><i>" + (i + 1) + "</i><span>" + arr[i].song_name + "-" + arr[i].artist + "</span></a></li>\n                  ";
                }
                me.list.html(template);
                me.listLi = $('#m-list li');
                me.playTo();
            }
        });
    };
    Music.prototype.playTo = function (dir) {
        var curIdx = 0;
        this.listLi.each(function (idx, ele) {
            if (ele.className === 'current') {
                curIdx = idx;
                return false;
            }
        });
        if (dir) {
            switch (dir) {
                case 'prev':
                    if (curIdx === 0) {
                        curIdx = this.allSongData.length - 1;
                    }
                    else {
                        curIdx--;
                    }
                    break;
                case 'next':
                    if (curIdx === this.allSongData.length - 1) {
                        curIdx = 0;
                    }
                    else {
                        curIdx++;
                    }
                    break;
            }
        }
        this.playNew(this.currentSong = curIdx);
    };
    Music.prototype.playNew = function (idx) {
        this.lyricContainer.html('正在载入...');
        this.spePre.moved = 0;
        clearInterval(this.spePre.timer);
        this.spe.attr('src', "images/special/" + this.theme.type + "/" + this.allSongData[this.currentSong].spe_en + ".jpg");
        var me = this;
        load(this.allSongData[idx].qiniu_src);
        // this.audio.src = this.allSongData[idx].qiniu_src;
        var lyricSrc = "./data/" + this.theme.type + "/" + this.allSongData[idx].lrc_name + ".lrc";
        me.getLyric(lyricSrc);
        me.status = me.PLAY;
        me.upState();
    };
    Music.prototype.getLyric = function (url) {
        var me = this;
        $.ajax({
            url: url,
            type: 'GET',
            success: function (data) {
                parseLyric(data.trim());
            }
        });
        function parseLyric(text) {
            var lines = text.split(/\n/g); //分割每行歌词
            var pattern = /\[\d{2}:\d{2}.\d{2}\]/g;
            var result = []; //声明一个空数组,存放歌词对象
            var offset = getOffset(text);
            while (!pattern.test(lines[0])) {
                lines = lines.slice(1);
            }
            lines[lines.length - 1].length === 0 && lines.pop();
            Array.prototype.forEach.call(lines, function (v, i, a) {
                var time = v.match(pattern), value = v.replace(pattern, '');
                Array.prototype.forEach.call(time, function (v1, i1, a1) {
                    var t = v1.slice(1, -1).split(':');
                    result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]) + offset / 1000, value]);
                });
            });
            result.sort(function (a, b) {
                return a[0] - b[0];
            });
            appendLyric(result);
            me.lyric = result;
        }
        function getOffset(text) {
            var offset = 0;
            try {
                var offsetPattern = /\[offset:\-?\+?\d+\]/g, offset_line = text.match(offsetPattern)[0], offset_str = offset_line.split(':')[1];
                offset = parseInt(offset_str);
            }
            catch (err) {
                offset = 0;
            }
            return offset;
        }
        function appendLyric(lyric) {
            var ul = document.createElement('ul');
            var template = '';
            for (var i = 0; i < lyric.length; i++) {
                template += "\n                <li id=\"line-" + i + "\">" + lyric[i][1] + "</li>\n                ";
            }
            me.lyricContainer.html('<ul>' + template + '</ul>');
        }
    };
    Music.prototype.upState = function () {
        switch (this.status) {
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
        if ($('#m-list li.current').data('idx') !== this.currentSong) {
            this.listLi.eq(this.currentSong).addClass('current').find('i').text('').addClass('glyphicon glyphicon-music').end()
                .siblings('.current').removeClass('current').find('i').removeClass('glyphicon-music').text(function () {
                return parseInt($(this).parents('li').data('idx')) + 1;
            });
        }
        this.listBtn.text(this.allSongData[this.currentSong].song_name);
    };
    Music.prototype.speRoll = function () {
        var _this = this;
        var interval = 100;
        var max = 360;
        var min = 0;
        var moved = this.spePre.moved;
        if (this.status === this.PLAY) {
            this.spePre.timer = setInterval(function () {
                _this.spePre.moved = moved++;
                _this.spe.css('transform', "rotate(" + moved + "deg)");
                if (moved === max)
                    moved = min;
            }, interval);
        }
        else if (this.status === this.PAUSE) {
            clearInterval(this.spePre.timer);
        }
    };
    Music.prototype.upBg = function () {
        var me = this;
        this.randomImg.inter = 5000;
        if (!this.randomImg.timer) {
            this.randomImg.timer = setInterval(function () {
                var r = Math.floor(Math.random() * me.theme.count) + 1;
                var img = new Image();
                img.src = "images/bgs/" + me.theme.type + "/bg" + r + ".jpg";
                img.onload = function () {
                    var url = "url(images/bgs/" + me.theme.type + "/bg" + r + ".jpg)";
                    $(document.body).css('backgroundImage', url);
                };
            }, me.randomImg.inter);
        }
        else {
            clearInterval(this.randomImg.timer);
            this.randomImg.timer = null;
        }
    };
    Music.prototype.reset = function (type, count) {
        if (this.theme.type === type) {
            return;
        }
        else {
            this.theme.type = type;
            this.theme.count = count;
            $(document.body).css('backgroundImage', "url(images/bgs/" + this.theme.type + "/bg1.jpg)");
            clearInterval(this.randomImg.timer);
            this.randomImg.timer = null;
            this.initList();
        }
    };
    return Music;
}());
var xhr = new XMLHttpRequest();
var ac = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = ac[ac.createGain ? 'createGain' : 'createGainNode']();
gainNode.connect(ac.destination);
var source = null;
var count = 0;
function load(url) {
    var n = ++count;
    source && source[source.stop ? 'stop' : 'noteOff']();
    xhr.abort();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
        if (n !== count)
            return;
        ac.decodeAudioData(xhr.response, function (buffer) {
            if (n !== count)
                return;
            var bufferSouce = ac.createBufferSource();
            bufferSouce.buffer = buffer;
            bufferSouce.connect(gainNode);
            bufferSouce[bufferSouce.start ? 'start' : 'noteOn'](0);
            source = bufferSouce;
        }, function (err) {
            console.log(err);
        });
    };
    xhr.send();
}
function changeVolume(percent) {
    gainNode.gain.value = percent * percent;
}
$('#volume').change(function () {
    changeVolume(this.value / this.max);
});
var music = new Music('mayday', 20);
$('#switch .dropdown-menu').delegate('a', 'click', function () {
    var v = $(this).attr('href').slice(1);
    switch (v) {
        case 'dianyin':
            music.reset('dianyin', 4);
            break;
        case 'mayday':
            music.reset('mayday', 20);
            break;
        case 'xzz':
            music.reset('xzz', 4);
            break;
        case 'jay':
            music.reset('jay', 10);
            break;
    }
});
//# sourceMappingURL=music.js.map