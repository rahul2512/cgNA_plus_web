import * as THREE from "three";
//window.THREE = require("three");
//window.THREE = THREE;

import * as geometries from "./cgDNAweb_main.js";
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const reframe = new THREE.Matrix4().set(1, 0, 0, 0,
                                        0,-1, 0, 0,
                                        0, 0,-1, 0,
                                        0, 0, 0, 1);
import { camera_layer } from './dnaView.js';
import { raycaster_layer } from './dnaView.js';

//R1 and R2 are THREE.Matrix4
//returns matrix4
export function midframe(R1, R2) {

    let rel_q = relativeRotation(R1.clone(), R2.clone());
    let pos1 = new THREE.Vector3().setFromMatrixPosition(R1.clone());
    let pos2 = new THREE.Vector3().setFromMatrixPosition(R2.clone());
    let pos = (new THREE.Vector3().addVectors(pos1, pos2)).multiplyScalar(0.5);

    return R1.clone().premultiply(halfRotation(rel_q)).setPosition(pos);
}

//R1 and R2 are THREE.Matrix4
function relativeRotation(R1, R2) {
    return new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().getInverse(R2), R1);
}

function rotationAxis(R) {
    let prefactor = 10.0/(R.elements[0] +R.elements[5] +R.elements[10] + 1.0);
    let axis = new THREE.Vector3();
    axis.z = R.elements[1] - R.elements[4];
    axis.y = -(R.elements[2] - R.elements[8]);
    axis.x = R.elements[6] - R.elements[9];

    return axis.multiplyScalar(prefactor);
}

function rotationMatrix(axis) {
    let new_axis = new THREE.Vector3().copy(axis).multiplyScalar(0.2);
    let sqnorm = new_axis.x*new_axis.x + new_axis.y*new_axis.y + new_axis.z*new_axis.z;
    let X = new THREE.Matrix4().set(0.,         new_axis.z, -new_axis.y, 0,
                                    -new_axis.z, 0.,         new_axis.x, 0,
                                    new_axis.y, -new_axis.x,         0., 0,
                                    0,          0,           0,          1);
    //console.log("X1")
    //console.log(X)
    let X2 = new THREE.Matrix4().copy(X).multiplyScalar(4.0/(4.0 + sqnorm));
    X2.elements[15] = 1.;
    let X2e = X2.elements;
    //console.log("X2")
    //console.log(X2)
    let tmp = new THREE.Matrix4().copy(X).multiply(X).multiplyScalar(0.5);
    tmp.elements[15] = 1.;
    let tmpe = tmp.elements;
    //console.log("tmpe")
    //console.log(tmpe)
    let I = new THREE.Matrix4();
    let Ie = I.elements;
    //console.log("I")
    //console.log(I)
    let out = [0., 0., 0., 0.,
               0., 0., 0., 0.,
               0., 0., 0., 0.,
               0., 0., 0., 1.,];
    for (let i = 0; i < 15; i++) {
        //console.log(`${Ie[i]} + ${tmpe[i]} + ${X2e[i]}`);
        out[i] = Ie[i] + tmpe[i] + X2e[i];
        //console.log(out[i])
    }
    //let out = I.elements.map((e, i) => {e + tmpe[i] + Xe[i];});
    //console.log("out")
    //console.log(out)
    return new THREE.Matrix4().fromArray(out);
}

function halfRotation(R) {
    let axis = rotationAxis(R);
    let sqnorm = 0.2*(axis.x*axis.x + axis.y*axis.y + axis.z*axis.z);
    axis.multiplyScalar(2./(2. + Math.sqrt(sqnorm+4.)));
    //console.log("half axis")
    //console.log(axis)

    return rotationMatrix(axis);
}

export function WCcomplement (nuc, dna) {
    let comp = null;
    if (dna.type === "cgDNA+") {
    if (nuc == 'A') {
        comp = 'T';
    } else if (nuc == 'C') {
        comp = 'G';
    } else if (nuc == 'G') {
        comp = 'C';
    } else if (nuc == 'M') {
        comp = 'N';
    } else if (nuc == 'N') {
        comp = 'M';
    } else if (nuc == 'H') {
        comp = 'K';
    } else if (nuc == 'K') {
        comp = 'H';
    } else if (nuc == 'T') {
        comp = 'A';
    }
    }

    else if (dna.type === "cgDNA") {
    if (nuc == 'A') {
        comp = 'T';
    } else if (nuc == 'C') {
        comp = 'G';
    } else if (nuc == 'G') {
        comp = 'C';
    } else if (nuc == 'T') {
        comp = 'A';
    }
    }

    else if (dna.type === "cgHYB+") {
    if (nuc == 'A') {
        comp = 'U';
    } else if (nuc == 'C') {
        comp = 'G';
    } else if (nuc == 'G') {
        comp = 'C';
    } else if (nuc == 'U') {
        comp = 'A';
    } else if (nuc == 'T') {
        comp = 'A';
    }}

    else if (dna.type === "cgRNA+") {
    if (nuc == 'A') {
        comp = 'U';
    } else if (nuc == 'C') {
        comp = 'G';
    } else if (nuc == 'G') {
        comp = 'C';
    } else if (nuc == 'U') {
        comp = 'A';
    }}

    return comp;
};


export async function buildRenderObject (dna) {
    let objectToRender = new THREE.Group();
    objectToRender.layers.set(30);

    //=====================================================================
    //  Base rendering
    //=====================================================================

    //addBases(objectToRender, dna);
    //addBases_optimised(objectToRender, dna);
    //addBases_outlines(objectToRender, dna);
    //addBasepairs(objectToRender, dna);
    //addBasepairs_optimised(objectToRender, dna);
    //addBasepairs_outlines(objectToRender, dna);
    //addBaseAtoms(objectToRender, dna);
    //addBaseAtoms_optimised(objectToRender, dna);
    //addBaseAtoms_outlines(objectToRender, dna);

    Promise.all([
        addBases_optimised(objectToRender, dna),
        addBases_outlines(objectToRender, dna),
        addBasepairs_optimised(objectToRender, dna),
        addBasepairs_outlines(objectToRender, dna),
        addBaseAtoms_optimised(objectToRender, dna),
        addBaseAtoms_outlines(objectToRender, dna)
    ]);

    if (dna.type === "cgDNA+" || dna.type === "cgRNA+" || dna.type === "cgHYB+") {
        Promise.all([
            //addPhosphates(objectToRender, dna),
            addPhosphates_optimised(objectToRender, dna),
            addPhosphates_outlines(objectToRender, dna),
            //addPhosphateAtoms(objectToRender, dna),
            addPhosphateAtoms_optimised(objectToRender, dna),
            addPhosphateAtoms_outlines(objectToRender, dna),
        ]);
    } else if (dna.type === "cgDNA") {
        await addBackbones(objectToRender, dna);
    }

    //STOPPED HERE, CHECK WITH REST OF CALLED FUNCTIONS TO PUT ONTO SCREEN

    //=====================================================================
    //  Frame rendering
    //=====================================================================

    addBaseFrames(objectToRender, dna);
    addBpFrames(objectToRender, dna);
    //addBpsFrames(objectToRender, dna);
    if (dna.type === "cgDNA+" || dna.type === "cgRNA+" || dna.type === "cgHYB+")
        addPhosphateFrames(objectToRender, dna);

    console.log("renderObject")
    console.log(objectToRender)

    return objectToRender;
}

async function addBases (object_to_render, dna) {
    let basesWatson = new THREE.Group();
    basesWatson.name = "basesWatson";
    let basesCrick = new THREE.Group();
    basesCrick.name = "basesCrick";

    let bfW = dna.baseFramesWatson;
    let bfC = dna.baseFramesCrick;

    for (let i = 0; i < bfW.length; i++) {
        let base_R = geometries.bases[dna.sequence[i]]['W'].clone();
        let base_Rc = geometries.bases[WCcomplement(dna.sequence[i],dna)]['C'].clone();
        base_R.name = dna.sequence[i]+'_'+'_'+"base_Watson_".concat(i.toString());
        base_Rc.name = WCcomplement(dna.sequence[i],dna)+'_'+'_'+"base_Crick_".concat(i.toString());

        base_R.applyMatrix4(bfW[i]);
        base_Rc.applyMatrix4(bfC[i]);
        basesWatson.add(base_R);
        basesCrick.add(base_Rc);
    }

    //set layer object for visibility
    basesWatson.layers.set(raycaster_layer["bases"]);
    basesCrick.layers.set(raycaster_layer["bases"]);
    basesWatson.traverse( function( child ) { child.layers.enable( raycaster_layer["bases"] ) } );
    basesCrick.traverse( function( child ) { child.layers.enable( raycaster_layer["bases"] ) } );
    object_to_render.add(basesWatson);
    object_to_render.add(basesCrick);
}

async function addBases_optimised (object_to_render, dna) {
    let bfW = dna.baseFramesWatson;
    let bfC = dna.baseFramesCrick;

    const _colors = new Uint8Array( 4 );
	for ( let c = 0; c <= _colors.length; c ++ ) {
		//_colors[ c ] = ( c / _colors.length ) * 256;
		_colors[ c ] = 1/(1 - Math.exp(- c / _colors.length ))  * 256;
		//_colors[ c ] = -(1/(1 - Math.exp(- c  )))  * 256;
	}

	const gradientMap = new THREE.DataTexture( _colors, _colors.length, 1, THREE.LuminanceFormat );
	gradientMap.minFilter = THREE.NearestFilter;
	gradientMap.magFilter = THREE.NearestFilter;
	gradientMap.generateMipmaps = false;

    let material = new THREE.MeshToonMaterial({gradientMap: gradientMap});

    let colors = {
        //"A": new THREE.Color("#"+geometries.bases['A']['W'].material.color.getHexString()),
        //"C": new THREE.Color("#"+geometries.bases['C']['W'].material.color.getHexString()),
        //"G": new THREE.Color("#"+geometries.bases['G']['W'].material.color.getHexString()),
        //"T": new THREE.Color("#"+geometries.bases['T']['W'].material.color.getHexString()),
        "A": new THREE.Color("#EE4654"),
        "C": new THREE.Color("#FFE634"),
        "G": new THREE.Color("#49B82A"),
        "T": new THREE.Color("#47869A"),
        "M": new THREE.Color("#FFB334"), 
        "N": new THREE.Color("#49B82A"),
        "H": new THREE.Color("#DBC542"),
        "K": new THREE.Color("#49B82A"),
        "U": new THREE.Color("#0F2EFF"),
    };

    let scales = {
        "A": new THREE.Vector3(1., 1.451, 1.),
        "C": new THREE.Vector3(1.,    1., 1.),
        "G": new THREE.Vector3(1., 1.451, 1.),
        "T": new THREE.Vector3(1.,    1., 1.),
        "U": new THREE.Vector3(1.,    1., 1.),
        "M": new THREE.Vector3(1.,    1., 1.),
        "N": new THREE.Vector3(1., 1.451, 1.),
        "H": new THREE.Vector3(1.,    1., 1.),
        "K": new THREE.Vector3(1., 1.451, 1.),
    }

    let offsets_W = {
        "A": new THREE.Matrix4().copy(geometries.bases["A"]["W"].matrix),
        "C": new THREE.Matrix4().copy(geometries.bases["C"]["W"].matrix),
        "G": new THREE.Matrix4().copy(geometries.bases["G"]["W"].matrix),
        "T": new THREE.Matrix4().copy(geometries.bases["T"]["W"].matrix),
        "M": new THREE.Matrix4().copy(geometries.bases["M"]["W"].matrix),
        "H": new THREE.Matrix4().copy(geometries.bases["H"]["W"].matrix),
        "N": new THREE.Matrix4().copy(geometries.bases["N"]["W"].matrix),
        "K": new THREE.Matrix4().copy(geometries.bases["K"]["W"].matrix),
        "U": new THREE.Matrix4().copy(geometries.bases["U"]["W"].matrix),
    }
    let offsets_C = {
        "A": new THREE.Matrix4().copy(geometries.bases["A"]["C"].matrix),
        "C": new THREE.Matrix4().copy(geometries.bases["C"]["C"].matrix),
        "G": new THREE.Matrix4().copy(geometries.bases["G"]["C"].matrix),
        "T": new THREE.Matrix4().copy(geometries.bases["T"]["C"].matrix),
        "M": new THREE.Matrix4().copy(geometries.bases["M"]["C"].matrix),
        "N": new THREE.Matrix4().copy(geometries.bases["N"]["C"].matrix),
        "H": new THREE.Matrix4().copy(geometries.bases["H"]["C"].matrix),
        "K": new THREE.Matrix4().copy(geometries.bases["K"]["C"].matrix),
        "U": new THREE.Matrix4().copy(geometries.bases["U"]["C"].matrix),
    }

    let base_geometry = geometries.bases["T"]["W"].geometry.clone();

    let base_mesh = new THREE.InstancedMesh(base_geometry, material.clone(), 2*dna.sequence.length);
    base_mesh.name = "bases_camera";


    for (let i = 0; i < dna.sequence.length; i++) {
        let dummy = new THREE.Object3D();
        dummy.applyMatrix4(offsets_W[dna.sequence[i]]);
        dummy.applyMatrix4(dna.baseFramesWatson[i]);
        dummy.scale.copy(scales[dna.sequence[i]]);
        dummy.updateMatrix();
        base_mesh.setMatrixAt(i, dummy.matrix);
        base_mesh.setColorAt(i, colors[dna.sequence[i]]);
    }
    for (let i = 0; i < dna.sequence.length; i++) {
        let dummy = new THREE.Object3D();
        dummy.applyMatrix4(offsets_C[WCcomplement(dna.sequence[i],dna)]);
        dummy.applyMatrix4(dna.baseFramesCrick[i]);
        dummy.scale.copy(scales[WCcomplement(dna.sequence[i],dna)]);
        dummy.updateMatrix();
        base_mesh.setMatrixAt(i+dna.sequence.length, dummy.matrix);
        base_mesh.setColorAt(i+dna.sequence.length, colors[WCcomplement(dna.sequence[i],dna)]);
    }
    base_mesh.instanceMatrix.needsUpdate = true;

    //set layer object for visibility
    base_mesh.layers.disableAll();
    base_mesh.traverse( function( child ) { child.layers.disableAll(); } );
    base_mesh.layers.set(camera_layer["bases"]);
    base_mesh.traverse( function( child ) { child.layers.set( camera_layer["bases"] ) } );

    object_to_render.add(base_mesh);
}

async function addBases_outlines (object_to_render, dna) {
    let base_outlines = new THREE.Group();
    base_outlines.name = "bases_outlines";

    let bfW = dna.baseFramesWatson;
    let bfC = dna.baseFramesCrick;

    for (let i = 0; i < bfW.length; i++) {
        let base_R = geometries.bases[dna.sequence[i]]['W'].clone();
        base_R.name = dna.sequence[i]+'_'+'_'+"base_Watson_".concat(i.toString())+"_outline";

        let params_R = new THREE.Vector3(base_R.geometry.parameters.width, base_R.geometry.parameters.height, base_R.geometry.parameters.depth);
        base_R.geometry = new THREE.BoxBufferGeometry(1., 1., 1.);
        base_R.scale.multiply(params_R.addScalar(0.2));
        base_R.updateMatrix();
        //base_R.material = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.BackSide});
        base_R.material = new THREE.MeshBasicMaterial({color: 0x1a6eb2, side: THREE.BackSide});

        base_R.applyMatrix4(bfW[i]);
        base_outlines.add(base_R);
    }
    for (let i = 0; i < bfC.length; i++) {
        let base_Rc = geometries.bases[WCcomplement(dna.sequence[i],dna)]['C'].clone();
        base_Rc.name = WCcomplement(dna.sequence[i],dna)+'_'+'_'+"base_Crick_".concat(i.toString())+"_outline";

        let params_Rc = new THREE.Vector3(base_Rc.geometry.parameters.width, base_Rc.geometry.parameters.height, base_Rc.geometry.parameters.depth);
        base_Rc.geometry = new THREE.BoxBufferGeometry(1., 1., 1.);
        base_Rc.scale.multiply(params_Rc.addScalar(0.2));
        base_Rc.updateMatrix();
        //base_Rc.material = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.BackSide});
        base_Rc.material = new THREE.MeshBasicMaterial({color: 0x1a6eb2, side: THREE.BackSide});

        base_Rc.applyMatrix4(bfC[i]);
        base_outlines.add(base_Rc);
    }

    //set layer object for visibility
    //base_outlines.layers.set(camera_layer["bases"]);
    //base_outlines.traverse( function( child ) { child.layers.enable( raycaster_layer["bases"] ) } );
    base_outlines.layers.disableAll();
    base_outlines.traverse( function( child ) { child.layers.disableAll(); } );
    object_to_render.add(base_outlines);
}

async function addBaseAtoms (object_to_render, dna) {
    let atomsWatson = new THREE.Group();
    atomsWatson.name = "atomsWatson";
    let atomsCrick = new THREE.Group();
    atomsCrick.name = "atomsCrick";

    let bfW = dna.baseFramesWatson;
    let bfC = dna.baseFramesCrick;

    for (let i = 0; i < bfW.length; i++) {
        let base_R = geometries.atomGroups[dna.sequence[i]]['W'].clone();
        let base_Rc = geometries.atomGroups[WCcomplement(dna.sequence[i],dna)]['C'].clone();
        base_R.name = dna.sequence[i]+'_'+'_'+"atom_Watson_".concat(i.toString());
        base_Rc.name = WCcomplement(dna.sequence[i],dna)+'_'+'_'+"atom_Crick_".concat(i.toString());

        base_R.applyMatrix4(bfW[i]);
        base_Rc.applyMatrix4(bfC[i]);
        atomsWatson.add(base_R);
        atomsCrick.add(base_Rc);
    }

    //atomsWatson.layers.set(camera_layer["baseatoms"]);
    //atomsCrick.layers.set(camera_layer["baseatoms"]);
    //atomsWatson.traverse( function( child ) { child.layers.set( camera_layer["baseatoms"] ) } );
    //atomsCrick.traverse( function( child ) { child.layers.set( camera_layer["baseatoms"] ) } );
    object_to_render.add(atomsWatson);
    object_to_render.add(atomsCrick);
}

async function addBaseAtoms_optimised (object_to_render, dna) {
    let bfW = dna.baseFramesWatson;
    let bfC = dna.baseFramesCrick;

    let atom_geometry = new THREE.SphereBufferGeometry(0.4, 16, 16);
    let atom_material = new THREE.MeshToonMaterial();

    let colors = {
        "C" : new THREE.Color(0.27, 0.27, 0.27),
        "N" : new THREE.Color(0.0, 0.0, .67),
        "O" : new THREE.Color(0.67, .0, 0.0),
        "P" : new THREE.Color(1.0, .0, .0),
    }

    let scales = {
        "C" : 0.42,
        "N" : 0.39,
        "O" : 0.38,
        "P" : 1.8,
    }

    //determine how many atoms there are:
    let atom_count = 0;
    for (let i = 0; i < bfW.length; i++) {
        let atoms_R = geometries.atomGroups[dna.sequence[i]]['W'].clone();
        let atoms_Rc = geometries.atomGroups[WCcomplement(dna.sequence[i],dna)]['C'].clone();
        atom_count += atoms_R.getObjectByName("atoms").children.length;
        atom_count += atoms_Rc.getObjectByName("atoms").children.length;
    }

    let atoms_mesh = new THREE.InstancedMesh(atom_geometry, atom_material, atom_count);
    atoms_mesh.name = "baseatoms_camera";
    atoms_mesh.userData = {
        instanceIdTobase: []
    };

    let atom_positions = [];
    let types = [];
    //loop over each base, then each atom, put the pos and type in the corresponding arrays
    for (let i = 0; i < bfW.length; i++) {
        let atoms_R = geometries.atomGroups[dna.sequence[i]]['W'].clone();
        for (let atom of atoms_R.getObjectByName("atoms").children) {
            atoms_mesh.userData.instanceIdTobase.push(i)
            let position = new THREE.Vector3().copy(atom.position).applyMatrix4(atoms_R.matrix);
            atom_positions.push(position.applyMatrix4(bfW[i]));
            types.push(atom.name[0])
        }
    }
    for (let i = 0; i < bfC.length; i++) {
        let atoms_Rc = geometries.atomGroups[WCcomplement(dna.sequence[i],dna)]['C'].clone();
        for (let atom of atoms_Rc.getObjectByName("atoms").children) {
            atoms_mesh.userData.instanceIdTobase.push(i+dna.sequence.length)
            let position = new THREE.Vector3().copy(atom.position).applyMatrix4(atoms_Rc.matrix);
            atom_positions.push(position.applyMatrix4(bfC[i]));
            types.push(atom.name[0])
        }
    }
    console.log(atom_positions);
    console.log(types);
    for (let i = 0; i < atom_count; i++) {
        let dummy = new THREE.Object3D();
        dummy.applyMatrix4(new THREE.Matrix4().setPosition(atom_positions[i]));
        dummy.matrix.scale(scales[types[i]]);
        dummy.updateMatrix();
        atoms_mesh.setMatrixAt(i, dummy.matrix);
        atoms_mesh.setColorAt(i, colors[types[i]]);
    }
    atoms_mesh.instanceMatrix.needsUpdate = true;


    let bond_geometry = new THREE.CylinderBufferGeometry(0.1, 0.1, 1.0, 16);
    let bond_material = new THREE.MeshToonMaterial();

    let bond_count = 0;
    for (let i = 0; i < bfW.length; i++) {
        let bonds_R = geometries.atomGroups[dna.sequence[i]]['W'].clone();
        let bonds_Rc = geometries.atomGroups[WCcomplement(dna.sequence[i],dna)]['C'].clone();
        bond_count += 2*bonds_R.getObjectByName("bonds").children.length;
        bond_count += 2*bonds_Rc.getObjectByName("bonds").children.length;
    }

    let bonds_mesh = new THREE.InstancedMesh(bond_geometry, bond_material, bond_count);
    bonds_mesh.name = "basebonds_camera";
    bonds_mesh.userData = {
        instanceIdTobase: []
    };

    let bond_attitudes = [];
    let bond_types = [];
    let bond_lengths = [];
    for (let i = 0; i < bfW.length; i++) {
        let atoms_R = geometries.atomGroups[dna.sequence[i]]['W'].clone();
        for (let combined_bond of atoms_R.getObjectByName("bonds").children) {
            for (let bond of combined_bond.children) {
                bonds_mesh.userData.instanceIdTobase.push(i)
                //console.log(bond)
                let attitude = bond.clone();
                attitude.applyMatrix4(combined_bond.matrix);
                attitude.applyMatrix4(atoms_R.matrix);
                attitude.applyMatrix4(bfW[i]);
                attitude.updateMatrix();
                bond_attitudes.push(attitude.matrix);
                bond_types.push(bond.name[0]);
                bond_lengths.push(bond.geometry.parameters.height);
            }
        }
    }
    for (let i = 0; i < bfC.length; i++) {
        let atoms_Rc = geometries.atomGroups[WCcomplement(dna.sequence[i],dna)]['C'].clone();
        for (let combined_bond of atoms_Rc.getObjectByName("bonds").children) {
            for (let bond of combined_bond.children) {
                bonds_mesh.userData.instanceIdTobase.push(i+dna.sequence.length)
                let attitude = bond.clone();
                attitude.applyMatrix4(combined_bond.matrix);
                attitude.applyMatrix4(atoms_Rc.matrix);
                attitude.applyMatrix4(bfC[i]);
                attitude.updateMatrix();
                bond_attitudes.push(attitude.matrix);
                bond_types.push(bond.name[0]);
                bond_lengths.push(bond.geometry.parameters.height);
            }
        }
    }

    for (let i = 0; i < bond_count; i++) {
        let dummy = new THREE.Object3D();
        dummy.applyMatrix4(new THREE.Matrix4().copy(bond_attitudes[i]));
        //dummy.matrix.scale(scales[types[i]]);
        dummy.scale.copy(new THREE.Vector3(1., bond_lengths[i], 1.0));
        dummy.updateMatrix();
        bonds_mesh.setMatrixAt(i, dummy.matrix);
        bonds_mesh.setColorAt(i, colors[bond_types[i]]);
    }
    bonds_mesh.instanceMatrix.needsUpdate = true;

    //set layer object for visibility
    //atoms_mesh.layers.enableAll();
    //atoms_mesh.traverse( function( child ) { child.layers.enableAll(); } );
    atoms_mesh.layers.disableAll();
    atoms_mesh.traverse( function( child ) { child.layers.disableAll(); } );
    bonds_mesh.layers.disableAll();
    bonds_mesh.traverse( function( child ) { child.layers.disableAll(); } );
    atoms_mesh.layers.enable(camera_layer["baseAtoms"]);
    atoms_mesh.traverse( function( child ) { child.layers.enable( camera_layer["baseAtoms"] ) } );
    bonds_mesh.layers.enable(camera_layer["baseAtoms"]);
    bonds_mesh.traverse( function( child ) { child.layers.enable( camera_layer["baseAtoms"] ) } );
    //atoms_mesh.layers.enable(raycaster_layer["baseatoms"]);
    //atoms_mesh.traverse( function( child ) { child.layers.enable( raycaster_layer["baseatoms"] ) } );

    object_to_render.add(atoms_mesh);
    object_to_render.add(bonds_mesh);
}

async function addBaseAtoms_outlines (object_to_render, dna) {
    //loop over all children of atom geometries, and if it's a mesh, change material to other material:
    //...
    let bfW = dna.baseFramesWatson;
    let bfC = dna.baseFramesCrick;

    let outline_shader = {
        uniforms: {
            "linewidth":  { type: "f", value: 0.1 },
        },
        vertex_shader: [
            "uniform float linewidth;",
            "void main() {",
                "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                "vec4 displacement = vec4( normalize( normalMatrix * normal ) * linewidth, 0.0 ) + mvPosition;",
                "gl_Position = projectionMatrix * displacement;",
            "}"
        ].join("\n"),
        fragment_shader: [
            "void main() {",
                "gl_FragColor = vec4( 0.00828, 0.3503, 0.5669, 1.0 );",
            "}"
        ].join("\n")
    };
                //"gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );",

    let outline_material = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(outline_shader.uniforms),
        vertexShader: outline_shader.vertex_shader,
        fragmentShader: outline_shader.fragment_shader,
        side: THREE.BackSide
    });

    let outlines = new THREE.Group();
    outlines.name = "baseatoms_outlines";
    for (let i = 0; i < bfW.length; i++) {
        let atoms_R = geometries.atomGroups[dna.sequence[i]]['W'].clone();
        atoms_R.traverse( function( child ) {
            if (child.type === "Mesh"){
                child.material = outline_material.clone();
            }

        } );
        atoms_R.applyMatrix4(bfW[i])
        outlines.add(atoms_R);
    }
    for (let i = 0; i < bfC.length; i++) {
        let atoms_Rc = geometries.atomGroups[WCcomplement(dna.sequence[i],dna)]['C'].clone();
        atoms_Rc.traverse( function( child ) {
            if (child.type === "Mesh"){
                child.material = outline_material.clone();
            }

        } );
        atoms_Rc.applyMatrix4(bfC[i])
        outlines.add(atoms_Rc);
    }


    outlines.layers.disableAll();
    outlines.traverse( function( child ) { child.layers.disableAll(); } );
    object_to_render.add(outlines);
}

async function addBasepairs (object_to_render, dna) {
    let basepairs = new THREE.Group();
    basepairs.name = "basepairs";

    for (let i = 0; i < dna.bpFrames.length; i++) {
        let bp = geometries.basepairs[dna.sequence[i]].clone();
        bp.name = dna.sequence[i]+'_'+'_'+"bp_Watson_".concat(i.toString());

        bp.applyMatrix4(dna.bpFrames[i]);
        basepairs.add(bp);
    }

    //basepairs.layers.set(camera_layer["basepairs"]);
    //basepairs.traverse( function( child ) { child.layers.set( camera_layer["basepairs"] ) } );
    basepairs.layers.enableAll();
    basepairs.traverse( function( child ) { child.layers.enableAll() } );
    object_to_render.add(basepairs);
}

async function addBasepairs_optimised (object_to_render, dna) {
    const _colors = new Uint8Array( 4 );
	for ( let c = 0; c <= _colors.length; c ++ ) {
		//_colors[ c ] = ( c / _colors.length ) * 256;
		_colors[ c ] = 1/(1 - Math.exp(- c / _colors.length ))  * 256;
	}

	const gradientMap = new THREE.DataTexture( _colors, _colors.length, 1, THREE.LuminanceFormat );
	gradientMap.minFilter = THREE.NearestFilter;
	gradientMap.magFilter = THREE.NearestFilter;
	gradientMap.generateMipmaps = false;

    let material = new THREE.MeshToonMaterial({gradientMap: gradientMap});
    //let material = new THREE.MeshToonMaterial();

    let colors = {
        //"A": new THREE.Color("#"+geometries.bases['A']['W'].material.color.getHexString()),
        //"C": new THREE.Color("#"+geometries.bases['C']['W'].material.color.getHexString()),
        //"G": new THREE.Color("#"+geometries.bases['G']['W'].material.color.getHexString()),
        //"T": new THREE.Color("#"+geometries.bases['T']['W'].material.color.getHexString()),
        "A": new THREE.Color("#EE4654"),
        "C": new THREE.Color("#FFE634"),
        "G": new THREE.Color("#49B82A"),
        "T": new THREE.Color("#47869A"),
        "M": new THREE.Color("#FFB334"),
        "N": new THREE.Color("#49B82A"),
        "H": new THREE.Color("#DBC542"),
        "K": new THREE.Color("#49B82A"),
        "U": new THREE.Color("#0F2EFF"),
    };

    //let bp_geometry = geometries.bases["T"]["W"].geometry.clone();
    let bp_geometry = new THREE.BoxBufferGeometry();
    let bp_mesh = new THREE.InstancedMesh(bp_geometry, material.clone(), 2*dna.sequence.length);
    bp_mesh.name = "basepairs_camera";


    let base_attitudes = [];
    let base_types = [];
    let base_scales = [];
    for (let i = 0; i < dna.bpFrames.length; i++) {
        let basepair = geometries.basepairs[dna.sequence[i]].clone();
        //console.log(basepair);
        for (let base of basepair.children) {
            let attitude = base.clone();
            attitude.applyMatrix4(basepair.matrix);
            attitude.applyMatrix4(dna.bpFrames[i]);
            attitude.updateMatrix();
            base_attitudes.push(attitude.matrix);
            base_types.push(base.name[0]);
            base_scales.push(new THREE.Vector3(base.geometry.parameters.width, base.geometry.parameters.height, base.geometry.parameters.depth));
        }
    }

    for (let i = 0; i < base_attitudes.length; i++) {
        let dummy = new THREE.Object3D();
        dummy.applyMatrix4(new THREE.Matrix4().copy(base_attitudes[i]));
        dummy.scale.copy(base_scales[i]);
        dummy.updateMatrix();
        bp_mesh.setMatrixAt(i, dummy.matrix);
        bp_mesh.setColorAt(i, colors[base_types[i]]);
    }
    bp_mesh.instanceMatrix.needsUpdate = true;

    //bp_mesh.layers.enableAll();
    //bp_mesh.traverse( function( child ) { child.layers.enableAll() } );
    bp_mesh.layers.disableAll();
    bp_mesh.traverse( function( child ) { child.layers.disableAll() } );
    bp_mesh.layers.set(camera_layer["basepairs"]);
    bp_mesh.traverse( function( child ) { child.layers.set( camera_layer["basepairs"] ) } );

    object_to_render.add(bp_mesh);
}

async function addBasepairs_outlines (object_to_render, dna) {
    let basepairs = new THREE.Group();
    basepairs.name = "basepairs_outlines";

    for (let i = 0; i < dna.bpFrames.length; i++) {
        let bp_mat = geometries.basepairs[dna.sequence[i]].clone();
        let bp_outline = new THREE.Mesh(new THREE.BoxBufferGeometry(3.9, 11., .40), new THREE.MeshBasicMaterial({color: 0x1a6eb2, side: THREE.BackSide}));
        bp_outline.name = dna.sequence[i]+'_'+'_'+"bp_Watson_".concat(i.toString());

        bp_outline.applyMatrix4(new THREE.Matrix4().setPosition(-0.6, 0., 0.));
        bp_outline.applyMatrix4(dna.bpFrames[i]);
        bp_outline.updateMatrix();
        basepairs.add(bp_outline.clone()); //not a mistake!, I want two objects here
        basepairs.add(bp_outline.clone());
    }

    //basepairs.layers.set(camera_layer["basepairs"]);
    //basepairs.traverse( function( child ) { child.layers.set( camera_layer["basepairs"] ) } );
    //basepairs.layers.enableAll();
    //basepairs.traverse( function( child ) { child.layers.enableAll() } );
    basepairs.layers.disableAll();
    basepairs.traverse( function( child ) { child.layers.disableAll() } );
    object_to_render.add(basepairs);
}

async function addBackbones (object_to_render, config) {
    let backbones = new THREE.Object3D();
    backbones.name = "backbones";

    let coords_W = [];
    let coords_C = [];

    for (let i = 0; i < config.sequence.length-1; i++) {
        let R = new THREE.Matrix4().copy(config.baseFramesWatson[i]);
        let v = (config.sequence[i] === 'C' || config.sequence[i] === 'T') ?
                    new THREE.Vector3().fromArray([-5.0, 8.0, 2.0]) :
                    new THREE.Vector3().fromArray([-5.0, 8.0, 2.0]);
        let groove = new THREE.Matrix4().setPosition(v);
        coords_W.push(new THREE.Vector3().setFromMatrixPosition(R.clone().multiply(groove)));
    }

    for (let i = 1; i < config.sequence.length; i++) {
        let R = new THREE.Matrix4().copy(config.baseFramesCrick[i]);
        let v = (config.sequence[i] === 'C' || config.sequence[i] === 'T') ?
                    new THREE.Vector3().fromArray([-5.0, -8.0, -2.0]) :
                    new THREE.Vector3().fromArray([-5.0, -8.0, -2.0]);
        let groove = new THREE.Matrix4().setPosition(v);
        coords_C.push(new THREE.Vector3().setFromMatrixPosition(R.clone().multiply(groove)));
    }

    //make splines:
    let spline_W = new THREE.CatmullRomCurve3(coords_W);
    let spline_C = new THREE.CatmullRomCurve3(coords_C);

    let geometry_W = new THREE.TubeBufferGeometry( spline_W, config.sequence.length*4, 0.3, 8, false );
    let geometry_C = new THREE.TubeBufferGeometry( spline_C, config.sequence.length*4, 0.3, 8, false );

    //let backboneGeom = BufferGeometryUtils.mergeBufferGeometries([geometry_W, geometry_C], false);
    //let backboneMesh = new THREE.Mesh(backboneGeom, new THREE.MeshToonMaterial({color: 0xbbbbbb }));
    let backboneW = new THREE.Mesh(geometry_W, new THREE.MeshToonMaterial({color: 0x5e5073 }));
    let backboneC = new THREE.Mesh(geometry_C, new THREE.MeshToonMaterial({color: 0x2c2136 }));

    backbones.add(backboneW);
    backbones.add(backboneC);

    backbones.layers.set(camera_layer["backbones"]);
    backbones.traverse( function( child ) { child.layers.set( camera_layer["backbones"] ) } );

    object_to_render.add(backbones);
}

async function addPhosphates (object_to_render, dna) {
    let phosphatesWatson = new THREE.Group();
    phosphatesWatson.name = "phosphatesWatson";
    let phosphatesCrick = new THREE.Group();
    phosphatesCrick.name = "phosphatesCrick";

    for (let i = 0; i < dna.sequence.length; i++) {
        if (dna.phosphateFramesWatson[i]) {
            let phosphateW = geometries.phosphate.clone();
            phosphateW.applyMatrix4(dna.phosphateFramesWatson[i]);
            phosphateW.name = "phosphate_Watson_".concat(i.toString());
            phosphatesWatson.add(phosphateW);
        }

        if (dna.phosphateFramesCrick[i]) {
            let phosphateC = geometries.phosphate.clone();
            phosphateC.applyMatrix4(dna.phosphateFramesCrick[i]);
            phosphateC.name = "phosphate_Crick_".concat(i.toString());
            phosphateC.material = new THREE.MeshToonMaterial({color : "#00ffff"});
            phosphatesCrick.add(phosphateC);
        }
    }

    phosphatesWatson.layers.set(raycaster_layer["phosphates"]);
    phosphatesCrick.layers.set(raycaster_layer["phosphates"]);
    phosphatesWatson.traverse( function( child ) { child.layers.set( raycaster_layer["phosphates"] ) } );
    phosphatesCrick.traverse( function( child ) { child.layers.set( raycaster_layer["phosphates"] ) } );

    object_to_render.add(phosphatesWatson);
    object_to_render.add(phosphatesCrick);
}

async function addPhosphates_optimised (object_to_render, dna) {
    const _colors = new Uint8Array( 4 );
	for ( let c = 0; c <= _colors.length; c ++ ) {
		_colors[ c ] = 1/(1 - Math.exp(- c / _colors.length )) * 256;
	}

	const gradientMap = new THREE.DataTexture( _colors, _colors.length, 1, THREE.LuminanceFormat );
	gradientMap.minFilter = THREE.NearestFilter;
	gradientMap.magFilter = THREE.NearestFilter;
	gradientMap.generateMipmaps = false;

    let material = new THREE.MeshToonMaterial({gradientMap: gradientMap});
    //let material = geometries.phosphate.material.clone();
    let color_W = new THREE.Color(0x5E5073);
    let color_C = new THREE.Color(0x2C2136);
    let phosphate_geometry = geometries.phosphate.geometry.clone();

    let phosphate_mesh = new THREE.InstancedMesh(phosphate_geometry, material.clone(), 2*dna.sequence.length-2);
    //let phosphate_mesh = new THREE.InstancedMesh(phosphate_geometry, material.clone(), 2*dna.sequence.length-2);
    phosphate_mesh.name = "phosphates_camera";

    let offset = 0;
    for (let i = 0; i < dna.sequence.length; i++) {
        if (dna.phosphateFramesWatson[i]) {
            let dummy = new THREE.Object3D();
            dummy.applyMatrix4(dna.phosphateFramesWatson[i]);
            dummy.updateMatrix();
            phosphate_mesh.setMatrixAt(i-offset, dummy.matrix);
            phosphate_mesh.setColorAt(i-offset, color_W);
        } else {
            offset += 1;
        }
    }

    for (let i = 0; i < dna.sequence.length; i++) {
        if (dna.phosphateFramesCrick[i]) {
            let dummy = new THREE.Object3D();
            dummy.applyMatrix4(dna.phosphateFramesCrick[i]);
            dummy.updateMatrix();
            phosphate_mesh.setMatrixAt(i+dna.sequence.length - offset, dummy.matrix);
            phosphate_mesh.setColorAt(i+dna.sequence.length - offset, color_C);
        } else {
            offset += 1;
        }
    }
    phosphate_mesh.instanceMatrix.needsUpdate = true;
    phosphate_mesh.instanceColor.needsUpdate = true;

    phosphate_mesh.layers.disableAll();
    phosphate_mesh.traverse( function( child ) { child.layers.disableAll() } );
    phosphate_mesh.layers.set(camera_layer["phosphates"]);
    phosphate_mesh.traverse( function( child ) { child.layers.set( camera_layer["phosphates"] ) } );

    object_to_render.add(phosphate_mesh);
}

async function addPhosphates_outlines (object_to_render, dna) {
    let phosphate_outlines = new THREE.Group();
    phosphate_outlines.name = "phosphates_outlines";

    for (let i = 0; i < dna.sequence.length; i++) {
        if (dna.phosphateFramesWatson[i]) {
            let phosphateW = geometries.phosphate.clone();
            phosphateW.scale.multiplyScalar(1.2);
            phosphateW.updateMatrix();
            phosphateW.material = new THREE.MeshBasicMaterial({color: 0x1a6eb2, side: THREE.BackSide});
            phosphateW.applyMatrix4(dna.phosphateFramesWatson[i]);
            //phosphateW.name = "phosphate_Watson_".concat(i.toString());
            phosphate_outlines.add(phosphateW);
        }
    }

    for (let i = 0; i < dna.sequence.length; i++) {
        if (dna.phosphateFramesCrick[i]) {
            let phosphateC = geometries.phosphate.clone();
            phosphateC.scale.multiplyScalar(1.2);
            phosphateC.updateMatrix();
            phosphateC.material = new THREE.MeshBasicMaterial({color: 0x1a6eb2, side: THREE.BackSide});
            phosphateC.applyMatrix4(dna.phosphateFramesCrick[i]);
            //phosphateC.name = "phosphate_Crick_".concat(i.toString());
            phosphate_outlines.add(phosphateC);
        }
    }

    phosphate_outlines.layers.disableAll()
    phosphate_outlines.traverse( function( child ) { child.layers.disableAll(); } );

    object_to_render.add(phosphate_outlines);
}

async function addPhosphateAtoms (object_to_render, dna) {
    let phosAtomsWatson = new THREE.Group();
    phosAtomsWatson.name = "atomsPhosphatesWatson";
    let phosAtomsCrick = new THREE.Group();
    phosAtomsCrick.name = "atomsPhosphatesCrick";

    for (let i = 0; i < dna.sequence.length; i++) {
        if (dna.phosphateFramesWatson[i]) {
            let Pw = geometries.phosphateAtoms.clone();
            Pw.name = "phos_atom_Watson_".concat(i.toString());
            Pw.applyMatrix4(dna.phosphateFramesWatson[i]);
            phosAtomsWatson.add(Pw);
        }
        if (dna.phosphateFramesCrick[i]) {
            let Pc = geometries.phosphateAtoms.clone();
            Pc.name = "phos_atom_Crick_".concat(i.toString());
            Pc.applyMatrix4(dna.phosphateFramesCrick[i]);
            phosAtomsCrick.add(Pc);
        }
    }

    phosAtomsWatson.layers.set(camera_layer["phosphateAtoms"]);
    phosAtomsCrick.layers.set(camera_layer["phosphateAtoms"]);
    phosAtomsWatson.traverse( function( child ) { child.layers.set( camera_layer["phosphateAtoms"] ) } );
    phosAtomsCrick.traverse( function( child ) { child.layers.set( camera_layer["phosphateAtoms"] ) } );

    object_to_render.add(phosAtomsWatson);
    object_to_render.add(phosAtomsCrick);
}

async function addPhosphateAtoms_optimised (object_to_render, dna) {
    let atom_geometry = new THREE.SphereBufferGeometry(0.4, 16, 16);
    //let material = geometries.atomGroups['T']['W'].getObjectByName("atoms").getObjectByName("C1").material.clone();
    let atom_material = new THREE.MeshToonMaterial();

    let colors = {
        "C" : new THREE.Color(0.57, 0.57, 0.57),
        //"C" : new THREE.Color(0.7, 0.6, 0.07),
        "N" : new THREE.Color(0.0, 0.0, .67),
        "O" : new THREE.Color(0.67, .0, 0.0),
        "P" : new THREE.Color(0.5, .125, 1.0),
    }

    let scales = {
        "C" : 0.42,
        "N" : 0.39,
        "O" : 0.38,
        "P" : 1.8,
    }

    //determine how many atoms there are:
    let atom_count = 0;
    for (let i = 0; i < dna.sequence.length; i++) {
        if (dna.phosphateFramesWatson[i]) {
            let phosphate_atoms = geometries.phosphateAtoms.clone();
            atom_count += 2*phosphate_atoms.getObjectByName("atoms").children.length;
        }
    }

    let atoms_mesh = new THREE.InstancedMesh(atom_geometry, atom_material, atom_count);
    atoms_mesh.name = "phosphateatoms_camera";
    atoms_mesh.userData = {
        instanceIdTobase: []
    };

    let offset = 0;
    let atom_positions = [];
    let types = [];
    //loop over each base, then each atom, put the pos and type in the corresponding arrays
    for (let i = 0; i < dna.sequence.length; i++) {
        if (dna.phosphateFramesWatson[i]) {
            let atoms_R = geometries.phosphateAtoms.clone();
            for (let atom of atoms_R.getObjectByName("atoms").children) {
                atoms_mesh.userData.instanceIdTobase.push(i-offset);
                let position = new THREE.Vector3().copy(atom.position).applyMatrix4(atoms_R.matrix);
                atom_positions.push(position.applyMatrix4(dna.phosphateFramesWatson[i]));
                types.push(atom.name[0])
            }
        } else {
            offset += 1;
        }
    }
    for (let i = 0; i < dna.sequence.length; i++) {
        if (dna.phosphateFramesCrick[i]) {
            let atoms_Rc = geometries.phosphateAtoms.clone();
            for (let atom of atoms_Rc.getObjectByName("atoms").children) {
                atoms_mesh.userData.instanceIdTobase.push(i+dna.sequence.length-offset);
                let position = new THREE.Vector3().copy(atom.position).applyMatrix4(atoms_Rc.matrix);
                atom_positions.push(position.applyMatrix4(dna.phosphateFramesCrick[i]));
                types.push(atom.name[0])
            }
        } else {
            offset += 1;
        }
    }
    //console.log(atom_positions);
    //console.log(types);
    for (let i = 0; i < atom_count; i++) {
        let dummy = new THREE.Object3D();
        dummy.applyMatrix4(new THREE.Matrix4().setPosition(atom_positions[i]));
        dummy.matrix.scale(scales[types[i]]);
        dummy.updateMatrix();
        atoms_mesh.setMatrixAt(i, dummy.matrix);
        atoms_mesh.setColorAt(i, colors[types[i]]);
    }
    atoms_mesh.instanceMatrix.needsUpdate = true;


    let bond_geometry = new THREE.CylinderBufferGeometry(0.1, 0.1, 1.0, 16);
    let bond_material = new THREE.MeshToonMaterial();

    let bond_count = 0;
    for (let i = 0; i < dna.sequence.length; i++) {
        if (dna.phosphateFramesWatson[i]) {
            let bonds_R = geometries.phosphateAtoms.clone();
            bond_count += 2*2*bonds_R.getObjectByName("bonds").children.length;
        }
    }

    let bonds_mesh = new THREE.InstancedMesh(bond_geometry, bond_material, bond_count);
    bonds_mesh.name = "phosphatebonds_camera";
    bonds_mesh.userData = {
        instanceIdTobase: []
    };

    offset = 0;
    let bond_attitudes = [];
    let bond_types = [];
    let bond_lengths = [];
    for (let i = 0; i < dna.sequence.length; i++) {
        if (dna.phosphateFramesWatson[i]) {
            let atoms_R = geometries.phosphateAtoms.clone();
            for (let combined_bond of atoms_R.getObjectByName("bonds").children) {
                for (let bond of combined_bond.children) {
                    bonds_mesh.userData.instanceIdTobase.push(i-offset);
                    //console.log(bond)
                    let attitude = bond.clone();
                    attitude.applyMatrix4(combined_bond.matrix);
                    attitude.applyMatrix4(atoms_R.matrix);
                    attitude.applyMatrix4(dna.phosphateFramesWatson[i]);
                    attitude.updateMatrix();
                    bond_attitudes.push(attitude.matrix);
                    bond_types.push(bond.name[0]);
                    bond_lengths.push(bond.geometry.parameters.height);
                }
            }
        } else {
            offset += 1;
        }
    }
    for (let i = 0; i < dna.sequence.length; i++) {
        if (dna.phosphateFramesCrick[i]) {
            let atoms_Rc = geometries.phosphateAtoms.clone();
            for (let combined_bond of atoms_Rc.getObjectByName("bonds").children) {
                for (let bond of combined_bond.children) {
                    bonds_mesh.userData.instanceIdTobase.push(i+dna.sequence.length-offset);
                    let attitude = bond.clone();
                    attitude.applyMatrix4(combined_bond.matrix);
                    attitude.applyMatrix4(atoms_Rc.matrix);
                    attitude.applyMatrix4(dna.phosphateFramesCrick[i]);
                    attitude.updateMatrix();
                    bond_attitudes.push(attitude.matrix);
                    bond_types.push(bond.name[0]);
                    bond_lengths.push(bond.geometry.parameters.height);
                }
            }
        } else {
            offset += 1;
        }
    }

    for (let i = 0; i < bond_count; i++) {
        let dummy = new THREE.Object3D();
        dummy.applyMatrix4(new THREE.Matrix4().copy(bond_attitudes[i]));
        dummy.scale.copy(new THREE.Vector3(1., bond_lengths[i], 1.0));
        dummy.updateMatrix();
        bonds_mesh.setMatrixAt(i, dummy.matrix);
        bonds_mesh.setColorAt(i, colors[bond_types[i]]);
    }
    bonds_mesh.instanceMatrix.needsUpdate = true;

    //set layer object for visibility
    //atoms_mesh.layers.set(camera_layer["bases"]);
    //atoms_mesh.traverse( function( child ) { child.layers.set( camera_layer["baseatoms"] ) } );
    //

    atoms_mesh.layers.disableAll();
    atoms_mesh.traverse( function( child ) { child.layers.disableAll(); } );
    bonds_mesh.layers.disableAll();
    bonds_mesh.traverse( function( child ) { child.layers.disableAll(); } );
    atoms_mesh.layers.enable(camera_layer["phosphateAtoms"]);
    atoms_mesh.traverse( function( child ) { child.layers.enable( camera_layer["phosphateAtoms"] ) } );
    bonds_mesh.layers.enable(camera_layer["phosphateAtoms"]);
    bonds_mesh.traverse( function( child ) { child.layers.enable( camera_layer["phosphateAtoms"] ) } );


    object_to_render.add(atoms_mesh);
    object_to_render.add(bonds_mesh);
}

async function addPhosphateAtoms_outlines (object_to_render, dna) {
    //loop over all children of atom geometries, and if it's a mesh, change material to other material:
    //...
    let outline_shader = {
        uniforms: {
            "linewidth":  { type: "f", value: 0.1 },
        },
        vertex_shader: [
            "uniform float linewidth;",
            "void main() {",
                "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                "vec4 displacement = vec4( normalize( normalMatrix * normal ) * linewidth, 0.0 ) + mvPosition;",
                "gl_Position = projectionMatrix * displacement;",
            "}"
        ].join("\n"),
        fragment_shader: [
            "void main() {",
                "gl_FragColor = vec4( 0.00828, 0.3503, 0.5669, 1.0 );",
            "}"
        ].join("\n")
                //"gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );",
    };

    let outline_material = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(outline_shader.uniforms),
        vertexShader: outline_shader.vertex_shader,
        fragmentShader: outline_shader.fragment_shader,
        side: THREE.BackSide
    });

    console.log(outline_material)

    let outlines = new THREE.Group();
    outlines.name = "phosphateatoms_outlines";
    for (let i = 0; i < dna.phosphateFramesWatson.length; i++) {
        if (dna.phosphateFramesWatson[i]) {
            let atoms_R = geometries.phosphateAtoms.clone();
            //console.log("ATOMS");
            //console.log(atoms_R);
            //console.log(dna.phosphateFramesWatson[i]);
            atoms_R.traverse( function( child ) {
                if (child.type === "Mesh"){
                    child.material = outline_material.clone();
                }
            } );
            atoms_R.applyMatrix4(dna.phosphateFramesWatson[i])
            outlines.add(atoms_R);
        }
    }
    for (let i = 0; i < dna.phosphateFramesCrick.length; i++) {
        if (dna.phosphateFramesCrick[i]) {
        let atoms_Rc = geometries.phosphateAtoms.clone();
            atoms_Rc.traverse( function( child ) {
                if (child.type === "Mesh"){
                    child.material = outline_material.clone();
                }

            } );
            atoms_Rc.applyMatrix4(dna.phosphateFramesCrick[i])
            outlines.add(atoms_Rc);
        }
    }


    outlines.layers.disableAll();
    outlines.traverse( function( child ) { child.layers.disableAll(); } );
    object_to_render.add(outlines);
}

function addBaseFrames (object_to_render, dna) {
    let baseFramesWatson = new THREE.Group();
    baseFramesWatson.name = "baseFramesWatson";
    let baseFramesCrick = new THREE.Group();
    baseFramesCrick.name = "baseFramesCrick";

    for (let i = 0; i < dna.sequence.length; i++) {
        //let frame_R = new THREE.LineSegments(geometries.FrameGeom("base"), new THREE.LineBasicMaterial({color: 0xff4444, linewidth: 3 }));
        let frame_R = new THREE.AxesHelper();
        //let frame_Rc = new THREE.LineSegments(geometries.FrameGeom("base"), new THREE.LineBasicMaterial({color: 0xff4444, linewidth: 3 }));
        let frame_Rc = new THREE.AxesHelper();

        frame_R.applyMatrix4(dna.baseFramesWatson[i]);
        frame_Rc.applyMatrix4(dna.baseFramesCrick[i]);

        frame_R.name = "bframeW_".concat(i.toString());
        frame_Rc.name = "bframeC_".concat(i.toString());
        baseFramesWatson.add(frame_R);
        baseFramesCrick.add(frame_Rc);
    }

    baseFramesWatson.layers.set(camera_layer["baseFrames"]);
    baseFramesCrick.layers.set(camera_layer["baseFrames"]);
    baseFramesWatson.traverse( function( child ) { child.layers.set( camera_layer["baseFrames"] ) } );
    baseFramesCrick.traverse( function( child ) { child.layers.set( camera_layer["baseFrames"] ) } );

    object_to_render.add(baseFramesWatson);
    object_to_render.add(baseFramesCrick);
}

function addBpFrames (object_to_render, dna) {
    let bpFrames = new THREE.Group();
    bpFrames.name = "bpFrames";

    for (let i = 0; i < dna.sequence.length; i++) {
        //let frame_M = new THREE.LineSegments(geometries.FrameGeom("bp"), new THREE.LineBasicMaterial({color: 0xaaaaaa, linewidth: 3 }));
        let frame_bp = new THREE.AxesHelper();
        frame_bp.applyMatrix4(dna.bpFrames[i]);
        frame_bp.name = "bpframe_".concat(i.toString());

        bpFrames.add(frame_bp);
    }

    bpFrames.layers.set(camera_layer["basepairFrames"]);
    bpFrames.traverse( function( child ) { child.layers.set( camera_layer["basepairFrames"] ) } );

    object_to_render.add(bpFrames);
}

function addBpsFrames (object_to_render, dna) {
    let bpsFrames = new THREE.Group();
    bpsFrames.name = "bpsFrames";

    //console.log(dna.bpsFrames)
    for (let i = 0; i < dna.sequence.length-1; i++) {
        //let frame_M = new THREE.LineSegments(geometries.FrameGeom("bps"), new THREE.LineBasicMaterial({color: 0xffff00, linewidth: 3 }));
        let frame_bps = new THREE.AxesHelper();
        frame_bps.applyMatrix4(dna.bpsFrames[i]);
        frame_bps.name = "bpsframe_".concat(i.toString());
        bpsFrames.add(frame_bps);
    }

    object_to_render.add(bpsFrames);
}

function addPhosphateFrames (object_to_render, dna) {
    let phosphateFramesWatson = new THREE.Group();
    phosphateFramesWatson.name = "phosphateFramesWatson";
    let phosphateFramesCrick = new THREE.Group();
    phosphateFramesCrick.name = "phosphateFramesCrick";

    for (let i = 0; i < dna.sequence.length; i++) {
        //var frame_R = new THREE.LineSegments(this.geom_phosphate_frame, this.material_phosphate_frame);
        if (dna.phosphateFramesWatson[i]) {
            let frame_R = new THREE.AxesHelper();
            let frame_R2 = new THREE.AxesHelper(0.8);
            frame_R2.material = new THREE.LineBasicMaterial({color: "#eeeeee", linewidth: 4});
            frame_R.applyMatrix4(dna.phosphateFramesWatson[i]);
            frame_R2.applyMatrix4(dna.phosphateFramesWatson[i]);
            frame_R.name = "pframeW_".concat(i.toString());
            phosphateFramesWatson.add(frame_R);
            phosphateFramesWatson.add(frame_R2);
        }
        if (dna.phosphateFramesCrick[i]) {
            let frame_Rc = new THREE.AxesHelper();
            let frame_Rc2 = new THREE.AxesHelper(0.8);
            frame_Rc2.material = new THREE.LineBasicMaterial({color: "#00dddd", linewidth: 4});
            frame_Rc.applyMatrix4(dna.phosphateFramesCrick[i]);
            frame_Rc2.applyMatrix4(dna.phosphateFramesCrick[i]);
            frame_Rc.name = "pframeC_".concat(i.toString());
            phosphateFramesCrick.add(frame_Rc);
            phosphateFramesCrick.add(frame_Rc2);
        }
    }

    phosphateFramesWatson.layers.set(camera_layer["phosphateFrames"]);
    phosphateFramesCrick.layers.set(camera_layer["phosphateFrames"]);
    phosphateFramesWatson.traverse( function( child ) { child.layers.set( camera_layer["phosphateFrames"] ) } );
    phosphateFramesCrick.traverse( function( child ) { child.layers.set( camera_layer["phosphateFrames"] ) } );

    object_to_render.add(phosphateFramesWatson);
    object_to_render.add(phosphateFramesCrick);
}
