import {BaseSketch} from '../../BaseSketch.js';
import * as THREE from '../../../node_modules/three/build/three.module.js';
import {GLTFLoader} from '../../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {DRACOLoader} from '../../../node_modules/three/examples/jsm/loaders/DRACOLoader.js';
import {WEBVR} from '../../../node_modules/three/examples/jsm/vr/WebVR.js';

export default class RandomTiles_1 extends BaseSketch {

    constructor() {
        super('RandomTiles_1');

        this._createScene();
        this._loadModels();
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

    //---------------------------------------------

    _createScene() {

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

    _loadModels() {

        var loader = new GLTFLoader();
        var dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('js/lib/draco/');
        loader.setDRACOLoader(dracoLoader);
        loader.load('assets/tiles.gltf', gltf => {

            this.scene.add(gltf.scene);
            this.content = gltf.scene;

            var tiles = this.content.children;//.slice(3, this.content.children.length);

            this._renderTiles(tiles);

            this._addLights();
            this._updateTextureEncoding();
            this._createCubeMap();

        }, undefined, error => {

            console.error(error);

        });
    }

    _renderTiles(tiles, materials) {

        var numTiles = 10;

        var x, y, z;
        //create tiled wall
        for (var i = 0; i < numTiles; i++) {

            var tile = tiles[Math.floor(Math.random() * tiles.length)];
            tile = tile.clone();
            this.scene.add(tile);

            var quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);

            var col = Math.floor(i / 3);
            x = col;

            var row = i % 3;
            y = row;

            var rO = row % 2;
            var cO = col % 2;

            //toggle rotation
            var rotation = !(rO && cO) && ((row % 2) || (col % 2));

            if (rotation) {
                var newRot = new THREE.Quaternion();
                newRot.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
                quaternion.multiply(newRot);
                y += 0.5;
            }

            y += row * 0.65;
            y -= 1;

            z = 0;
            tile.position.x = x - (numTiles / 3) / 2;
            tile.position.y = y;
            tile.position.z = z;
            tile.setRotationFromQuaternion(quaternion);
        }

        tiles.forEach(tile => {
            tile.visible = false;
        });
    }

    _addLights() {

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

        this._updateTextureEncoding();
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

        this._traverseMaterials(this.content, (material) => {
            if (material.isMeshStandardMaterial || material.isGLTFSpecularGlossinessMaterial) {
                material.envMap = textureCube;
                material.needsUpdate = true;
            }
        });

    }

    _updateTextureEncoding() {
        const encoding = THREE.sRGBEncoding;
        this._traverseMaterials(this.content, (material) => {
            if (material.map) material.map.encoding = encoding;
            if (material.emissiveMap) material.emissiveMap.encoding = encoding;
            if (material.map || material.emissiveMap) material.needsUpdate = true;
        });
    }

    _traverseMaterials(object, callback) {
        object.traverse((node) => {
            if (!node.isMesh) return;
            const materials = Array.isArray(node.material)
                ? node.material
                : [node.material];
            materials.forEach(callback);
        });
    }
}