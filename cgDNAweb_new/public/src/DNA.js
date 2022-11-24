import * as THREE from "three";
import {midframe} from "./utils.js";

export default class DNA {
    constructor() {
        this.baseFramesWatson = []; //THREE.Matrix4 array
        this.baseFramesCrick = [];
        this.bpFrames = [];
        this.bpsFrames = [];
        this.phosphateFramesWatson = undefined;
        this.phosphateFramesCrick = undefined;
        this.sequence = undefined; //string
        this.type = undefined; //string, either cgDNA or cgDNA+

        this.shapes = undefined;
        this.center = undefined;
    }

    empty() {
        if (this.baseFramesWatson !== undefined) {
            delete this.baseFramesWatson;
        }
        if (this.baseFramesCrick !== undefined) {
            delete this.baseFramesCrick;
        }
        if (this.bpFrames !== undefined) {
            delete this.bpFrames;
        }
        if (this.sequence !== undefined) {
            delete this.sequence;
        }
        if (this.phosphateFramesWatson !== undefined) {
            delete this.baseFramesWatson;
        }
        if (this.phosphateFramesCrick !== undefined) {
            delete this.baseFramesCrick;
        }

        if (this.shapes !== undefined) {
            delete this.shapes;
        }
    }

    calculateBpFrames() {
        if (this.bpFrames !== undefined) {
            delete this.bpFrames;
        }
        this.bpFrames = [];

        for (var i = 0; i < this.baseFramesWatson.length; i++) {
            let Dw = this.baseFramesWatson[i];
            let Dc = this.baseFramesCrick[i];
            this.bpFrames.push(utils.midframe(Dw, Dc));
        }
    }

    //assumes the bp frames exist
    calculateBpsFrames() {
        if (this.bpsFrames !== undefined) {
            delete this.bpsFrames;
        }

        this.bpsFrames = [];
        for (var i = 0; i < this.bpFrames.length-1; i++) {
            let bf1 = this.bpFrames[i];
            let bf2 = this.bpFrames[i+1];
            this.bpsFrames.push(utils.midframe(bf1, bf2));
        }
    }

    /*
    calculatePhosphates() {
        if (this.phosphateFramesWatson !== undefined || this.phosphateFramesCrick !== undefined) {
            delete this.phosphateFramesWatson;
            delete this.phosphateFramesCrick;
        }
        this.phosphateFramesWatson = [];
        this.phosphateFramesCrick = [];

        for (var i = 0; i < this.baseFramesWatson.length-1; i++) {
            var bfWl = this.baseFramesWatson[i];
            var bfWr = this.baseFramesWatson[i+1];
            var Rl = makeMatrix3_col(bfWl.or);
            var Rr = makeMatrix3_col(bfWr.or);
            var RelRot = calculateRelRotMat(Rl,Rr);
            var half = calculateHalfRotMat(RelRot);

            //shift the phosphate frame to the outside:
            var groove;
            if (this.sequence[i] === 'A' || this.sequence[i] === 'G' || this.sequence[i] === 'K' || this.sequence[i] === 'N')
                groove = [-3.0, 4.0, 0.0] //shift outward
            else if (this.sequence[i] === 'T' || this.sequence[i] === 'U' || this.sequence[i] === 'C' || this.sequence[i] === 'H' || this.sequence[i] === 'M')
                groove = [-4.0, 4.0, 0.0] //shift outward

            //var groove = [0.0, 0.0, 0.0] //no shift
            var diff = numeric.dotMV(numeric.transpose(numeric.dot(Rr, half)), groove);
            var G = new flattenMat3_col(numeric.dot(Rr, half));
            var pos = ScVec3Mult(0.5,numeric.add(bfWl.pos, bfWr.pos));
            pos = numeric.add(pos, diff);

            var frame = new coordinateFrame(G, pos);
            this.phosphateFramesWatson.push(frame);
        }
        for (var i = 0; i < this.baseFramesCrick.length-1; i++) {
            var bfCl = this.baseFramesCrick[i];
            var bfCr = this.baseFramesCrick[i+1];
            var Rl = makeMatrix3_col(bfCl.or);
            var Rr = makeMatrix3_col(bfCr.or);
            var RelRot = calculateRelRotMat(Rl,Rr);
            var half = calculateHalfRotMat(RelRot);

            //shift the phosphate frame to the outside and
            //Give the DNA a major/minor groove:
            var groove = [ -3.0, -4.0, 0.0] //shift outward
            //var groove = [ 0.0, 0.0, 0.0] //no shift
            var diff = numeric.dotMV(numeric.transpose(numeric.dot(Rr, half)), groove);
            var G = new flattenMat3_col(numeric.dot(Rr, half));
            var pos = ScVec3Mult(0.5,numeric.add(bfCl.pos, bfCr.pos));
            pos = numeric.add(pos, diff);

            var frame = new coordinateFrame(G, pos);
            this.phosphateFramesCrick.push(frame);
        }
    }
    */
}
