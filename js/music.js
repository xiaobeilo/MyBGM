/// <reference path="jquery.d.ts" />
var Music = (function () {
    function Music() {
        this.currentSong = 0;
        this.list = $('#m-list');
        this.listBtn = $('#m-box h3');
        this.lyricContainer = $('.lyc-container');
        this.rate = $('#mainc .progress-bar');
        this.f_play = $('#f-play');
        this.f_prev = $('#f-prev');
        this.f_next = $('#f-next');
        this.lyric = [];
        this.PLAY = 1;
        this.PAUSE = -1;
        this.STOP = 0;
        this.audio = $('#audio')[0];
        var me = this;
        this.initList();
        this.listBtn.click(function () {
            $(this).next().toggle();
        });
        this.list.on('click', 'li', function () {
            me.currentSong = parseInt($(this).data('idx'));
            me.playNew(me.currentSong);
            me.upState();
        });
        $(document).on('click', function (e) {
            e.target.nodeName !== 'H3' && me.list.hide();
        });
        this.f_play.click(function () {
            var span = $(this).children();
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
            var w = me.rate.parent().width();
            me.rate.width(now * w / time);
        });
    }
    Music.prototype.initList = function () {
        var me = this;
        $.ajax({
            type: 'GET',
            url: 'data/mayday.php',
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
        Array.prototype.forEach.call(this.listLi, function (v, i, a) {
            if (v.className === 'current') {
                return curIdx = i;
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
        this.upState();
        this.playNew(this.currentSong = curIdx);
    };
    Music.prototype.playNew = function (idx) {
        this.lyricContainer.html('正在载入...');
        /*初始化歌词
        切换封面
        * */
        var me = this;
        this.audio.src = this.allSongData[idx].qiniu_src;
        var lyricSrc = './data/songs_mayday/' + this.allSongData[idx].lrc_name + '.lrc';
        this.audio.oncanplay = function () {
            me.getLyric(lyricSrc);
            me.status = me.PLAY;
            me.upState();
        };
        this.audio.onerror = function () {
            //    提示
        };
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
                break;
            /*播放音频 转动专辑 滚动歌词*/
            case this.PAUSE:
                this.audio.pause();
                this.f_play.children().removeClass('glyphicon-pause').addClass('glyphicon-play');
                break;
            case this.STOP:
        }
        this.listLi.eq(this.currentSong).addClass('current').find('i').text('').addClass('glyphicon glyphicon-music').end()
            .siblings('.current').removeClass('current').find('i').removeClass('glyphicon-music').text(function () {
            return parseInt($(this).parents('li').data('idx')) + 1;
        });
        this.listBtn.text(this.allSongData[this.currentSong].song_name);
    };
    return Music;
}());
new Music();
//# sourceMappingURL=music.js.map