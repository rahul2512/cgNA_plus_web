//TODO CHECK WHETHER ALL MakeMatrix3_row/col  ARE THE RIGHT ONES!!
//AND ALSO JUST CHECK ROTATIONS, DNA LOOKS SHEARED SOMETIMES!!!!
function coordinateFrame (orientation, position) {
    if (orientation === undefined || position === undefined) {
        console.log("CoordinateFrame parameters undefined! Exiting");
        return;
    }

    this.or = orientation;
    this.pos = position;
}

function dnaModel () {
    "use strict";
    this.dna_molecules = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
}

dnaModel.prototype = {
    clear : function () {
        for (var i = 0; i < this.dna_molecules.length; i++) {
            this.dna_molecules[i].empty();
            delete this.dna_molecules[i];
            this.dna_molecules.pop();
        }
    },

    loadConfigurationFromJSON : function (config, id) {
        "use strict";
        this.dna_molecules[id] = null;

        var dna = new DNA();
        dna.sequence = config.sequence;
        dna.center = parseInt(config.center);
	    dna.shapes = config.shapes;
        for (var i = 0; i < config.sequence.length; i++) {
            var bp = config.coords[i];
            //the configurations are in column-major format, and should be in row-major, so transpose them:
            var R = makeMatrix3_col(bp.D);
            var Rc = makeMatrix3_col(bp.Dc);
            R = flattenMat3_col(R);
            Rc = flattenMat3_col(Rc);

            //then add them to the model:
            dna.baseFramesWatson.push(new coordinateFrame(R, bp.r));
            dna.baseFramesCrick.push(new coordinateFrame(Rc, bp.rc));
        }
        dna.calculateBpFrames();
        dna.calculateBpsFrames();
	    //dna.calculatePhosphates();

        this.dna_molecules[id] = dna;
    },

    removeConfiguration : function (id) {
        this.dna_molecules[id] = null;
    }

};
