import * as THREE from "three";
import DNA from "./DNA.js"

export default class dnaModel {
    constructor() {
        this.dna_molecules = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    }

    clear() {
        for (let i = 0; i < this.dna_molecules.length; i++) {
            this.dna_molecules[i].empty();
            delete this.dna_molecules[i];
            this.dna_molecules.pop();
        }
    }

    loadConfigurationFromJSON(config, id) {
        this.dna_molecules[id] = null;

        let dna = new DNA();
        dna.type = config.type;
        dna.sequence = config.sequence;
        dna.center = parseInt(config.center);
	    dna.shapes = config.shapes;
        for (let i = 0; i < config.sequence.length; i++) {
            //console.log(`loading bp ${i}`)
            let bp = config.coords[i];
            let Rw = new THREE.Matrix4();
            let Rc = new THREE.Matrix4();
            let Rbp = new THREE.Matrix4();

            Rw.set(bp.D[0], bp.D[1], bp.D[2], bp.r[0],
                   bp.D[3], bp.D[4], bp.D[5], bp.r[1],
                   bp.D[6], bp.D[7], bp.D[8], bp.r[2],
                        0,       0,       0,       1);

            Rc.set(bp.Dc[0], bp.Dc[1], bp.Dc[2], bp.rc[0],
                   bp.Dc[3], bp.Dc[4], bp.Dc[5], bp.rc[1],
                   bp.Dc[6], bp.Dc[7], bp.Dc[8], bp.rc[2],
                          0,        0,        0,        1);

            Rbp.set(bp.Dbp[0], bp.Dbp[1], bp.Dbp[2], bp.rbp[0],
                   bp.Dbp[3], bp.Dbp[4], bp.Dbp[5], bp.rbp[1],
                   bp.Dbp[6], bp.Dbp[7], bp.Dbp[8], bp.rbp[2],
                          0,        0,        0,        1);

            dna.baseFramesWatson.push(Rw);
            dna.baseFramesCrick.push(Rc);
            dna.bpFrames.push(Rbp);
        }

        //if phosphate frames are part of the data, add them:
        if (config.type === "cgDNA+" || config.type === "cgRNA+" || config.type === "cgHYB+") {
            dna.phosphateFramesWatson = [];
            dna.phosphateFramesCrick = [];
            //console.log(`loading cgDNA+ phosphates`)
            for (let i = 0; i < config.sequence.length; i++) {
                //console.log(`loading phosphates ${i}`)
                let bp = config.coords[i];
                //console.log(bp)

                if (bp.Dpw) {
                    let Pw = new THREE.Matrix4();
                    Pw.set(bp.Dpw[0], bp.Dpw[1], bp.Dpw[2], bp.rpw[0],
                           bp.Dpw[3], bp.Dpw[4], bp.Dpw[5], bp.rpw[1],
                           bp.Dpw[6], bp.Dpw[7], bp.Dpw[8], bp.rpw[2],
                                   0,         0,         0,        1);
                    dna.phosphateFramesWatson.push(Pw);
                } else {
                    dna.phosphateFramesWatson.push(null);
                }

                if (bp.Dpc) {
                    let Pc = new THREE.Matrix4();
                    Pc.set(bp.Dpc[0], bp.Dpc[1], bp.Dpc[2], bp.rpc[0],
                           bp.Dpc[3], bp.Dpc[4], bp.Dpc[5], bp.rpc[1],
                           bp.Dpc[6], bp.Dpc[7], bp.Dpc[8], bp.rpc[2],
                                   0,          0,        0,        1);
                    dna.phosphateFramesCrick.push(Pc);
                } else {
                    dna.phosphateFramesCrick.push(null);
                }
            }
        } /*else if (config.type === "cgDNA") {
	        dna.calculatePhosphates();
        }*/

        //console.log(`     CALCULATING BP FRAMES`)
        //dna.calculateBpFrames();
        //dna.calculateBpsFrames();

        this.dna_molecules[id] = dna;
    }

    removeConfiguration(id) {
        this.dna_molecules[id].empty();
        this.dna_molecules[id] = null;
    }
}
