import Chart from "./d3chart.js";
import * as d3 from "d3-array";

let labels = {
    "buckle"   : "buckle"   ,
    "propeller": "propeller",
    "opening"  : "opening"  ,
    "shear"    : "shear"    ,
    "stretch"  : "stretch"  ,
    "stagger"  : "stagger"  ,
    "tilt" : "tilt" ,
    "roll" : "roll" ,
    "twist": "twist",
    "shift": "shift",
    "slide": "slide",
    "rise" : "rise" ,
    "phos_w_eta1": "\u03B7\u2081",
    "phos_w_eta2": "\u03B7\u2082",
    "phos_w_eta3": "\u03B7\u2083",
    "phos_w_w1": "w\u2081",
    "phos_w_w2": "w\u2082",
    "phos_w_w3": "w\u2083",
    "phos_c_eta1": "\u03B7\u2081",
    "phos_c_eta2": "\u03B7\u2082",
    "phos_c_eta3": "\u03B7\u2083",
    "phos_c_w1": "w\u2081",
    "phos_c_w2": "w\u2082",
    "phos_c_w3": "w\u2083",
};

export default class dnaCharts{
    constructor() {
        //console.log("constructing charts");
        //intras
        this.intras = new Map([
            ["buckle"    , undefined],
            ["propeller" , undefined],
            ["opening"   , undefined],
            ["shear"     , undefined],
            ["stretch"   , undefined],
            ["stagger"   , undefined],
        ]);

        this.inters = new Map([
            ["tilt"  , undefined],
            ["roll"  , undefined],
            ["twist" , undefined],
            ["shift" , undefined],
            ["slide" , undefined],
            ["rise"  , undefined],
        ]);

        //phosphate_watson
        this.phos_w = new Map([
            ["phos_w_eta1" , undefined],
            ["phos_w_eta2" , undefined],
            ["phos_w_eta3" , undefined],
            ["phos_w_w1" , undefined],
            ["phos_w_w2" , undefined],
            ["phos_w_w3" , undefined],
        ]);

        //phosphate_crick
        this.phos_c = new Map([
            ["phos_c_eta1" , undefined],
            ["phos_c_eta2" , undefined],
            ["phos_c_eta3" , undefined],
            ["phos_c_w1" , undefined],
            ["phos_c_w2" , undefined],
            ["phos_c_w3" , undefined],
        ]);

        //sequences
        this.sequences = [undefined, undefined, undefined, undefined, undefined];
        this.types = [undefined, undefined, undefined, undefined, undefined]; //cgDNA or cgDNA+

        //options
        this.coords = 'curves'; //or 'cgDNA'
    }

    init() {
        let width = 500;
        let height = 300;

        //================================================================================
        // Intras
        //================================================================================

        let intra_names = [...this.intras.keys()];
        for (let i = 0; i < intra_names.length; i++) {
        //for (let [index, coord] of this.intras.entries()) {
            let name = intra_names[i]
            //console.log(name)
            if (i < 3) {
                this.intras.set(name, new Chart(width, height, 'deg', 'monomer'));
                this.intras.get(name).init(`#${name}`);
                this.intras.get(name).setYLabel(`${labels[name]} (degrees)`);
            } else {
                this.intras.set(name, new Chart(width, height, '\u212B', 'monomer'));
                this.intras.get(name).init(`#${name}`);
                this.intras.get(name).setYLabel(`${labels[name]} (\u212B)`);
            }
        }

        //================================================================================
        // Inters
        //================================================================================

        let inter_names = [...this.inters.keys()];
        for (let i = 0; i < inter_names.length; i++) {
        //for (let [index, coord] of this.inters.entries()) {
            let name = inter_names[i];
            if (i < 3) {
                this.inters.set(name, new Chart(width, height, 'deg', 'dimer'));
                this.inters.get(name).init(`#${name}`)
                this.inters.get(name).setYLabel(`${labels[name]} (degrees)`);
                this.inters.get(name).setXLabel('basepair step');
                this.inters.get(name).setType('dimer');
            } else {
                this.inters.set(name,  new Chart(width, height, '\u212B', 'dimer'));
                this.inters.get(name).init(`#${name}`)
                this.inters.get(name).setYLabel(`${labels[name]} (\u212B)`);
                this.inters.get(name).setXLabel('basepair step');
                this.inters.get(name).setType('dimer');
            }
        }

        //================================================================================
        // Phosphates
        //================================================================================

        let phos_w_names = [...this.phos_w.keys()];
        for (let i = 0; i < phos_w_names.length; i++) {
        //for (let [index, coord] of this.phos_w.entries()) {
            let name = phos_w_names[i];
            if (i < 3) {
                this.phos_w.set(name, new Chart(width, height, 'deg', 'dimer'));
                this.phos_w.get(name).init(`#${name}`);
                this.phos_w.get(name).setYLabel(`${labels[name]} (degrees)`);
            } else {
                this.phos_w.set(name, new Chart(width, height, '\u212B', 'dimer'));
                this.phos_w.get(name).init(`#${name}`);
                this.phos_w.get(name).setYLabel(`${labels[name]} (\u212B)`);
            }
        }
        let phos_c_names = [...this.phos_c.keys()];
        for (let i = 0; i < phos_c_names.length; i++) {
        //for (let [index, coord] of this.phos_c.entries()) {
            let name = phos_c_names[i];
            let coord = this.phos_c.get(name);
            if (i < 3) {
                this.phos_c.set(name, new Chart(width, height, 'deg', 'dimer'));
                this.phos_c.get(name).init(`#${name}`);
                this.phos_c.get(name).setYLabel(`${labels[name]} (degrees)`);
            } else {
                this.phos_c.set(name, new Chart(width, height, '\u212B', 'dimer'));
                this.phos_c.get(name).init(`#${name}`);
                this.phos_c.get(name).setYLabel(`${labels[name]} (\u212B)`);
            }
        }
    }

    addData(DNA_id, seq, data, type) {
        //console.log(`ADDING ${DNA_id}`);
        //console.log(this.sequences);
        //console.log(this.sequences[DNA_id-1]);
        if (this.sequences[DNA_id-1])
            this.removeData(DNA_id);

        //add the sequence
        this.sequences[DNA_id-1] = seq;
        this.types[DNA_id-1] = type;

        //split all data:
	    let buckle_curves = [];
	    let propeller_curves = [];
	    let opening_curves = [];

	    let tilt_curves = [];
	    let roll_curves = [];
	    let twist_curves = [];

	    let phos_w_eta1_curves = [];
	    let phos_w_eta2_curves = [];
	    let phos_w_eta3_curves = [];

	    let phos_c_eta1_curves = [];
	    let phos_c_eta2_curves = [];
	    let phos_c_eta3_curves = [];

        let intras, inters, phos_w, phos_c = undefined;
        if (type === "cgDNA") {
            //console.log(this.splitcgDNAdata(data))
            ;([intras, inters] = this.splitcgDNAdata(data, seq));
            //console.log(intras)
            phos_w = undefined;
            phos_c = undefined;
        } else if (type === "cgDNA+" || type === "cgRNA+" || type === "cgHYB+") {
            ;([intras, inters, phos_w, phos_c] = this.splitcgDNAplusdata(data, seq));
        }

	    //Calculate curves+ rotational coordinates:
	    const length_intras = intras.get("buckle").length;
	    for (let i = 0; i < length_intras; i++) {
	        buckle_curves.push(0.1*intras.get("buckle")[i]);
	        propeller_curves.push(0.1*intras.get("propeller")[i]);
	        opening_curves.push(0.1*intras.get("opening")[i]);
	    }
	    let ncay_intras = [];
	    for (let i = 0; i < length_intras; i++) {
	        const sum = Math.pow(buckle_curves[i],2)
                        + Math.pow(propeller_curves[i],2)
                        + Math.pow(opening_curves[i],2);
                ncay_intras.push(Math.sqrt(sum));
	    }
	    let angle_intras = [];
	    for (let i = 0; i < length_intras; i++) {
                angle_intras.push(2.0*Math.atan(ncay_intras[i])*180.0/Math.PI);
	    }
	    for (let i = 0; i < length_intras; i++) {
	        buckle_curves[i]    *= angle_intras[i]/ncay_intras[i];
	        propeller_curves[i] *= angle_intras[i]/ncay_intras[i];
	        opening_curves[i]   *= angle_intras[i]/ncay_intras[i];
	    }
	    const length_inters = inters.get("tilt").length;
	    for (let i = 0; i < length_inters; i++) {
	        tilt_curves.push(0.1*inters.get("tilt")[i]);
	        roll_curves.push(0.1*inters.get("roll")[i]);
	        twist_curves.push(0.1*inters.get("twist")[i]);
	    }
	    let ncay_inters = [];
	    for (let i = 0; i < length_inters; i++) {
	        const sum = Math.pow(tilt_curves[i],2)
                        + Math.pow(roll_curves[i],2)
                        + Math.pow(twist_curves[i],2);
                ncay_inters.push(Math.sqrt(sum));
	    }
	    let angle_inters = [];
	    for (let i = 0; i < length_inters; i++) {
                angle_inters.push(2.0*Math.atan(ncay_inters[i])*180.0/Math.PI);
	    }
	    for (let i = 0; i < length_inters; i++) {
	        tilt_curves[i] *= angle_inters[i]/ncay_inters[i];
	        roll_curves[i] *= angle_inters[i]/ncay_inters[i];
	        twist_curves[i]*= angle_inters[i]/ncay_inters[i];
	    }

	    //Calculate curves+ rotational coordinates for the phosphates:
        if (type === "cgDNA+" || type === "cgRNA+" || type === "cgHYB+") {
	        const length_phos_w = phos_w.get("phos_w_eta1").length;
	        for (let i = 0; i < length_phos_w; i++) {
	            phos_w_eta1_curves.push(0.1*phos_w.get("phos_w_eta1")[i]);
	            phos_w_eta2_curves.push(0.1*phos_w.get("phos_w_eta2")[i]);
	            phos_w_eta3_curves.push(0.1*phos_w.get("phos_w_eta3")[i]);
	        }
	        let ncay_phos_w = [];
	        for (let i = 0; i < length_phos_w; i++) {
	            const sum = Math.pow(phos_w_eta1_curves[i],2)
                            + Math.pow(phos_w_eta2_curves[i],2)
                            + Math.pow(phos_w_eta3_curves[i],2);
                    ncay_phos_w.push(Math.sqrt(sum));
	        }
	        let angle_phos_w = [];
	        for (let i = 0; i < length_phos_w; i++) {
                    angle_phos_w.push(2.0*Math.atan(ncay_phos_w[i])*180.0/Math.PI);
	        }
	        for (let i = 0; i < length_phos_w; i++) {
	            phos_w_eta1_curves[i] *= angle_phos_w[i]/ncay_phos_w[i];
	            phos_w_eta2_curves[i] *= angle_phos_w[i]/ncay_phos_w[i];
	            phos_w_eta3_curves[i] *= angle_phos_w[i]/ncay_phos_w[i];
	        }

	        const length_phos_c = phos_c.get("phos_c_eta1").length;
	        for (let i = 0; i < length_phos_c; i++) {
	            phos_c_eta1_curves.push(0.1*phos_c.get("phos_c_eta1")[i]);
	            phos_c_eta2_curves.push(0.1*phos_c.get("phos_c_eta2")[i]);
	            phos_c_eta3_curves.push(0.1*phos_c.get("phos_c_eta3")[i]);
	        }
	        let ncay_phos_c = [];
	        for (let i = 0; i < length_phos_c; i++) {
	            const sum = Math.pow(phos_c_eta1_curves[i],2)
                            + Math.pow(phos_c_eta2_curves[i],2)
                            + Math.pow(phos_c_eta3_curves[i],2);
                    ncay_phos_c.push(Math.sqrt(sum));
	        }
	        let angle_phos_c = [];
	        for (let i = 0; i < length_phos_c; i++) {
                    angle_phos_c.push(2.0*Math.atan(ncay_phos_c[i])*180.0/Math.PI);
	        }
	        for (let i = 0; i < length_phos_c; i++) {
	            phos_c_eta1_curves[i] *= angle_phos_c[i]/ncay_phos_c[i];
	            phos_c_eta2_curves[i] *= angle_phos_c[i]/ncay_phos_c[i];
	            phos_c_eta3_curves[i] *= angle_phos_c[i]/ncay_phos_c[i];
	        }

        }


        this.intras.get("buckle").addData(   DNA_id, seq, intras.get("buckle"),    buckle_curves,     this.coords);
        this.intras.get("propeller").addData(DNA_id, seq, intras.get("propeller"), propeller_curves,  this.coords);
        this.intras.get("opening").addData(  DNA_id, seq, intras.get("opening"),   opening_curves,    this.coords);
        this.intras.get("shear").addData(    DNA_id, seq, intras.get("shear"),     intras.get("shear"),   this.coords);
        this.intras.get("stretch").addData(  DNA_id, seq, intras.get("stretch"),   intras.get("stretch"), this.coords);
        this.intras.get("stagger").addData(  DNA_id, seq, intras.get("stagger"),   intras.get("stagger"), this.coords);

        this.inters.get("tilt").addData( DNA_id, seq, inters.get("tilt"),  tilt_curves,     this.coords);
        this.inters.get("roll").addData( DNA_id, seq, inters.get("roll"),  roll_curves,     this.coords);
        this.inters.get("twist").addData(DNA_id, seq, inters.get("twist"), twist_curves,    this.coords);
        this.inters.get("shift").addData(DNA_id, seq, inters.get("shift"), inters.get("shift"), this.coords);
        this.inters.get("slide").addData(DNA_id, seq, inters.get("slide"), inters.get("slide"), this.coords);
        this.inters.get("rise").addData( DNA_id, seq, inters.get("rise"),  inters.get("rise"),  this.coords);

        if (type === "cgDNA+" || type === "cgHYB+" || type === "cgRNA+") {
            this.phos_w.get("phos_w_eta1").addData(DNA_id, seq, phos_w.get("phos_w_eta1"), phos_w_eta1_curves,  this.coords);
            this.phos_w.get("phos_w_eta2").addData(DNA_id, seq, phos_w.get("phos_w_eta2"), phos_w_eta2_curves,  this.coords);
            this.phos_w.get("phos_w_eta3").addData(DNA_id, seq, phos_w.get("phos_w_eta3"), phos_w_eta3_curves,  this.coords);
            this.phos_w.get("phos_w_w1").addData(  DNA_id, seq, phos_w.get("phos_w_w1"),   phos_w.get("phos_w_w1"), this.coords);
            this.phos_w.get("phos_w_w2").addData(  DNA_id, seq, phos_w.get("phos_w_w2"),   phos_w.get("phos_w_w2"), this.coords);
            this.phos_w.get("phos_w_w3").addData(  DNA_id, seq, phos_w.get("phos_w_w3"),   phos_w.get("phos_w_w3"), this.coords);

            this.phos_c.get("phos_c_eta1").addData(DNA_id, seq, phos_c.get("phos_c_eta1"), phos_c_eta1_curves,  this.coords);
            this.phos_c.get("phos_c_eta2").addData(DNA_id, seq, phos_c.get("phos_c_eta2"), phos_c_eta2_curves,  this.coords);
            this.phos_c.get("phos_c_eta3").addData(DNA_id, seq, phos_c.get("phos_c_eta3"), phos_c_eta3_curves,  this.coords);
            this.phos_c.get("phos_c_w1").addData(  DNA_id, seq, phos_c.get("phos_c_w1"),   phos_c.get("phos_c_w1"), this.coords);
            this.phos_c.get("phos_c_w2").addData(  DNA_id, seq, phos_c.get("phos_c_w2"),   phos_c.get("phos_c_w2"), this.coords);
            this.phos_c.get("phos_c_w3").addData(  DNA_id, seq, phos_c.get("phos_c_w3"),   phos_c.get("phos_c_w3"), this.coords);
        }
    }

    splitcgDNAdata(data, seq) {
        //console.log("in splitcgDNAdata")
        let intras = new Map([
            ["buckle"   , []],
            ["propeller", []],
            ["opening"  , []],
            ["shear"    , []],
            ["stretch"  , []],
            ["stagger"  , []],
        ]);

        let inters = new Map([
            ["tilt" , []],
            ["roll" , []],
            ["twist", []],
            ["shift", []],
            ["slide", []],
            ["rise" , []],
        ]);

        let intra_names = [...intras.keys()];
        let inter_names = [...inters.keys()];

        let coord_names = [];
        //for (let i = 0; i < data.length-12; i+=12) {
        for (let i = 0; i < seq.length-1; i++) {
            coord_names.push(intra_names);
            coord_names.push(inter_names);
        }
        coord_names.push(intra_names);
        coord_names = d3.merge(coord_names)

        for (let [name, arr] of intras) {
            intras.set(name, coord_names.reduce(function(a, e, i) {
                if (e === name)
                    a.push(data[i]);
                return a;
            }, []));
        }
        for (let [name, arr] of inters) {
            inters.set(name, coord_names.reduce(function(a, e, i) {
                if (e === name)
                    a.push(data[i]);
                return a;
            }, []));
        }

        return [intras, inters];
    }

    splitcgDNAplusdata(data, seq) {
        let intras = new Map([
            ["buckle"    , []],
            ["propeller" , []],
            ["opening"   , []],
            ["shear"     , []],
            ["stretch"   , []],
            ["stagger"   , []],
        ]);

        let inters = new Map([
            ["tilt"  , []],
            ["roll"  , []],
            ["twist" , []],
            ["shift" , []],
            ["slide" , []],
            ["rise"  , []],
        ]);

        //phosphate_watson
        let phos_w = new Map([
            ["phos_w_eta1" , []],
            ["phos_w_eta2" , []],
            ["phos_w_eta3" , []],
            ["phos_w_w1" , []],
            ["phos_w_w2" , []],
            ["phos_w_w3" , []],
        ]);

        //phosphate_crick
        let phos_c = new Map([
            ["phos_c_eta1" , []],
            ["phos_c_eta2" , []],
            ["phos_c_eta3" , []],
            ["phos_c_w1" , []],
            ["phos_c_w2" , []],
            ["phos_c_w3" , []],
        ]);

        let intra_names = [...intras.keys()];
        let inter_names = [...inters.keys()];
        let phos_w_names = [...phos_w.keys()];
        let phos_c_names = [...phos_c.keys()];

        let coord_names = [];
        coord_names.push(intra_names);
        coord_names.push(phos_c_names);
        coord_names.push(inter_names);
        //for (let i = 0; i < data.length-18; i+=24) {
        for (let i = 1; i < seq.length-1; i++) {
            coord_names.push(phos_w_names);
            coord_names.push(intra_names);
            coord_names.push(phos_c_names);
            coord_names.push(inter_names);
        }
        coord_names.push(phos_w_names);
        coord_names.push(intra_names);

        coord_names = d3.merge(coord_names)

        for (let [name, arr] of intras) {
            intras.set(name, coord_names.reduce(function(a, e, i) {
                if (e === name)
                    a.push(data[i]);
                return a;
            }, []));
        }
        for (let [name, arr] of inters) {
            inters.set(name, coord_names.reduce(function(a, e, i) {
                if (e === name)
                    a.push(data[i]);
                return a;
            }, []));
        }
        for (let [name, arr] of phos_w) {
            phos_w.set(name, coord_names.reduce(function(a, e, i) {
                if (e === name)
                    a.push(data[i]);
                return a;
            }, []));
            //phos_w.get(name).unshift(undefined); //add null value to front
        }
        for (let [name, arr] of phos_c) {
            phos_c.set(name, coord_names.reduce(function(a, e, i) {
                if (e === name)
                    a.push(data[i]);
                return a;
            }, []));
            //phos_c.get(name).push(undefined); //add null value to back
        }

        return [intras, inters, phos_w, phos_c];
    }

    removeData(DNA_id) {
        //console.log(`removing DNA_${DNA_id}`)
        for (let [index, coord] of this.intras) {
            coord.removeData(DNA_id);
        }
        for (let [index, coord] of this.inters) {
            coord.removeData(DNA_id);
        }

        if (this.types[DNA_id-1] === "cgDNA+" || this.types[DNA_id-1] === "cgRNA+" || this.types[DNA_id-1] === "cgHYB+") {
            for (let [index, coord] of this.phos_w) {
                coord.removeData(DNA_id);
            }
            for (let [index, coord] of this.phos_c) {
                coord.removeData(DNA_id);
            }
        }

        this.sequences[DNA_id-1] = undefined;
        this.types[DNA_id-1] = undefined;
    }

    changeCoords(type) {
        //console.log("in changeCoords");
        //console.log("type:",type);
        //console.log("this.coords:",this.coords);
        if (type === 'cgDNA' && this.coords === 'curves') {
            this.coords = type;

            let intra_names = [...this.intras.keys()];
            for (let i = 0; i < intra_names.length; i++) {
                let name = intra_names[i];
                let coord = this.intras.get(name);
                if (i < 3) {
                    coord.setYLabel(`${labels[name]} (rad/5)`);
                    coord.changeCoordType(type);
                } else {
                    coord.setYLabel(`${labels[name]} (\u212B)`);
                    coord.changeCoordType(type);
                }
            }
            let inter_names = [...this.inters.keys()];
            for (let i = 0; i < inter_names.length; i++) {
                let name = inter_names[i];
                let coord = this.inters.get(name);
                if (i < 3) {
                    coord.setYLabel(`${labels[name]} (rad/5)`);
                    coord.changeCoordType(type);
                } else {
                    coord.setYLabel(`${labels[name]} (\u212B)`);
                    coord.changeCoordType(type);
                }
            }
            let phos_w_names = [...this.phos_w.keys()];
            for (let i = 0; i < phos_w_names.length; i++) {
                let name = phos_w_names[i];
                let coord = this.phos_w.get(name);
                if (i < 3) {
                    coord.setYLabel(`${labels[name]} (rad/5)`);
                    coord.changeCoordType(type);
                } else {
                    coord.setYLabel(`${labels[name]} (\u212B)`);
                    coord.changeCoordType(type);
                }
            }
            let phos_c_names = [...this.phos_c.keys()];
            for (let i = 0; i < phos_c_names.length; i++) {
                let name = phos_c_names[i];
                let coord = this.phos_c.get(name);
                if (i < 3) {
                    coord.setYLabel(`${labels[name]} (rad/5)`);
                    coord.changeCoordType(type);
                } else {
                    coord.setYLabel(`${labels[name]} (\u212B)`);
                    coord.changeCoordType(type);
                }
            }
        } else if (type === 'curves' && this.coords === 'cgDNA') {
            this.coords = type;

            let intra_names = [...this.intras.keys()];
            for (let i = 0; i < intra_names.length; i++) {
                let name = intra_names[i]
                let coord = this.intras.get(name);
                if (i < 3) {
                    coord.setYLabel(`${labels[name]} (degrees)`);
                    coord.changeCoordType(type);
                } else {
                    coord.setYLabel(`${labels[name]} (\u212B)`);
                    coord.changeCoordType(type);
                }
            }
            let inter_names = [...this.inters.keys()];
            for (let i = 0; i < inter_names.length; i++) {
                let name = inter_names[i]
                let coord = this.inters.get(name);
                if (i < 3) {
                    coord.setYLabel(`${labels[name]} (degrees)`);
                    coord.changeCoordType(type);
                } else {
                    coord.setYLabel(`${labels[name]} (\u212B)`);
                    coord.changeCoordType(type);
                }
            }
            let phos_w_names = [...this.phos_w.keys()];
            for (let i = 0; i < phos_w_names.length; i++) {
                let name = phos_w_names[i];
                let coord = this.phos_w.get(name);
                if (i < 3) {
                    coord.setYLabel(`${labels[name]} (degrees)`);
                    coord.changeCoordType(type);
                } else {
                    coord.setYLabel(`${labels[name]} (\u212B)`);
                    coord.changeCoordType(type);
                }
            }
            let phos_c_names = [...this.phos_c.keys()];
            for (let i = 0; i < phos_c_names.length; i++) {
                let name = phos_c_names[i];
                let coord = this.phos_c.get(name);
                if (i < 3) {
                    coord.setYLabel(`${labels[name]} (degrees)`);
                    coord.changeCoordType(type);
                } else {
                    coord.setYLabel(`${labels[name]} (\u212B)`);
                    coord.changeCoordType(type);
                }
            }
        }
    }
}
