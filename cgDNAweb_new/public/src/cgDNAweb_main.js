import * as THREE from "three";//"/build/three.module.js";
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

import dnaModel from "./dnaModel.js";
import dnaView from "./dnaView.js";
import dnaController from "./dnaController.js";
import dnaCharts from "./dnaCharts.js";

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
                    "T": {},
                    "U": {},
                    "M": {},
                    "N": {},
                    "H": {},
                    "K": {},
};

export let phosphate = {};
export let phosphateAtoms = {};



function cgDNAweb () {
    this.model = undefined;
    this.view = undefined;
    this.controller = undefined;
    this.charts = undefined;

    const that = this;

    //wait until some button has been pressed to load all of the JS
    document.addEventListener('DOMContentLoaded', function () {
        //alert("LOADED");

        for (let id = 1; id < 5; id++) {
            document.getElementById("loading".concat(id.toString())).style.display = "none";
        }

        let handle = function(event) {
            console.log('initialising cgDNAweb');
            //if it has been pressed, the listener isn't needed anymore

            document.getElementById('3dview_content')
                .insertAdjacentHTML('afterbegin', '<canvas id="viewer"></canvas>');
            let canvas_container = document.getElementById("3dview_content");

            let canvas = document.getElementById('viewer');
            //canvas.width = canvas_container.clientWidth;
            //canvas.height = canvas_container.clientHeight;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            event.currentTarget.removeEventListener(event.type, handle);
            //that.init();
            document.getElementById('start_instructions').style.display = "none";
            that.init().then(() => {
                that.controller.onSubmit(event, 1);
            });

            //that.controller.onSubmit(event, 1);
        };

        document.getElementById("submit_seq1").addEventListener('click', handle, false);

        document.getElementById("seq_input1").addEventListener('keyup', function (event) {
            if (event.keyCode === 13) {
                document.getElementById("submit_seq1").dispatchEvent(new Event('click'));
                event.currentTarget.removeEventListener(event.type, handle);
            }
        }, false);

        let seq_input1 = document.getElementById("seq_input1");
        let seq_input2 = document.getElementById("seq_input2");
        let seq_input3 = document.getElementById("seq_input3");
        let seq_input4 = document.getElementById("seq_input4");
        let remove_seq_button1 = document.getElementById("remove_seq_button1");
        let remove_seq_button2 = document.getElementById("remove_seq_button2");
        let remove_seq_button3 = document.getElementById("remove_seq_button3");
        let remove_seq_button4 = document.getElementById("remove_seq_button4");

        remove_seq_button1.addEventListener('click', function (event) {
            //remove from model:
            if (that.model)
                that.model.removeConfiguration(1);
            //remove from view:
            if (that.view) {
                that.view.removeRenderObject(1);
                that.view.animateWithoutSelecting();
            }
            //remove from plots:
            if (that.charts)
                that.charts.removeData(1);
            seq_input1.value = "";
            remove_seq_button1.style.opacity = 0;
        }, false);

        remove_seq_button2.addEventListener('click', function (event) {
            //remove from model:
            if (that.model)
            that.model.removeConfiguration(2);
            //remove from view:
            if (that.view) {
                that.view.removeRenderObject(2);
                that.view.animateWithoutSelecting();
            }
            //remove from plots:
            if (that.charts)
                that.charts.removeData(2);
            seq_input2.value = "";
            remove_seq_button2.style.opacity = 0;
        }, false);

        remove_seq_button3.addEventListener('click', function (event) {
            //remove from model:
            if (that.model)
            that.model.removeConfiguration(3);
            //remove from view:
            if (that.view) {
                that.view.removeRenderObject(3);
                that.view.animateWithoutSelecting();
            }
            //remove from plots:
            if (that.charts)
                that.charts.removeData(3);
            seq_input3.value = "";
            remove_seq_button3.style.opacity = 0;
        }, false);

        remove_seq_button4.addEventListener('click', function (event) {
            //remove from model:
            if (that.model)
            that.model.removeConfiguration(4);
            //remove from view:
            if (that.view) {
                that.view.removeRenderObject(4);
                that.view.animateWithoutSelecting();
            }
            //remove from plots:
            if (that.charts)
                that.charts.removeData(4);
            seq_input4.value = "";
            remove_seq_button4.style.opacity = 0;
        }, false);
        seq_input1.addEventListener('input', function (event) {
            event.preventDefault();
            let search_wrapper = document.querySelector("#slide1 > .search_wrapper");
            if (search_wrapper.style.borderTopColor !== "rgb(112,178,233)") {
                search_wrapper.style.borderWidth = "3px";
                search_wrapper.style.borderTopColor = "rgb(112,178,233)";
                search_wrapper.style.borderRightColor = "rgb(112,178,233)";
                search_wrapper.style.borderBottomColor = "rgb(112,178,233)";
                search_wrapper.style.borderLeftColor = "rgb(112,178,233)";
            }

            if (seq_input1.value !== "") {
                remove_seq_button1.style.opacity = 1;
            } else {
                remove_seq_button1.style.opacity = 0;
            }
        }, false);
        seq_input2.addEventListener('input', function (event) {
            event.preventDefault();
            let search_wrapper = document.querySelector("#slide2 > .search_wrapper");
            if (search_wrapper.style.borderTopColor !== "rgb(112,178,233)") {
                search_wrapper.style.borderWidth = "3px";
                search_wrapper.style.borderTopColor = "rgb(112,178,233)";
                search_wrapper.style.borderRightColor = "rgb(112,178,233)";
                search_wrapper.style.borderBottomColor = "rgb(112,178,233)";
                search_wrapper.style.borderLeftColor = "rgb(112,178,233)";
            }

            if (seq_input2.value !== "") {
                remove_seq_button2.style.opacity = 1;
            } else {
                remove_seq_button2.style.opacity = 0;
            }
        }, false);
        seq_input3.addEventListener('input', function (event) {
            event.preventDefault();
            let search_wrapper = document.querySelector("#slide3 > .search_wrapper");
            if (search_wrapper.style.borderTopColor !== "rgb(112,178,233)") {
                search_wrapper.style.borderWidth = "3px";
                search_wrapper.style.borderTopColor = "rgb(112,178,233)";
                search_wrapper.style.borderRightColor = "rgb(112,178,233)";
                search_wrapper.style.borderBottomColor = "rgb(112,178,233)";
                search_wrapper.style.borderLeftColor = "rgb(112,178,233)";
            }

            if (seq_input3.value !== "") {
                remove_seq_button3.style.opacity = 1;
            } else {
                remove_seq_button3.style.opacity = 0;
            }
        }, false);
        seq_input4.addEventListener('input', function (event) {
            let search_wrapper = document.querySelector("#slide4 > .search_wrapper");
            if (search_wrapper.style.borderTopColor !== "rgb(112,178,233)") {
                search_wrapper.style.borderWidth = "3px";
                search_wrapper.style.borderTopColor = "rgb(112,178,233)";
                search_wrapper.style.borderRightColor = "rgb(112,178,233)";
                search_wrapper.style.borderBottomColor = "rgb(112,178,233)";
                search_wrapper.style.borderLeftColor = "rgb(112,178,233)";
            }

            event.preventDefault();
            if (seq_input4.value !== "") {
                remove_seq_button4.style.opacity = 1;
            } else {
                remove_seq_button4.style.opacity = 0;
            }
        }, false);

    });
    //};
}

cgDNAweb.prototype = {
    init : async function () {
        const that = this;
        this.model = new dnaModel();
        this.view = new dnaView(this.model, "viewer");

        //add settings button:
        document.getElementById('3dview_content').insertAdjacentHTML('afterbegin', '<button id="view_settings_button" class="settings_button"></button>');

        this.charts = new dnaCharts();
        this.controller = new dnaController(this.model, this.view, this.charts);

        //this.loadMeshes();

        //console.log("yello");

        //let tick = Date.now();
        await (async function() {
            for (let nuc of ["A", "C", "G", "T", "U", "M", "N", "H", "K"]) {
                let agW = that.loadAtomMeshes(nuc, "W");
                let agC = that.loadAtomMeshes(nuc, "C");
                let bW =  that.loadBaseMeshes(nuc, "W");
                let bC =  that.loadBaseMeshes(nuc, "C");
                let bp =  that.loadBasepairMeshes(nuc);

                ([
                    /*geometries.*/atomGroups[nuc]["W"],
                    /*geometries.*/atomGroups[nuc]["C"],
                    /*geometries.*/bases[nuc]["W"],
                    /*geometries.*/bases[nuc]["C"],
                    /*geometries.*/basepairs[nuc]
                ] = await Promise.all([agW, agC, bW, bC, bp]));

                //geometries.atomGroups[nuc]["W"] = await this.loadAtomMeshes(nuc, "W");
                //geometries.atomGroups[nuc]["C"] = await this.loadAtomMeshes(nuc, "C");
                //geometries.bases[nuc]["W"] = await this.loadBaseMeshes(nuc, "W");
                //geometries.bases[nuc]["C"] = await this.loadBaseMeshes(nuc, "C");
                //geometries.basepairs[nuc] = await this.loadBasepairMeshes(nuc);
            }
        })();
        //console.log("ATOM GROUPS")
        //console.log(geometries.atomGroups["T"]["W"])
        //geometries.phosphateAtoms = await this.loadPhosphateAtoms();
        //geometries.phosphate = await this.loadPhosphates();
        ([/*geometries.*/phosphateAtoms, /*geometries.*/phosphate] = await Promise.all([this.loadPhosphateAtoms(), this.loadPhosphates()]));
        //console.log(`Time elapsed: ${Date.now()-tick}`);

        this.view.init();
        this.controller.init();
        this.controller.initControls();
        this.charts.init();
    },

    loadAtomMeshes : async function (nuc, strand) {
        //console.log(`loading atoms of ${nuc} ${strand}`);
        return new Promise( (resolve, reject) => {
            const loader = new THREE.ObjectLoader();
            loader.load(`geometries/${nuc}_atoms_${strand}.json`, function (object) {
                resolve(object);
            });
        });
    },

    loadBaseMeshes : async function (nuc, strand) {
        //console.log(`loading bases of ${nuc} ${strand}`);
        return new Promise( (resolve, reject) => {
            const loader = new THREE.ObjectLoader();
            loader.load(`geometries/${nuc}_base_${strand}_straightC1.json`, function (object) {
                resolve(object);
            });
        });
    },

    loadBasepairMeshes : async function (nuc) {
        //console.log(`loading basepair of ${nuc}`);
        return new Promise( (resolve, reject) => {
            const loader = new THREE.ObjectLoader();
            loader.load(`geometries/${nuc}_bp_W_straightC1.json`, function (object) {
                resolve(object);
            });
        });
    },

    loadPhosphateAtoms : async function () {
        //console.log("loading phosphate atoms");
        return new Promise( (resolve, reject) => {
            const loader = new THREE.ObjectLoader();
            loader.load("geometries/phosphate_atoms.json", function (object) {
                resolve(object);
            });
        });
    },

    loadPhosphates : async function () {
        //console.log("loading phosphate group");
        return new Promise( (resolve, reject) => {
            const loader = new THREE.ObjectLoader();
            loader.load("geometries/phosphate.json", function (object) {
                resolve(object);
            });
        });
    },
};

dnaController.prototype.onSubmit = async function (event, id) {
    //event.preventDefault();
    let seq = document.getElementById(`seq_input${id}`).value;
    let param_query = `#slide${id} .search_wrapper .params_dd_label`;
    let param = window.getComputedStyle(document.querySelector(`#slide${id} .search_wrapper .params_dd_label`), ':before').content;

    //console.log(param);
    console.log(seq);

    const that = this;
    //document.getElementById("loading".concat(id.toString())).style.display = "block";
    document.getElementById(`loading${id}`).style.display = "block";
    $.ajax({
       'async': true,
       'type': "POST",
       'global': false,
       'dataType': 'JSON',
       'url': "/data2",
       'data': { 'seq_input': seq,
                 'param_input': param},
       'success': function (data) {
            if (data.error === 'none') {
                that.model.loadConfigurationFromJSON(data, id);
                that.view.addDNA(that.model.dna_molecules[id], id);
                that.charts.addData(id, data.sequence, data.shapes, data.type);
                that.view.renderer.render(that.view.scene, that.view.camera);

            } else {
                //let search_wrapper = document.querySelector("#slide".concat(id.toString())+" > .search_wrapper");
                let search_wrapper = document.querySelector(`#slide${id} > .search_wrapper`);
                search_wrapper.style.borderWidth = "4px";
                search_wrapper.style.borderTopColor = "rgb(255,0,0)";
                search_wrapper.style.borderRightColor = "rgb(255,0,0)";
                search_wrapper.style.borderBottomColor = "rgb(255,0,0)";
                search_wrapper.style.borderLeftColor = "rgb(255,0,0)";
                console.log(`error: ${data.error}`);
            }
            //document.getElementById("loading".concat(id.toString())).style.display = "none";
            document.getElementById(`loading${id}`).style.display = "none";
       },
       'error': function (response) {
            console.log(`error: ${response}`);
            console.log(response);
            //document.getElementById("loading".concat(id.toString())).style.display = "none";
            document.getElementById(`loading${id}`).style.display = "none";
       }
    });

    return false;
};
let program = new cgDNAweb();

//document.addEventListener('DOMContentLoaded', function () {
    /*
document.getElementById("submit_seq1").addEventListener('click', function (event) {
    console.log('initialising cgDNAweb');
    program.init();

    let ctnt1 = document.getElementById("3dview_content");
    let ctnt2 = document.getElementById("plots_content");

    let canvas = document.getElementById('viewer');
    canvas.width = Math.max(ctnt1.clientWidth, ctnt2.clientWidth);
    canvas.height = Math.max(ctnt1.clientHeight, ctnt2.clientHeight);
}, false);
*/

/*
window.onload = function () {
    //program.init();

    document.getElementById("loading1").style.display = "none";
    document.getElementById("loading2").style.display = "none";
    document.getElementById("loading3").style.display = "none";
    document.getElementById("loading4").style.display = "none";
}
*/


