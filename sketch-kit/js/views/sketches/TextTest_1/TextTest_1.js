import {BaseSketch} from '../../BaseSketch.js';
import * as THREE from '../../../node_modules/three/build/three.module.js';
import {GLTFLoader} from '../../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {DRACOLoader} from '../../../node_modules/three/examples/jsm/loaders/DRACOLoader.js';

/**
 * Want to achieve something like this : https://threejs.org/examples/#webgl_postprocessing_masking
 */
export default class TextTest_1 extends BaseSketch {

    constructor() {

        super('TextTest_1');

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        var renderer = new THREE.WebGLRenderer({antialias : true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer = renderer;
        this.renderer.autoClear = false;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2.2;
        this.renderer.setClearColor(0xcccccc);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMappingExposure = 1.0;
        this.el.appendChild(renderer.domElement);

        var loader = new GLTFLoader();
        var dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('js/lib/draco/');
        loader.setDRACOLoader(dracoLoader);
        loader.load('assets/text_image.gltf', gltf => {

            var image = gltf.scene.children[1];
            var text = gltf.scene.children[0];

            var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, colorWrite: false, depthWrite: false, stencilWrite: true } );
            var mesh = new THREE.Mesh(text.geometry, material);
            mesh.position.copy(text.position);
            mesh.rotation.copy(text.rotation);

            //this is important for threejs...
            image.material.stencilWrite = true;
            this.maskScene.add(mesh);
            scene.add(image);

            this.content = gltf.scene;

            this.addLights();
            //this.updateTextureEncoding();

        }, undefined, error => {

            console.error(error);

        });

        camera.position.z = 5;
        scene.add(camera);

        this.scene = scene;

        this.maskScene = new THREE.Scene();

        this.camera = camera;
        this.defaultCamera = camera;
        this.controls = new OrbitControls(this.defaultCamera, this.renderer.domElement);
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = -10;
        this.controls.screenSpacePanning = true;

        window.scene = scene;
    }

    draw(time) {
        super.draw(time);
        this.controls.update();

        var gl = this.renderer.getContext();

        // Clearing the stencil buffer
        gl.clearStencil(0);
        gl.clear(gl.STENCIL_BUFFER_BIT);

        // Replacing the values at the stencil buffer to 1 on every pixel we draw
        gl.stencilFunc(gl.ALWAYS, 1, 1);
        gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);

        // disable color (u can also disable here the depth buffers)
        gl.colorMask(false, false, false, false);

        gl.enable(gl.STENCIL_TEST);

        // Renders the mask through gl.drawArrays L111
        this.renderer.render(this.maskScene, this.camera);

        // Telling the stencil now to draw/keep only pixels that equals 1 - which we set earlier
        gl.stencilFunc(gl.EQUAL, 1, 1);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        // enabling back the color buffer
        gl.colorMask(true, true, true, true);

        this.renderer.render(this.scene, this.camera);

        gl.disable(gl.STENCIL_TEST);
    }

    addLights() {

        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 1;

        const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        hemiLight.name = 'hemi_light';
        this.scene.add(hemiLight);

        const light1 = new THREE.AmbientLight(0xFFFFFF, 0.3);
        light1.name = 'ambient_light';
        light1.intensity = intensity;
        this.defaultCamera.add(light1);

        const light2 = new THREE.DirectionalLight(0xFFFFFF, 0.8 * Math.PI);
        light2.position.set(0.5, 0, 0.866); // ~60º
        light2.name = 'main_light';
        light2.intensity = intensity;
        this.defaultCamera.add(light2);

    }

}