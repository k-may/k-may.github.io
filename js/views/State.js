import {GLOBALS} from './MainView.js';
import Emitter from './Emitter.js';

export default class State extends Emitter{

    constructor() {
        super();

        this.PrimaryColor = null;
        this.SecondaryColor = null;

        this._loop();

    }

    _loop(){

        setTimeout(()=>{
            this._updateColor();
            this._loop();

        }, 1000);

    }

    _updateColor(){

        var colors = GLOBALS.Colors.map(color => color.clone());
        //colors = colors.filter(color => color != this.SecondaryColor);

        var index = Math.floor(Math.random() * colors.length);
        this.PrimaryColor = this.SecondaryColor || colors.splice(index , 1).pop();
        
        var count = 0;
        do{
            index= Math.floor( Math.random() * colors.length);

            this.currentIndex !== undefined ? this.currentIndex : index;
            
        }while(count ++ < 10 && this.currentIndex == index)

        this.SecondaryColor = colors.splice(index, 1).pop();
        console.log(this.currentIndex, index);
        this.currentIndex = index;
        
        this.trigger('change:color', index);
    }
}