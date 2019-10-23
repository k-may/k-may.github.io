import {BaseSketch} from '../../BaseSketch.js';
import * as THREE from '../../../node_modules/three/build/three.module.js';
import {GLTFLoader} from '../../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {DRACOLoader} from '../../../node_modules/three/examples/jsm/loaders/DRACOLoader.js';
import {WEBVR} from '../../../node_modules/three/examples/jsm/vr/WebVR.js';
import {HorizontalBlurShader} from '../../../node_modules/three/examples/jsm/shaders/HorizontalBlurShader.js';
import {VerticalBlurShader} from '../../../node_modules/three/examples/jsm/shaders/VerticalBlurShader.js';
import {BokehShader, BokehDepthShader} from '../../../shaders/BokehShader3.js';

export default class EnvironmentTest extends BaseSketch {

    constructor() {
        super('EnvironmentTest');

        this._createRenderer();
        this._createScenePass();
        this._createScene3D();
        this._createDOFScene();
        this._createMaskScene();
        this._loadModels();
    }

    draw(time) {
        super.draw(time);

        this.controls.update();
        this.camera.lookAt(this.scene.position);
        // this.cameraMask.lookAt(this.scene.position);

         if (this.cubeCamera) {
             this.cubeCamera.rotation.copy(this.camera.rotation);
             this.renderer.render(this.sceneCube, this.cubeCamera);
         }
        this._renderDOF3DScene();

        // this._renderBlurPasses();

         this._renderMaskPass();

         if(this.tiles) {
             var height = 7 * 1.6;
             var speed = -0.001;
             var tiles = this.tiles.tiles;
             tiles.forEach(tile => {
                 if (tile.position.y < -4) {
                     tile.position.setY(tile.position.y + this.tiles.totalHeight);
                 }
                 tile.position.setY(tile.position.y + speed);
             });
         }

            
         if(this.lightHelper){
             this.spotLight.position.setZ(10);
                this.spotLight.angle = 0.8;
                this.spotLight.shadow.camera.far = 2000;
                this.spotLight.distance = 200;
             this.spotLight.position.setY(1);
            this.lightHelper.update();
         }
    }

    onResize(args) {
        super.onResize(args);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderTargetA.setSize(window.innerWidth, window.innerHeight);
        this.renderTargetB.setSize(window.innerWidth, window.innerHeight);

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.cameraMask.aspect = window.innerWidth / window.innerHeight;
        this.cameraMask.updateProjectionMatrix();

        var pos = 100 / window.innerWidth - 0.5;
        var position = new THREE.Vector3(pos, 0.57, -1).unproject(this.cameraMask);
        this.meshMask.position.set(position.x, position.y, position.z);

        this.materialBokeh.uniforms['textureWidth'].value = window.innerWidth;
        this.materialBokeh.uniforms['textureHeight'].value = window.innerHeight;
        this.materialBokeh.needsUpdate = true;
    }

    //=========================================

    _renderDOF3DScene() {

        this.renderer.setRenderTarget(this.rtTextureColor);
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);

        this.scene.overrideMaterial = this.materialDepth;
        this.renderer.setRenderTarget(this.rtTextureDepth);
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
        this.scene.overrideMaterial = null;

        // this.renderer.setRenderTarget(this.renderTargetA);
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.sceneDOF, this.cameraPass);


    }

    _render3DScene() {

        //render 3D scene to texture
        this.renderer.setRenderTarget(this.renderTargetA);
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
    }

    _renderBlurPasses() {

        //render first pass
        this.renderer.setRenderTarget(this.renderTargetB);
        this.renderer.render(this.sceneA, this.cameraPass);

        //render last pass
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.sceneB, this.cameraPass);

    }

    _renderMaskPass() {
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
        this.renderer.render(this.sceneMask, this.cameraMask);

        // Telling the stencil now to draw/keep only pixels that equals 1 - which we set earlier
        gl.stencilFunc(gl.EQUAL, 1, 1);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        // enabling back the color buffer
        gl.colorMask(true, true, true, true);

        this.renderer.render(this.sceneOrig, this.cameraPass);

        gl.disable(gl.STENCIL_TEST);
    }


    //---------------------------------------------

    _createDOFScene() {

        this.sceneDOF = new THREE.Scene();

        var depthShader = BokehDepthShader;
        this.materialDepth = new THREE.ShaderMaterial({
            uniforms: depthShader.uniforms,
            vertexShader: depthShader.vertexShader,
            fragmentShader: depthShader.fragmentShader
        });
        this.materialDepth.uniforms['mNear'].value = this.camera.near;
        this.materialDepth.uniforms['mFar'].value = 10;//this.camera.far;
        this.materialDepth.uniforms['cameraPos'].value = this.camera.position;

        var pars = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat};
        this.rtTextureDepth = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);
        this.rtTextureColor = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);
        var bokeh_shader = BokehShader;

        var shaderSettings = {
            rings: 8,
            samples: 4
        };

        var bokeh_uniforms = THREE.UniformsUtils.clone(bokeh_shader.uniforms);
        bokeh_uniforms['tColor'].value = this.rtTextureColor.texture;
        bokeh_uniforms['tDepth'].value = this.rtTextureDepth.texture;
        bokeh_uniforms['textureWidth'].value = window.innerWidth;
        bokeh_uniforms['textureHeight'].value = window.innerHeight;
        //bokeh_uniforms['showFocus'].value = 1;
        bokeh_uniforms['vignetting'].value = 1;
        this.materialBokeh = new THREE.ShaderMaterial({
            uniforms: bokeh_uniforms,
            vertexShader: bokeh_shader.vertexShader,
            fragmentShader: bokeh_shader.fragmentShader,
            defines: {
                RINGS: shaderSettings.rings,
                SAMPLES: shaderSettings.samples
            }
        });

        var quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.materialBokeh);
        var quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.materialBokeh);
        quad.frustumCulled = false;
        this.sceneDOF.add(quad);

    }

    _createMaskScene() {

        this.sceneMask = new THREE.Scene();

        this.cameraMask = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.cameraMask.position.z = 5;

        this.sceneOrig = new THREE.Scene();

        var material = new THREE.MeshBasicMaterial();
        material.map = this.rtTextureColor.texture;
        material.stencilWrite = true;
        var quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), material);

        quad.frustumCulled = false;
        material.envMap = this.textureCube;
        material.transparent = true;
//material.opacity = 0.2;
        material.needsUpdate = true;
        this.sceneOrig.add(quad);

        //  this._updateTextureEncoding(this.sceneOrig);
    }

    _createScenePass() {

        this.renderTargetA = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
        this.renderTargetB = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

        var shader = HorizontalBlurShader;
        var material = new THREE.ShaderMaterial({
            uniforms: {
                'tDiffuse': {value: this.renderTargetA.texture},
                'h': {value: 1. / 1000}
            },
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader
        });
        this.sceneA = new THREE.Scene();
        var quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), material);
        quad.frustumCulled = false;
        this.sceneA.add(quad);

        shader = VerticalBlurShader;
        material = new THREE.ShaderMaterial({
            uniforms: {
                'tDiffuse': {value: this.renderTargetB.texture},
                'v': {value: 1. / 1000}
            },
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader
        });

        this.sceneB = new THREE.Scene();
        var quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), material);
        quad.frustumCulled = false;
        this.sceneB.add(quad);

        this.cameraPass = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.cameraPass.position.z = 1;
    }

    _createScene3D() {

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z =2;
        scene.add(camera);

        this.scene = scene;
        this.camera = camera;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.autoRotate = false;
        this.controls.screenSpacePanning = true;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.9;
/*        this.controls.maxAzimuthAngle = 0.2;
        this.controls.minAzimuthAngle = -0.2;
        this.controls.maxPolarAngle = 1.6;
        this.controls.minPolarAngle = 1.2;*/

        window.scene = scene;
    }

    _createRenderer() {

        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer = renderer;
        this.renderer.physicallyCorrectLights = true;
        /*
         this.renderer.gammaOutput = true;
         this.renderer.gammaFactor = 2.2;*/
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        //this.renderer.setClearColor(0xcccccc);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMappingExposure = 1.0;
        this.el.appendChild(renderer.domElement);
    }

    _loadModels() {

        var loader = new GLTFLoader();
        var dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('js/lib/draco/');
        loader.setDRACOLoader(dracoLoader);
        loader.load('assets/tiles.gltf', gltf => {

            //this.scene.add(gltf.scene);
            this.content = gltf.scene;

            this._layoutText(this.content.children[0]);

            var tiles = this.content.children.slice(1, this.content.children.length);
            this._layoutTiles(tiles);

            this._addLights();
            this._updateTextureEncoding();
            this._createCubeMap();
            this.onResize();

        }, undefined, error => {

            console.error(error);

        });
    }

    _layoutText(text) {

        this.text = text;
        //rotate
        var quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        text.setRotationFromQuaternion(quaternion);

        var material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            colorWrite: false,
            depthWrite: false,
            stencilWrite: true
        });
        var mesh = new THREE.Mesh(text.geometry, material);
        mesh.position.copy(text.position);
        mesh.rotation.copy(text.rotation);
        mesh.material.stencilWrite = true;
        this.meshMask = mesh;

        //material.opacity = 0.1;
        material.transparent = true;
        material.depthTest = false;
        material.depthWrite = false;
        
        var scale = 0.06;
        mesh.scale.set(scale, scale, scale);
        this.sceneMask.add(mesh);

        this._updateTextureEncoding(this.sceneMask);
    }

    _layoutTiles(tiles, materials) {

        var numTiles = 100;
        var tileHeight = 1.6;
        var tileWidth = 1.8;
        //size should be even
        var sizeRow = 8;

        var angles = [];
        for (var i = 0; i < 6; i++) {
            angles.push(((Math.PI * 2) / 6) * i);
        }
        var x, y, z;
        this.tiles = {
            tiles : [],
            totalHeight : 0
        };

        //create tiled wall
        for (var i = 0; i < numTiles; i++) {

            var tile = tiles[Math.floor(Math.random() * tiles.length)];
            tile = tile.clone();
            this.scene.add(tile);
            this.tiles.tiles.push(tile);

            var quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);

            var col = Math.floor(i / sizeRow);
            x = col * 1.8;

            var row = i % sizeRow;
            y = row * 1.6 - 4;

            if (row % 2) {
                x -= 0.9;
            }

            var newRot = new THREE.Quaternion();
            var angle = angles[Math.floor(angles.length * Math.random())];
            newRot.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            quaternion.multiply(newRot);

            z = 0;
            tile.position.x = x - ((numTiles / sizeRow) / 2) * 1.8;
            tile.position.y = y;
            tile.position.z = z;
            tile.setRotationFromQuaternion(quaternion);
        }

        this.tiles.totalHeight = sizeRow * tileHeight;
    }

    _addLights() {

        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 0.4;

        const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        hemiLight.name = 'hemi_light';
        this.scene.add(hemiLight);

        const light1 = new THREE.AmbientLight(0xFFFFFF, 0.3);
        light1.name = 'ambient_light';
        light1.intensity = intensity;
        this.camera.add(light1);

        const light2 = new THREE.DirectionalLight(0xFFFFFF, 0.8 * Math.PI);
        light2.position.set(0.5, 0, 0.866); // ~60º
        light2.name = 'main_light';
        light2.intensity = intensity;
        this.camera.add(light2);

        var spotLight = new THREE.SpotLight( 0xffffff, 1 );
        spotLight.position.set( 0, 10, 3 );
        spotLight.angle = 0.2;
        spotLight.penumbra = 0.05;
        spotLight.decay = 2;
        spotLight.intensity = 1;
        spotLight.distance = 100;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 10;
        spotLight.shadow.camera.far = 200;
        
        this.spotLight = spotLight;

        this.lightHelper = new THREE.SpotLightHelper( spotLight );
        this.scene.add( this.lightHelper );

        this.scene.traverse( function( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;
                child.receiveShadow = true;

            }

        } );
        this._updateTextureEncoding();
    }

    _createCubeMap() {

        this.sceneCube = new THREE.Scene();

        this.cubeCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);

        // Textures

        var r = 'assets/environment/skybox/';
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
                //material.stencilWrite = true;
            }
        });

    }

    _updateTextureEncoding(content) {
        content = content || this.content;
        const encoding = THREE.sRGBEncoding;
        this._traverseMaterials(content, (material) => {
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