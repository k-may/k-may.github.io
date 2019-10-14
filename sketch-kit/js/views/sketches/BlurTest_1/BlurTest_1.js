import {BaseSketch} from '../../BaseSketch.js';
import * as THREE from '../../../node_modules/three/build/three.module.js';
import {OrbitControls} from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {HorizontalBlurShader} from '../../../node_modules/three/examples/jsm/shaders/HorizontalBlurShader.js';
import {VerticalBlurShader} from '../../../node_modules/three/examples/jsm/shaders/VerticalBlurShader.js';

export default class BlurTest_1 extends BaseSketch {

    constructor() {
        super('BlurTest_1');

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

        this.renderer.setRenderTarget(this.renderTargetV);

        this.renderer.render(this.sceneH, this.camera);
        this.renderer.setRenderTarget(null);
       /* this.scene.remove(this.meshH);
        this.scene.add(this.meshV);*/

        this.renderer.render(this.sceneV, this.camera);
    }

    onResize(args) {
        super.onResize(args)
    }

    _createScene(){

        var plane = new THREE.PlaneBufferGeometry(1,1,2,2);

        var shader = HorizontalBlurShader;
        var material = new THREE.ShaderMaterial({
            uniforms : {
                "tDiffuse": { value: this.renderTargetH.texture },
                "h": { value: 1.0 / 512.0 }
            },
            fragmentShader : shader.fragmentShader,
            vertexShader : shader.vertexShader
        });
        this.meshH = new THREE.Mesh(plane, material);

        shader = VerticalBlurShader;
        material = new THREE.ShaderMaterial({
            uniforms : {
                "tDiffuse": { value: this.renderTargetV.texture },
                "h": { value: 1.0 / 512.0 }
            },
            fragmentShader : shader.fragmentShader,
            vertexShader : shader.vertexShader
        });
        this.meshV = new THREE.Mesh(plane, material);

        this.camera = new THREE.Camera();//PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 1;

        this.sceneH = new THREE.Scene();
        this.sceneH.background = new THREE.Color( 0x444444 );
        this.sceneH.add(this.meshH);

        this.sceneV = new THREE.Scene();
        this.sceneV.add(this.meshV);
    }

    _createRenderTextureScene() {

        this.rTScene = new THREE.Scene();
        this.rTScene.background = new THREE.Color( 0x444444 );

        this.renderTargetH = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
        this.renderTargetV = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

        const material = new THREE.MeshBasicMaterial({color:0xff0000});

        var plane = new THREE.PlaneBufferGeometry(2, 2, 2, 2);
        var mesh = new THREE.Mesh(plane, material);

        this.rTScene.add(mesh);
        this.plane = mesh;

        this.rTCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.rTCamera.position.z = 10;


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