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

        this._state.on('change:color', this._onChangeColor.bind(this));
    }

    //--------------------------

    _onChangeColor(index){

        this._sections.forEach((section, i) => {
            section.style.display = i == index ? "block" : "none";
        });

    }
}