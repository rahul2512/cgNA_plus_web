//var THREE = require("three");
import * as THREE from "three";

export let atomGroups = {
                    "A": {},
                    "C": {},
                    "G": {},
                    "T": {},
                    "U": {},
                    "M": {},
                    "N": {},
                    "H": {},
                    "K": {},
};

export let bases = {
                    "A": {},
                    "C": {},
                    "G": {},
                    "T": {},
                    "U": {},
                    "M": {},
                    "N": {},
                    "H": {},
                    "K": {},
};

export let basepairs = {
                    "A": {},
                    "C": {},
                    "G": {},
                    "U": {},
                    "T": {},
                    "M": {},
                    "N": {},
                    "H": {},
                    "K": {},
};

export let phosphate = {};
export let phosphateAtoms = {};

let nucleotideColors = {
    T: 0x336699, //Azure
    U: 0x336699, //Azure
    A: 0x960018, //Carmine
    G: 0x007700, //Green
    C: 0xfdf501, //Tweety bird
    M: 0xFFFFE0, //light yellow
    N: 0x228B22, //forestgreen
    H: 0xFFFFE0, //light yellow
    K: 0x228B22, //forestgreen
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
    U : [
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
        ],
    M : [
            [-1.28657765449683,4.52255701334427,2.77555756156289e-17],
            [-1.47665054038848,3.14316712685502,0],
            [-2.62254356529968,2.68442396996229,0.00100000000000000],
            [-0.385057702897589,2.33540381348435,0.000345992810207529],
            [0.848496113805832,2.85477978961241,0.00158616112557461],
            [1.88303685950519,2.01968489662960,0.00100000000000000],
            [1.06531043633039,4.27112225105204,0.00155664258340361],
            [-0.0382837938843514,5.06162143324159,0.00103501592415939],
            [-2.49796842535900,5.38950786804710,-5.55111512312578e-17]
        ],
    H : [
            [-1.28657765449683,4.52255701334427,2.77555756156289e-17],
            [-1.47665054038848,3.14316712685502,0],
            [-2.62254356529968,2.68442396996229,0.00100000000000000],
            [-0.385057702897589,2.33540381348435,0.000345992810207529],
            [0.848496113805832,2.85477978961241,0.00158616112557461],
            [1.88303685950519,2.01968489662960,0.00100000000000000],
            [1.06531043633039,4.27112225105204,0.00155664258340361],
            [-0.0382837938843514,5.06162143324159,0.00103501592415939],
            [-2.49796842535900,5.38950786804710,-5.55111512312578e-17]
        ],
    N : [
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
    K : [
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
        ]

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
    U : [
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
    U : [
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

export function atomMesh (type, pos) {
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

export function bondMesh (pos_from, pos_to, atom_from, atom_to) {
    var radius = 0.1;
    var direction = new THREE.Vector3().subVectors( pos_to, pos_from );
    var orientation = new THREE.Matrix4();
    var material_from = new THREE.MeshPhongMaterial({color: atomColors[atom_from.toString()], shininess: 25});
    var material_to = new THREE.MeshPhongMaterial({color: atomColors[atom_to.toString()], shininess: 25});

    orientation.lookAt(pos_from, pos_to, new THREE.Object3D().up);
    orientation.multiply(
        new THREE.Matrix4()
        .set(1,  0, 0, 0,
             0,  0, 1, 0,
             0, -1, 0, 0,
             0,  0, 0, 1));
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

export function baseGeom (nuc) {
    var thickness = 0.36;
    var height = 4.2;
    var purine_width = 6.0;
    var pyrimidine_width = 3.6;
    var geometry;// = new THREE.BoxGeometry(1,1,1);
    if (nuc == 'A')
        geometry = new THREE.BoxBufferGeometry(height, purine_width,     thickness);
    else if (nuc == 'C')
        geometry = new THREE.BoxBufferGeometry(height, pyrimidine_width, thickness);
    else if (nuc == 'G')
        geometry = new THREE.BoxBufferGeometry(height, purine_width,     thickness);
    else if (nuc == 'T')
        geometry = new THREE.BoxBufferGeometry(height, pyrimidine_width, thickness);
    else //if (nuc == 'X')
        geometry = new THREE.BoxBufferGeometry(height,0.8,thickness);
    return geometry;
}

export function bpGeom (nuc) {
    var thickness = 0.36;
    var width = 4.2;
    var height = 5.3;
    var geometry = new THREE.BoxBufferGeometry(width,height,thickness);

    return geometry;
}

export function phosphateGeom () {
    return new THREE.TetrahedromBufferGeometry(1);
}

export function baseMaterial (nuc, type) {
    //var material = new THREE.MeshLambertMaterial({color: 0x554444 });
    var material = new THREE.MeshToonMaterial({color: 0x554444 });
    if (nuc == 'A') {
        material.color = new THREE.Color(nucleotideColors.A);
    } else if (nuc == 'C') {
        material.color = new THREE.Color(nucleotideColors.C);
    } else if (nuc == 'G') {
        material.color = new THREE.Color(nucleotideColors.G);
    } else if (nuc == 'T') {
        material.color = new THREE.Color(nucleotideColors.T);
    } else if (nuc == 'U') {
        material.color = new THREE.Color(nucleotideColors.U);
    } else if (nuc == 'M') {
        material.color = new THREE.Color(nucleotideColors.M);
    } else if (nuc == 'N') {
        material.color = new THREE.Color(nucleotideColors.N);
    } else if (nuc == 'H') {
        material.color = new THREE.Color(nucleotideColors.H);
    } else if (nuc == 'K') {
        material.color = new THREE.Color(nucleotideColors.K);
    } else {//if (nuc == 'X')
        material.color = new THREE.Color(uniformColor);
    }
    if (type === 'highlight') {
        material.color = new THREE.Color(0x1fefef);
        material.emissive = new THREE.Color(0x1fefef);
    }

    return material;
}

export function phosphateMaterial () {
    var material = new THREE.MeshLambertMaterial({color: 0x554444 });
        material.color = new THREE.Color(0x444444);

    return material;
}

export function FrameGeom (type) {
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

    //R: Matrix4
function makeAtomsObject (R, base, strand) {
    var baseObject = new THREE.Object3D();
    base = base.toString();
    for (var i = 0; i < idealBasesPositions[base].length; i++) {
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


    //var D = new THREE.Matrix4();
    //D = make_4_mat(R,r);
    baseObject.applyMatrix(R);

    return baseObject;
}

//exports.atomMesh = atomMesh;
//exports.bondMesh = bondMesh;
//exports.baseGeom = baseGeom;
//exports.bpGeom = bpGeom;
//exports.baseMaterial = baseMaterial;
//exports.FrameGeom = FrameGeom;
//exports.phosphateGeom = phosphateGeom;
//exports.phosphateMaterial = phosphateMaterial;
//exports.makeAtomsObject = makeAtomsObject;
//exports.atomGroups = atomGroups;
//exports.bases = bases;
//exports.basepairs = basepairs;
//exports.phosphate = phosphate;
//exports.phosphateAtoms = phosphateAtoms;
