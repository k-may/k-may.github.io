import {BaseSketch} from '../../BaseSketch.js';
import * as THREE from '../../../node_modules/three/build/three.module.js';
import {OrbitControls} from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';

export default class BlurTest extends BaseSketch {

    constructor() {
        super('BlurTest');

        this._createRenderer();
        this._createRenderTextureScene();
        this._createScene();

        this.controls = new OrbitControls(this.rTCamera, this.renderer.domElement);
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = -10;
        this.controls.screenSpacePanning = true;
    }

    draw(time) {
        super.draw(time);
/*        this.plane.rotation.x += 0.005;
        this.plane.rotation.y += 0.005;*/

        this.controls.update();

        this.renderer.setRenderTarget(this.renderTargetH);
        this.renderer.render(this.rTScene, this.rTCamera);
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
    }

    onResize(args) {
        super.onResize(args)
    }

    _createScene(){

        var plane = new THREE.PlaneBufferGeometry(1,1,2,2);
        var material = new THREE.MeshBasicMaterial({ map : this.renderTarget.texture});
        var mesh = new THREE.Mesh(plane, material);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 1;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x444444 );

        this.scene.add(mesh);
    }

    _createRenderTextureScene() {

        this.rTScene = new THREE.Scene();
        this.rTScene.background = new THREE.Color( 0x444444 );

        this.renderTargetH = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
        this.renderTargetV = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

        const material = new THREE.MeshBasicMaterial({color:0xff0000});

        var plane = new THREE.PlaneBufferGeometry(1, 1, 2, 2);
        var mesh = new THREE.Mesh(plane, material);

        this.rTScene.add(mesh);
        this.plane = mesh;

        this.rTCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.rTCamera.position.z = 30;


    }

    _createRenderer(){
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2.2;
        this.renderer.autoClear = false;

        //this.renderer.setClearColor(0xcccccc);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMappingExposure = 1.0;
        this.el.appendChild(this.renderer.domElement);

    }

}