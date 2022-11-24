import * as THREE from "three";//"/build/three.module.js";
//const stat = require("stats.js/src/Stats.js")

import {WCcomplement, buildRenderObject} from "./utils.js";

export const camera_layer = {
    "bases"           : 1,
    "basepairs"       : 2,
    "baseAtoms"       : 3,
    "phosphates"      : 4,
    "phosphateAtoms"  : 5,
    "backbones"       : 6,
    "baseFrames"      : 7,
    "basepairFrames"  : 8,
    "phosphateFrames" : 9,
    "grid"            : 10,
    "disk"            : 11,
};

export const raycaster_layer = {
    "bases"           : 21,
    "basepairs"       : 22,
    "baseatoms"       : 23,
    "phosphates"      : 24,
    "phosphateatoms"  : 25,
};

const renderOptions = {
    "bases"           : true,
    "basepairs"       : false,
    "baseAtoms"       : false,
    "phosphates"      : true,
    "phosphateAtoms"  : false,
    "backbones"       : true,
    "baseFrames"      : false,
    "basepairFrames"  : false,
    "phosphateFrames" : false,
    "grid"            : false,
    "disk"            : true,
};

const raycastOptions = {
    "bases"           : true,
    "basepairs"       : false,
    "baseatoms"       : false,
    "phosphates"      : true,
    "phosphateAtoms"  : false,
}

export default class dnaView  {
    constructor(_model, _canvas_id) {
        this.canvas_id = _canvas_id;
        this.container_id = undefined;
        this.scene    = undefined;
        this.camera   = undefined;
        this.renderer = undefined;
        this.lights   = undefined;
        this.grid     = undefined;
        this.disk     = undefined;

        //MOUSE STUFF (to be set from controller)
        this.mouse     = undefined;
        this.selected  = null;
        this.hovered   = null;
        this.raycaster = undefined;

        this.model = _model;

        //new spread syntax
        //this.renderOptions = {...renderOptions};
        //this.raycastOptions = {...raycastOptions};
        //old way
        this.renderOptions = Object.assign({}, renderOptions);
        this.raycastOptions = Object.assign({}, raycastOptions);

        //optional FPS counter
        this.stats = undefined;
    }

    init() {
        let canvas = document.getElementById(this.canvas_id);
        let container = canvas.parentNode;
        this.container_id = container.id
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, 0.1, 20000);

        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        //CAMERA POSITION
        this.camera.position.x = 80;
        this.camera.position.y = 80;
        this.camera.position.z = 80;
        //this.camera.up.set(0,0,1); //REMOVE THIS FOR NORMAL VIEW
        this.camera.lookAt(new THREE.Vector3(0,0,0));

        this.addDisk();
        this.addGridFar();
        //this.camera.layers.set(0);
        this.camera.layers.enableAll();
        this.raycaster.layers.disable(0);
        this.update_raycaster();
        this.update_dna();

        //this.addGridPolar();
        //this.addGrid();
        this.addLights();

        this.scene.add(new THREE.AxesHelper(3));


        this.setBackgroundColor(0xffffff);

        //FPS counter:
        //this.stats = new stat.Stats();
        //this.stats.showPanel(0);
        //this.stats.showPanel(1);
        //document.body.append(this.stats.dom)
    }

    getIntersects() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        //old one
        //let intersects = this.raycaster.intersectObjects(this.scene.children, true);
        //new one
        let objects_to_intersect = []
        for (let i = 1; i <= 4; i++) {
            let scene_DNA = this.scene.getObjectByName(`DNA_${i}`);
            if (scene_DNA) {
                if (scene_DNA.getObjectByName("baseatoms_camera")) {
                    objects_to_intersect.push(scene_DNA.getObjectByName("baseatoms_camera"));
                }
                if (scene_DNA.getObjectByName("basebonds_camera")) {
                    //console.log("bonds present")
                    objects_to_intersect.push(scene_DNA.getObjectByName("basebonds_camera"));
                }
                if (scene_DNA.getObjectByName("bases_camera")) {
                    objects_to_intersect.push(scene_DNA.getObjectByName("bases_camera"));
                }
                if (scene_DNA.getObjectByName("basepairs_camera")) {
                    objects_to_intersect.push(scene_DNA.getObjectByName("basepairs_camera"));
                }
                if (scene_DNA.getObjectByName("phosphates_camera")) {
                    objects_to_intersect.push(scene_DNA.getObjectByName("phosphates_camera"));
                }
                if (scene_DNA.getObjectByName("phosphateatoms_camera")) {
                    objects_to_intersect.push(scene_DNA.getObjectByName("phosphateatoms_camera"));
                }
                if (scene_DNA.getObjectByName("phosphatebonds_camera")) {
                    objects_to_intersect.push(scene_DNA.getObjectByName("phosphatebonds_camera"));
                }
            }
        }
        let intersects = this.raycaster.intersectObjects(objects_to_intersect, true);

        return intersects;
    }

    animate() {
        //requestAnimationFrame(this.animate.bind(this));

        //this.stats.begin();
        let intersects = this.getIntersects();

        //console.log(intersects[0]?.instanceId)
        //if (intersects?.length > 0) {
        if (intersects && intersects.length > 0) {
            //console.log(intersects)
            let intersected = intersects[0];
            let name = intersected.object.name.split("_")[0]
            //console.log("name")
            //console.log(name)
            if (this.hovered) {
                //console.log("old hover")
                //console.log(this.hovered)
                //reset previous hovered
                //console.log(this.hovered);
                //console.log(this.hovered.type);
                if (this.hovered.type === 'baseatoms' || this.hovered.type === 'phosphateatoms') {
                    //console.log(this.hovered.instanceID);
                    //console.log(intersected.object?.userData?.instanceIdTobase[intersected.instanceId]);
                    if (!intersected.object.userData.instanceIdTobase ||
                        this.hovered.instanceID !== intersected.object.userData.instanceIdTobase[intersected.instanceId]) {
                        this.hovered.outline.layers.disableAll();
                        this.hovered.outline.traverse( function( child ) { child.layers.disableAll(); } );//necessary for easy atom outlines
                        this.hovered = null;
                    }
                } else {
                    if (this.hovered.instanceID !== intersected.instanceId
                        || this.hovered.object !== intersected.object) {
                        //console.log("different hover")
                        //console.log(intersected.object);
                        //console.log(this.hovered.object);
                        this.hovered.outline.layers.disableAll();
                        this.hovered.outline.traverse( function( child ) { child.layers.disableAll(); } );//necessary for easy atom outlines
                        this.hovered = null;
                    }
                }
            } else {
                //console.log("new hover")
                if (name === "baseatoms"
                    || name === "basebonds"
                    || name === "phosphateatoms"
                    || name === "phosphatebonds"
                ) {
                    //console.log("intersected.instanceId")
                    //console.log(intersected.instanceId)
                    //console.log(intersected.object.userData)
                    //to deal with 'easy' atom outlines
                    if (name === "basebonds")
                        name = "baseatoms";
                    else if (name === "phosphatebonds")
                        name = "phosphateatoms";
                    this.hovered = {
                        instanceID: intersected.object.userData.instanceIdTobase[intersected.instanceId],
                        object: intersected.object,
                        type: name,
                        //outline: intersected.object.parent.getObjectByName(`${name}_outlines`)
                        //            ?.children[intersected.object.userData.instanceIdTobase[intersected.instanceId]]
                        outline: intersected.object.parent.getObjectByName(`${name}_outlines`)
                                    ? intersected.object.parent.getObjectByName(`${name}_outlines`)
                                        .children[intersected.object.userData.instanceIdTobase[intersected.instanceId]]
                                    : null
                    };
                    //console.log("this.hovered")
                    //console.log(this.hovered)
                    //console.log(intersected.object.userData.instanceIdTobase)
                } else {
                    this.hovered = {
                        instanceID: intersected.instanceId,
                        object: intersected.object,
                        type: name,
                        //outline: intersected.object.parent.getObjectByName(`${name}_outlines`)?.children[intersected.instanceId]
                        outline: intersected.object.parent.getObjectByName(`${name}_outlines`)
                                    ? intersected.object.parent.getObjectByName(`${name}_outlines`).children[intersected.instanceId]
                                    : null
                    };
                    //console.log("this.hovered.type")
                    //console.log(this.hovered.type)
                    this.hovered.outline.layers.enableAll();
                }
                //console.log(this.hovered.instanceID)
                //console.log(this.hovered.type)
                //console.log(this.hovered.outline)
                //console.log(this.hovered.outline.layers)
                //this.hovered.outline.layers.enable(camera_layer[name]);
                this.hovered.outline.layers.enableAll();
                this.hovered.outline.traverse( function( child ) { child.layers.enableAll(); } ); //necessary for easy atom outlines
                //console.log(this.hovered.outline.layers)
            }
        } else {
            if (this.hovered) {
                this.hovered.outline.layers.disableAll();
                this.hovered.outline.traverse( function( child ) { child.layers.disableAll(); } );//necessary for easy atom outlines
            }
            //this.hovered?.outline.layers.disableAll();
            //this.hovered?.outline.traverse( function( child ) { child.layers.disableAll(); } );//necessary for easy atom outlines
            this.hovered = null;
        }

        //console.log(this.renderer.info.render.calls);
        this.renderer.render(this.scene, this.camera);
        //this.stats.end();
    }

    animateWithoutSelecting() {
        this.renderer.render(this.scene, this.camera);
    }

    renderArrow(ray) {
        let arrowHelper = new THREE.ArrowHelper( ray.direction, ray.origin, 1000.0, 0xff0000);
        this.scene.add(arrowHelper);
    }

    removeRenderObject(id) {
        if (this.scene.getObjectByName(`DNA_${id}`)) {
            this.scene.remove(this.scene.getObjectByName(`DNA_${id}`));
        }
    }

    renderDNA(id, flag) {
        if (this.scene.getObjectByName(`DNA_${id}`)) {
            this.scene.getObjectByName(`DNA_${id}`).visible = flag;
        }
    }

    setBackgroundColor( color ) {
        this.scene.background = new THREE.Color(color);
        //let background = new THREE.TextureLoader().load( 'images/skyboxes/dark_gradient_skybox2.jpg' );
        //background.mapping = THREE.EquirectangularReflectionMapping;
        //this.scene.background = background;
    }

    update_dna() {
        for (let [layername, layernumber] of Object.entries(camera_layer)) {
            if (this.renderOptions[layername]) {
                this.camera.layers.enable(layernumber);
            } else {
                this.camera.layers.disable(layernumber);
            }
        }
        this.animateWithoutSelecting();
    }

    //TODO see if correct
    update_raycaster() {
        //for (let [layername, layernumber] of Object.entries(raycaster_layer)) {
        for (let [layername, layernumber] of Object.entries(camera_layer)) {
            if (this.renderOptions[layername]) {
                this.raycaster.layers.enable(layernumber);
            } else {
                this.raycaster.layers.disable(layernumber);
            }
        }
    }

    async addDNA(dna, id) {
        if (this.scene.getObjectByName(`DNA_${id}`) !== null)
            this.removeRenderObject(id);

        const objectToRender = await buildRenderObject(dna);
        objectToRender.name = `DNA_${id}`;

        //=====================================================================
        //  Setting visibilities
        //=====================================================================

        this.scene.add(objectToRender);
        objectToRender.updateMatrixWorld(true);

        this.update_dna();

        //to center the DNA on the given basepair;
        const that = this;
        this.centerDNAAtFrame(`DNA_${id}`, dna.center);//, that.scene.getObjectByName(`DNA_${id}`).getObjectByName("basepairs_camera", true).children[dna.center].name);
    }

    //================================================================================
    //  SELECTION
    //================================================================================

    selectByNames(name_arr) {
        this.scene.getObjectByName(name_arr[0]).getObjectByName(name_arr[1]).getObjectByName(name_arr[2]).material.emissive.setHex(0xff0000);
    }

    deselectByNames(name_arr) {
        this.scene.getObjectByName(name_arr[0]).getObjectByName(name_arr[1]).getObjectByName(name_arr[2]).material.emissive.setHex(0x000000);
    }

    //================================================================================
    //  Centering DNA
    //================================================================================

    //centerDNAAtFrame(dna_name, frame_name) {
    centerDNAAtFrame(dna_name, center_index) {
        let dna = this.scene.getObjectByName(dna_name);
        dna.applyMatrix4(new THREE.Matrix4().getInverse(dna.matrix.clone()));
        let dna_index = parseInt(dna_name.split("_")[1]);
        let R = this.model.dna_molecules[dna_index].bpFrames[center_index].clone();
        dna.applyMatrix4(new THREE.Matrix4().getInverse(R));

        dna.matrixWorldNeedsUpdate = true;
        dna.updateMatrixWorld(true);
        this.animateWithoutSelecting();
    }

    centerDNAAtBP(dna_name, center_index) {
        let dna = this.scene.getObjectByName(dna_name);
        dna.applyMatrix4(new THREE.Matrix4().getInverse(dna.matrix.clone()));
        let dna_index = parseInt(dna_name.split("_")[1]);
        let R = this.model.dna_molecules[dna_index].bpFrames[center_index].clone();
        dna.applyMatrix4(new THREE.Matrix4().getInverse(R));

        dna.matrixWorldNeedsUpdate = true;
        dna.updateMatrixWorld(true);
        this.animateWithoutSelecting();
    }

    centerDNAAtBase(dna_name, center_index, strand) {
        let dna = this.scene.getObjectByName(dna_name);
        dna.applyMatrix4(new THREE.Matrix4().getInverse(dna.matrix.clone()));
        let dna_index = parseInt(dna_name.split("_")[1]);
        let R = new THREE.Matrix4();
        if (strand === 'W') {
            R = this.model.dna_molecules[dna_index].baseFramesWatson[center_index].clone();
        } else if (strand === "C") {
            R = this.model.dna_molecules[dna_index].baseFramesCrick[center_index].clone();
        }
        dna.applyMatrix4(new THREE.Matrix4().getInverse(R));

        dna.matrixWorldNeedsUpdate = true;
        dna.updateMatrixWorld(true);
        this.animateWithoutSelecting();
    }

    //================================================================================
    //  Adding lighting, grid etc.
    //================================================================================

    addDisk() {
        let disk = new THREE.Mesh(new THREE.CircleBufferGeometry(15, 50), new THREE.MeshLambertMaterial({color: 0x777777, side: THREE.DoubleSide}));
        disk.translateY(-16)
        disk.rotateX(0.5*Math.PI)
        this.disk = disk;
        this.disk.name = "disk";

        this.disk.layers.disableAll();
        this.disk.layers.set(camera_layer["disk"]);
        this.disk.traverse( function( child ) { child.layers.set( camera_layer["disk"] ) } );

        this.scene.add(this.disk);
    }

    addGrid() {
        let grid = new THREE.Object3D();
        let gridSize = 60;
        let gridStep = 10;
        let gridxz = new THREE.GridHelper(gridSize,gridStep);
        let gridxy = new THREE.GridHelper(gridSize,gridStep);
        let gridzy = new THREE.GridHelper(gridSize,gridStep);
        gridxy.geometry.rotateX(Math.PI/2);
        gridxy.geometry.translate(0,gridSize,-gridSize);
        gridzy.geometry.rotateZ(Math.PI/2);
        gridzy.geometry.translate(-gridSize,gridSize,0);
        grid.add(gridxz);
        grid.add(gridxy);
        grid.add(gridzy);

        grid.translateY(-gridSize/2);
        this.grid = grid;
        this.grid.name = "grid";
        this.grid.translateY(30);
        this.scene.add(this.grid);
    }

    addGridFar() {
        let grid = new THREE.Object3D();
        let gridSize = 5000;
        let gridStep = 20;
        let gridxz = new THREE.GridHelper(gridSize,gridStep);
        let gridxy = new THREE.GridHelper(gridSize,gridStep);
        let gridzy = new THREE.GridHelper(gridSize,gridStep);
        gridxy.geometry.rotateX(Math.PI/2);
        gridxy.geometry.translate(0,gridSize/2,-gridSize/2);
        gridzy.geometry.rotateZ(Math.PI/2);
        gridzy.geometry.translate(-gridSize/2,gridSize/2,0);
        grid.add(gridxz);
        grid.add(gridxy);
        grid.add(gridzy);

        grid.translateY(-gridSize/2);
        this.grid = grid;
        this.grid.name = "grid";
        this.grid.translateY(30);

        this.grid.layers.disableAll();
        this.grid.layers.set(camera_layer["grid"]);
        this.grid.traverse( function( child ) { child.layers.set( camera_layer["grid"] ) } );

        //console.log(this.grid.layers)
        //console.log(this.camera.layers)
        //console.log("this.grid.layers.test(camera_layer[grid])");
        //console.log(this.grid.layers.test(camera_layer["grid"]));
        this.scene.add(this.grid);
    }

    addGridPolar() {
        let radius = 200;
        let radials = 16;
        let circles = 8;
        let divisions = 64;

        this.grid = new THREE.PolarGridHelper( radius, radials, circles, divisions );
        this.grid.geometry.rotateX(Math.PI/2);
        this.grid.name = "grid";
        this.scene.add(this.grid);
    }

    addLights() {
        this.lights = [];
        let ambientLight = new THREE.AmbientLight(0x777777);
        ambientLight.name = "ambientLight";
        let directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.name = "directionalLight";
        directionalLight.position.set(0,1000,0);
        this.lights.push(ambientLight);
        this.lights.push(directionalLight);
        this.scene.add(this.lights[0]);
        this.scene.add(this.lights[1]);
    }
}
