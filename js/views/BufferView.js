import {BaseView} from './BaseView.js';
import {CanvasUtils} from '../utils/CanvasUtils.js';
import {GLOBALS} from './MainView.js';
import TWEEN from '../vendor/tween.esm.js';

export default class BufferView extends BaseView{

    constructor(canvas, state) {
        super(canvas);

        this.state = state;

        this.state.on('change:color', this._onChangeColor.bind(this));
        this.buffer = CanvasUtils.CreateBuffer(canvas);
        this.onResize();
    }

    draw(){
        try{

        if(this.state.PrimaryColor)
            this._draw();
            else
            this.buffer.clear();
        }catch(e){
            console.log(e);
        }
    }

    onResize(){
        this.buffer.resizeToDisplaySize();
    }

    _draw(ctx){
        var ctx = this.buffer.ctx;

        var outTween = function (k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        }

        var inTween =function (k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -15 * k);
        }

        var ratioOut =  outTween(this.state.transition);
        var ratioIn = inTween(this.state.transition);
     //   console.log(ratioIn);

        var rect = [
             (1 - ratioOut) * this.buffer.width, 0,
            this.buffer.width, 0,
            this.buffer.width, this.buffer.height,
            (1 - ratioIn) * this.buffer.width, this.buffer.height
        ];

        ctx.fillStyle = this.state.SecondaryColor.toRGBString();
        ctx.beginPath();
        ctx.moveTo(rect[0], rect[1]);
        ctx.lineTo(rect[2], rect[3]);
        ctx.lineTo(rect[4], rect[5]);
        ctx.lineTo(rect[6], rect[7]);
        ctx.moveTo(rect[0], rect[1]);
        ctx.fill();
    }

    _onChangeColor(){
        this.buffer.fill(this.state.PrimaryColor.toRGBString());
    }
}