//=============================================================================
// GraphicsRotate.js
//=============================================================================
/*:
 * @plugindesc 旋转屏幕 及 网页元素添加 
 * @author wangwang
 *
 * @param  GraphicsRotate
 * @desc 插件 旋转屏幕 及 网页元素添加,作者:汪汪
 * @default 汪汪 
 *
 * @help  
 * 网页动态添加元素
 * 修改部分
 * Graphics
 * Input
 * Graphics._createElement( "cs","input",  { "type": "tel", "sz": { "x": 20, "y": 30, "width": 100, "height": 30, "fontSize": 20 }}   )
 * 创建一个输入框, id 为 "cs",种类为 tel (电话输入) 框, x坐标为 20 y坐标为 30 , 宽 100 , 高 30 ,输入的字字体大小 20
 * "tel" 改成 "text" 为文本输入 ,改成 "number" 为 数字输入 ,改成 "password" 为密码输入
 * 
 * 创建时会先移除同名的(如果有的话)再添加新的
 * 
 * Graphics._getElement("cs") 获取id 为"cs" 的输入框 
 * Graphics._getElement("cs") && Graphics._getElement("cs").value 
 * 
 * 
 * 如果有"cs"输入框,返回它的 value 参数的值,如果没有返回 为 假 (undefined) 
 *  ( (Graphics._getElement("cs") && Graphics._getElement("cs").value ) || ""  )  
 * 如果有"cs"输入框,返回它的 value 参数的值,如果没有或者值为假(false,"", null, undefined )返回 为 ""
 * 
 * 
 * 
 * Graphics._removeElement("cs") 
 * 移除"cs" 输入框
 */


Graphics._rotate = 0

Graphics._inputType = {
    "button": {},
    "checkbox": {},
    "date": {},
    "datetime": {},
    "datetime-local": {},
    "email": {},
    "file": {},
    "hidden": {},
    "image": {},
    "month": {},
    "number": {},
    "password": {},
    "radio": {},
    "range": {},
    "reset": {},
    "submit": {},
    "text": {},
    "time": {},
    "url": {},
    "week": {}
}

/* overflow: hidden;
 white-space: nowrap;*/

Graphics._disableTextSelection = function (body, type) {
    if (type) {
        var v = ""
    } else {
        var v = "none"
    }
    var body = body || document.body;
    body.style.userSelect = v;
    body.style.webkitUserSelect = v;
    body.style.msUserSelect = v;
    body.style.mozUserSelect = v

    /* -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
    user-select: none;}
 */
};


Graphics._createAllElements = function () {

    this._createBase()

    this._createErrorPrinter();
    this._createCanvas();
    this._createVideo();
    this._createUpperCanvas();
    this._createRenderer();
    this._createFPSMeter();
    this._createModeBox();
    this._createGameFontLoader();

    this._createElements() //修改

    this._updateAllElements()

    // this._switchFPSMeter();

};

Graphics._createBase = function (id) {
    this._base = document.createElement('div');

    this._base.style.position = 'absolute';
    this._base.style.margin = 'auto';
    this._base.style.top = 0 + 'px';
    this._base.style.left = 0 + 'px';

    this._base.style.right = 0 + 'px';
    this._base.style.bottom = 0 + 'px';

    this._base.style.width = 0 + 'px';
    this._base.style.height = 0 + 'px';
    document.body.appendChild(this._base);
}

/**创建错误打印
 * @static
 * @method _createErrorPrinter
 * @private
 */
Graphics._createErrorPrinter = function () {
    this._errorPrinter = document.createElement('p');
    this._errorPrinter.id = 'ErrorPrinter';
    this._updateErrorPrinter();
    this._addElementToBody(this._errorPrinter);
};


/**创建画布
 * @static
 * @method _createCanvas
 * @private
 */
Graphics._createCanvas = function () {
    this._canvas = document.createElement('canvas');
    this._canvas.id = 'GameCanvas';
    this._updateCanvas();
    this._addElementToBody(this._canvas);
};

/**创建视频
 * @static
 * @method _createVideo
 * @private
 */
Graphics._createVideo = function () {
    this._video = document.createElement('video');
    this._video.id = 'GameVideo';
    this._video.style.opacity = 0;
    this._video.setAttribute('playsinline', '');
    this._video.volume = this._videoVolume;
    this._updateVideo();
    makeVideoPlayableInline(this._video);
    this._addElementToBody(this._video);
};


/**创建上层画布
 * @static
 * @method _createUpperCanvas
 * @private
 */
Graphics._createUpperCanvas = function () {
    this._upperCanvas = document.createElement('canvas');
    this._upperCanvas.id = 'UpperCanvas';
    this._updateUpperCanvas();
    this._addElementToBody(this._upperCanvas);
};


/**创建模式盒
 * @static
 * @method _createModeBox
 * @private
 */
Graphics._createModeBox = function () {
    var box = document.createElement('div');
    box.id = 'modeTextBack';
    box.style.position = 'absolute';
    box.style.left = '5px';
    box.style.top = '5px';
    box.style.width = '119px';
    box.style.height = '58px';
    box.style.background = 'rgba(0,0,0,0.2)';
    box.style.zIndex = 9;
    box.style.opacity = 0;

    var text = document.createElement('div');
    text.id = 'modeText';
    text.style.position = 'absolute';
    text.style.left = '0px';
    text.style.top = '41px';
    text.style.width = '119px';
    text.style.fontSize = '12px';
    text.style.fontFamily = 'monospace';
    text.style.color = 'white';
    text.style.textAlign = 'center';
    text.style.textShadow = '1px 1px 0 rgba(0,0,0,0.5)';
    text.innerHTML = this.isWebGL() ? 'WebGL mode' : 'Canvas mode';

    this._addElementToBody(box);
    box.appendChild(text);

    this._modeBox = box;
};


/**创建字体加载
 * @static
 * @method _createFontLoader
 * @param {string} name
 * @private
 */
Graphics._createFontLoader = function (name) {
    var div = document.createElement('div');
    var text = document.createTextNode('.');
    div.style.fontFamily = name;
    div.style.fontSize = '0px';
    div.style.color = 'transparent';
    div.style.position = 'absolute';
    div.style.margin = 'auto';
    div.style.top = '0px';
    div.style.left = '0px';
    div.style.width = '1px';
    div.style.height = '1px';
    div.appendChild(text);
    this._addElementToBody(div);
};





/**中心元素 */
Graphics._centerElement = function (element) {
    var width = element.width * this._realScale;
    var height = element.height * this._realScale;
    element.style.position = 'absolute';
    element.style.margin = 'auto';
    element.style.top = 0;
    element.style.left = 0;
    element.style.right = 0;
    element.style.bottom = 0;
    element.style.width = width + 'px';
    element.style.height = height + 'px';
};



/**创建元素组 */
Graphics._createElements = function () {
    this._elements = {}
    this._elementsBody = document.createElement('div')
    this._elementsBody.id = 'elementsBody';
    this._updateElementsBody()
    this._addElementToBody(this._elementsBody);
};



/**添加元素到基础 */
Graphics._addElementToBody = function (e) {
    this._base.appendChild(e);
}

/**添加元素到 */
Graphics._addElement2 = function (e, body) {
    Graphics._disableTextSelection(e, true)
    var body = this._getElementById(body)
    var body = body || this._elementsBody
    body.appendChild(e);
}

/**获取id的元素 */
Graphics._getElementById = function (element) {
    var t = typeof (element)
    if (t == "string" || t == "number") {
        var element = this._getElement(element)
    }
    return element
}






/**更新所有成分
 * @static
 * @method _updateAllElements
 * @private
 */
Graphics._updateAllElements = function () {
    this._updateRealScale();
    this._updateErrorPrinter();
    this._updateCanvas();
    this._updateVideo();
    this._updateUpperCanvas();
    this._updateRenderer();

    this._updateElements(); //添加

    this._paintUpperCanvas();
};



/**更新画布
 * @static
 * @method _updateCanvas
 * @private
 */
Graphics._updateElementsBody = function () {
    this._elementsBody.width = this._width;
    this._elementsBody.height = this._height;
    this._elementsBody.style.zIndex = 112;
    this._centerElement(this._elementsBody);
};


//创建输入
Graphics._createElement = function (id, type, set, set2, body) {

    var element = document.createElement(type);
    this._addElement(id, element)
    if (set) {
        this._setElement(element, set)
    }
    //this._elements[id].style.zIndex = 112;
	/*if (set3 == "transparent"){//设置透明背景色
		this._elements[id].style.backgroundColor="transparent"
		this._elements[id].style.color="#FFFFFF"
	}
	if (set4 == "solid"){//设置边框
	this._elements[id].style.outline = "none"
	this._elements[id].style.borderStyle = "solid"
	this._elements[id].style.borderColor= set5 //"#ff0000";//边框颜色
	this._elements[id].style.borderWidth= set6 //"1px";//边框宽度
	}*/
    if (set2) {
        this._setElement(element, set, "style")
    }
    this._updateElement(id)
    this._addElement2(this._elements[id], body);
    return this._elements[id]
};

/**添加元素 */
Graphics._addElement = function (id, element) {
    this._removeElement(id)
    this._elements[id] = element
    element.id = id;
    return this._elements[id]
}

/**设置元素 */
Graphics._setElement = function (element, set, type) {
    var element = Graphics._getElementById(element)
    if (element && set) {
        var element = element
        if (type) {
            element = element[type]
        }
    }
    this._setElementObj(element, set)
}

Graphics._setElementObj = function (obj, set) {
    if (obj && set) {
        for (var i in set) {
            var se = set[i]
            if (typeof se == "object" && !Array.isArray(se)) {
                if (!obj[i]) { obj[i] = {} }
                this._setElementObj(obj[i], se)
            } else {
                obj[i] = se
            }
        }
    }
}


//是添加元素
Graphics._isElement = function (element) {
    try {
        if (element && this._elements[element.id] == element) {
            return true
        }
    } catch (error) { }
    return false
};

//移除输入
Graphics._removeElement = function (id) {
    var element = Graphics._getElementById(id)
    if (element) {
        element.remove()
        delete this._elements[element.id]
    }
};


//更新输入
Graphics._updateElements = function () {
    this._updateElementsBody()
    for (var id in this._elements) {
        this._updateElement(id)
    }
}


Graphics._getElement = function (id) {
    return this._elements[id]
};



Graphics._updateElement = function (id) {
    var element = this._getElement(id)
    if (element) {
        var sz = element.sz
        if (sz) {
            var x = sz.x * this._realScale
            var y = sz.y * this._realScale
            var width = sz.width * this._realScale;
            var height = sz.height * this._realScale;
            var fontSize = sz.fontSize * this._realScale;
            element.style.position = 'absolute';
            element.style.margin = 'auto';
            element.style.top = y + 'px';
            element.style.left = x + 'px';
            element.style.width = width + 'px';
            element.style.height = height + 'px';
            element.style.fontSize = fontSize + 'px';
        }
    }
}

/**获取旋转设置 */
Graphics._getRotateSet = function (rotate) {
    var rotate = rotate ? "rotate(" + rotate + "deg)" : ""
    var set = {
        "-webkit-transform": rotate,
        "-moz-transform": rotate,
        "-ms-transform": rotate,
        "transform": rotate,
    }
    return set
}


/**获取旋转原点设置 */
Graphics._getRotateOriginSet = function (ox, oy) {
    var ox = ox ? "" + ox + "%" : "0"
    var oy = ox ? "" + oy + "%" : "0"
    var origin = ox + " " + oy
    var set = {
        "-webkit-transform-origin": origin,
        "-moz-transform-origin": origin,
        "-ms-transform-origin": origin,
        "transform-origin": origin,
    }
    return set
}


/**旋转元素 */
Graphics._rotateElement = function (id, rotate, ox, oy) {
    var element = this._getElementById(id)

    var rotateset = this._getRotateSet(rotate)
    var originset = this._getRotateOriginSet(ox, oy)
    this._setElement(element, rotateset, "style")
    this._setElement(element, originset, "style")
}



/**旋转到 */
Graphics.rotateTo = function (type) {
    var type = type || 0
    if (this._rotate != type) {
        var list = [0, -90, -180, 90]
        var set = this._getRotateSet(list[type])
        this._setElement(this._base, set, "style")
        this._rotate = type
        Graphics._updateAllElements()
    }
}

/**更新真实比例 */
Graphics._updateRealScale = function () {
    if (this._stretchEnabled) {
        var margin = "auto"
        if (this._rotate == 1 || this._rotate == 3) {
            this.innerWidth = window.innerHeight
            this.innerHeight = window.innerWidth
            if (this.innerWidth > this.innerHeight) {
                var w = (this.innerWidth - this.innerHeight) * 0.5
                var margin = "" + w + "px " + -w + "px " + -w + "px " + -w + "px "
            }
        } else {
            this.innerWidth = window.innerWidth
            this.innerHeight = window.innerHeight
        }
        var h = this.innerWidth / this._width;
        var v = this.innerHeight / this._height;

        var set = { width: this.innerWidth + "px", height: this.innerHeight + "px", margin: margin }

        this._setElement(
            this._base,
            set,
            "style"
        )

        if (h >= 1 && h - 0.01 <= 1) h = 1;
        if (v >= 1 && v - 0.01 <= 1) v = 1;
        this._realScale = Math.min(h, v);
    } else {
        this._realScale = this._scale;
    }
};




/**缺省伸展模式
 * @static
 * @method _defaultStretchMode
 * @private
 */
Graphics._defaultStretchMode = function () {
    return true //Utils.isNwjs() || Utils.isMobileDevice();
};












/**页到画布X2 */
Graphics.pageToCanvasX2 = function (x, y) {
    if (this._rotate == 1 || this._rotate == 3) {
        x = y
        if (this._rotate == 1) {
            x = this.innerWidth - x
        }
    } else {
        if (this._rotate == 2) {
            x = this.innerWidth - x
        }
    }
    return Graphics.pageToCanvasX(x)
}

/**页到画布Y2 */
Graphics.pageToCanvasY2 = function (x, y) {
    if (this._rotate == 1 || this._rotate == 3) {
        y = x
        if (this._rotate == 3) {
            y = this.innerHeight - y
        }
    } else {
        if (this._rotate == 2) {
            y = this.innerHeight - y
        }
    }
    return Graphics.pageToCanvasY(y)
}




//防止默认
Input._onKeyDown = function (event) {
    //如果 需要避免默认 (键值) 
    if (Graphics._isElement(document.activeElement)) {
        if (event.keyCode == 13 || event.keyCode == 27) { } else {
            return
        }
    } else {
        //需要避免默认
        if (this._shouldPreventDefault(event.keyCode)) {
            //避免默认
            event.preventDefault();
        }
    }

    //键值===144
    if (event.keyCode === 144) { // Numlock  数字开关
        //清除
        this.clear();
    }
    var buttonName = this.keyMapper[event.keyCode];
    //如果 键名
    if (buttonName) {
        //当前状态 键 =true
        this._currentState[buttonName] = true;
    }
};


/**当左键按下
 * @static
 * @method _onLeftButtonDown
 * @param {MouseEvent} event
 * @private
 */
TouchInput._onLeftButtonDown = function (event) {
    //x  = 画布x
    var x = Graphics.pageToCanvasX2(event.pageX, event.pageY);
    //y  = 画布y
    var y = Graphics.pageToCanvasY2(event.pageX, event.pageY);
    //是画布内部
    if (Graphics.isInsideCanvas(x, y)) {
        //鼠标按下 _mousePressed = true
        this._mousePressed = true;
        //按下时间 _pressedTime = 0
        this._pressedTime = 0;
        //当触发(x,y)
        this._onTrigger(x, y);
    }
};


/**当右键按下
 * @static
 * @method _onRightButtonDown
 * @param {MouseEvent} event
 * @private
 */
TouchInput._onRightButtonDown = function (event) {
    //x  = 画布x
    var x = Graphics.pageToCanvasX2(event.pageX, event.pageY);
    //y  = 画布y
    var y = Graphics.pageToCanvasY2(event.pageX, event.pageY);
    //是画布内部
    if (Graphics.isInsideCanvas(x, y)) {
        //当取消(x,y)
        this._onCancel(x, y);
    }
};











/**当鼠标移动
 * @static
 * @method _onMouseMove
 * @param {MouseEvent} event
 * @private
 */
TouchInput._onMouseMove = function (event) {
    //如果 鼠标按下
    //if (this._mousePressed) {
    //画布x 
    var x = Graphics.pageToCanvasX2(event.pageX, event.pageY);
    //y  = 画布y
    var y = Graphics.pageToCanvasY2(event.pageX, event.pageY);
    //当移动(x,y)
    this._onMove(x, y);
    //}
};



/**当鼠标抬起
 * @static
 * @method _onMouseUp
 * @param {MouseEvent} event
 * @private
 */
TouchInput._onMouseUp = function (event) {
    //如果 事件按键 ===0
    if (event.button === 0) {
        //画布 x
        //x  = 画布x
        var x = Graphics.pageToCanvasX2(event.pageX, event.pageY);
        //y  = 画布y
        var y = Graphics.pageToCanvasY2(event.pageX, event.pageY);
        //鼠标 按下
        this._mousePressed = false;
        //当释放(x,y)
        this._onRelease(x, y);
    }
};











/**当触摸开始
 * @static
 * @method _onTouchStart
 * @param {TouchEvent} event
 * @private
 */
TouchInput._onTouchStart = function (event) {
    //循环 在 事件改变触摸组
    for (var i = 0; i < event.changedTouches.length; i++) {
        //触摸 =  事件改变触摸组[i]
        var touch = event.changedTouches[i];
        //x  = 画布x 
        var x = Graphics.pageToCanvasX2(touch.pageX, touch.pageY);
        //y  = 画布y
        var y = Graphics.pageToCanvasY2(touch.pageX, touch.pageY);
        if (Graphics.isInsideCanvas(x, y)) {
            //屏幕按下 = true
            this._screenPressed = true;
            //按下时间=0
            this._pressedTime = 0;
            //触摸大于等于 2
            if (event.touches.length >= 2) {
                //当取消(x,y)
                this._onCancel(x, y);
            } else {
                //当触发(x,y)
                this._onTrigger(x, y);
            }
            //避免默认


        }

    }
    //if (window.cordova || window.navigator.standalone) {
    //避免默认
    if (!Graphics._isElement(event.target)) {
        event.preventDefault();
    }
    //}
};

/**当触摸移动
 * @static
 * @method _onTouchMove
 * @param {TouchEvent} event
 * @private
 */
TouchInput._onTouchMove = function (event) {
    //循环 在 事件改变触摸组
    for (var i = 0; i < event.changedTouches.length; i++) {
        //触摸 = 事件改变触摸组[i]
        var touch = event.changedTouches[i];
        //x  = 画布x
        var x = Graphics.pageToCanvasX2(touch.pageX, touch.pageY);
        //y  = 画布y
        var y = Graphics.pageToCanvasY2(touch.pageX, touch.pageY);

        this._onMove(x, y);
    }
};

/**当触摸结束
 * @static
 * @method _onTouchEnd
 * @param {TouchEvent} event
 * @private
 */
TouchInput._onTouchEnd = function (event) {
    //循环 在 事件改变触摸组
    for (var i = 0; i < event.changedTouches.length; i++) {
        //触摸 = 事件改变触摸组[i]
        var touch = event.changedTouches[i];
        //x  = 画布x
        var x = Graphics.pageToCanvasX2(touch.pageX, touch.pageY);
        //y  = 画布y
        var y = Graphics.pageToCanvasY2(touch.pageX, touch.pageY);
        //屏幕按下 = false
        this._screenPressed = false;
        //当释放(x,y)
        this._onRelease(x, y);
    }
};



/**当指示物按下
 * @static
 * @method _onPointerDown
 * @param {PointerEvent} event
 * @private
 */
TouchInput._onPointerDown = function (event) {
    if (event.pointerType === 'touch' && !event.isPrimary) {
        var x = Graphics.pageToCanvasX2(event.pageX, event.pageY);
        //y  = 画布y
        var y = Graphics.pageToCanvasY2(event.pageX, event.pageY);
        if (Graphics.isInsideCanvas(x, y)) {
            // For Microsoft Edge
            this._onCancel(x, y);
            if (!Graphics._isElement(event.target)) {
                event.preventDefault();
            }
        }
    }
};














