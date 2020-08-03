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
     //   this.buffer.fill(this.state.PrimaryColor.toRGBString());
        var ctx = this.buffer.ctx;

        var out = function (k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -15 * k);
        }

        var ratio =  out(this.state.transition)
        var rect = {
            x : (1 - ratio) * this.buffer.width,
            y : 0,
            w : ratio * this.buffer.width,
            h : this.buffer.height
        };

        ctx.fillStyle = this.state.SecondaryColor.toRGBString();
        ctx.beginPath();
        ctx.rect(rect.x, rect.y,rect.w, rect.h);
        ctx.fill();
    }

    _onChangeColor(){
        this.buffer.fill(this.state.PrimaryColor.toRGBString());
    }
}