//=============================================================================
//  2w_ScreenPictureUp.js
//=============================================================================

/*:
 * @plugindesc  
 * 2w_ScreenPictureUp ,场景-战斗地图人物事件显示图片
 * @author wangwang
 *   
 * @param  2w_ScreenPictureUp
 * @desc 插件 场景-战斗地图人物事件显示图片/文字 ,作者:汪汪
 * @default 汪汪
 * 
 * 
 * @help
 *   
 * 
 * 对于人物/事件/场景增加图片组
 * 
 * 如 $gamePlayer ,$gameMap.event(1),  
 * $gameScreen.mapPictures()  地图上层图片组
 * $gameScreen.mapPictures2() 地图下层图片组
 * $gameScreen.battlePictures() 战斗上层图片组
 * $gameScreen.battlePictures2() 战斗下层图片组
 * 
 * 显示图片
 * .showPicture(pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode) 
 * 移动图片
 * .movePicture (pictureId, origin, x, y, scaleX,scaleY, opacity, blendMode, duration)
 * 着色图片
 * .tintPicture  (pictureId, tone, duration)
 * 抹去图片
 * .erasePicture  (pictureId)
 * 抹去所有图片
 * .eraseAllPicture()
 * 
 * 储存所有图片到id (切换地图和进入战斗时,会自动保存到0号id )
 * .saveAllPicture(id)
 * 读取id对应的所有图片
 * .loadAllPicture(id)
 * 
 * 设置图片位置种类
 * .setPicturePositionType (pictureId, positionType)
 *      positionType 为数组 ,[type,id,pw,ph,tw,th,dx,dy]
 *      type 种类,
 *            0 父类精灵 , 
 *            1 地图图块位置, id参数为图块坐标,数组[x,y]
 *            2 地图像素位置, id参数为真实位置(即图块坐标*图块大小),数组[x,y]
 *            3 事件位置,id小于等于0为角色及随从
 *            5 队伍成员,id为队伍中的位置
 *            6 角色id,  id 为角色id
 *            7 敌人id(暂无)
 *            8 画面位置 id  0为一个像素, 1为整个画面
 *      id   id参数  如果不能确定存在,那么会自动隐藏
 *      pw   位于以上确定精灵的宽的比例
 *      ph   位于以上确定精灵的高的比例 
 *      tw   位于本精灵的宽的比例
 *      th   位于本精灵的高的比例
 *      dx   偏移x 
 *      dy   偏移y
 *      
 *      最终位置为(type ,id 确定的精灵为p)
 *       x = p的x + pw * p的宽 - 本精灵的宽 * tw + dx  
 *       y = p的y + ph * p的高 - 本精灵的高 * th + dy  
 * 
 * 
 * 设置图片方法组
 * .setPictureMethod(pictureId, list, re)
 * 
 *  list为数组 
 *  [{name:方法名,params:[参数,参数,参数]},{name:方法名,params:[参数,参数,参数]}]
 *  re 播放完后是否重新开始
 *  对于有等待的图片操作,会等待完后进行下一个方法,
 *  如 
 *  让1号图片在 0 ,100 到 100 , 100 之间来回移动
 *  .setPictureMethod(1, [{name:"move",params:[0,0 , 100,100,100,255,0,100]},{name:"movePicture",params:[0,100,100,100,100,255,0,100]}],true)
 *  让1号图片在 0 ,100 到 100 , 100 之间来回移动
 * 
 *  
 * 
 * 当name中 前面有 t/ 时 为绘制文字 ,后面跟 [长,宽,文字]
 * 当name中 前面有 w/ 时 为绘制窗口 ,后面跟[ 长,宽,文字]
 * 当name中 前面有 f/ 时为 图片 ,后面跟 [脸图名,索引]
 * 
 * 
 * 范例
 * s = $gameScreen.mapPictures()
 * s.showPicture(1,'t/[100,100,"上层"]',0,0,0,100,100,255,0)
 * s.setPicturePositionType(1,[1,[5,5],0.5,1,0.5,1])
 * s.setPictureMethod(1, [{name:"move",params:[0,0 , 100,100,100,255,0,100]},{name:"move",params:[0,100,100,100,100,255,0,100]}],true)
 * 
 *  
 * s2 = $gameScreen.mapPictures2()
 * s2.showPicture(1,'t/[100,100,"下层"]',0,0,0,100,100,255,0)
 * s2.setPicturePositionType(1,[1,[3,5],0.5,1,0.5,1])
 * s2.setPictureMethod(1, [{name:"move",params:[0,0 , 100,100,100,255,0,100]},{name:"move",params:[0,100,0,100,100,255,0,100]}],true)
 * 
 * 
 */

var ww = ww || {}

ww._ScreenPictureUp = {}


ww._ScreenPictureUp._Game_Picture_prototype_update = Game_Picture.prototype.update
Game_Picture.prototype.update = function () {
    ww._ScreenPictureUp._Game_Picture_prototype_update.call(this)
    this.updateNext()
};

/**更新下一个 */
Game_Picture.prototype.updateNext = function () { 
    if (this._duration <= 0 && this._toneDuration <= 0 && this._rotationDuration <= 0) {
        this.nextMethod()
    }
};


/**下一个方法 */
Game_Picture.prototype.nextMethod = function () {
    if (this._methods) {
        var method = this._methods[this._methodsIndex];
        //如果 方法 名称 并且 方法 名称 存在 
        if (method && method.name && this[method.name]) {
            // 方法 名称 应用 方法 参数
            this[method.name].apply(this, method.params);
        }
        this._methodsIndex += 1
        if (this._methodsre && this._methods.length <= this._methodsIndex) {
            this._methodsIndex = 0
        }
    }
};

/**设置位置种类 */
Game_Picture.prototype.positionType = function () {
    return this._positionType
};

/**设置位置种类 */
Game_Picture.prototype.setPositionType = function (positionType) {
    this._positionType = positionType
};


/**移动到 */
Game_Picture.prototype.move = function (origin, x, y, scaleX, scaleY,
    opacity, blendMode, duration) {

    if ((duration || 0) <= 0) {
        //原点 = 原点
        this._origin = origin;
        //x = x 
        this._x = x;
        //y = y 
        this._y = y;
        //比例x = 比例x 
        this._scaleX = scaleX;
        //比例y = 比例y
        this._scaleY = scaleY;
        //不透明度 = 不透明度
        this._opacity = opacity;
        //混合模式 = 混合模式
        this._blendMode = blendMode;
        //持续时间 = 持续时间
        this._duration = 0;
    } else {
        //原点 = 原点
        this._origin = origin;
        //目标x = x 
        this._targetX = x;
        //目标y = y 
        this._targetY = y;
        //目标比例x = 比例x 
        this._targetScaleX = scaleX;
        //目标比例y = 比例y
        this._targetScaleY = scaleY;
        //目标不透明度 = 不透明度
        this._targetOpacity = opacity;
        //混合模式 = 混合模式
        this._blendMode = blendMode;
        //持续时间 = 持续时间
        this._duration = duration;
    }
};


/**初始化旋转*/
Game_Picture.prototype.initRotation = function () {
    this._angle = 0;
    this._rotationSpeed = 0;
    this._rotationTarget = 0;
    this._rotationDuration = 0
};


/**
 * 更新旋转
 */
Game_Picture.prototype.updateRotation = function () {
    if (this._rotationSpeed !== 0) {
        this._angle += this._rotationSpeed / 2;
    }
    if (this._rotationDuration > 0) {
        var d = this._rotationDuration;
        this._angle = (this._angle * (d - 1) + this._rotationTarget) / d;
        this._rotationDuration--;
    }
};


/**
 * 旋转到
 * @param {number} rotation 角度 
 * @param {number} duration 持续时间 ,0时为立刻
 * 
 */
Game_Picture.prototype.rotateTo = function (rotation, duration) {
    this._rotationTarget = rotation || 0;
    this._rotationDuration = duration || 0;
    if (this._rotationDuration <= 0) {
        this._angle = this._rotationTarget
    }
};


/**
 * 设置原点
 * @param {number|[number,number]|{x:number,y:number}}origin 原点
 * 
 */
Game_Picture.prototype.setOrigin = function (origin) {
    this._origin = origin || 0
};







/**
 * 设置方法
 * @param {[{name: string, params: []} ]}list 方法
 * @param {boolean} re 返回
 * 
 */
Game_Picture.prototype.setMethod = function (list, re) {
    this._methods = list || []
    this._methodsIndex = 0
    this._methodsre = re
};


/**
 * 设置索引
 * @param {number }index 索引
 * 
 */
Game_Picture.prototype.setMethodIndex = function (index) {
    this._methodsIndex = index
};

/**
 * 设置方法返回
 * @param {boolean} re 返回
 * 
 */
Game_Picture.prototype.setMethodRe = function (re) {
    this._methodsre = re
};


/**
 * 添加方法
 * @param {string} methodName
 * @param {} params
 */
Game_Picture.prototype.pushMethod = function (methodName) {
    if (!this._methods) { this.setMethod() }
    //方法参数 = 数组 切割 呼叫 (参数,1)
    var methodArgs = Array.prototype.slice.call(arguments, 1);
    //方法组 添加 ( {名称:方法名称 ,参数:方法参数} )
    this._methods.push({ name: methodName, params: methodArgs });
}


/**
 *
 * Game_CharacterBase
 * 
 * */




ww._ScreenPictureUp._Game_CharacterBase_prototype_initMembers = Game_CharacterBase.prototype.initMembers
Game_CharacterBase.prototype.initMembers = function () {

    ww._ScreenPictureUp._Game_CharacterBase_prototype_initMembers.call(this)
    this._pictures = {}
    this._savePictures = {}
}



ww._ScreenPictureUp._Game_CharacterBase_prototype_update = Game_CharacterBase.prototype.update
Game_CharacterBase.prototype.update = function () {
    ww._ScreenPictureUp._Game_CharacterBase_prototype_update.call(this)
    this.updatePictures() /** */
};



Game_CharacterBase.prototype.picture = function (pictureId) {
    return this._pictures[pictureId]
};





/**更新图片*/
Game_CharacterBase.prototype.updatePictures = function () {
    if (this._pictures) {
        for (var n in this._pictures) {
            var picture = this._pictures[n]
            if (picture) {
                //图片 更新
                picture.update();
            }
        }

    }
};



/**显示图片
 * @param {number} pictureId 图片id
 * @param {number} origin 原点
 * @param {number} x x
 * @param {number} y y
 * @param {number} scaleX 比例x
 * @param {number} scaleY 比例y
 * @param {number} opacity 不透明度
 * @param {number} blendMode 混合模式 
 * @param {number} duration 持续时间 
 */
Game_CharacterBase.prototype.showPicture = function (pictureId, name, origin, x, y,
    scaleX, scaleY, opacity, blendMode) {
    //真实图片id = 真实图片id(图片id)
    var pictureId = pictureId;
    //图片 = 新 游戏图片
    var picture = new Game_Picture();
    //图片 显示(名称,原点,x,y,比例x,比例y,不透明度,混合方式)
    picture.show(name, origin, x, y, scaleX, scaleY, opacity, blendMode);
    //图片组[真实图片id] = 图片
    this._pictures[pictureId] = picture;
};
/**移动图片
 * @param {number} pictureId 图片id
 * @param {number} origin 原点
 * @param {number} x x
 * @param {number} y y
 * @param {number} scaleX 比例x
 * @param {number} scaleY 比例y
 * @param {number} opacity 不透明度
 * @param {number} blendMode 混合模式 
 * @param {number} duration 持续时间 
 */
Game_CharacterBase.prototype.movePicture = function (pictureId, origin, x, y, scaleX,
    scaleY, opacity, blendMode, duration) {
    //图片 = 图片(图片id)
    var picture = this.picture(pictureId);
    //如果 图片 
    if (picture) {
        //图片 移动  (原点,x,y,比例x,比例y,不透明度,混合方式,持续时间)
        picture.move(origin, x, y, scaleX, scaleY, opacity, blendMode, duration);
    }
};



/**旋转图片
 * @param {number} pictureId 图片id
 * @param {number} speed 速度
 * 
 */
Game_CharacterBase.prototype.rotatePicture = function (pictureId, speed) {
    //图片 = 图片(图片id)
    var picture = this.picture(pictureId);
    //如果 图片 
    if (picture) {
        //图片 旋转(速度)
        picture.rotate(speed);
    }
};
/**着色图片
 * @param {number} pictureId 图片id
 * @param {[number,number,number,number]} tone 色调
 * @param {number}  duration 持续时间
 * 
 */
Game_CharacterBase.prototype.tintPicture = function (pictureId, tone, duration) {
    //图片 = 图片(图片id)
    var picture = this.picture(pictureId);
    //如果 图片 
    if (picture) {
        //图片 着色 (色调 ,持续时间)
        picture.tint(tone, duration);
    }
};
/**抹去图片
 * @param {number} pictureId 图片id
 * */
Game_CharacterBase.prototype.erasePicture = function (pictureId) {
    //真实图片id = 真实图片id(图片id)
    //var realPictureId = this.picture(pictureId)
    //图片组[真实图片id] = null
    this._pictures[pictureId] = null;
};


/**消失所有图片 */
Game_CharacterBase.prototype.eraseAllPicture = function () {
    this._pictures = {}
};


Game_CharacterBase.prototype.saveAllPicture = function (id) {
    var id = id || 0
    this._savePictures[id] = this._pictures || {}
};

Game_CharacterBase.prototype.loadAllPicture = function (id) {
    var id = id || 0
    this._pictures = this._savePictures[id] || {}
};



/**
 * 设置图片位置
 * @param {number} pictureId 图片id
 * @param {[type,id,pw,ph,tw,th,dx,dy]} positionType
 */
Game_CharacterBase.prototype.setPicturePositionType = function (pictureId, positionType) {
    var picture = this.picture(pictureId);
    //如果 图片 
    if (picture) {
        //图片 旋转(速度)
        picture.setPositionType(positionType);
    }
};




/**
 * 设置图片原点
 * 
 * @param {number} pictureId 图片id
 * @param {number|[number,number]|{x:number,y:number}}origin 原点
 * 
 */
Game_CharacterBase.prototype.setPictureOrigin = function (pictureId, origin) {
    var picture = this.picture(pictureId);
    if (picture) {
        picture.setOrigin(origin);
    }
};


/**设置方法 */
Game_CharacterBase.prototype.setPictureMethod = function (pictureId, list, re) {
    var picture = this.picture(pictureId);
    if (picture) {
        picture.setMethod(list, re);
    }
};



/**设置图片方法循环*/
Game_CharacterBase.prototype.setPictureMethodRe = function (pictureId, re) {
    var picture = this.picture(pictureId);
    if (picture) {
        picture.setMethodRe(re);
    }
};

/**设置图片方法索引 */
Game_CharacterBase.prototype.setPictureMethodIndex = function (pictureId, index) {
    var picture = this.picture(pictureId);
    if (picture) {
        picture.setMethodIndex(index);
    }
};


/**添加图片方法
 * @param {number} pictureId
 * @param {[]} methodArgs
 * 
 */
Game_CharacterBase.prototype.pushPictureMethod = function (pictureId) {
    var picture = this.picture(pictureId);
    if (picture) {
        var methodArgs = Array.prototype.slice.call(arguments, 1);
        picture.pushMethod.apply(picture, methodArgs);
    }
};


Game_CharacterBase.prototype.nextPictureMethod = function (pictureId) {
    var picture = this.picture(pictureId);
    if (picture) { 
        picture.nextMethod()
    }
};





Game_Screen.prototype.mapPictures = function () {
    if (!this._mapPictures) {
        this._mapPictures = new Game_CharacterBase()
    }
    return this._mapPictures
};


/**游戏画面数据 */
Game_Screen.prototype.mapPictures2 = function () {
    if (!this._mapPictures2) {
        this._mapPictures2 = new Game_CharacterBase()
    }
    return this._mapPictures2
};

 


Game_Screen.prototype.battlePictures = function () {
    if (!this._battlePictures) {
        this._battlePictures = new Game_CharacterBase()
    }
    return this._battlePictures
};


Game_Screen.prototype.battlePictures2 = function () {
    if (!this._battlePictures2) {
        this._battlePictures2 = new Game_CharacterBase()
    }
    return this._battlePictures2
};



Game_Screen.prototype.updatePictures = function() {
    //图片组 对每一个 (方法 图片)
    this._pictures.forEach(function(picture) {
        //如果 图片 
        if (picture) {
            //图片 更新
            picture.update();
        }
    });

  
    this.mapPictures().update()
    this.mapPictures2().update()
    this.battlePictures().update()
    this.battlePictures2().update()



};



/**
 * 旋转图片到
 * 
 * @param {number} pictureId 图片id
 * @param {number} rotation 角度 
 * @param {number} duration 持续时间 ,0时为立刻
 * 
 */

Game_Screen.prototype.rotatePictureTo = function (pictureId, rotation, duration) {
    //图片 = 图片(图片id)
    var picture = this.picture(pictureId);
    //如果 图片 
    if (picture) {
        //图片 旋转(速度)
        picture.rotateTo(rotation, duration);
    }
};


/**设置图片位置种类 */
Game_Screen.prototype.setPicturePositionType = function (pictureId, positionType) {
    var picture = this.picture(pictureId);
    //如果 图片 
    if (picture) {
        //图片 旋转(速度)
        picture.setPositionType(positionType);
    }
};




/**
 * 设置图片
 * 
 * @param {number} pictureId 图片id
 * @param {number|[number,number]|{x:number,y:number}}origin 原点
 * 
 */
Game_Screen.prototype.setPictureOrigin = function (pictureId, origin) {
    var picture = this.picture(pictureId);
    if (picture) {
        picture.setOrigin(origin);
    }
};




Game_Screen.prototype.setPictureMethod = function (pictureId, list, re) {
    var picture = this.picture(pictureId);
    if (picture) {
        picture.setMethod(list, re);
    }
};


Game_Screen.prototype.setPictureMethodRe = function (pictureId, re) {
    var picture = this.picture(pictureId);
    if (picture) {
        picture.setMethodRe(re);
    }
};

Game_Screen.prototype.setPictureMethodIndex = function (pictureId, index) {
    var picture = this.picture(pictureId);
    if (picture) {
        picture.setMethodIndex(index);
    }
};



Game_Screen.prototype.pushPictureMethod = function (pictureId) {
    var picture = this.picture(pictureId);
    if (picture) {
        var methodArgs = Array.prototype.slice.call(arguments, 1);
        picture.pushMethod.apply(picture, methodArgs);
    }
};



Sprite_Picture.prototype.loadBitmap = function () {
    if (this._window) {
        this.removeChild(this._window)
        delete this._window
    }
    if (this._pictureName.indexOf("m/") == 0) {
        var json = this._pictureName.slice(2)
        if (json) {
            var list = JSON.parse(json)
            var w = list[0] || 0
            var h = list[1] || 0
            var text = list[2] || ""
            var wb = new Window_Message(0, 0, w, h)
            wb.drawTextEx(text, 0, 0)
            this._window = wb
            this.addChild(this._window)
            this.bitmap = new Bitmap(w, h)
        } else {
            this.bitmap = new Bitmap()
        }
    } else if (this._pictureName.indexOf("w/") == 0) {
        var json = this._pictureName.slice(2)
        if (json) {
            var list = JSON.parse(json)
            var w = list[0] || 0
            var h = list[1] || 0
            var text = list[2] || ""
            var wb = new Window_Base(0, 0, w, h)
            wb.drawTextEx(text, 0, 0)
            this._window = wb
            this.addChild(this._window)
            this.bitmap = new Bitmap(w, h)
        } else {
            this.bitmap = new Bitmap()
        }
    } else if (this._pictureName.indexOf("t/") == 0) {
        var json = this._pictureName.slice(2)
        if (json) {
            var list = JSON.parse(json)
            var w = list[0] || 0
            var h = list[1] || 0
            var text = list[2] || ""
            var wb = new Window_Base(0, 0, 1, 1)
            wb.contents = new Bitmap(w, h)
            wb.drawTextEx(text, 0, 0)
            this.bitmap = wb.contents
            ///wb.contents = new Bitmap(0, 0)
            wb = null
        } else {
            this.bitmap = new Bitmap()
        }
    } else if (this._pictureName.indexOf("f/") == 0) {
        var json = this._pictureName.slice(2)
        if (json) {
            var list = JSON.parse(json)
            var faceName = list[0] || ""
            var faceIndex = list[1] || 0
            this.bitmap = ImageManager.loadFace(faceName);
            var that = this
            this.bitmap.addLoadListener(
                function () {
                    var pw = Window_Base._faceWidth;
                    var ph = Window_Base._faceHeight;
                    var sw = pw
                    var sh = ph
                    var sx = faceIndex % 4 * pw + (pw - sw) / 2;
                    var sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;
                    that.setFrame(sx, sy, sw, sh);
                }
            )
        } else {
            this.bitmap = new Bitmap()
        }
    } else {
        this.bitmap = ImageManager.loadPicture(this._pictureName);
    }
}

Sprite_Picture.prototype.getPosition2 = function () {
    this.visible = false
    return [0, 0]
}


/**获取图片位置 */
Sprite_Picture.prototype.getPosition = function (picture) {

    var postype = picture.positionType();

    var w = this.width
    var h = this.height

    var x = 0
    var y = 0

    if (typeof (postype) == "number") {
        var y = Math.floor(postype / 3) * (Graphics.boxHeight - h) / 2;
        var x = (postype % 3) * (Graphics.boxWidth - w) / 2;
    } else if (Array.isArray(postype)) {
        var types = postype
        var type = (types[0] || 0) * 1
        var id = (type <= 2) ? types[1] : (types[1] || 0) * 1
        var cex = types[2] === undefined ? 0.5 : types[2] * 1
        var cey = types[3] === undefined ? 0.5 : types[3] * 1
        var wex = types[4] === undefined ? 0.5 : types[4] * 1
        var wey = types[5] === undefined ? 0.5 : types[5] * 1
        var wdx = (types[6] || 0) * 1
        var wdy = (types[7] || 0) * 1
        var ax = (types[8] || 0) * 1
        var ay = (types[9] || 0) * 1

        var rx = 0
        var ry = 0
        var rw = 1
        var rh = 1
        var fx = this.parent ? this.parent.x : 0
        var fy = this.parent ? this.parent.y : 0
        if (type == 0) {
            var rx = 0
            var ry = 0
            var rw = this.parent ? this.parent.width : 0
            var rh = this.parent ? this.parent.height : 0
        } else if (type == 1) {
            var realX = id[0] * 1
            var realY = id[1] * 1
            var tw = $gameMap.tileWidth();
            var th = $gameMap.tileHeight();
            var scrolledX = $gameMap.adjustX(realX);
            var scrolledY = $gameMap.adjustY(realY);
            var screenX = Math.round(scrolledX * tw + tw / 2);
            var screenY = Math.round(scrolledY * th + th);
            var rx = screenX
            var ry = screenY
            var rw = tw
            var rh = th
        } else if (type == 2) {
            var realX = id[0] * 1
            var realY = id[1] * 1
            var tw = $gameMap.tileWidth();
            var th = $gameMap.tileHeight();
            var scrolledX = $gameMap.adjustX(realX / tw);
            var scrolledY = $gameMap.adjustY(realY / th);
            var screenX = Math.round(scrolledX * tw + tw / 2);
            var screenY = Math.round(scrolledY * th + th);
            var rx = screenX
            var ry = screenY
            var rw = tw
            var rh = th
        } else if (type == 8) {
            if (id == 4) {
                var rx = 0
                var ry = 0
                var rw = Graphics._width
                var rh = Graphics._height
            }
            if (id == 1) {
                var rx = 0
                var ry = 0
                var rw = SceneManager._screenWidth
                var rh = SceneManager._screenHeight
            }
            if (id == 2) {
                var rw = SceneManager._boxWidth
                var rh = SceneManager._boxHeight
                var rx = (SceneManager._screenWidth - SceneManager._boxWidth) * 0.5
                var ry = (SceneManager._screenHeight - SceneManager._boxHeight) * 0.5
            }
            if (id == 0) {
                var rx = 0
                var ry = 0
                var rw = 1
                var rh = 1
            }
            if (id == 3) {
                var rx = 0
                var ry = 0
                var rw = SceneManager._screenWidth
                var rh = SceneManager._screenHeight
            }
        } else {
            var actor
            var character
            if (type == 3) {
                if (id < 0) {
                    character = $gamePlayer.followers().follower(-id - 1)
                    actor = $gameParty.members()[id]
                } else if (id == 0) {
                    character = $gamePlayer
                    actor = $gameParty.members()[0]
                } else {
                    character = $gameMap.event(id);
                }
            }
            /**队伍 */
            if (type == 5) {
                actor = $gameParty.members()[id]
            }
            /**角色 */
            if (type == 6) {
                actor = $gameActors.actor(id)
            }
            /**敌人 */
            if (type == 7) {
                actor = $gameTroop.members()[id]
            }
            if (SceneManager._scene.constructor === Scene_Map && SceneManager._sceneStarted) {
                if (type == 5 || type == 6 || type == 7) {
                    if (!actor) {
                        return this.getPosition2()
                    }
                    var fid = -1
                    var l = $gameParty.members()
                    for (var i = 0; i < l.length; i++) {
                        if (l[i] == actor) {
                            fid = i
                        }
                    }
                    if (fid == -1) {

                    } else if (fid == 0) {
                        character = $gamePlayer
                    } else {
                        character = $gamePlayer.followers().follower(fid - 1)
                    }
                }
                if (!character) {
                    return this.getPosition2()
                }
                var ns
                var ps
                var ss = SceneManager._scene._spriteset._characterSprites
                for (var i = 0; i < ss.length; i++) {
                    var s = ss[i]
                    if (s && s._character == character) {
                        ns = s
                        break
                    }
                }
                if (!ns) {
                    return this.getPosition2()
                }
                var px = ns.x
                var py = ns.y
                var pw = ns.patternWidth()
                var ph = ns.patternHeight()

                var rx = px - pw * 0.5
                var ry = py - ph * 1
                var rw = pw
                var rh = ph
            }
            if (SceneManager._scene.constructor === Scene_Battle && SceneManager._sceneStarted) {
                if (!actor) {
                    return this.getPosition2()
                }

                var ns
                var ps
                var ss = SceneManager._scene._spriteset.battlerSprites()
                for (var i = 0; i < ss.length; i++) {
                    var s = ss[i]
                    if (s && s._battler == actor) {
                        ns = s
                        break
                    }
                }
                if (!ns) {
                    return this.getPosition2()
                }
                if (ns.constructor == Sprite_Enemy) {
                    var rx = ns.x
                    var ry = ns.y
                    var rw = ns.bitmap.width
                    var rh = ns.bitmap.height
                } else if (ns.constructor == Sprite_Actor) {
                    var px = ns.x
                    var py = ns.y
                    var pw = ns._mainSprite.bitmap.width
                    var ph = ns._mainSprite.bitmap.height

                    var rx = px - pw * 0.5
                    var ry = py - ph * 1
                    var rw = pw
                    var rh = ph

                } else {
                    var rx = ns.x
                    var ry = ns.y
                    var rw = 0
                    var rh = 0
                }

            }
        }


        var x = rx + cex * rw - w * wex + wdx //- ax * fx
        var y = ry + cey * rh - h * wey + wdx //- ay * fy
    } else {
        var x = 0
        var y = 0
    }
    return [x, y]
}


Sprite_Picture.prototype.updatePosition = function () {

    var picture = this.picture();
    var bxy = this.getPosition(picture)
    var x = picture.x()
    var y = picture.y()
    this.x = Math.floor(bxy[0] + x);
    this.y = Math.floor(bxy[1] + y);
};




/**更新原点 */
Sprite_Picture.prototype.updateOrigin = function () {
    var picture = this.picture();
    var origin = picture.origin()
    var t = typeof (origin)
    if (t == "object") {

    } else if (t == "number") {
        var list = [
            [0, 0],
            [0.5, 0.5],
            [1, 1],
            [0, 0.5],
            [1, 0.5],
            [0.5, 0],
            [0.5, 1],
            [1, 0],
            [0, 1]
        ]
        var origin = list[origin] || [0, 0]
    } else {
        var origin = [0, 0]
    }
    this.anchor.x = origin.x || origin[0] || 0;
    this.anchor.y = origin.y || origin[1] || 0;
};





function Sprite_WindowPicture() {
    this.initialize.apply(this, arguments);
}


/**设置原形  */
Sprite_WindowPicture.prototype = Object.create(Sprite_Picture.prototype);
/**设置创造者 */
Sprite_WindowPicture.prototype.constructor = Sprite_WindowPicture;

Sprite_WindowPicture.prototype.initialize = function (pictureId, screen) {
    this.setScreen(screen)
    Sprite_Picture.prototype.initialize.call(this, pictureId);

};

Sprite_WindowPicture.prototype.setScreen = function (screen) {
    this._screen = screen
};


Sprite_WindowPicture.prototype.screen = function () {
    return this._screen

};
Sprite_WindowPicture.prototype.picture = function () {
    return this.screen() && this.screen().picture && this.screen().picture(this._pictureId);
};




ww._ScreenPictureUp._Sprite_Character_prototype_update = Sprite_Character.prototype.update
Sprite_Character.prototype.update = function () {
    ww._ScreenPictureUp._Sprite_Character_prototype_update.call(this)
    this.updatePictures()
}

Sprite_Character.prototype.updatePictures = function () {
    if (this._character) {
        if (!this._pictures) { this._pictures = {} }
        var ps = this._character._pictures || {}
        for (var n in ps) {
            if (!this._pictures[n]) {
                this.addPicture(n)
            }
        }
        var ps2 = this._pictures
        for (var n in ps2) {
            if (!ps[n]) {
                this.delPicture(n)
            }
        }
        if (this._character._changeZindex) {
            this._character._changeZindex = false
            this.sortPicture()
        }
    }
}




Sprite_Character.prototype.sortPicture = function () {
    this.children.sort(function (a, b) {
        var az = a._zIndex || 0
        var bz = b._zIndex || 0
        if (az == bz) {
            return a.spriteId - b.spriteId
        } else {
            return az - bz
        }
    })
}





Sprite_Character.prototype.addPicture = function (n) {
    this._pictures[n] = new Sprite_WindowPicture(n, this._character)
    this.addChild(this._pictures[n])
}


Sprite_Character.prototype.delPicture = function (n) {
    this.removeChild(this._pictures[n])
    delete this._pictures[n]
}



function Sprite_MorePicture() {
    this.initialize.apply(this, arguments);
}


/**设置原形  */
Sprite_MorePicture.prototype = Object.create(Sprite_Character.prototype);
/**设置创造者 */
Sprite_MorePicture.prototype.constructor = Sprite_MorePicture;
Sprite_MorePicture.prototype.updatePosition = function () {
};





/**
 * 
 * 
 * 精灵组设置 
 * 
 * 
 * */




ww._ScreenPictureUp._Spriteset_Base_prototype_createUpperLayer = Spriteset_Base.prototype.createUpperLayer
Spriteset_Base.prototype.createUpperLayer = function () {
    this.createMorePictures()
    ww._ScreenPictureUp._Spriteset_Base_prototype_createUpperLayer.call(this)
};
 

Spriteset_Base.prototype.createMorePictures = function () {
};

 



/**
 * 
 * 地图精灵组 
 * 
 * 
 * */



Spriteset_Map.prototype.createMorePictures = function () {

    //获取数据
    $gameScreen.mapPictures().saveAllPicture()
    $gameScreen.mapPictures().eraseAllPicture()
    
    //创建精灵
    this._morePictures = new Sprite_MorePicture($gameScreen.mapPictures())
    this.addChild(this._morePictures);
};


ww._ScreenPictureUp._Spriteset_Map_prototype_createCharacters = Spriteset_Map.prototype.createCharacters
Spriteset_Map.prototype.createCharacters = function () {
    ww._ScreenPictureUp._Spriteset_Map_prototype_createCharacters.call(this)

    //获取数据
    $gameScreen.mapPictures2().saveAllPicture()
    $gameScreen.mapPictures2().eraseAllPicture()
    
    
    //创建精灵
    this._morePictures2 = new Sprite_MorePicture($gameScreen.mapPictures2())
    this._morePictures2.z = 0.5
    this._tilemap.addChild(this._morePictures2);
};


/**
 * 
 * 
 * 战斗精灵组 
 * 
 * 
 * */
Spriteset_Battle.prototype.createMorePictures = function () {
    //获取数据
    $gameScreen.battlePictures().saveAllPicture()
    $gameScreen.battlePictures().eraseAllPicture()
    
    //创建精灵
    this._morePictures = new Sprite_MorePicture($gameScreen.battlePictures())
    this.addChild(this._morePictures);
};


ww._ScreenPictureUp._Spriteset_Battle_prototype_createBattleback = Spriteset_Battle.prototype.createBattleback
Spriteset_Battle.prototype.createBattleback = function () {
    ww._ScreenPictureUp._Spriteset_Battle_prototype_createBattleback.call(this)

    //获取数据 
    $gameScreen.battlePictures2().saveAllPicture() 
    $gameScreen.battlePictures2().eraseAllPicture() 
    
    //创建精灵
    this._morePictures2 = new Sprite_MorePicture($gameScreen.battlePictures2())
    this._battleField.addChild(this._morePictures2);
};


