Bitmap.prototype.drawSetStyle = function (style) {
    if (style && typeof (style) == "object") {
        for (var i in style) {
            this._context[i] = style
        }
    }
}

Bitmap.prototype.drawFun = function (list) {

    //环境 = 环境
    var context = this._context;
    //环境 保存()
    context.save();
 
    for (var i = 0; i < list.length; i++) {
        var name = list[i]
        if (Array.isArray(name)) {
            var n = name[0]
            var p = name.slice(1)
            if (typeof (context[n]) == "function") {
                context[n].apply(context, p)
            }
        } else if (typeof (name) == "string") { 
            if (typeof (context[n]) == "function") {
                context[n]()
            }
        } else{
            this.drawSetStyle(name)
        }
    } 

  
    //环境 恢复()
    context.restore();
    //设置发生更改()
    this._setDirty();
}

/**绘制扇形 */
Bitmap.prototype.drawCircleSE = function (x, y, r, start, end, color, type) {

    var type = type ? "stroke" : "fill"
    var unit = Math.PI / 180;
    var start = start || 0
    var end = end === undefined ? 360 : (end || 0)

    //环境 = 环境
    var context = this._context;
    //环境 保存()
    context.save();

    context[type + 'Style'] = color; 
 
    //环境 开始路径()
    context.beginPath();
    //环境 弧形(x,y,半径,0,数学 PI * 2 ,false )     
    context.arc(x, y, r, start * unit, end * unit);
 
    context.closePath();

    context[type]();
    //环境 恢复()
    context.restore();
    //设置发生更改()
    this._setDirty();
 
}


/**绘制圆角矩形 */
Bitmap.prototype.drawRoundedRectangle = function (x, y, width, height, radius, color, type, j0, j1, j2, j3) {
 

    var type = type ? "stroke" : "fill"
    //环境 = 环境
    var context = this._context;
    //环境 保存()
    context.save();


    context[type + 'Style'] = color;

    /**
     * 0 3
     * 1 2
     */
    context.beginPath();
    //左上点
    context.moveTo(x, y + radius);
    //往下
    context.lineTo(x, y + height - radius);
    //角1处理
    if (j1) {
        context.lineTo(x, y + height);
        context.lineTo(x + radius, y + height);
    } else {
        context.quadraticCurveTo(x, y + height, x + radius, y + height);
    }
    //往左
    context.lineTo(x + width - radius, y + height);
    //角2处理 
    if (j2) {
        context.lineTo(x + width, y + height);
        context.lineTo(x + width, y + height - radius);
    } else {
        context.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    }
    //往上
    context.lineTo(x + width, y + radius);
    //角3处理  
    if (j3) {
        context.lineTo(x + width, y);
        context.lineTo(x + width - radius, y);
    } else {
        context.quadraticCurveTo(x + width, y, x + width - radius, y);
    }
    //往左
    context.lineTo(x + radius, y);
    //角0处理 
    if (j0) {
        context.lineTo(x, y);
        context.lineTo(x, y + radius);
    } else {
        context.quadraticCurveTo(x, y, x, y + radius);
    }

    context.closePath();
    context[type]();


    //环境 恢复()
    context.restore();
    //设置发生更改()
    this._setDirty();

}

















/** 
描述

HTML5 <canvas> 标签用于绘制图像（通过脚本，通常是 JavaScript）。

不过，<canvas> 元素本身并没有绘制能力（它仅仅是图形的容器） - 您必须使用脚本来完成实际的绘图任务。

getContext() 方法可返回一个对象，该对象提供了用于在画布上绘图的方法和属性。

本手册提供完整的 getContext("2d") 对象属性和方法，可用于在画布上绘制文本、线条、矩形、圆形等等。
浏览器支持

Internet Explorer 9、Firefox、Opera、Chrome 以及 Safari 支持 <canvas> 及其属性和方法。

注释：Internet Explorer 8 以及更早的版本不支持 <canvas> 元素。
颜色、样式和阴影
属性 	描述
fillStyle 	设置或返回用于填充绘画的颜色、渐变或模式
strokeStyle 	设置或返回用于笔触的颜色、渐变或模式
shadowColor 	设置或返回用于阴影的颜色
shadowBlur 	设置或返回用于阴影的模糊级别
shadowOffsetX 	设置或返回阴影距形状的水平距离
shadowOffsetY 	设置或返回阴影距形状的垂直距离
方法 	描述
createLinearGradient() 	创建线性渐变（用在画布内容上）
createPattern() 	在指定的方向上重复指定的元素
createRadialGradient() 	创建放射状/环形的渐变（用在画布内容上）
addColorStop() 	规定渐变对象中的颜色和停止位置
线条样式
属性 	描述
lineCap 	设置或返回线条的结束端点样式
lineJoin 	设置或返回两条线相交时，所创建的拐角类型
lineWidth 	设置或返回当前的线条宽度
miterLimit 	设置或返回最大斜接长度
矩形
方法 	描述
rect() 	创建矩形
fillRect() 	绘制“被填充”的矩形
strokeRect() 	绘制矩形（无填充）
clearRect() 	在给定的矩形内清除指定的像素
路径
方法 	描述
fill() 	填充当前绘图（路径）
stroke() 	绘制已定义的路径
beginPath() 	起始一条路径，或重置当前路径
moveTo() 	把路径移动到画布中的指定点，不创建线条
closePath() 	创建从当前点回到起始点的路径
lineTo() 	添加一个新点，然后在画布中创建从该点到最后指定点的线条
clip() 	从原始画布剪切任意形状和尺寸的区域
quadraticCurveTo() 	创建二次贝塞尔曲线
bezierCurveTo() 	创建三次方贝塞尔曲线
arc() 	创建弧/曲线（用于创建圆形或部分圆）
arcTo() 	创建两切线之间的弧/曲线
isPointInPath() 	如果指定的点位于当前路径中，则返回 true，否则返回 false
转换
方法 	描述
scale() 	缩放当前绘图至更大或更小
rotate() 	旋转当前绘图
translate() 	重新映射画布上的 (0,0) 位置
transform() 	替换绘图的当前转换矩阵
setTransform() 	将当前转换重置为单位矩阵。然后运行 transform()
文本
属性 	描述
font 	设置或返回文本内容的当前字体属性
textAlign 	设置或返回文本内容的当前对齐方式
textBaseline 	设置或返回在绘制文本时使用的当前文本基线
方法 	描述
fillText() 	在画布上绘制“被填充的”文本
strokeText() 	在画布上绘制文本（无填充）
measureText() 	返回包含指定文本宽度的对象
图像绘制
方法 	描述
drawImage() 	向画布上绘制图像、画布或视频
像素操作
属性 	描述
width 	返回 ImageData 对象的宽度
height 	返回 ImageData 对象的高度
data 	返回一个对象，其包含指定的 ImageData 对象的图像数据
方法 	描述
createImageData() 	创建新的、空白的 ImageData 对象
getImageData() 	返回 ImageData 对象，该对象为画布上指定的矩形复制像素数据
putImageData() 	把图像数据（从指定的 ImageData 对象）放回画布上
合成
属性 	描述
globalAlpha 	设置或返回绘图的当前 alpha 或透明值
globalCompositeOperation 	设置或返回新图像如何绘制到已有的图像上
其他
方法 	描述
save() 	保存当前环境的状态
restore() 	返回之前保存过的路径状态和属性
createEvent() 	 
getContext() 	 
toDataURL() 	 


 */