/* RenderObject:
 *     - basesWatson: 
 *         - base0:
 *            ...
 *         - baseN
 *     - basesCrick: 
 *         - base0:
 *            ...
 *         - baseN
 *     - bps: 
 *         - bp0:
 *            ...
 *         - bpN
 *     - phosphatesWatson (array of phosphate meshes)
 *         - phosphate0
 *            ...
 *         - phosphateN
 *     - phosphatesCrick (array of phosphate meshes)
 *         - phosphate0
 *            ...
 *         - phosphateN
 *     - phosphatesBound: (array of sphere meshes)
 *         - phosphateB0
 *          ...
 *         - phosphateB14
 *     - baseFramesWatson: (array of base frame meshes)
 *         - bframe0
 *         - bframe1
 *            ...
 *         - bframeN
 *     - baseFramesCrick: (array of base frame meshes)
 *         - bframe0
 *         - bframe1
 *            ...
 *         - bframeN
 *     - bpFrames: (array of bp frame meshes)
 *         - bpframe0
 *            ...
 *         - bpframeN
 *     - bpsFrames: (array of bps frame meshes)
 *         - bpsframe0
 *            ...
 *         - bpsframeN
 *     - phosphateFramesWatson (array of phosphate frame meshes)
 *         - pframe0
 *            ...
 *         - pframeN
 *     - phosphateFramesCrick (array of phosphate frame meshes)
 *         - pframe0
 *            ...
 *         - pframeN
 */

//relative positions from the midframe G of the nucleobases. THis was calculated using the average of the positions of the atoms in idealBases.mat from cgDNA.
var baseRelativePositions = {
    A : [-0.6649,   2.8093,  -0.0001],
    T : [-0.1795,   3.7435,   0.0006],
    G : [-0.8746,   2.5819,   0.0002],
    C : [-0.5011,   3.5869,   0.0007]
};

var baseRelativePositions_comp = {
    A : [-0.6649,   -2.8093,  -0.0001],
    T : [-0.1795,   -3.7435,   0.0006],
    G : [-0.8746,   -2.5819,   0.0002],
    C : [-0.5011,   -3.5869,   0.0007]
};

/*
//Zeroed x and z coordinates:
var baseRelativePositions = {
    A : [0.0,   2.8093,  0.0],
    T : [0.0,   3.7435,  0.0],
    G : [0.0,   2.5819,  0.0],
    C : [0.0,   3.5869,  0.0]
};
*/
    
function relBasePos (nuc) {
    if (nuc === 'A')
        return baseRelativePositions.A;
    else if (nuc === 'T')
        return baseRelativePositions.T;
    else if (nuc === 'G')
        return baseRelativePositions.G;
    else if (nuc === 'C')
        return baseRelativePositions.C;
}

function relBasePos_comp (nuc) {
    if (nuc === 'A')
        return baseRelativePositions_comp.A;
    else if (nuc === 'T')
        return baseRelativePositions_comp.T;
    else if (nuc === 'G')
        return baseRelativePositions_comp.G;
    else if (nuc === 'C')
        return baseRelativePositions_comp.C;
}

/*
var baseRenderMode = {
    base: 0,
    bp : 1,
    atoms: 2
};

var baseColorRenderMode = {
    nucleotide: 0,
    protein: 1,
    baseEnergy: 2
};
*/

//var uniformColor = 0x444444;

var nucleotideColors = {
    T: 0x336699, //Azure
    A: 0x960018, //Carmine
    G: 0x007700, //Green
    C: 0xfdf501 //Tweety bird
};

var atomColors = {
    C1 : 0xaaaaaa,
    C2 : 0xaaaaaa,
    C4 : 0xaaaaaa,
    C5 : 0xaaaaaa,
    C6 : 0xaaaaaa,
    C7 : 0xaaaaaa,
    C8 : 0xaaaaaa,
    N1 : 0x0000aa,
    N2 : 0x0000aa,
    N3 : 0x0000aa,
    N4 : 0x0000aa,
    N6 : 0x0000aa,
    N7 : 0x0000aa,
    N9 : 0x0000aa,
    O2 : 0xdd0000,
    O4 : 0xdd0000,
    O6 : 0xdd0000
};

//Tsukuba convention, in Angstroms
var idealBasesPositions = {
    A : [
            [-2.49796327085232,5.38950417914333,-5.55111512312578e-17],
            [-1.28657765449683,4.52255701334427,-5.55111512312578e-17],
            [0.0414485126804114,4.88655404950894,0.00199878860014835],
            [0.862626669580093,3.88333803661065,0.00133110956912930],
            [0.0333357284215527,2.77105187462224,0.000488695488453567],
            [0.298311935152744,1.39214274295957,0.000229111870740747],
            [1.61099933122680,0.929985147423594,0],
            [-0.758766225646914,0.558232846858952,-0.00130276471245037],
            [-1.98588607523965,1.07703691889775,-0.00183911484875782],
            [-2.35392362006564,2.33877296288239,-0.00179658907407414],
            [-1.27754797169666,3.15275083197096,-4.16333634234434e-17]
        ],
    T : [
            [-2.49797385251954,5.38951175207988,-8.32667268468867e-17],
            [-1.28657765449683,4.52255701334427,-9.71445146547012e-17],
            [-0.0308318929617097,5.06966398538589,0.00106227587351299],
            [1.06705884597297,4.29544362667478,0.00182968625221110],
            [2.46409441406427,4.97805677636900,0.00100000000000000],
            [0.954415605430206,2.85551051188829,0.00131997916448753],
            [1.93792690492813,2.13682539678559,0],
            [-1.49052504046889,3.16358559151261,-1.38777878078145e-16],
            [-2.56735108282079,2.63243335990271,0],
            [-0.345449648812713,2.39168814612310,0.00125651287566437] 
    ],
    G : [
            [-1.28657765449683,4.52255701334427,-6.93889390390723e-17],
            [0.0426423566174657,4.88330289243608,0.00130968377641127],
            [0.871086535669193,3.86785583503164,0.00131167498235545],
            [0.0311247947646614,2.75498381388369,0.000526268903276811],
            [0.347544708728062,1.37173063868634,0.000999083717970736],
            [1.55199075361480,0.923057827003115,0],
            [-0.811580042335409,0.582460960590514,-0.000109613967279027],
            [-2.10468805144495,1.06601640189687,4.02518859410478e-05],
            [-2.95201095238939,0.112605094074547,-0.00100000000000000],
            [-2.39995031196363,2.36417953688744,-0.000724381917298830],
            [-1.28738844874338,3.14401190725862,-6.93889390390723e-17],
            [-2.49796842535900,5.38950786804709,-1.11022302462516e-16]
        ],
    C : [
            [-1.28657765449683,4.52255701334427,2.77555756156289e-17],
            [-1.47665054038848,3.14316712685502,0],
            [-2.62254356529968,2.68442396996229,0.00100000000000000],
            [-0.385057702897589,2.33540381348435,0.000345992810207529],
            [0.848496113805832,2.85477978961241,0.00158616112557461],
            [1.88303685950519,2.01968489662960,0.00100000000000000],
            [1.06531043633039,4.27112225105204,0.00155664258340361],
            [-0.0382837938843514,5.06162143324159,0.00103501592415939],
            [-2.49796842535900,5.38950786804710,-5.55111512312578e-17]
        ]
};

var idealBasesNames = {
    A : [
            'C1',
            'N9',
            'C8',
            'N7',
            'C5',
            'C6',
            'N6',
            'N1',
            'C2',
            'N3',
            'C4'
        ],
    T : [
            'C1',
            'N1',
            'C6',
            'C5',
            'C7',
            'C4',
            'O4',
            'C2',
            'O2',
            'N3'
    ],
    G : [
            'N9',
            'C8',
            'N7',
            'C5',
            'C6',
            'O6',
            'N1',
            'C2',
            'N2',
            'N3',
            'C4',
            'C1'
        ],
    C : [
            'N1',
            'C2',
            'O2',
            'N3',
            'C4',
            'N4',
            'C5',
            'C6',
            'C1'
        ]
};

var baseBonds = {
    A : [
            ['C1', 'N9'],
            ['N9', 'C4'],
            ['N9', 'C8'],
            ['C8', 'N7'],
            ['N7', 'C5'],
            ['C5', 'C6'],
            ['C6', 'N6'],
            ['C6', 'N1'],
            ['N1', 'C2'],
            ['C2', 'N3'],
            ['N3', 'C4'],
            ['C4', 'C5']
    ],

    T : [
            ['C1', 'N1'],
            ['N1', 'C6'],
            ['C6', 'C5'],
            ['C5', 'C7'],
            ['C5', 'C4'],
            ['C4', 'O4'],
            ['C4', 'N3'],
            ['N3', 'C2'],
            ['C2', 'O2'],
            ['C2', 'N1']
    ],
    G : [
            ['C1', 'N9'],
            ['N9', 'C8'],
            ['N9', 'C4'],
            ['C8', 'N7'],
            ['N7', 'C5'],
            ['C5', 'C6'],
            ['C6', 'O6'],
            ['C6', 'N1'],
            ['N1', 'C2'],
            ['C2', 'N2'],
            ['C2', 'N3'],
            ['N3', 'C4'],
            ['C4', 'C5']
    ],
    C : [
            ['C1', 'N1'],
            ['N1', 'C6'],
            ['C6', 'C5'],
            ['C5', 'C4'],
            ['C4', 'N4'],
            ['C4', 'N3'],
            ['N3', 'C2'],
            ['C2', 'O2'],
            ['C2', 'N1']
    ]
};

var bpBonds = {
    //A-T
    A : [
            ['N6', 'O4'],
            ['N1', 'N3']
    ],
    //T-A
    T : [
            ['O4', 'N6'],
            ['N3', 'N1']
    ],
    //G-C
    G : [
            ['O6', 'N4'],
            ['N1', 'N3'],
            ['N2', 'O2']
    ],
    //C-G
    C : [
            ['N4', 'O6'],
            ['N3', 'N1'],
            ['O2', 'N2']
    ],
};

function dnaView (_model, _canvas_id) {
    "use strict";
    //BASIC VIEWER STUFF
    this.canvas_id = _canvas_id;
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.lights = undefined;
    this.grid = undefined;

    //MOUSE STUFF
    //to be set from controller
    this.mouse = undefined;
    this.selected = null;
    this.hovered = null;
    this.raycaster = undefined;

    this.model = _model; //dnaModel

    //bools to render or not render things:
    this.renderBases          = true;
    this.renderBasepairs      = false;
    this.renderAtoms          = false;
    this.renderBackboneWatson = true;
    this.renderBackboneCrick  = true;
    this.renderBaseFrames     = false;
    this.renderBpFrames       = false;
    this.renderBpsFrames      = false;
    //this.renderPhosphateFrames = false;
    this.renderGrid           = true;

    //=========================================================================
    //GEOMETRIES/MATERIALS
    //=========================================================================


    this.geom_A = new baseGeom('A');
    this.geom_C = new baseGeom('C');
    this.geom_G = new baseGeom('G');
    this.geom_T = new baseGeom('T');

    this.material_A = new baseMaterial('A', "normal");
    this.material_C = new baseMaterial('C', "normal");
    this.material_G = new baseMaterial('G', "normal");
    this.material_T = new baseMaterial('T', "normal");
    this.material_highlight = new baseMaterial('A', "highlight");
    //this.material_selected = new baseMaterial('X', "selected");
    this.old_material = null;

    this.geom_bp = bpGeom();

    //this.geom_C_atom = new THREE.SphereBufferGeometry(1.7*0.5, 10, 10);
    //this.geom_N_atom = new THREE.SphereBufferGeometry(1.55*0.5, 10, 10);
    //this.geom_O_atom = new THREE.SphereBufferGeometry(1.52*0.5, 10, 10);

    //this.C_atom_material = new THREE.MeshLambertMaterial({color: atomColors.C1});
    //this.N_atom_material = new THREE.MeshLambertMaterial({color: atomColors.N1});
    //this.O_atom_material = new THREE.MeshLambertMaterial({color: atomColors.O4});

    //FRAMES

    this.geom_base_frame = new FrameGeom("base");
    this.geom_bp_frame = new FrameGeom("bp");
    this.geom_bps_frame = new FrameGeom("bps");
    //this.geom_phosphate_frame = new FrameGeom("phosphate");

    this.material_base_frame = new THREE.LineBasicMaterial({color: 0xff4444, linewidth: 3 });
    this.material_bp_frame = new THREE.LineBasicMaterial({color: 0xaaaaaa, linewidth: 3 });
    this.material_bps_frame = new THREE.LineBasicMaterial({color: 0xffff00, linewidth: 3 });
    //this.material_phosphate_frame = new THREE.LineBasicMaterial({color: 0x00ffff, linewidth: 4 });
    
}

dnaView.prototype = {
    init : function () {
        "use strict";
        var container = document.getElementById(this.canvas_id);
        this.scene = new THREE.Scene();


        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);

        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: container});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.camera.position.x = 80;
        this.camera.position.y = 80;
        this.camera.position.z = 80;
        //this.camera.up.set(0,0,1); //REMOVE THIS FOR NORMAL VIEW
        this.camera.lookAt(new THREE.Vector3(0,0,0));

        this.addGridFar();
        //this.addGridPolar();
        //this.addGrid();
        this.addLights();

        this.scene.add(new THREE.AxisHelper(3));

        this.setBackgroundColor(0xffffff);
        this.animate();
    },

    getIntersects : function () {
        var intersects = null;
        this.raycaster.setFromCamera( this.mouse, this.camera);
        intersects = this.raycaster.intersectObjects(this.scene.children, true);

        //remove some unwanted stuff:
        var to_remove = [];
        for (var i = 0; i < intersects.length; i++) {
           if (intersects[i].object.type !== "Mesh"
               || intersects[i].object.type === "LineSegments"
               || intersects[i].object.parent.name.substr(0,8) === "backbone"
               || intersects[i].object.parent.name === "bond")
                to_remove.push(i);
        }
        var shift = 0;
        while(to_remove.length > 0) {
            intersects.splice(to_remove[0]-shift, 1);
            to_remove.shift();
            shift++;
        }

        return intersects;
    },

    animate : function () {
        requestAnimationFrame(this.animate.bind(this));

        var intersects = this.getIntersects();

        if (intersects.length > 0) {
            if (this.hovered !== intersects[0].object) {
                //reset previous hovered
                    if (this.hovered !== null) {
                        this.hovered.material = this.old_material;
                    }
                     //set current hovered
                    if (intersects[0].object !== this.hovered && intersects[0].object.type === "Mesh") {
                        this.hovered = intersects[0].object;
                        this.old_material = this.hovered.material;
                        this.hovered.material = this.material_highlight;
                    }
            }
        } else {
            if (this.hovered != null) {
                this.hovered.material = this.old_material;
            }
            this.hovered = null;
            this.old_material = null;
        }


        this.renderer.render(this.scene, this.camera);
    },

    renderArrow : function (ray) {
        var arrowHelper = new THREE.ArrowHelper( ray.direction, ray.origin, 1000.0, 0xff0000);
        this.scene.add(arrowHelper);
    },

    removeRenderObject : function (id) {
        this.scene.remove(this.scene.getObjectByName("DNA_".concat(id.toString())));
    },

    renderDNA : function (id, flag) {
        this.scene.getObjectByName("DNA_".concat(id.toString())).visible = flag;
    },

    setBackgroundColor : function ( color ) {
        this.scene.background = new THREE.Color(color);
    },

    update_dna : function () {
        //search for all DNA Objects:
        for (var i = 0; i < this.scene.children.length; i++) {
            if (this.scene.children[i].name.indexOf("DNA") !== -1 ) {
                //get the id
                var id = parseInt(this.scene.children[i].name[this.scene.children[i].name.length-1]);

                //go through all necessary options:
                this.showBases(id, this.renderBases);
                this.showBasepairs(id, this.renderBasepairs);
                this.showAtoms(id, this.renderAtoms);

                this.showBackbones(id, this.renderBackboneWatson);

                this.showBaseFrames(id, this.renderBaseFrames);
                this.showBpFrames(id, this.renderBpFrames);
                this.showBpsFrames(id, this.renderBpsFrames);
                //this.showPhosphateFrames(id, this.renderPhosphateFrames);
            }
        }
    },
    
    buildRenderObject : function (dna, id) {
        this.removeRenderObject(id);

        var objectToRender = new THREE.Object3D();
        objectToRender.name = "DNA_".concat(id.toString());

        //=====================================================================
        //  Base rendering
        //=====================================================================

        this.addBases(objectToRender, dna);
        this.addBasepairs(objectToRender, dna);
        this.addBaseAtoms(objectToRender, dna);
        
        this.addBackbones(objectToRender, dna);

        //=====================================================================
        //  Frame rendering
        //=====================================================================

        this.addBaseFrames(objectToRender, dna);
        this.addBpFrames(objectToRender, dna);
        this.addBpsFrames(objectToRender, dna);
        //this.addPhosphateFrames(objectToRender, dna);

        //=====================================================================
        //  Color rendering
        //=====================================================================

        //this.colorise(objectToRender, dna);

        //=====================================================================
        //  Setting visibilities
        //=====================================================================

        var that = this;
        this.scene.add(objectToRender);
        objectToRender.updateMatrixWorld(true);


        if (this.renderBasepairs === false) {
            this.showBasepairs(id, false);
        }
        if (this.renderBases === false) {
            this.showBases(id, false);
        }
        if (this.renderAtoms === false) {
            this.showAtoms(id,false);
        }
        //if (this.renderPhosphates === false) {
        //    this.togglePhosphates(id);
        //}
        if (this.renderBackboneWatson === false) {
            this.showBackbones(id, false);
        }
        if (this.renderBaseFrames === false) {
            this.showBaseFrames(id, false);
        }
        if (this.renderBpFrames === false) {
            this.showBpFrames(id, false);
        }
        if (this.renderBpsFrames === false) {
            this.showBpsFrames(id, false);
        }
        //if (this.renderPhosphateFrames === false) {
        //    this.showPhosphateFrames(id, false);
        //}

        //to center the DNA on the given basepair;
        this.centerDNAAtFrame("DNA_"+id, that.scene.getObjectByName("DNA_"+id).getObjectByName("basepairs", true).children[dna.center].name);
    },

    //NAMES ARE ALWAYS IN FORMAT: nucleotide_atom_type_strand_bp-index
    //E.g. for bases A__base_Watson_0
    //E.g. for atoms A_N6_atom_Watson_0
    addBases : function (object_to_render, dna) {
        var basesWatson = new THREE.Object3D();
        basesWatson.name = "basesWatson";
        var basesCrick = new THREE.Object3D();
        basesCrick.name = "basesCrick";

        var bfW = dna.baseFramesWatson;
        var bfC = dna.baseFramesCrick;

        for (var i = 0; i < bfW.length; i++) {
            var R = new THREE.Matrix3().fromArray(bfW[i].or);
            var Rc = new THREE.Matrix3().fromArray(bfC[i].or);
            var r = new THREE.Vector3().fromArray(bfW[i].pos);
            var rc = new THREE.Vector3().fromArray(bfC[i].pos);

            var R_i = new THREE.Matrix3().copy(R).transpose();
            var Rc_i = new THREE.Matrix3().copy(Rc).transpose();

            var d = new THREE.Vector3().fromArray(relBasePos(dna.sequence[i])).applyMatrix3(R_i);
            var dc = new THREE.Vector3().fromArray(relBasePos_comp(WCcomplement(dna.sequence[i]))).applyMatrix3(Rc_i);

            r.add(d);
            rc.add(dc);

            var D = make_4_mat(R,r);
            var Dc = make_4_mat(Rc,rc);

            var base_R = new THREE.Object3D();
            var base_Rc = new THREE.Object3D();
            if (dna.sequence[i] == 'A') {
                base_R.add(new THREE.Mesh(this.geom_A, this.material_A));
                base_Rc.add(new THREE.Mesh(this.geom_T, this.material_T));
            } else if (dna.sequence[i] == 'C') {
                base_R.add(new THREE.Mesh(this.geom_C, this.material_C));
                base_Rc.add(new THREE.Mesh(this.geom_G, this.material_G));
            } else if (dna.sequence[i] == 'G') {
                base_R.add(new THREE.Mesh(this.geom_G, this.material_G));
                base_Rc.add(new THREE.Mesh(this.geom_C, this.material_C));
            } else if (dna.sequence[i] == 'T') {
                base_R.add(new THREE.Mesh(this.geom_T, this.material_T));
                base_Rc.add(new THREE.Mesh(this.geom_A, this.material_A));
            }
            base_R.applyMatrix(D);
            base_Rc.applyMatrix(Dc);
            
            base_R.name = dna.sequence[i]+'__'+"base_Watson_".concat(i.toString());
            base_Rc.name = WCcomplement(dna.sequence[i])+'__'+"base_Crick_".concat(i.toString());
            //console.log(base_R);
            basesWatson.add(base_R);
            basesCrick.add(base_Rc);
        }

        object_to_render.add(basesWatson);
        object_to_render.add(basesCrick);
    },

    //NAMES ARE ALWAYS IN FORMAT: nucleotide_atom_type_strand_bp-index
    //E.g. for bases A__base_Watson_0
    //E.g. for atoms A_N6_atom_Watson_0
    addBaseAtoms : function (object_to_render, dna) {
        var atomsWatson = new THREE.Object3D();
        atomsWatson.name = "atomsWatson";
        var atomsCrick = new THREE.Object3D();
        atomsCrick.name = "atomsCrick";

        var bfW = dna.baseFramesWatson;
        var bfC = dna.baseFramesCrick;

        for (var i = 0; i < bfW.length; i++) {
            var R = new THREE.Matrix3().fromArray(bfW[i].or);
            var Rc = new THREE.Matrix3().fromArray(bfC[i].or);
            var r = new THREE.Vector3().fromArray(bfW[i].pos);
            var rc = new THREE.Vector3().fromArray(bfC[i].pos);

            var R_i = new THREE.Matrix3().copy(R).transpose();
            var Rc_i = new THREE.Matrix3().copy(Rc).transpose();

            var D = make_4_mat(R,r);
            var Dc = make_4_mat(Rc,rc);

            var base_R = new this.makeAtomsObject(R,r, dna.sequence[i], 'W');
            var base_Rc = new this.makeAtomsObject(Rc,rc, WCcomplement(dna.sequence[i]), 'C');
            base_R.name = dna.sequence[i]+'_'+'_'+"atom_Watson_".concat(i.toString());
            base_Rc.name = WCcomplement(dna.sequence[i])+'_'+'_'+"atom_Crick_".concat(i.toString());

            atomsWatson.add(base_R);
            atomsCrick.add(base_Rc);
        }

        object_to_render.add(atomsWatson);
        object_to_render.add(atomsCrick);
    },

    addBasepairs : function (object_to_render, dna) {
        var bps = new THREE.Object3D();
        bps.name = "basepairs";

        var bpF = dna.bpFrames;
        for (var i = 0; i < bpF.length; i++) {
            var M = bpF[i];
            var R = new THREE.Matrix3();
            R.fromArray(M.or);
            var r = new THREE.Vector3();
            r.fromArray(M.pos);
            var D = make_4_mat(R,r);

            var w_geom = this.geom_bp.parameters.height/2;
            var bp_M = new THREE.Object3D();
            bp_M.name = dna.sequence[i]+'_'+'_'+"bp_bp_".concat(i.toString());
            if (dna.sequence[i] == 'A') {
                var part_W = new THREE.Mesh(this.geom_bp, this.material_A);
                part_W.translateY(w_geom);
                var part_C = new THREE.Mesh(this.geom_bp, this.material_T);
                part_C.translateY(-w_geom);
                part_W.name = dna.sequence[i]+'_'+'_'+"bp_Watson_".concat(i.toString());
                part_C.name = WCcomplement(dna.sequence[i])+'_'+'_'+"bp_Crick_".concat(i.toString());
                bp_M.add(part_W);
                bp_M.add(part_C);
            } else if (dna.sequence[i] == 'C') {
                var part_W = new THREE.Mesh(this.geom_bp, this.material_C);
                part_W.translateY(w_geom);
                var part_C = new THREE.Mesh(this.geom_bp, this.material_G);
                part_C.translateY(-w_geom);
                part_W.name = dna.sequence[i]+'_'+'_'+"bp_Watson_".concat(i.toString());
                part_C.name = WCcomplement(dna.sequence[i])+'_'+'_'+"bp_Crick_".concat(i.toString());
                bp_M.add(part_W);
                bp_M.add(part_C);
            } else if (dna.sequence[i] == 'G') {
                var part_W = new THREE.Mesh(this.geom_bp, this.material_G);
                part_W.translateY(w_geom);
                var part_C = new THREE.Mesh(this.geom_bp, this.material_C);
                part_C.translateY(-w_geom);
                part_W.name = dna.sequence[i]+'_'+'_'+"bp_Watson_".concat(i.toString());
                part_C.name = WCcomplement(dna.sequence[i])+'_'+'_'+"bp_Crick_".concat(i.toString());
                bp_M.add(part_W);
                bp_M.add(part_C);
            } else if (dna.sequence[i] == 'T') {
                var part_W = new THREE.Mesh(this.geom_bp, this.material_T);
                part_W.translateY(w_geom);
                var part_C = new THREE.Mesh(this.geom_bp, this.material_A);
                part_C.translateY(-w_geom);
                part_W.name = dna.sequence[i]+'_'+'_'+"bp_Watson_".concat(i.toString());
                part_C.name = WCcomplement(dna.sequence[i])+'_'+'_'+"bp_Crick_".concat(i.toString());
                bp_M.add(part_W);
                bp_M.add(part_C);
            }
            bp_M.applyMatrix(D);

            bps.add(bp_M);
        }

        object_to_render.add(bps);
    },

    addBackbones : function (object_to_render, config) {
        var backboneWatson = new THREE.Object3D();
        backboneWatson.name = "backboneWatson";
        var backboneCrick = new THREE.Object3D();
        backboneCrick.name = "backboneCrick";

        //remove older one:
        var bbW = object_to_render.getObjectByName("backboneWatson");
        var bbC = object_to_render.getObjectByName("backboneCrick");
        object_to_render.remove(bbW);
        object_to_render.remove(bbC);

        //console.log(object_to_render.getObjectByName("basesWatson"));
        var bfW = object_to_render.getObjectByName("basesWatson");
        var bfC = object_to_render.getObjectByName("basesCrick");

        var coords_W = [];
        var coords_C = [];

  	    for (var i = 0; i < bfW.children.length; i++) {
            var rl = new THREE.Vector3().copy(bfW.children[i].position);
            var R = new THREE.Matrix3().setFromMatrix4(bfW.children[i].matrix);
            var v;
            if (config.sequence[i] === 'C' || config.sequence[i] === 'T') {
                v = [-3.0, 3.0, 1.0];
            } else {
                v = [-3.0, 4.0, 1.0];
            }
            var groove = new THREE.Vector3().fromArray(v).applyMatrix3(R); //shift outward
            coords_W.push(rl.add(groove));
        }

  	    for (var i = 0; i < bfC.children.length; i++) {
            var rl = new THREE.Vector3().copy(bfC.children[i].position);
            var R = new THREE.Matrix3().setFromMatrix4(bfC.children[i].matrix);
            if (config.sequence[i] === 'C' || config.sequence[i] === 'T') {
                v = [-3.0, -4.0, -1.0];
            } else {
                v = [-3.0, -3.0, -1.0];
            }
            var groove = new THREE.Vector3().fromArray(v).applyMatrix3(R); //shift outward
            coords_C.push(rl.add(groove));
        }

        //make splines:
        var spline_W = new THREE.CatmullRomCurve3(coords_W);
        var spline_C = new THREE.CatmullRomCurve3(coords_C);

        var geometry_W = new THREE.TubeBufferGeometry( spline_W, bfW.children.length*4, 0.3, 5, false );
        var geometry_C = new THREE.TubeBufferGeometry( spline_C, bfC.children.length*4, 0.3, 5, false );
        var material_W = new THREE.MeshLambertMaterial( { color: 0xaaaaaa } );
        var material_C = new THREE.MeshLambertMaterial( { color: 0xaaaaaa } );
        var mesh_W = new THREE.Mesh( geometry_W, material_W );
        var mesh_C = new THREE.Mesh( geometry_C, material_C );

        backboneWatson.add(mesh_W);
        backboneCrick.add(mesh_C);


        object_to_render.add(backboneWatson);
        object_to_render.add(backboneCrick);
    },

    addBaseFrames : function (object_to_render, dna) {
        var baseFramesWatson = new THREE.Object3D();
        baseFramesWatson.name = "baseFramesWatson";
        var baseFramesCrick = new THREE.Object3D();
        baseFramesCrick.name = "baseFramesCrick";

        var bfW = dna.baseFramesWatson;
        var bfC = dna.baseFramesCrick;

        for (var i = 0; i < bfW.length; i++) {
            var R = new THREE.Matrix3().fromArray(bfW[i].or);
            var Rc = new THREE.Matrix3().fromArray(bfC[i].or);
            var r = new THREE.Vector3().fromArray(bfW[i].pos);
            var rc = new THREE.Vector3().fromArray(bfC[i].pos);

            var D = make_4_mat(R,r);
            var Dc = make_4_mat(Rc,rc);

            var frame_R = new THREE.LineSegments(this.geom_base_frame, this.material_base_frame);
            var frame_Rc = new THREE.LineSegments(this.geom_base_frame, this.material_base_frame);

            frame_R.applyMatrix(D);
            frame_Rc.applyMatrix(Dc);
            
            frame_R.name = "bframeW_".concat(i.toString());
            frame_Rc.name = "bframeC_".concat(i.toString());
            baseFramesWatson.add(frame_R);
            baseFramesCrick.add(frame_Rc);
        }
        object_to_render.add(baseFramesWatson);
        object_to_render.add(baseFramesCrick);
    },

    addBpFrames : function (object_to_render, dna) {
        var bpFrames = new THREE.Object3D();
        bpFrames.name = "bpFrames";

        var bpF = dna.bpFrames;
        for (var i = 0; i < bpF.length; i++) {
            var M = bpF[i];
            var R = new THREE.Matrix3().fromArray(M.or);
            var r = new THREE.Vector3().fromArray(M.pos);
            var D = make_4_mat(R,r);
            var frame_M = new THREE.LineSegments(this.geom_bp_frame, this.material_bp_frame);
            frame_M.applyMatrix(D);
            frame_M.name = "bpframe_".concat(i.toString());

            bpFrames.add(frame_M);
        }

        object_to_render.add(bpFrames);
    },

    addBpsFrames : function (object_to_render, dna) {
        var bpsFrames = new THREE.Object3D();
        bpsFrames.name = "bpsFrames";

        var bpsF = dna.bpsFrames;
        for (var i = 0; i < bpsF.length; i++) {
            var M = bpsF[i];
            var R = new THREE.Matrix3().fromArray(M.or);
            var r = new THREE.Vector3().fromArray(M.pos);
            var D = make_4_mat(R,r);
            var frame_M = new THREE.LineSegments(this.geom_bps_frame, this.material_bps_frame);
            frame_M.applyMatrix(D);
            frame_M.name = "bpsframe_".concat(i.toString());
            bpsFrames.add(frame_M);
        }

        object_to_render.add(bpsFrames);
    },

    /*
    addPhosphateFrames : function (object_to_render, dna) {
        var phosphateFramesWatson = new THREE.Object3D();
        phosphateFramesWatson.name = "phosphateFramesWatson";
        var phosphateFramesCrick = new THREE.Object3D();
        phosphateFramesCrick.name = "phosphateFramesCrick";

        //var pfW = dna.phosphateFramesWatson;
        //var pfC = dna.phosphateFramesCrick;

        var bfW = object_to_render.getObjectByName("basesWatson")
        var bfC = object_to_render.getObjectByName("basesCrick")

        for (var i = 0; i < bfW.children.length; i++) {
            var r = new THREE.Vector3().copy(bfW.children[i].position);
            var R = new THREE.Matrix3().setFromMatrix4(bfW.children[i].matrix);
            var v;
            if (dna.sequence[i] === 'C' || dna.sequence[i] === 'T') {
                v = [-3.0, 3.0, 1.0];
            } else {
                v = [-3.0, 4.0, 1.0];
            }
            var groove = new THREE.Vector3().fromArray(v).applyMatrix3(R); //shift outward
            r.add(groove);

            var D = make_4_mat(R,r);
            var frame_R = new THREE.LineSegments(this.geom_phosphate_frame, this.material_phosphate_frame);
            frame_R.applyMatrix(D);
            frame_R.name = "pframeW_".concat(i.toString());
            phosphateFramesWatson.add(frame_R);
        }

        for (var i = 0; i < bfC.children.length; i++) {
            var rc = new THREE.Vector3().copy(bfC.children[i].position);
            var Rc = new THREE.Matrix3().setFromMatrix4(bfC.children[i].matrix);
            var v;
            if (dna.sequence[i] === 'C' || dna.sequence[i] === 'T') {
                v = [3.0, -4.0, -1.0];
            } else {
                v = [3.0, -3.0, -1.0];
            }
            var groove = new THREE.Vector3().fromArray(v).applyMatrix3(Rc); //shift outward
            rc.add(groove);
            var Dc = make_4_mat(Rc,rc);
            var frame_Rc = new THREE.LineSegments(this.geom_phosphate_frame, this.material_phosphate_frame);
            frame_Rc.applyMatrix(Dc);
            frame_Rc.name = "pframeC_".concat(i.toString());
            phosphateFramesCrick.add(frame_Rc);
        }

        object_to_render.add(phosphateFramesWatson);
        object_to_render.add(phosphateFramesCrick);
    },
    */

    //================================================================================
    //  SELECTION
    //================================================================================

    selectByNames : function (name_arr) {
        this.scene.getObjectByName(name_arr[0]).getObjectByName(name_arr[1]).getObjectByName(name_arr[2]).material.emissive.setHex(0xff0000);
    },

    deselectByNames : function (name_arr) {
        this.scene.getObjectByName(name_arr[0]).getObjectByName(name_arr[1]).getObjectByName(name_arr[2]).material.emissive.setHex(0x000000);
    },

    //================================================================================
    //  VISIBILITY
    //================================================================================

    showGrid : function (val) {
        this.grid.visible = val;
        this.renderGrid = val;
    },

    showBases : function (id, val) {
        var basesWatson = this.scene.getObjectByName("DNA_".concat(id.toString())).getObjectByName("basesWatson");
        var basesCrick = this.scene.getObjectByName("DNA_".concat(id.toString())).getObjectByName("basesCrick");

        basesWatson.visible = val;
        basesCrick.visible = val;
        this.renderBases = val;
    },

    showBasepairs : function (id, val) {
        var basepairs = this.scene.getObjectByName("DNA_".concat(id.toString())).getObjectByName("basepairs");

        basepairs.visible = val;
        this.renderBasepairs = val;
    },

    showAtoms : function (id, val) {
        var atomsWatson = this.scene.getObjectByName("DNA_".concat(id.toString())).getObjectByName("atomsWatson");
        var atomsCrick = this.scene.getObjectByName("DNA_".concat(id.toString())).getObjectByName("atomsCrick");

        atomsWatson.visible = val;
        atomsCrick.visible = val;
        this.renderAtoms = val;
    },

    showBackbones : function (id, val) {
        var backboneWatson = this.scene.getObjectByName("DNA_".concat(id.toString())).getObjectByName("backboneWatson");
        var backboneCrick = this.scene.getObjectByName("DNA_".concat(id.toString())).getObjectByName("backboneCrick");

        backboneWatson.visible = val;
        backboneCrick.visible = val;
        this.renderBackboneWatson = val;
        this.renderBackboneCrick = val;
    },

    showBaseFrames : function (id, val) {
        var baseFramesWatson = this.scene.getObjectByName("DNA_".concat(id.toString())).getObjectByName("baseFramesWatson");
        var baseFramesCrick = this.scene.getObjectByName("DNA_".concat(id.toString())).getObjectByName("baseFramesCrick");

        baseFramesWatson.visible = val;
        baseFramesCrick.visible = val;
        this.renderBaseFrames = val;
    },

    showBpFrames : function (id, val) {
        var bpFrames = this.scene.getObjectByName("DNA_".concat(id.toString())).getObjectByName("bpFrames");

        bpFrames.visible = val;
        this.renderBpFrames = val;
    },

    showBpsFrames : function (id, val) {
        var bpsFrames = this.scene.getObjectByName("DNA_".concat(id.toString())).getObjectByName("bpsFrames");

        bpsFrames.visible = val;
        this.renderBpsFrames = val;
    },

    //showPhosphateFrames : function (id, val) {
    //    var phosphateFramesWatson = this.scene.getObjectByName("DNA_".concat(id.toString())).getObjectByName("phosphateFramesWatson");
    //    var phosphateFramesCrick = this.scene.getObjectByName("DNA_".concat(id.toString())).getObjectByName("phosphateFramesCrick");
    //    
    //    phosphateFramesWatson.visible = val;
    //    phosphateFramesCrick.visible = val;
    //    this.renderPhosphateFrames = val;
    //},

    //================================================================================
    //  Centering DNA
    //================================================================================

    centerDNAAtFrame : function (dna_name, frame_name) {
        var dna = this.scene.getObjectByName(dna_name);
        var frame = dna.getObjectByName(frame_name, true);

        var R = frame.matrixWorld.clone();
        var Rt = new THREE.Matrix4();
        Rt.getInverse(R);
        dna.applyMatrix(Rt);

        dna.matrixWorldNeedsUpdate = true;
        dna.updateMatrixWorld(true);
        frame.matrixWorldNeedsUpdate = true;
        frame.updateMatrixWorld(true);
    },

    //================================================================================
    //  Adding lighting, grid etc.
    //================================================================================

    addGrid : function () {
        var grid = new THREE.Object3D();
        var gridSize = 60;
        var gridStep = 10;
        var gridxz = new THREE.GridHelper(gridSize,gridStep);
        var gridxy = new THREE.GridHelper(gridSize,gridStep);
        var gridzy = new THREE.GridHelper(gridSize,gridStep);
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
    },

    addGridFar : function () {
        var grid = new THREE.Object3D();
        var gridSize = 5000;
        var gridStep = 20;
        var gridxz = new THREE.GridHelper(gridSize,gridStep);
        var gridxy = new THREE.GridHelper(gridSize,gridStep);
        var gridzy = new THREE.GridHelper(gridSize,gridStep);
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
        this.scene.add(this.grid);
    },

    addGridPolar : function () {
        var radius = 200;
        var radials = 16;
        var circles = 8;
        var divisions = 64;
        
        this.grid = new THREE.PolarGridHelper( radius, radials, circles, divisions );
        this.grid.geometry.rotateX(Math.PI/2);
        this.grid.name = "grid";
        this.scene.add(this.grid);
    },

    addLights : function () {
        this.lights = [];
        var ambientLight = new THREE.AmbientLight(0x777777);
        ambientLight.name = "ambientLight";
        var directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.name = "directionalLight";
        directionalLight.position.set(0,1000,0);
        this.lights.push(ambientLight);
        this.lights.push(directionalLight);
        this.scene.add(this.lights[0]);
        this.scene.add(this.lights[1]);
    },
    
    //================================================================================
    //  Making meshes
    //================================================================================

    makeAtomsObject : function (R, r, base, strand) {
        var i;
        var baseObject = new THREE.Object3D();
        base = base.toString();
        for (i = 0; i < idealBasesPositions[base].length; i++) {
            var am = atomMesh(idealBasesNames[base][i], idealBasesPositions[base][i]);
            if (strand === 'C')
                am.rotateX(Math.PI);
            baseObject.add(am);
        }

        var bondsObject = new THREE.Group();
        for (i = 0; i < baseBonds[base].length; i++) {
            //find positions of each
            var atom1 = baseBonds[base][i][0].toString();
            var atom2 = baseBonds[base][i][1].toString();

            var atom1_index = idealBasesNames[base].indexOf(atom1);
            var atom2_index = idealBasesNames[base].indexOf(atom2);
            
            var pos1 = new THREE.Vector3().fromArray(idealBasesPositions[base][atom1_index]);
            var pos2 = new THREE.Vector3().fromArray(idealBasesPositions[base][atom2_index]);
            var bm = bondMesh(pos1, pos2, atom1, atom2);
            bondsObject.add(bm);
        }
        if (strand === 'C') {
            bondsObject.rotateX(Math.PI);
        }
        baseObject.add(bondsObject);


        var D = new THREE.Matrix4();
        D = make_4_mat(R,r);
        baseObject.applyMatrix(D);

        return baseObject;
    },

    makeBackboneMesh : function (r1, r2, type) {
        var direction = new THREE.Vector3().subVectors( r2, r1 );
        var orientation = new THREE.Matrix4();
        orientation.lookAt(r1, r2, new THREE.Object3D().up);
        orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0,
                0, 0, 1, 0,
                0, -1, 0, 0,
                0, 0, 0, 1));
        var geometry = new THREE.CylinderBufferGeometry( 0.2, 0.2, direction.length(), 6, 1 );
        var cyl = new THREE.Mesh( geometry, 
            new THREE.MeshLambertMaterial( { color: 0xbbaaaa } ) );
        cyl.applyMatrix(orientation);

        // position based on midpoints - there may be a better solution than this
        cyl.position.x = (r1.x + r2.x) / 2;
        cyl.position.y = (r1.y + r2.y) / 2;
        cyl.position.z = (r1.z + r2.z) / 2;

        return cyl;
    },

    makeFrameMesh : function (R, r, type) {
        var mesh = new FrameMesh(type);
        var D = new THREE.Matrix4();
        D = make_4_mat(R,r);
        mesh.applyMatrix(D);

        return mesh;
    }
};

function atomMesh (type, pos) {
    var geometry;
    var detail = 16;
    var scale = 0.25;
    if (type[0] === 'C')
        geometry = new THREE.SphereBufferGeometry(scale*1.7, detail, detail);
    else if (type[0] === 'N')
        geometry = new THREE.SphereBufferGeometry(scale*1.55, detail, detail);
    else if (type[0] === 'O')
        geometry = new THREE.SphereBufferGeometry(scale*1.52, detail, detail);
    geometry.translate(pos[0], pos[1], pos[2]);
    var material = new THREE.MeshPhongMaterial({color: atomColors[type.toString()], shininess: 25});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.name = type;
    return mesh;
}

function bondMesh (pos_from, pos_to, atom_from, atom_to) {
    var radius = 0.1;
    var direction = new THREE.Vector3().subVectors( pos_to, pos_from );
    var orientation = new THREE.Matrix4();
    var material_from = new THREE.MeshPhongMaterial({color: atomColors[atom_from.toString()], shininess: 25});
    var material_to = new THREE.MeshPhongMaterial({color: atomColors[atom_to.toString()], shininess: 25});

    orientation.lookAt(pos_from, pos_to, new THREE.Object3D().up);
    orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0,
            0, 0, 1, 0,
            0, -1, 0, 0,
            0, 0, 0, 1));
    var geometry = new THREE.CylinderBufferGeometry( radius, radius, direction.length()/2.0, 6, 6, true );
    var cyl1 = new THREE.Mesh( geometry, material_from );
    var cyl2 = new THREE.Mesh( geometry, material_to );
    cyl1.applyMatrix(orientation);
    cyl2.applyMatrix(orientation);
    cyl1.name = "bond";
    cyl2.name = "bond";

    // position based on midpoints - there may be a better solution than this
    cyl1.position.x = (pos_from.x + pos_to.x)/2 - 1*direction.x/4;
    cyl1.position.y = (pos_from.y + pos_to.y)/2 - 1*direction.y/4;
    cyl1.position.z = (pos_from.z + pos_to.z)/2 - 1*direction.z/4;

    cyl2.position.x = (pos_from.x + pos_to.x)/2 + 1*direction.x/4;
    cyl2.position.y = (pos_from.y + pos_to.y)/2 + 1*direction.y/4;
    cyl2.position.z = (pos_from.z + pos_to.z)/2 + 1*direction.z/4;
    var cyl = new THREE.Group();
    cyl.name = "bond";
    cyl.add(cyl1);
    cyl.add(cyl2);

    return cyl;
}

function baseGeom (nuc) {
    var thickness = 0.36;
    var height = 4.2;
    var purine_width = 6.0;
    var pyrimidine_width = 3.6;
    var geometry;// = new THREE.BoxGeometry(1,1,1);
    if (nuc == 'A')
        geometry = new THREE.BoxGeometry(height, purine_width,     thickness);
    else if (nuc == 'C')
        geometry = new THREE.BoxGeometry(height, pyrimidine_width, thickness);
    else if (nuc == 'G')
        geometry = new THREE.BoxGeometry(height, purine_width,     thickness);
    else if (nuc == 'T')
        geometry = new THREE.BoxGeometry(height, pyrimidine_width, thickness);
    else //if (nuc == 'X')
        geometry = new THREE.BoxGeometry(height,0.8,thickness);
    return geometry;
}

function bpGeom (nuc) {
    var thickness = 0.36;
    var width = 4.2;
    var height = 5.3;
    var geometry = new THREE.BoxGeometry(width,height,thickness);

    return geometry;
}

function baseMaterial (nuc, type) {
    var material = new THREE.MeshLambertMaterial({color: 0x554444 });
    if (nuc == 'A') {
        material.color = new THREE.Color(nucleotideColors.A);
    } else if (nuc == 'C') {
        material.color = new THREE.Color(nucleotideColors.C);
    } else if (nuc == 'G') {
        material.color = new THREE.Color(nucleotideColors.G);
    } else if (nuc == 'T') {
        material.color = new THREE.Color(nucleotideColors.T);
    } else {//if (nuc == 'X')
        material.color = new THREE.Color(uniformColor);
    }
    if (type === 'highlight') {
        material.color = new THREE.Color(0x1fefef);
        material.emissive = new THREE.Color(0x1fefef);
    }

    return material;
}

function FrameGeom (type) {
    var size = 1.0;
    if (type == "base") { // base frame
        size = 2.0;
    }
    if (type == "phosphate") {// bps midframe
        size = 1.2;
    }

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(size,0,0)
    );
    geometry.vertices.push(
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(0,size,0)
    );
    geometry.vertices.push(
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(0,0,size)
    );

    return geometry;
}

var make_4_mat = function (M, v) {
    var tmp = new THREE.Matrix4();
    var m = M.elements;
    tmp.set(m[0], m[1], m[2], v.x,
            m[3], m[4], m[5], v.y,
            m[6], m[7], m[8], v.z,
               0,    0,    0,   1);
    return tmp;
};

var WCcomplement = function (nuc) {
    var comp = null;
    if (nuc == 'A') {
        comp = 'T';
    } else if (nuc == 'C') {
        comp = 'G';
    } else if (nuc == 'G') {
        comp = 'C';
    } else { //(nuc == 'T') {
        comp = 'A';
    }
    return comp;
};


