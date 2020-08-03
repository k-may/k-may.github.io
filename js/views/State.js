import {GLOBALS} from './MainView.js';
import Emitter from './Emitter.js';

export default class State extends Emitter{

    constructor() {
        super();

        this.PrimaryColor = null;
        this.SecondaryColor = null;
        this.opacity = 0;
        this.transition = 0;
        this.duration = 1000;

        this.update();
        this._lastUpdate = Date.now();
    }

    update(){

        var time = Date.now();
        var elapsed = time - this._lastUpdate;

        var ratio = Math.min(1,elapsed / 1200);

        this.transition = Math.max(0, (ratio - 0.6) / 0.4);
        this.opacity = Math.min(1, ratio / 0.3);

        if(elapsed > this.duration){
            this.transition = 0;
            this.opacity = 0;
            this._updateColor();
            this._lastUpdate = time;
        }

    }

    _updateColor(){

        var colors = GLOBALS.Colors.map(color => color.clone());

        var index = Math.floor(Math.random() * colors.length);
        this.PrimaryColor = this.SecondaryColor || colors.splice(index , 1).pop();
        
        var count = 0;
        do{
            index= Math.floor( Math.random() * colors.length);
            this.currentIndex !== undefined ? this.currentIndex : index;
        }while(count ++ < 10 && this.currentIndex == index)

        this.SecondaryColor = colors.splice(index, 1).pop();
        this.currentIndex = index;
        
        this.trigger('change:color', this.currentIndex);

    }
}