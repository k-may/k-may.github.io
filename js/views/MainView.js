import {BaseView} from './BaseView.js';
import {Color, ColorUtils} from '../utils/ColorUtils.js';
import BufferView from './BufferView.js';
import State from './State.js';
import SectionsView from './SectionsView.js';
import {BrowserUtils} from '../utils/BrowserUtils.js';

export const GLOBALS = {
    Colors: []
}

export class MainView extends BaseView {

    constructor(el) {
        super(el);
    }

    //---------------------------------------------------

    /***
     * Load config.json and create menu
     */
    initialize() {

        GLOBALS.Colors.push(ColorUtils.HexToRgb(BrowserUtils.GetCSSVariable('--color1')));
        GLOBALS.Colors.push(ColorUtils.HexToRgb(BrowserUtils.GetCSSVariable('--color2')));
        GLOBALS.Colors.push(ColorUtils.HexToRgb(BrowserUtils.GetCSSVariable('--color3')));
        GLOBALS.Colors.push(ColorUtils.HexToRgb(BrowserUtils.GetCSSVariable('--color4')));
        GLOBALS.Colors.push(ColorUtils.HexToRgb(BrowserUtils.GetCSSVariable('--color5')));
        GLOBALS.Colors.push(ColorUtils.HexToRgb(BrowserUtils.GetCSSVariable('--color6')));
        GLOBALS.Colors.push(ColorUtils.HexToRgb(BrowserUtils.GetCSSVariable('--color7')));
        GLOBALS.Colors.push(ColorUtils.HexToRgb(BrowserUtils.GetCSSVariable('--color8')));

        this._setupWindow();
        this._state = new State();
        this._bufferView = new BufferView(this.el.querySelector('canvas'), this._state);

        this._sectionsView = new SectionsView(this.el.querySelector('section'), this._state);
    }

    /***
     * Update current sketch and smooth scroll
     * @param time
     */
    draw(time) {

        this._state.update();
        this._sectionsView.draw();

        if(this._bufferView)
            this._bufferView.draw()
    }

    //---------------------------------------------------


    _setupWindow() {
        //window.onmousedown = this._onMouseDown.bind(this);
        //window.onmouseup = this._onMouseUp.bind(this);
        //window.onclick = this._onClick.bind(this);
        window.onresize = this._onResize.bind(this);
        //window.onscroll = this._onScroll.bind(this);
        //window.onhashchange = this._onHashChange.bind(this);
        //window.onmousemove = this._onMouseMove.bind(this);

        window.dispatchEvent(new Event('resize'));
    }

    _onResize() {
    }

    _onScroll() {
        this._destScrollTo = window.scrollY;
    }

    _onMouseMove(e) {
        if (this._sketch && this._sketch.onMouseMove)
            this._sketch.onMouseMove(e);
    }

    _onMouseDown(e) {
        if (this._sketch && this._sketch.onMouseDown)
            this._sketch.onMouseDown(e);
    }

    _onMouseUp(e) {
        if (this._sketch && this._sketch.onMouseUp)
            this._sketch.onMouseUp(e);
    }

}
