import {BaseSketch} from '../../BaseSketch.js';
import * as THREE from '../../../node_modules/three/build/three.module.js';
import {GLTFLoader} from '../../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {DRACOLoader} from '../../../node_modules/three/examples/jsm/loaders/DRACOLoader.js';


export default class LightsTest extends BaseSketch {

    constructor() {
        super('LightsTest');

        this._createScene();
        this._loadTile().then(() => {
            this.addLights();
            this.updateTextureEncoding();
        });

        this.spot_intensity = 1;
        this.spot_distance = 100;
        this.spot_angle = 1;
        this.ambient_intensity = 0.1;
    }

    draw(time) {
        super.draw(time);



        if(this._spotLight){
            this.lightHelper.update();
            this._spotLight.intensity = this.spot_intensity;
            this._spotLight.distance = this.spot_distance;
            this._spotLight.angle = this.spot_angle;
            this._ambientLight.intensity = this.ambient_intensity;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    //------------------------------------------------

    addLights() {
        const state = this.state;


        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 1;

        //  var light = new THREE.HemisphereLight(skyColor, groundColor, intensity);// new THREE.AmbientLight( 0x404040 ); // soft white light
        //this.scene.add( light );
        // if (this.options.preset === Preset.ASSET_GENERATOR) {
        const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        hemiLight.name = 'hemi_light';
        //this.scene.add(hemiLight);
        //   this.lights.push(hemiLight);
        // return;
        //}


        var spotLight = new THREE.SpotLight( 0xffffff, 1 );
        spotLight.position.set( 15, 40, 35 );
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.05;
        spotLight.decay = 2;
        spotLight.distance = 200;

        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 10;
        spotLight.shadow.camera.far = 200;
        this.scene.add( spotLight );
        this._spotLight = spotLight;


        this.lightHelper = new THREE.SpotLightHelper( spotLight );
        this.scene.add( this.lightHelper );

        const light1 = new THREE.AmbientLight(0xFFFFFF, 0.3);
        light1.name = 'ambient_light';
        light1.intensity = intensity;
        this._ambientLight = light1;
        this.scene.add(light1);

       /* const light1 = new THREE.AmbientLight(0xFFFFFF, 0.3);
        light1.name = 'ambient_light';
        light1.intensity = intensity;
        this.defaultCamera.add(light1);

        const light2 = new THREE.DirectionalLight(0xFFFFFF, 0.8 * Math.PI);
        light2.position.set(0.5, 0, 0.866); // ~60º
        light2.name = 'main_light';
        light2.intensity = intensity;
        this.defaultCamera.add(light2);*/

        this.updateTextureEncoding();

        //this.lights.push(light1, light2);
    }
    _createScene() {

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer = renderer;
      //  this.renderer.physicallyCorrectLights = true;
        this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2.2;
     //   this.renderer.setClearColor(0xcccccc);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
      //  this.renderer.toneMappingExposure = 1.0;
        this.el.appendChild(renderer.domElement);
        camera.position.z = 5;
        scene.add(camera);

        this.scene = scene;

        var material = new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true } );

        var geometry = new THREE.PlaneBufferGeometry( 2000, 2000 );

        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.set( 0, - 1, 0 );
        mesh.rotation.x = - Math.PI * 0.5;
        mesh.receiveShadow = true;
        scene.add( mesh );

        this.camera = camera;
        this.defaultCamera = camera;
        this.controls = new OrbitControls(this.defaultCamera, this.renderer.domElement);
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = -10;
        this.controls.screenSpacePanning = true;

        window.scene = scene;

    }


    _loadTile() {
        return new Promise((resolve, reject) => {

            var loader = new GLTFLoader();
            var dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('js/lib/draco/');
            loader.setDRACOLoader(dracoLoader);
            loader.load('assets/tile_flowers.gltf', gltf => {

                this.scene.add(gltf.scene);

                this.content = gltf.scene;

                //rotate tile to face camera
                var tile = gltf.scene.children[0];//.find(object => object.name == "Tile_Flower");
                tile.receiveShadow = true;
                tile.castShadow = true;

                tile.children.forEach(mesh =>{
                    mesh.receiveShadow = true;
                    mesh.castShadow = true;
                });
                this.scene.traverse( function( child ) {

                    if ( child.isMesh ) {

                        child.castShadow = true;
                        child.receiveShadow = true;

                    }

                } );
                var rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI/2);
                tile.rotation.setFromQuaternion(rot);

                resolve();

            }, undefined, error => {
                console.log(error);
                reject();
            });

        });
    }

    updateTextureEncoding() {
        const encoding = THREE.sRGBEncoding;
        this.traverseMaterials(this.content, (material) => {
            if (material.map) material.map.encoding = encoding;
            if (material.emissiveMap) material.emissiveMap.encoding = encoding;
            if (material.map || material.emissiveMap) material.needsUpdate = true;
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
}