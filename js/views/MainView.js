import {BaseView} from './BaseView.js';


export class MainView extends BaseView {

    constructor(el) {
        super(el);


    }

    //---------------------------------------------------

    /***
     * Load config.json and create menu
     */
    initialize() {

        this._cell = this.el.querySelector('.grid_cell');

        this._setupWindow();
    }

    /***
     * Update current sketch and smooth scroll
     * @param time
     */
    draw(time) {

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
        var gridWidth = this.el.clientWidth;
        var gridHeight = this.el.clientHeight;

        var cellWidth = this._cell.clientWidth;
        var cellHeight = this._cell.clientHeight;

        document.documentElement.style.setProperty('--font', `${cellWidth}px`);

        var numCols = Math.round(gridWidth / cellWidth);
        var numRows = Math.round(gridHeight / cellHeight) - 1;
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
