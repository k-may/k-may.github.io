import {MainView} from "./views/MainView.js";

var mainView = new MainView(document.querySelector('body'));
mainView.initialize();

function draw() {
    window.requestAnimationFrame(draw);
    var time = window.performance.now();
    mainView.draw(time);

}

draw();
