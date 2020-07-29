import {GLOBALS} from './MainView.js';

export default class SectionsView{
    constructor(section, state) {
        this._section = section;
        this._state = state;

        this._sections = [];

        var parentNode = section.parentElement;
        for(var i = 0; i < GLOBALS.Colors.length; i ++){
            var clone = this._section.cloneNode(true);
            clone.style.setProperty('--color', GLOBALS.Colors[i].toRGBAString());
            this._sections.push(clone);
            parentNode.appendChild(clone);
        }

        this._currentSection = null;

        this._state.on('change:color', this._onChangeColor.bind(this));

    }

    //--------------------------

    draw(){
        if(this._currentSection)
            this._currentSection.style.opacity = this._state.opacity;
    }

    _onChangeColor(index){

        this._sections.forEach((section, i) => {
            //section.style.display = i == index ? "block" : "none";
            if(i == index){
                this._currentSection = section;
            }
            section.style.opacity = 0;
        });

    }
}