import {BaseSketch} from '../../BaseSketch.js';
import * as THREE from '../../../node_modules/three/build/three.module.js';
import {GLTFLoader} from '../../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {DRACOLoader} from '../../../node_modules/three/examples/jsm/loaders/DRACOLoader.js';


export default class TileTest_1_1 extends BaseSketch {

    constructor() {

        super('TileTest_1_1');

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer = renderer;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2.2;
        this.renderer.autoClear = false;
         //this.renderer.setClearColor(0xcccccc);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMappingExposure = 1.0;
        this.el.appendChild(renderer.domElement);

        var loader = new GLTFLoader();
        var dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('js/lib/draco/');
        loader.setDRACOLoader(dracoLoader);
        loader.load('assets/tile1_glass.gltf', gltf => {

            scene.add(gltf.scene);

            this.content = gltf.scene;

            this.addLights();
            this.updateTextureEncoding();
            this._createCubeMap();

        }, undefined, error => {

            console.error(error);

        });
        camera.position.z = 5;
        scene.add(camera);

        this.scene = scene;

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
this.defaultCamera.lookAt( this.scene.position );
        if(this.cubeCamera) {
              this.cubeCamera.rotation.copy(this.defaultCamera.rotation);
            this.renderer.render(this.sceneCube, this.cubeCamera);
        }

        this.renderer.render(this.scene, this.camera);
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

        this.updateTextureEncoding();

        //this.lights.push(light1, light2);
    }

    updateTextureEncoding() {
        const encoding = THREE.sRGBEncoding;
        this.traverseMaterials(this.content, (material) => {
            if (material.map) material.map.encoding = encoding;
            if (material.emissiveMap) material.emissiveMap.encoding = encoding;
            if (material.map || material.emissiveMap) material.needsUpdate = true;

            //material.transparent = true;
            //material.opacity = 0.5;
        });
    }

    traverseMaterials(object, callback) {
        object.traverse((node) => {
            if (!node.isMesh) return;
            const materials = Array.isArray(node.material)
                ? node.material
                : [node.material];
            materials.forEach(callback);
        });
    }

    _createCubeMap() {

        this.sceneCube = new THREE.Scene();

        this.cubeCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);

        // Textures

        var r = 'assets/environment/Bridge2/';
        var urls = [r + 'posx.jpg', r + 'negx.jpg',
            r + 'posy.jpg', r + 'negy.jpg',
            r + 'posz.jpg', r + 'negz.jpg'];

        var textureCube = new THREE.CubeTextureLoader().load(urls);
        textureCube.format = THREE.RGBFormat;
        textureCube.mapping = THREE.CubeReflectionMapping;
        textureCube.encoding = THREE.sRGBEncoding;

        var cubeShader = THREE.ShaderLib['cube'];
        var cubeMaterial = new THREE.ShaderMaterial({
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });

        cubeMaterial.uniforms['tCube'].value = textureCube;
        Object.defineProperty(cubeMaterial, 'map', {

            get: function () {

                return this.uniforms.tCube.value;

            }

        });

        var cubeMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(100, 100, 100), cubeMaterial);
        this.sceneCube.add(cubeMesh);

        this.traverseMaterials(this.content, (material) => {
            if (material.isMeshStandardMaterial || material.isGLTFSpecularGlossinessMaterial) {
                material.envMap = textureCube;
                material.needsUpdate = true;
            }
        });

    }
}