function coordinateFrame (orientation, position) {
    if (orientation === undefined || position === undefined) {
        console.log("CoordinateFrame parameters undefined! Exiting");
        return;
    }

    this.or = orientation;
    this.pos = position;
}

function DNA () {
    "use strict"
    this.baseFramesWatson = [];
    this.baseFramesCrick = [];
    this.bpFrames = [];
    this.bpsFrames = [];
    //this.phosphateFramesWatson = [];
    //this.phosphateFramesCrick = [];
    this.sequence = undefined;

    this.shapes = undefined;

    this.center = undefined;
}

DNA.prototype = {
    empty : function () {
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
    },

    loadConfigurationFromJSON : function (config) {
        this.baseFramesWatson = [];
        this.baseFramesCrick = [];
        this.sequence = config.sequence;
	    this.shapes = config.shapes;
        this.center = parseInt(config.center);
        for (var i = 0; i < config.sequence.length; i++) {
            var bp = config.coords[i];
            //the configurations are in column-major format, and should be in row-major, so transpose them:
            var R = makeMatrix3_col(bp.D);
            var Rc = makeMatrix3_col(bp.Dc);
            R = flattenMat3_col(R);
            Rc = flattenMat3_col(Rc);

            //then add them to the model:
            this.baseFramesWatson.push(new coordinateFrame(R, bp.r));
            this.baseFramesCrick.push(new coordinateFrame(Rc, bp.rc));
        }
        this.calculateBpFrames();
        this.calculateBpsFrames();
	    //this.calculatePhosphates();
    },

    calculateBpFrames : function () {
        if (this.bpFrames !== undefined) {
            delete this.bpFrames;
        }
        this.bpFrames = [];
        
        for (var i = 0; i < this.baseFramesWatson.length; i++) {
            var bfW = this.baseFramesWatson[i];
            var bfC = this.baseFramesCrick[i];
            var R = makeMatrix3_col(bfW.or);
            var Rc = makeMatrix3_col(bfC.or);
            var RelRot = calculateRelRotMat(R,Rc);
            var half = calculateHalfRotMat(RelRot);

            var G = new flattenMat3_col(numeric.dot(Rc, half));
            var frame = new coordinateFrame(G, ScVec3Mult(0.5,numeric.add(bfW.pos, bfC.pos)));
            this.bpFrames.push(frame);
        }
    },
    
    //assumes the bp frames exist
    calculateBpsFrames : function () {
        if (this.bpsFrames !== undefined) {
            delete this.bpsFrames;
        }
        this.bpsFrames = [];
        for (var i = 0; i < this.bpFrames.length-1; i++) {
            var bf1 = this.bpFrames[i];
            var bf2 = this.bpFrames[i+1];
            var R1 = makeMatrix3_col(bf1.or);
            var R2 = makeMatrix3_col(bf2.or);
            var RelRot = calculateRelRotMat(R1,R2);
            var half = calculateHalfRotMat(RelRot);

            var G = new flattenMat3_col(numeric.dot(R2, half));
            var frame = new coordinateFrame(G, ScVec3Mult(0.5,numeric.add(bf1.pos, bf2.pos)));
            //console.log(frame);
            this.bpsFrames.push(frame);
        }
    }//,

    /*
    calculatePhosphates : function () {
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
            if (this.sequence[i] === 'A' || this.sequence[i] === 'G')
                groove = [-3.0, 4.0, 0.0] //shift outward
            else if (this.sequence[i] === 'T' || this.sequence[i] === 'C')
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
};

//================================================================================
//  Utilities
//================================================================================

function calculateRelRotMat(D1,D2) {
    if (D1 === undefined || D2 === undefined) {
        console.log("rel rot mat: D1 or D2 undefined");
        return;
    }
    return numeric.dot(numeric.transpose(D2),D1);
}

function calculateHalfRotMat (R) {
    var eta = calculateRotVec(R);
    var nrm = 0.2*numeric.norm2(eta);

    var factor = 2.0/(2.0 + Math.sqrt(4.0 + nrm*nrm));

    var half = numeric.dot(factor, eta);
    return calculateRotMat(half);
}

function calculateRotVec (R) {
    var tr = R[0][0] + R[1][1] + R[2][2];
    var frac = 10.0/(tr + 1.0);
    return [frac*(R[2][1]-R[1][2]),
            frac*(R[0][2]-R[2][0]),
            frac*(R[1][0]-R[0][1])];
}

function calculateRotMat(v) {
    var eta = [0.2*v[0], 0.2*v[1], 0.2*v[2]];
    var nrm = numeric.norm2(eta);
    
    var I = new numeric.identity(3);

    var factor = (4.0/(4.0 +nrm*nrm));
    var X = new makeAsymMat(eta);
    var X2 = ScMat3Mult(0.5, numeric.dot(X,X));
    return numeric.add(I, ScMat3Mult(factor, numeric.add(X,X2)));
}

function makeAsymMat (v) {
    return [[     0, -v[2],  v[1]],
            [  v[2],     0, -v[0]],
            [ -v[1],  v[0],    0]];
}

function makeMatrix3_row (a) {
    if (a === undefined) {
        console.log("makeMatrix3: array undefined");
        return;
    }
    return [[ a[0], a[1], a[2]],
            [ a[3], a[4], a[5]],
            [ a[6], a[7], a[8]]];
}

function makeMatrix3_col (a) {
    if (a === undefined) {
        console.log("makeMatrix3: array undefined");
        return;
    }
    return [[ a[0], a[3], a[6]],
            [ a[1], a[4], a[7]],
            [ a[2], a[5], a[8]]];
}

function ScMat3Mult(sc, M) {
    return [[sc*M[0][0], sc*M[0][1], sc*M[0][2]],
            [sc*M[1][0], sc*M[1][1], sc*M[1][2]],
            [sc*M[2][0], sc*M[2][1], sc*M[2][2]]];
}

function ScVec3Mult(sc, v) {
    return [sc*v[0], sc*v[1], sc*v[2]];
}

function flattenMat3_row (M) {
    return [ M[0][0], M[0][1], M[0][2], M[1][0], M[1][1], M[1][2], M[2][0], M[2][1], M[2][2]];
}

function flattenMat3_col (M) {
    return [ M[0][0], M[1][0], M[2][0], M[0][1], M[1][1], M[2][1], M[0][2], M[1][2], M[2][2]];
}
