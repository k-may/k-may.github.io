import {BaseView} from './BaseView.js';
import {CanvasUtils} from '../utils/CanvasUtils.js';
import {GLOBALS} from './MainView.js';

export default class BufferView extends BaseView{

    constructor(canvas, state) {
        super(canvas);

        this.state = state;

        this.buffer = CanvasUtils.CreateBuffer(canvas);
        this.onResize();
    }

    draw(){
        try{
        var ctx = this.buffer.ctx;
        if(this.state.PrimaryColor)
            this.buffer.fill(this.state.PrimaryColor.toRGBString());
            else
            this.buffer.clear();
        }catch(e){
            console.log(e);
        }
    }

    onResize(){
        this.buffer.resizeToDisplaySize();
    }

}