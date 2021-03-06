/**----------------------------------------------------------------------------- */
/** Spriteset_Map */
/** 精灵组地图 */
/** The set of sprites on the map screen. */
/** 在地图画面 的 精灵 组 */

function Spriteset_Map() {
    this.initialize.apply(this, arguments);
}

/**设置原形  */
Spriteset_Map.prototype = Object.create(Spriteset_Base.prototype);
/**设置创造者 */
Spriteset_Map.prototype.constructor = Spriteset_Map;
/**初始化 */
Spriteset_Map.prototype.initialize = function() {
    //精灵组基础 初始化 呼叫(this)
    Spriteset_Base.prototype.initialize.call(this);
};
/**----------------------------------------------------------------------------- */
/**创建较下的层 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.createLowerLayer = function() {
    //精灵组基础 创建较下的层 呼叫(this)
    Spriteset_Base.prototype.createLowerLayer.call(this);
    //创建远景图()
    this.createParallax();
    //创建图块地图()
    this.createTilemap();
    //创建人物()
    this.createCharacters();
    //创建阴影()
    this.createShadow();
    //创建方向()
    this.createDestination();
    //创建天气()
    this.createWeather();
};
/**----------------------------------------------------------------------------- */
/**更新 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.update = function() {
    //精灵组基础 更新 呼叫(this)
    Spriteset_Base.prototype.update.call(this);
    //更新图块设置()
    this.updateTileset();
    //更新远景图()
    this.updateParallax();
    //更新图块地图()
    this.updateTilemap();
    //更新阴影()
    this.updateShadow();
    //更新天气()
    this.updateWeather();
};
/**----------------------------------------------------------------------------- */
/**隐藏人物 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.hideCharacters = function() {
    for (var i = 0; i < this._characterSprites.length; i++) {
        var sprite = this._characterSprites[i];
        if (!sprite.isTile()) {
            sprite.hide();
        }
    }
};
/**----------------------------------------------------------------------------- */
/**创建远景图 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.createParallax = function() {
    this._parallax = new TilingSprite();
    this._parallax.move(0, 0, Graphics.width, Graphics.height);
    this._baseSprite.addChild(this._parallax);
};
/**----------------------------------------------------------------------------- */
/**创建图块地图 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.createTilemap = function() {
    if (Graphics.isWebGL()) {
        this._tilemap = new ShaderTilemap();
    } else {
        this._tilemap = new Tilemap();
    }
    this._tilemap.tileWidth = $gameMap.tileWidth();
    this._tilemap.tileHeight = $gameMap.tileHeight();
    this._tilemap.setData($gameMap.width(), $gameMap.height(), $gameMap.data());
    this._tilemap.horizontalWrap = $gameMap.isLoopHorizontal();
    this._tilemap.verticalWrap = $gameMap.isLoopVertical();
    this.loadTileset();
    this._baseSprite.addChild(this._tilemap);
};
/**----------------------------------------------------------------------------- */
/**读取图块设置 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.loadTileset = function() {
    this._tileset = $gameMap.tileset();
    if (this._tileset) {
        //读取图块设置名字组 = 图块设置 图块设置名称组
        var tilesetNames = this._tileset.tilesetNames;
        for (var i = 0; i < tilesetNames.length; i++) {
            //图块地图 位图[i] = 
            this._tilemap.bitmaps[i] = ImageManager.loadTileset(tilesetNames[i]);
        }
        //新图块设置标志组 = 
        var newTilesetFlags = $gameMap.tilesetFlags();
        this._tilemap.refreshTileset();
        if (!this._tilemap.flags.equals(newTilesetFlags)) {
            this._tilemap.refresh();
        }
        this._tilemap.flags = newTilesetFlags;
    }
};
/**----------------------------------------------------------------------------- */
/**创建人物 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.createCharacters = function() {
    //人物精灵 = []
    this._characterSprites = [];

    //添加事件 到 人物精灵
    $gameMap.events().forEach(function(event) {
        this._characterSprites.push(new Sprite_Character(event));
    }, this);
    //添加交通工具 到 人物精灵
    $gameMap.vehicles().forEach(function(vehicle) {
        this._characterSprites.push(new Sprite_Character(vehicle));
    }, this);
    //添加从者 到 人物精灵
    $gamePlayer.followers().reverseEach(function(follower) {
        this._characterSprites.push(new Sprite_Character(follower));
    }, this);
    //添加游戏者 到 人物精灵
    this._characterSprites.push(new Sprite_Character($gamePlayer));

    //循环人物精灵
    for (var i = 0; i < this._characterSprites.length; i++) {
        this._tilemap.addChild(this._characterSprites[i]);
    }
};
/**----------------------------------------------------------------------------- */
/**创建阴影 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.createShadow = function() {
    this._shadowSprite = new Sprite();
    this._shadowSprite.bitmap = ImageManager.loadSystem('Shadow1');
    this._shadowSprite.anchor.x = 0.5;
    this._shadowSprite.anchor.y = 1;
    this._shadowSprite.z = 6;
    this._tilemap.addChild(this._shadowSprite);
};
/**----------------------------------------------------------------------------- */
/**创建目的地 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.createDestination = function() {
    this._destinationSprite = new Sprite_Destination();
    this._destinationSprite.z = 9;
    this._tilemap.addChild(this._destinationSprite);
};
/**----------------------------------------------------------------------------- */
/**创建天气 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.createWeather = function() {
    this._weather = new Weather();
    this.addChild(this._weather);
};
/**----------------------------------------------------------------------------- */
/**更新图块设置 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.updateTileset = function() {
    if (this._tileset !== $gameMap.tileset()) {
        this.loadTileset();
    }
};

/**----------------------------------------------------------------------------- */
/**画布重新添加远景图 */
/**----------------------------------------------------------------------------- */
/*
 * Simple fix for canvas parallax issue, destroy old parallax and readd to the tree.
 */
Spriteset_Map.prototype._canvasReAddParallax = function() {
    var index = this._baseSprite.children.indexOf(this._parallax);
    this._baseSprite.removeChild(this._parallax);
    this._parallax = new TilingSprite();
    this._parallax.move(0, 0, Graphics.width, Graphics.height);
    this._parallax.bitmap = ImageManager.loadParallax(this._parallaxName);
    this._baseSprite.addChildAt(this._parallax, index);
};
/**----------------------------------------------------------------------------- */
/**更新远景图 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.updateParallax = function() {
    if (this._parallaxName !== $gameMap.parallaxName()) {
        this._parallaxName = $gameMap.parallaxName();
        if (this._parallax.bitmap && Graphics.isWebGL() != true) {
            this._canvasReAddParallax();
        } else {
            this._parallax.bitmap = ImageManager.loadParallax(this._parallaxName);
        }
    }
    if (this._parallax.bitmap) {
        this._parallax.origin.x = $gameMap.parallaxOx();
        this._parallax.origin.y = $gameMap.parallaxOy();
    }
};
/**----------------------------------------------------------------------------- */
/**更新图块地图 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.updateTilemap = function() {
    this._tilemap.origin.x = $gameMap.displayX() * $gameMap.tileWidth();
    this._tilemap.origin.y = $gameMap.displayY() * $gameMap.tileHeight();
};
/**----------------------------------------------------------------------------- */
/**更新阴影 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.updateShadow = function() {
    var airship = $gameMap.airship();
    this._shadowSprite.x = airship.shadowX();
    this._shadowSprite.y = airship.shadowY();
    this._shadowSprite.opacity = airship.shadowOpacity();
};
/**----------------------------------------------------------------------------- */
/**更新天气 */
/**----------------------------------------------------------------------------- */
Spriteset_Map.prototype.updateWeather = function() {
    //天气 种类 = 游戏画面 天气种类()
    this._weather.type = $gameScreen.weatherType();
    //天气 强度 = 游戏画面 天气强度()
    this._weather.power = $gameScreen.weatherPower();
    //天气 原点 x = 游戏地图 显示x() * 游戏地图 图块宽()
    this._weather.origin.x = $gameMap.displayX() * $gameMap.tileWidth();
    //天气 原点 y = 游戏地图 显示y() * 游戏地图 图块高()
    this._weather.origin.y = $gameMap.displayY() * $gameMap.tileHeight();
};