import {BaseSketch} from '../../BaseSketch.js';
import * as THREE from '../../../node_modules/three/build/three.module.js';
import {OrbitControls} from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {HorizontalBlurShader} from '../../../node_modules/three/examples/jsm/shaders/HorizontalBlurShader.js';
import {VerticalBlurShader} from '../../../node_modules/three/examples/jsm/shaders/VerticalBlurShader.js';

export default class BlurTest_1 extends BaseSketch {

    constructor() {
        super('BlurTest_1');

        this._createRenderer();
        this._createPasses();
        this._create3DScene();

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

        //render 3D scene to texture
        this.renderer.setRenderTarget(this.renderTargetA);
        this.renderer.render(this.rTScene, this.rTCamera);

        //render first pass
        this.renderer.setRenderTarget(this.renderTargetB);
        this.renderer.render(this.sceneA, this.camera);

        //render last pass
        this.renderer.setRenderTarget(null);


        this.renderer.render(this.sceneB, this.camera);
    }

    onResize(args) {
        super.onResize(args);

        this.renderTargetA.setSize(window.innerWidth, window.innerHeight);
        this.renderTargetB.setSize(window.innerWidth, window.innerHeight);

    }

    _createPasses(){

        this.renderTargetA = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
        this.renderTargetB = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

        var shader = HorizontalBlurShader;
        var material = new THREE.ShaderMaterial({
            uniforms : {
                "tDiffuse": { value: this.renderTargetA.texture },
                "h": { value: 1.0 / 512.0 }
            },
            fragmentShader : shader.fragmentShader,
            vertexShader : shader.vertexShader
        });
        this.sceneA = new THREE.Scene();
        var quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), material);
        quad.frustumCulled = false;
        this.sceneA.add(quad);

        shader = VerticalBlurShader;
        material = new THREE.ShaderMaterial({
            uniforms : {
                "tDiffuse": { value: this.renderTargetB.texture },
                "v": { value: 1.0 / 512.0 }
            },
            fragmentShader : shader.fragmentShader,
            vertexShader : shader.vertexShader
        });

        this.sceneB = new THREE.Scene();
        var quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), material);
        quad.frustumCulled = false;
        this.sceneB.add(quad);

        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.camera.position.z = 1;

    }

    _create3DScene() {

        this.rTScene = new THREE.Scene();
        this.rTScene.background = new THREE.Color( 0x444444 );

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