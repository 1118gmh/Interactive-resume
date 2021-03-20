let loadingRender = (function() {
    let $loadingBox = $('.loadingBox'),
        $current = $loadingBox.find('.current');
    let imgData = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course2.png", "img/zf_course3.png", "img/zf_course4.png", "img/zf_course5.png", "img/zf_course6.png", "img/zf_cube1.png", "img/zf_cube2.png", "img/zf_cube3.png", "img/zf_cube4.png", "img/zf_cube5.png", "img/zf_cube6.png", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png", "img/zf_emploment.png", "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/zf_messageLogo.png", "img/zf_messageStudent.png", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png", "img/zf_style1.jpg", "img/zf_style2.jpg", "img/zf_style3.jpg", "img/zf_styleTip1.png", "img/zf_styleTip2.png", "img/zf_teacher1.png", "img/zf_teacher2.png", "img/zf_teacher3.jpg", "img/zf_teacher4.png", "img/zf_teacher5.png", "img/zf_teacher6.png", "img/zf_teacherTip.png"];
    let n = 0,
        len = imgData.length;
    //maxDelay:设置最长等待时间（假设最长等10s,如果10s到了，我们可以看看加载了多少，如果已经达到了90%以上，我们可以正常访问内容，如果不足这个比例，直接提示用户当前网络状态不佳，稍后重试）
    let delayTimer = null;
    let maxDelay = function(callback) {
        delayTimer = setTimeout(() => {
            if (n / len > 0.9) {
                //让用户感觉加载完了
                $current.css('width', '100%');
                callback && callback();
                return;
            }
            alert('非常遗憾，当前您的网络状况不佳，请稍后再试！');
            //此时我们应该让其关掉页面或者跳转其他页面
            // window.location.href = 'http://www.qq.com';
        }, 10000);
    };
    //done:完成
    let done = function() {
        //加载完成后停留1秒后跳转下一个环节
        let timer = setTimeout(() => {
            clearTimeout(timer);
            $loadingBox.remove();
            phoneRender.init();
        }, 1000);
    };
    //Run:预加载图片
    let run = function(callback) {
        imgData.forEach(item => {
            let tempImg = new Image();
            tempImg.addEventListener('load', () => {
                tempImg = null;
                $current.css('width', ((++n) / len) * 100 + '%');
                if (n === len) {
                    clearTimeout(delayTimer);
                    callback && callback();
                }
            });
            //加载完成后：执行回调函数（让当前loading页面消失）

            tempImg.src = item;
        });
    };
    return {
        init: function() {
            $loadingBox.css('display', 'block');
            run(done);
            maxDelay(done);
        }
    }
})();

let phoneRender = (function() {
    let $phoneBox = $('.phoneBox'),
        $time = $phoneBox.find('.time'),
        $answer = $phoneBox.find('.answer'),
        $answerMarkLink = $answer.find('.markLink'),
        $hang = $phoneBox.find('.hang'),
        $hangMarkLink = $hang.find('.markLink'),
        //音视频使用原生的API
        answerBell = $('#answerBell')[0],
        introduction = $('#introduction')[0];
    let answerMarkTouch = function() {
        //1. 播放bell
        $answer.remove();
        answerBell.pause();
        $(answerBell).remove(); //一定要先暂停播放再移除，否则即使移除了浏览器也会播放这个声音
        //2. 设置transform让其显示
        $hang.css('transform', 'translateY(0)');
        $time.css('display', 'block');
        introduction.play();
    };
    let autoTimer = null;
    //closePhone:关闭Phone
    let closePhone = function() {
        clearInterval(autoTimer);
        introduction.pause();
        $(introduction).remove();
        $phoneBox.remove();

        messageRender.init();
    };
    let computedTime = function() {
        let duration = 0;
        //我们让audio播放，首先会加载资源，部分资源在加载完成后才会播放，才会计算出总时间duration等信息，所以我们可以把获取信息放到canplay事件中
        introduction.oncanplay = function() {
            duration = introduction.duration;
        };
        autoTimer = setInterval(() => {
            let val = introduction.currentTime;
            //播放完成
            if (val >= duration) {
                closePhone();
            }
            let minute = Math.floor(val / 60),
                second = Math.floor(val - minute * 60);
            minute = minute < 10 ? `0` + minute : minute;
            second = second < 10 ? `0` + second : second;
            $time.html(`${minute}:${second}`);
        }, 1000);
    };
    return {
        init: function() {
            $phoneBox.css('display', 'block');
            //播放BELL
            answerBell.play();
            answerBell.volume = 0.3;
            //点击answerMark
            // $answerMarkLink.on('click', () => {
            //     answerMarkTouch()
            //     computedTime();
            // });
            $answerMarkLink.tap(answerMarkTouch);
            $answerMarkLink.tap(computedTime);
            $hangMarkLink.on('click', closePhone);

        }
    }
})();

let messageRender = (function() {
    let $messageBox = $('.messageBox'),
        $wrapper = $messageBox.find('.wrapper'),
        $messageList = $wrapper.find('li'),
        $keyBorad = $messageBox.find('.keyBoard'),
        $textInp = $keyBorad.find('span'),
        $submit = $keyBorad.find('.submit'),
        demonMusic = $messageBox.find('#demonMusic')[0];

    let step = -1, //记录当前展示信息的索引
        total = $messageList.length + 1, //记录的是信息的总条数（自己发一条，所以加一）
        autoTimer = null,
        interval = 2000; //记录信息相继出现的间隔时间
    //自动发送
    let showMessage = function() {
        ++step;
        if (step === 2) {
            //已经展示两条了，结束自动发送信息，让键盘出来，开始执行手动发送
            clearInterval(autoTimer);
            handleSend();
            return;
        }
        let $cur = $messageList.eq(step);
        $cur.addClass('active');
        if (step >= 3) {
            //展示的条数已经是4条或4条以上的，此时需要让wrapper向上移动（移动的距离是新展示的这一条的高度）
            let curH = $cur[0].offsetHeight,
                wraT = parseFloat($wrapper.css('top'));
            $wrapper.css('top', wraT - curH);
        }
        if (step >= total - 1) {
            clearInterval(autoTimer);
            let timer = setTimeout(() => {
                closeMessage();
                clearTimeout(timer);
            }, 2000);
        }
    };

    //手动发送
    let handleSend = function() {
        //1. 让键盘出来
        $keyBorad.css('transform', 'translateY(0);')
            .one('transitionend', () => {
                //监听当前元素transition动画结束的事件，并且有几个样式属性改变，事件就执行了几次
                //因此改变on方法，使用one方法只会让其触发一次。
                let str = '好的，马上介绍!',
                    n = -1,
                    textTimer = null;
                textTimer = setInterval(() => {
                    let originHTML = $textInp.html();
                    $textInp.html(originHTML + str[++n]);
                    if (n >= str.length - 1) {
                        clearInterval(textTimer);
                        $submit.css('display', 'block');
                    }
                }, 100);
            });
    };

    let handleSubmit = function() {
        $(`<li class="self">
        <i class="arrow"></i>
        <img src="img/zf_messageStudent.png" alt="" class="pic">${$textInp.html()}
    </li>`).insertAfter($messageList.eq(1)).addClass('active');
        $messageList = $wrapper.find('li'); //重新获取messageList,因为页面中新增了一个小li，但是messageList还是原来的，要更新一下，便于后面自动发送
        //该消失的消失
        $textInp.html('');
        $submit.css('display', 'none');
        $keyBorad.css('transform', 'translateY(3.7rem)');

        //继续向下展示剩余的消息
        autoTimer = setInterval(showMessage, interval);
    };
    let closeMessage = function() {
        $messageBox.remove();
        demonMusic.pause();
        $(demonMusic).remove();

        cubeRender.init();
    };
    return {
        init: function() {
            $messageBox.css('display', 'block');
            showMessage(); //先展示一条信息
            autoTimer = setInterval(showMessage, interval); //每间隔2秒，展示一条信息
            $submit.tap(handleSubmit);
            // music
            demonMusic.play();
            demonMusic.minute = 0.1;
        }
    }
})();

let cubeRender = (function() {
    let $cubeBox = $('.cubeBox'),
        $cube = $('.cube'),
        $cubeList = $cube.find('li');

    let start = function(ev) {
        //记录手指按下位置的起始坐标
        let point = ev.changedTouches[0];
        this.strX = point.clientX;
        this.strY = point.clientY;
        this.changeX = 0;
        this.changeY = 0;

    };
    let move = function(ev) {
        //用最新手指的位置-起始的位置，记录X、Y的偏移
        let point = ev.changedTouches[0];
        this.changeX = point.clientX - this.strX;
        this.changeY = point.clientY - this.strY;


    };
    let end = function(ev) {
        //获取change、rotate值
        let { changeX, changeY, rotateX, rotateY } = this;

        //验证是否发生移动
        let isMove = null;
        Math.abs(changeX) > 10 || Math.abs(changeY) > 10 ? isMove = true : null;

        //只有发生移动再处理
        if (isMove) {
            //左右滑：changeX改变，操作的是rotateY 正比(changeX越大，rotateY越大)
            //上下滑：changeY改变，操作的是rotateX 反比（changeY越大，rotateY越小）
            rotateX = rotateX - changeY / 3;
            rotateY = rotateY + changeX / 3;
            $(this).css('transform', `scale(0.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
            //让当前旋转角度称为下次起始角度
            this.rotateX = rotateX;
            this.rotateY = rotateY;

        }

        ['strX', 'strY', 'changeX', 'changeY'].forEach(item => {
            this[item] = null;
        });
    };

    return {
        init: function() {
            $cubeBox.css('display', 'block');

            //手指操作cube，让cube跟着移动
            $cube[0].rotateX = -30;
            $cube[0].rotateY = 45; //记录初始的旋转角度
            $cube.on('touchstart', start)
                .on('touchmove', move)
                .on('touchend', end);

            //点击每一个页面跳转到详情区对应的页面
            $cubeList.tap(function(ev) {
                $cubeBox.css('display', 'none');

                //跳转详情区域，获取当前点击索引，通过传递索引，跳转到对应页面
                let index = $(this).index();
                detailRender.init(index);

            });
        }
    };
})();

let detailRender = (function() {
    let $detailBox = $('.detailBox'),
        swiper = null,
        $dl = $('.page1>dl'),
        $returnList = $('.return');
    let move = function(swiper) {
        //1. 判断当前是否为第一个slide，如果是让3D菜单展开，不是收起菜单
        let activeIn = swiper.activeIndex,
            slideAry = swiper.slides;
        if (activeIn === 0) {
            $dl.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0.8
            });
            $dl.makisu('open');
        } else {
            $dl.makisu({
                selector: 'dd',
                speed: 0
            });
            $dl.makisu('close');
        }
        //2. 滑动到哪个页面，把当前页面设置对应的ID，其余页面移除即可
        slideAry.forEach((item, index) => {
            if (activeIn === index) {
                item.id = `page${index+1}`;
                return;
            }
            item.id = null;
        });

    };
    let swiperInit = function() {
        swiper = new Swiper('.swiper-container', {
            effect: 'coverflow',
            on: {
                init: move,
                transitionEnd: move
            }
        });
    };

    return {
        init: function(index = 0) {
            $detailBox.css('display', 'block');
            if (!swiper) {
                //防止重复初始化
                swiperInit();
            }
            swiper.slideTo(index, 0); //直接运动到具体的slide
            $returnList.tap(function(ev) {
                $detailBox.css('display', 'none');
                cubeRender.init();
            });
        }
    }
})();

let url = window.location.href,
    well = url.indexOf('#'),
    hash = well === -1 ? null : url.substring(well + 1);
switch (hash) {
    case 'loading':
        loadingRender.init();
        break;
    case 'phone':
        phoneRender.init();
        break;
    case 'message':
        messageRender.init();
        break;
    case 'cube':
        cubeRender.init();
        break;
    case 'detail':
        detailRender.init();
        break;
    default:
        loadingRender.init();
        break;
}