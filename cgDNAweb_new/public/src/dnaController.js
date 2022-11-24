import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import dnaModel from "./dnaModel.js";
import dnaView from "./dnaView.js";
import dnaCharts from "./dnaCharts.js";
import {WCcomplement} from "./utils.js";
import {atomGroups, phosphateAtoms} from "./cgDNAweb_main.js"

import {vsprintf} from "sprintf-js";
import * as FileSaver from "file-saver";
import JSZip from "jszip";

import { ResizeObserver as Polyfill } from '@juggle/resize-observer';

const ResizeObserver = window.ResizeObserver || Polyfill;

export default function dnaController (_model, _view, _charts) {
    "use strict";
    this.view = _view;
    this.model = _model;
    this.charts = _charts;

    this.menu = undefined;
    this.dna_info_tooltip = undefined;

    this.resizeObserver = undefined;

    this.mouseControls = undefined;
    this.selected = [];
    this.CTRL_held = false;
    this.SHIFT_held = false;
    this.domElement = undefined;
}

dnaController.prototype = {
    init : function () {
        this.domElement = document;

        //Window resizes:
        const that = this;
        let canvas_container = document.getElementById(that.view.container_id);
        let canvas = document.getElementById(that.view.canvas_id);

        this.resizeObserver = new ResizeObserver(entries => {
          for (let entry of entries) {
            const cr = entry.contentRect;
            //console.log('view:', that.view);
            //console.log('canvas:', canvas);
            //console.log('Element:', entry.target);
            //console.log(`Element size: ${cr.width}px x ${cr.height}px`);
            //console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);
            that.view.camera.aspect = (cr.width/cr.height);
            that.view.camera.updateProjectionMatrix();
            that.view.renderer.setSize(cr.width, cr.height);
            that.view.renderer.render(that.view.scene, that.view.camera); //to make sure screen doesn't ficker black, but not sure if this has an impact on overall rendering performance (even when not resizing)
          }
        });
        this.resizeObserver.observe(canvas_container)

        //================================================================================
        // SUBMITTING SEQUENCES
        //================================================================================

        document.getElementById("submit_seq1").addEventListener('click',
            function (event) {
                that.onSubmit(event, 1);
            }, false);

        document.getElementById("seq_input1").addEventListener('keyup', function (event) {
            event.preventDefault();
            if (event.keyCode == 13) {
                that.onSubmit(event, 1);
            }
        }, false);

        document.getElementById("submit_seq2").addEventListener('click', function (event) {
            that.onSubmit(event,2);}, false);

        document.getElementById("seq_input2").addEventListener('keyup', function (event) {
            event.preventDefault();
            if (event.keyCode == 13) {
                that.onSubmit(event,2);
            }
        }, false);

        document.getElementById("submit_seq3").addEventListener('click', function (event) {
            that.onSubmit(event, 3);}, false);

        document.getElementById("seq_input3").addEventListener('keyup', function (event) {
            event.preventDefault();
            if (event.keyCode == 13) {
                that.onSubmit(event, 3);
            }
        }, false);

        document.getElementById("submit_seq4").addEventListener('click', function (event) {
            that.onSubmit(event, 4);}, false);

        document.getElementById("seq_input4").addEventListener('keyup', function (event) {
            event.preventDefault();
            if (event.keyCode == 13) {
                that.onSubmit(event, 4);
            }
        }, false);

        //================================================================================
        // REMOVING SEQUENCES (is done in cgDNAweb object)
        //================================================================================
        //...

        //================================================================================
        // KEYBOARD CONTROL
        //================================================================================

        document.addEventListener('keyup', function (event) {
            event.preventDefault();
            //if we're typing in a text field, don't switch
            if (!document.activeElement.classList.contains("field")) {
                if (event.keyCode === 37) { //keyleft
                    if (document.getElementById("input1_radio").checked)
                        document.getElementById("input4_radio").checked = true;
                    else if (document.getElementById("input4_radio").checked)
                        document.getElementById("input3_radio").checked = true;
                    else if (document.getElementById("input3_radio").checked)
                        document.getElementById("input2_radio").checked = true;
                    else if (document.getElementById("input2_radio").checked)
                        document.getElementById("input1_radio").checked = true;
                }
                if (event.keyCode === 39) { //keyright
                    if (document.getElementById("input1_radio").checked)
                        document.getElementById("input2_radio").checked = true;
                    else if (document.getElementById("input2_radio").checked)
                        document.getElementById("input3_radio").checked = true;
                    else if (document.getElementById("input3_radio").checked)
                        document.getElementById("input4_radio").checked = true;
                    else if (document.getElementById("input4_radio").checked)
                        document.getElementById("input1_radio").checked = true;
                }
            }
        }, false);

        //================================================================================
        // SETTING VIEWER OPTIONS
        //================================================================================

        document.getElementById("view_settings_button").addEventListener('click', (event) => {
            if (event.target.classList.contains("settings_active")) {
                event.target.classList.remove("settings_active");
                document.querySelector(".settings_menu").classList.remove("settings_active");
            } else {
                event.target.classList.add("settings_active");
                document.querySelector(".settings_menu").classList.add("settings_active");
            }
        });

        document.getElementById("submit_viewer_settings").addEventListener('click', function (event) {

            //================================================================================
            //  Background
            //================================================================================

            if (document.getElementById("bg_black").checked) {
                that.view.setBackgroundColor(0x111111);
            } else if (document.getElementById("bg_white").checked) {
                that.view.setBackgroundColor(0xeeeeee);
            }

            //================================================================================
            //  Bases
            //================================================================================

            if (document.getElementById("type_base").checked) {
                that.view.renderOptions["bases"] = true;
                that.view.raycastOptions["bases"] = true;
            } else {
                that.view.renderOptions["bases"] = false;
                that.view.raycastOptions["bases"] = false;
            }

            if (document.getElementById("type_basepair").checked) {
                that.view.renderOptions["basepairs"] = true;
                that.view.raycastOptions["basepairs"] = true;
            } else {
                that.view.renderOptions["basepairs"] = false;
                that.view.raycastOptions["basepairs"] = false;
            }

            if (document.getElementById("type_atoms").checked) {
                that.view.renderOptions["baseAtoms"] = true;
                that.view.raycastOptions["baseAtoms"] = true;
            } else {
                that.view.renderOptions["baseAtoms"] = false;
                that.view.raycastOptions["baseAtoms"] = false;
            }

            //================================================================================
            //  Backbone
            //================================================================================

            if (document.getElementById("check_backbone").checked) {
                that.view.renderOptions["backbones"] = true;
                if (document.getElementById("type_atoms").checked) {
                    that.view.renderOptions["phosphates"] = false;
                    that.view.renderOptions["phosphateAtoms"] = true;
                    that.view.raycastOptions["phosphates"] = false;
                    that.view.raycastOptions["phosphateAtoms"] = true;
                } else {
                    that.view.renderOptions["phosphates"] = true;
                    that.view.renderOptions["phosphateAtoms"] = false;
                    that.view.raycastOptions["phosphates"] = true;
                    that.view.raycastOptions["phosphateAtoms"] = false;
                }
            } else {
                that.view.renderOptions["backbones"] = false;
                that.view.renderOptions["phosphates"] = false;
                that.view.renderOptions["phosphateAtoms"] = false;
                that.view.raycastOptions["phosphates"] = false;
                that.view.raycastOptions["phosphateAtoms"] = false;
            }

            //================================================================================
            //  Frames
            //================================================================================

            if (document.getElementById("check_baseframes").checked) {
                that.view.renderOptions["baseFrames"] = true;
            } else {
                that.view.renderOptions["baseFrames"] = false;
            }

            if (document.getElementById("check_basepairframes").checked) {
                that.view.renderOptions["basepairFrames"] = true;
            } else {
                that.view.renderOptions["basepairFrames"] = false;
            }

            //if (document.getElementById("check_phosphateframes").checked)
            //    that.view.renderOptions["phosphateFrames"] = true;
            //else
            //    that.view.renderOptions["phosphateFrames"] = false;

            //================================================================================
            //  Grid
            //================================================================================

            if (document.querySelector(".settings_menu>li>#check_grid").checked) {
                that.view.renderOptions["grid"] = true;
            } else {
                that.view.renderOptions["grid"] = false;
            }

            //================================================================================
            //  Disk
            //================================================================================

            if (document.querySelector(".settings_menu>li>#check_disk").checked) {
                that.view.renderOptions["disk"] = true;
            } else {
                that.view.renderOptions["disk"] = false;
            }

            that.view.update_dna();
            that.view.update_raycaster();
            that.view.animateWithoutSelecting();
        }, false);

        //================================================================================
        // SETTING PLOTS OPTIONS
        //================================================================================

        document.getElementById("submit_plots_settings").addEventListener('click', function (event) {
            if (document.getElementById("coords_c+").checked) {
                that.charts.changeCoords('curves');
            } else if (document.getElementById("coords_cg").checked) {
                that.charts.changeCoords('cgDNA');
            }
        }, false);

        //================================================================================
        // MOUSE MOVES, CLICKS (in viewer)
        //================================================================================

        document.getElementById("viewer").addEventListener( 'mousemove', (event) => {that.onDocumentMouseMove(event);});
        //document.getElementById("viewer").addEventListener( 'pointermove', (event) => {that.onDocumentMouseMove(event);});

        document.getElementById("viewer").addEventListener( 'contextmenu', function (event) {
            if (event.which === 3 || event.which === 2) {
                that.onRightMouseClick(event);
                //Also remove the viewer settings if it's open
                document.getElementById("view_settings_button").classList.remove("settings_active");
                document.querySelector(".settings_menu").classList.remove("settings_active");
            }
        }, false );

        //document.addEventListener('click', function (event) {
        document.addEventListener('click', (event) => {
            //console.log(event.target);
            if (event.target.tagName !== "CANVAS")
                that.hideTooltip();

            if (event.target.id === "viewer") {
                that.onMouseClick(event);
                //Also remove the viewer settings if it's open
                document.getElementById("view_settings_button").classList.remove("settings_active");
                document.querySelector(".settings_menu").classList.remove("settings_active");
            } else {
                let clickedInsideContext = that.clickInsideElement(event, 'cmenu-item');
                //console.log(clickedInsideContext);
                if (clickedInsideContext) {
                    that.resolveContextClick(event.target);
                    that.hideContextMenu();
                } else {
                    that.hideContextMenu();
                }
            }
        });

        //================================================================================
        //  Downloads
        //================================================================================

        document.getElementById("download_charts_svg").addEventListener('click', function (event) {
            console.log("clicked download plots svg");
            let zip = new JSZip();
            let files = ["buckle", "propeller", "opening", "shear", "stretch", "stagger",
                         "tilt", "roll", "twist", "shift", "slide", "rise",
                         "phos_w_eta1", "phos_w_eta2", "phos_w_eta3", "phos_w_w1", "phos_w_w2","phos_w_w3",
                         "phos_c_eta1", "phos_c_eta2", "phos_c_eta3", "phos_c_w1", "phos_c_w2","phos_c_w3",];

            function makeSVG(file) {
                let serializer = new XMLSerializer();
                let svg = document.getElementById(file).children[0];
                let svg_str = serializer.serializeToString(svg);
                let fblob = new Blob([svg_str], {type: "image/svg+xml"});
                return fblob;
            }

            for (let f of files) {
                zip.file(`${f}.svg`, makeSVG(f));
            }

            zip.generateAsync({type:"blob", compression: "DEFLATE"})
            .then(function(content) {
                // see FileSaver.js
                saveAs(content, "cgDNAweb_2Dplots.zip");
            });
        }, false);

        document.getElementById("download_charts_txt").addEventListener('click', function (event) {
            let zip = new JSZip();
            let files = [];
            for (let i = 0; i < that.model.dna_molecules.length; i++) {
                let dna = that.model.dna_molecules[i];
                if (dna && dna.baseFramesWatson)
                    files.push(`dna_${i}`);
            }

            function makeShapes(file) {
                let index = parseInt(file.split('_')[1]);
                let str = "";
                let dna = that.model.dna_molecules[index];
                if (dna && dna.shapes) {
                    str += "#"+dna.sequence + "\n";
                    for (let j = 0; j < dna.shapes.length; j++) {
                        str += dna.shapes[j] + "\n";
                    }
                }

                let fblob = new Blob([str], {type: "text/plain"});
                return fblob;
            }

            for (let f of files) {
                zip.file(`${f}.txt`, makeShapes(f));
            }

            zip.generateAsync({type:"blob", compression: "DEFLATE"})
            .then(function(content) {
                // see FileSaver.js
                saveAs(content, "cgDNAweb_shapes.zip");
            });

        }, false);

        document.getElementById("download_coords_fra").addEventListener('click', function (event) {
            let zip = new JSZip();
            let files = [];
            let types = [];
            for (let i = 0; i < that.model.dna_molecules.length; i++) {
                let dna = that.model.dna_molecules[i];
                if (dna && dna.baseFramesWatson) {
                    files.push(`dna_${i}`);
                    types.push(dna.type);
                }
            }

            function _makeFra(file) {
                let str = that.makeFra(file.split('_')[1]);
                let fblob = new Blob([str], {type: "text/plain"});
                return fblob;
            }

            function _makePFra(file) {
                let str = that.makePFra(file.split('_')[1]);
                let fblob = new Blob([str], {type: "text/plain"});
                return fblob;
            }

            for (let i in files) {
                zip.file(`${files[i]}.fra`, _makeFra(files[i]));
                if (types[i] === "cgDNA+" || types[i] === "cgHYB+" || types[i] === "cgRNA+")
                    zip.file(`${files[i]}.pfra`, _makePFra(files[i]));
            }

            zip.generateAsync({type:"blob", compression: "DEFLATE"})
            .then(function(content) {
                // see FileSaver.js
                saveAs(content, "cgDNAweb_frames.zip");
            });
        }, false);

        document.getElementById("download_coords_bp_fra").addEventListener('click', function (event) {
            let zip = new JSZip();
            let files = [];
            let types = [];
            for (let i = 0; i < that.model.dna_molecules.length; i++) {
                let dna = that.model.dna_molecules[i];
                if (dna && dna.baseFramesWatson) {
                    files.push(`dna_${i}`);
                    types.push(dna.type);

                }
            }

            function _makeBPFra(file) {
                let str = that.makeBPFra(file.split('_')[1]);
                let fblob = new Blob([str], {type: "text/plain"});
                return fblob;
            }

            function _makePFra(file) {
                let str = that.makePFra(file.split('_')[1]);
                let fblob = new Blob([str], {type: "text/plain"});
                return fblob;
            }

            for (let i in files) {
                zip.file(`${files[i]}_bp.fra`, _makeBPFra(files[i]));
                if (types[i] === "cgDNA+"  || types[i] === "cgHYB+" || types[i] === "cgRNA+")
                    zip.file(`${files[i]}.pfra`, _makePFra(files[i]));
            }

            zip.generateAsync({type:"blob", compression: "DEFLATE"})
            .then(function(content) {
                // see FileSaver.js
                saveAs(content, "cgDNAweb_bpframes.zip");
            });
        }, false);

        document.getElementById("download_coords_pdb").addEventListener('click', function (event) {
            let zip = new JSZip();
            let files = [];
            for (let i = 0; i < that.model.dna_molecules.length; i++) {
                let dna = that.model.dna_molecules[i];
                if (dna && dna.baseFramesWatson)
                    files.push(`dna_${i}`);
            }

            function _makePDB(file) {
                let str = that.makePDB(file.split('_')[1]);
                let fblob = new Blob([str], {type: "text/plain"});
                return fblob;
            }

            for (let f of files) {
                zip.file(`${f}.pdb`, _makePDB(f));
            }

            zip.generateAsync({type:"blob", compression: "DEFLATE"})
            .then(function(content) {
                // see FileSaver.js
                saveAs(content, "cgDNAweb_atoms_pdb.zip");
            });
        }, false);

        document.getElementById("download_stiff_csc").addEventListener('click', function (event) {
            let zip = new JSZip();
            let stiffness_matrices = [null, undefined, undefined, undefined, undefined];
            let promises = [];
            for (let id = 1; id <= 4; id++) {
                let seq = document.getElementById("seq_input".concat(id.toString())).value;
                let param = window.getComputedStyle(document.querySelector("#slide".concat(id.toString())+" .search_wrapper .params_dd_label"), ':before').content;
                console.log(param);
                //console.log(seq);
                //console.log("id:", "loading"+id.toString());

                let that = this;
                promises.push($.ajax({
                   'async': true,
                   'type': "POST",
                   'global': false,
                   'dataType': 'JSON',
                   'url': "/data3", //data3 is the one for K in CSC format
                   'data': { 'seq_input': seq,
                             'param_input': param},
                   'success': function (data) {
                       //not necessary to put anything here, promises handle it.
                        if( data.error === 'none' ) {
                            //download it
                        } else {
                            //something went wrong, handle it. Possibly by just doing nothing.
                        }
                   },
                   'error': function (response) {
                       //..
                   }
                }));
            }

            $.when.apply($, promises).then(function() {
                console.log(stiffness_matrices);
                //console.log(arguments);
                for (let i = 0; i < arguments.length; i++) {
                    //console.log(arguments[i][0]);
                    if (arguments[i][0].error === 'none') {
                        stiffness_matrices[i+1] = arguments[i][0];
                    }
                }

                function _makeCSC(file) {
                    let str = JSON.stringify(stiffness_matrices[file.split('_')[1]]);
                    let fblob = new Blob([str], {type: "text/json"});
                    return fblob;
                }

                let files = [];
                for (let i = 0; i < stiffness_matrices.length; i++) {
                    if (stiffness_matrices[i])
                        files.push(`dna_${i}`);
                }

                for (let f of files) {
                    zip.file(`${f}.csc`, _makeCSC(f));
                }

                zip.generateAsync({type:"blob", compression: "DEFLATE"})
                .then(function(content) {
                    // see FileSaver.js
                    saveAs(content, "cgDNAweb_stiffnesses.zip");
                });

            }, function() {
                console.log("error with promises");
                //console.log(arguments);
                //console.log(stiffness_matrices);
            });

        }, false);

        this.menu = document.getElementById("contextdiv");
        this.dna_info_tooltip = document.getElementById("dna-info-popup");
    },

    initControls : function () {
        this.mouseControls = new OrbitControls(this.view.camera, this.view.renderer.domElement);
        this.mouseControls.rotateSpeed = 0.2;
        this.mouseControls.zoomSpeed = 0.5;
        const that = this;
        this.mouseControls.addEventListener('change', () => {
            this.hideTooltip();
            that.view.animateWithoutSelecting();
        });
    },

    onDocumentMouseMove : function ( event ) {
        event.preventDefault();
        let elem = this.view.renderer.domElement;
        let rect = this.view.renderer.domElement.getBoundingClientRect();

        this.view.mouse.x = ( (event.clientX - rect.left)/ rect.width ) * 2 - 1;
        this.view.mouse.y = - ( (event.clientY - rect.top) / rect.height) * 2 + 1;
        //console.log("MOVING ZA MOUZE")
        this.view.animate(); //DOUBLE RENDERING?! apparently not
    },

    onMouseClick : function (event) {
        event.preventDefault();
        let intersects = this.view.getIntersects();

        //console.log(intersects);
        if (intersects.length > 0) {
            if (intersects[0].object.type === "Mesh") {
                this.showTooltip(event, intersects[0]);
            } else {
                this.hideTooltip();
            }
        } else {
            this.hideTooltip();
        }

        let clickedInsideContext = this.clickInsideElement(event, 'cmenu-item');
        if (clickedInsideContext) {
            this.hideContextMenu();
        } else {
            this.hideContextMenu();
        }
    },

    onRightMouseClick : function (event) {
        event.preventDefault();
        this.hideTooltip();
        this.showContextMenu(event);
    },

    showContextMenu : function (event) {
        this.menu.style.left = (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft).toString()+'px';
        this.menu.style.top = (event.clientY + document.body.scrollTop + document.documentElement.scrollTop).toString()+'px';
        this.menu.style.visibility = 'visible';
        this.menu.style.display = 'block';
    },

    hideContextMenu : function () {
        this.menu.style.visibility = 'hidden';
        this.menu.style.display = 'none';
    },

    showTooltip : function (event, intersected) {
        let that = this;

        //console.log(intersected.object);
        //let names = [intersected.object.parent.parent.parent.name, intersected.object.parent.parent.name, intersected.object.parent.name];
        let hit_name = intersected.object.name;
        let hit = intersected.object.name.split('_');

        //console.log("tooltip:");
        //console.log(intersected);
        let type = hit[0];
	let seq_no;
        let bp_no;
        let strand;
        let nuc;
        let atom;
        if (type === "baseatoms" || type === "basebonds") {
            let instance = intersected.object.userData.instanceIdTobase[intersected.instanceId];
            seq_no = intersected.object.parent.name.split('_')[1];
            let seq = this.model.dna_molecules[seq_no].sequence
            let na = this.model.dna_molecules[seq_no] 
            bp_no = 1 + instance % seq.length;
            strand = (instance < seq.length) ? 'W' : 'C';
            nuc = (strand === 'W') ? seq[bp_no-1] : WCcomplement(seq[bp_no-1],na);

            this.dna_info_tooltip.innerHTML = `<ul>
                <li>Sequence:\t${seq_no}</li>
                <li>Strand:\t${strand}</li>
                <li>Basepair:\t${bp_no}</li>
                <li>Nucleotide:\t${nuc}</li>

                </ul>`;
        } else if (type === "phosphateatoms" || type === "phosphatebonds") {
            let instance = intersected.object.userData.instanceIdTobase[intersected.instanceId];
            seq_no = intersected.object.parent.name.split('_')[1];
            let seq = this.model.dna_molecules[seq_no].sequence
            let offset = instance < seq.length-1 ? 1 : 0;
            bp_no = 1 + offset + (instance) % (seq.length-1);
            strand = (-offset + instance < (seq.length-1)) ? 'W' : 'C';

            this.dna_info_tooltip.innerHTML = `<ul>
                <li>Sequence: ${seq_no}</li>
                <li>Strand:   ${strand}</li>
                <li>Basepair: ${bp_no}</li>
                </ul>`;
        } else if (type === "phosphates") {
            seq_no = parseInt(intersected.object.parent.name.split('_')[1]);
            let seq = this.model.dna_molecules[seq_no].sequence
            let offset = intersected.instanceId < seq.length-1 ? 1 : 0;
            bp_no = 1 + offset + (intersected.instanceId) % (seq.length-1);
            strand = (-offset + intersected.instanceId < (seq.length-1)) ? 'W' : 'C';

            this.dna_info_tooltip.innerHTML = `<ul>
                <li>Sequence: ${seq_no}</li>
                <li>Strand:   ${strand}</li>
                <li>Basepair: ${bp_no}</li>
                </ul>`;
        } else if (type === "bases") {
            seq_no = parseInt(intersected.object.parent.name.split('_')[1]);
            let seq = this.model.dna_molecules[seq_no].sequence
            let na = this.model.dna_molecules[seq_no]
            bp_no = 1 + intersected.instanceId % seq.length;
            strand = (intersected.instanceId < seq.length) ? 'W' : 'C';
            nuc = (strand === 'W') ? seq[bp_no-1] : WCcomplement(seq[bp_no-1],na);

            this.dna_info_tooltip.innerHTML = `<ul>
                <li>Sequence: ${seq_no}</li>
                <li>Strand:   ${strand}</li>
                <li>Basepair: ${bp_no}</li>
                <li>Nucleotide: ${nuc}</li>
                </ul>`;
        } else if (type === "basepairs") {
            seq_no = parseInt(intersected.object.parent.name.split('_')[1]);
            let seq = this.model.dna_molecules[seq_no].sequence
            let na = this.model.dna_molecules[seq_no]
            bp_no = Math.floor(1 + (intersected.instanceId/2) % seq.length);
            nuc = seq[bp_no-1]+'-'+WCcomplement(seq[bp_no-1],na);

            this.dna_info_tooltip.innerHTML = `<ul>
                <li>Sequence: ${seq_no}</li>
                <li>Basepair: ${bp_no}</li>
                <li>Nucleotide: ${nuc}</li>
                </ul>`;
        }

        let style = window.getComputedStyle(that.dna_info_tooltip);
        let tt_width = parseInt(style.width.slice(0,-2)); //take of the px from "#px"
        this.dna_info_tooltip.style.left = (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft-0.5*tt_width).toString()+'px';
        this.dna_info_tooltip.style.top = (event.clientY + document.body.scrollTop + document.documentElement.scrollTop + 10).toString()+'px';
        this.dna_info_tooltip.style.visibility = 'visible';
        this.dna_info_tooltip.style.display = 'block';
    },

    hideTooltip : function () {
        this.dna_info_tooltip.style.visibility = 'hidden';
        this.dna_info_tooltip.style.display = 'none';
    },

    clickInsideElement : function (e, className) {
        let el = e.srcElement || e.target;

        if ( el.classList.contains(className) ) {
          return el;
        } else {
          while ( el = el.parentNode ) {
            if ( el.classList && el.classList.contains(className) ) {
              return el;
            }
          }
        }

        return false;
    },

    resolveContextClick : function (target) {
        let intersects;
        let to_remove;
        let names;
        let i;
        if (target.id === "center_base") {
            this.view.raycaster.setFromCamera( this.view.mouse, this.view.camera );
            intersects = this.view.getIntersects();

            if (intersects.length > 0) {
                if (intersects[0].object.type === "Mesh") {
                    let intersected = intersects[0];
                    names = [intersects[0].object.parent.parent.name, intersects[0].object.parent.name, intersects[0].object.name];
                    let dna_name = names[1];
                    //this.view.centerDNAAtFrame(intersects[0].object.parent.parent.parent.name, intersects[0].object.parent.name);

                    let hit_name = intersected.object.name;
                    let hit = intersected.object.name.split('_');

                    console.log("tooltip:");
                    console.log(intersected);
                    let type = hit[0];
                    let seq_no;
                    let bp_no;
                    let strand;
                    let nuc;
                    let atom;
                    if (type === "baseatoms" || type === "basebonds") {
                        let instance = intersected.object.userData.instanceIdTobase[intersected.instanceId];
                        seq_no = intersected.object.parent.name.split('_')[1];
                        let seq = this.model.dna_molecules[seq_no].sequence
                        bp_no = instance % seq.length;
                        strand = (instance < seq.length) ? 'W' : 'C';
                    } else if (type === "phosphateatoms" || type === "phosphatebonds") {
                        let instance = intersected.object.userData.instanceIdTobase[intersected.instanceId];
                        seq_no = intersected.object.parent.name.split('_')[1];
                        let seq = this.model.dna_molecules[seq_no].sequence
                        let offset = instance < seq.length-1 ? 1 : 0;
                        bp_no = offset + (instance) % (seq.length-1);
                        strand = (-offset + instance < (seq.length-1)) ? 'W' : 'C';
                    } else if (type === "phosphates") {
                        seq_no = parseInt(intersected.object.parent.name.split('_')[1]);
                        let seq = this.model.dna_molecules[seq_no].sequence
                        let offset = intersected.instanceId < seq.length-1 ? 1 : 0;
                        bp_no = offset + (intersected.instanceId) % (seq.length-1);
                        strand = (-offset + intersected.instanceId < (seq.length-1)) ? 'W' : 'C';
                    } else if (type === "bases") {
                        seq_no = parseInt(intersected.object.parent.name.split('_')[1]);
                        let seq = this.model.dna_molecules[seq_no].sequence
                        bp_no = intersected.instanceId % seq.length;
                        strand = (intersected.instanceId < seq.length) ? 'W' : 'C';
                    } else if (type === "basepairs") {
                        seq_no = parseInt(intersected.object.parent.name.split('_')[1]);
                        let seq = this.model.dna_molecules[seq_no].sequence
                        bp_no = Math.floor(1 + (intersected.instanceId/2) % seq.length)-1;
                        this.view.centerDNAAtBP(dna_name, bp_no);
                        return;
                    }

                    this.view.centerDNAAtBase(dna_name, bp_no, strand);
                }
            }
        }
        if (target.id === "center_bp") {
            this.view.raycaster.setFromCamera( this.view.mouse, this.view.camera );
            intersects = this.view.getIntersects();

            if (intersects.length > 0) {
                if (intersects[0].object.type === "Mesh") {
                    let intersected = intersects[0];
                    let hit_name = intersected.object.name;
                    let hit = intersected.object.name.split('_');

                    let type = hit[0];
                    let seq_no;
                    let bp_no;
                    names = [intersects[0].object.parent.parent.name, intersects[0].object.parent.name, intersects[0].object.name];
                    let dna_name = names[1];

                    if (type === "baseatoms" || type === "basebonds") {
                        let instance = intersected.object.userData.instanceIdTobase[intersected.instanceId];
                        seq_no = intersected.object.parent.name.split('_')[1];
                        let seq = this.model.dna_molecules[seq_no].sequence
                        bp_no = instance % seq.length;
                    } else if (type === "phosphateatoms" || type === "phosphatebonds") {
                        let instance = intersected.object.userData.instanceIdTobase[intersected.instanceId];
                        seq_no = intersected.object.parent.name.split('_')[1];
                        let seq = this.model.dna_molecules[seq_no].sequence
                        let offset = instance < seq.length-1 ? 1 : 0;
                        bp_no = offset + (instance) % (seq.length-1);
                    } else if (type === "phosphates") {
                        seq_no = parseInt(intersected.object.parent.name.split('_')[1]);
                        let seq = this.model.dna_molecules[seq_no].sequence
                        let offset = intersected.instanceId < seq.length-1 ? 1 : 0;
                        bp_no = offset + (intersected.instanceId) % (seq.length-1);
                    } else if (type === "bases") {
                        seq_no = parseInt(intersected.object.parent.name.split('_')[1]);
                        let seq = this.model.dna_molecules[seq_no].sequence
                        bp_no = intersected.instanceId % seq.length;
                    } else if (type === "basepairs") {
                        seq_no = parseInt(intersected.object.parent.name.split('_')[1]);
                        let seq = this.model.dna_molecules[seq_no].sequence
                        bp_no = Math.floor(1 + (intersected.instanceId/2) % seq.length)-1;
                    }

                    console.log(dna_name);
                    console.log(bp_no);
                    //this.view.centerDNAAtFrame(dna_name, bp_no);
                    this.view.centerDNAAtBP(dna_name, bp_no);
                }
            }
        }
        if (target.id === "view_origin") {
            this.mouseControls.target = new THREE.Vector3(0,0,0);
            this.mouseControls.update();
        }
    },

    //======================================================================================//
    //  Construct downloadable stuff
    //======================================================================================//

    makeFra : function (index) {
        let mol = this.model.dna_molecules[index];
        let out_str = "";
        let i,j;
        out_str += "#" + mol.sequence + "\n";
        for (i = 0; i < mol.sequence.length; i++) {
            out_str += "1 "+ (i+1).toString() + " ";
            let or = new THREE.Matrix3().setFromMatrix4(mol.baseFramesWatson[i]).transpose().toArray();
            let pos = new THREE.Vector3().setFromMatrixPosition(mol.baseFramesWatson[i]).toArray();
            for (j = 0; j < 9; j++) {
                //out_str += mol.baseFramesWatson[i].or[j] + " ";
                out_str += or[j] + " ";
            }
            for (j = 0; j < 3; j++) {
                //out_str += mol.baseFramesWatson[i].pos[j];
                out_str += pos[j];
                if (j < 2)
                    out_str += " ";
                else
                    out_str += "\n";
            }
        }
        for (i = 0; i < mol.sequence.length; i++) {
            out_str += "2 "+ (i+1).toString() + " ";
            let or = new THREE.Matrix3().setFromMatrix4(mol.baseFramesCrick[i]).transpose().toArray();
            let pos = new THREE.Vector3().setFromMatrixPosition(mol.baseFramesCrick[i]).toArray();
            for (j = 0; j < 9; j++) {
                //out_str += mol.baseFramesCrick[i].or[j] + " ";
                out_str += or[j] + " ";
            }
            for (j = 0; j < 3; j++) {
                //out_str += mol.baseFramesCrick[i].pos[j];
                out_str += pos[j];
                if (j < 2)
                    out_str += " ";
                else
                    out_str += "\n";
            }
        }

        return out_str;
    },

    makePFra : function (index) {
        let dna = this.model.dna_molecules[index];
        let out_str = "";
        let i,j;
        out_str += "#" + dna.sequence + "\n";
        for (i = 0; i < dna.sequence.length; i++) {
            if ((dna.type === "cgDNA+" && dna.phosphateFramesWatson[i]) || (dna.type === "cgRNA+" && dna.phosphateFramesWatson[i]) || (dna.type === "cgHYB+" && dna.phosphateFramesWatson[i])) {
                out_str += "1 "+ (i+1).toString() + " ";
                let or = new THREE.Matrix3().setFromMatrix4(dna.phosphateFramesWatson[i]).transpose().toArray();
                let pos = new THREE.Vector3().setFromMatrixPosition(dna.phosphateFramesWatson[i]).toArray();
                for (j = 0; j < 9; j++) {
                    out_str += or[j] + " ";
                }
                for (j = 0; j < 3; j++) {
                    out_str += pos[j];
                    if (j < 2)
                        out_str += " ";
                    else
                        out_str += "\n";
                }
            }
        }
        for (i = 0; i < dna.sequence.length; i++) {
            if ((dna.type === "cgDNA+" && dna.phosphateFramesCrick[i]) || (dna.type === "cgRNA+" && dna.phosphateFramesCrick[i]) ||(dna.type === "cgHYB+" && dna.phosphateFramesCrick[i])) {
                out_str += "2 "+ (i+1).toString() + " ";
                let or = new THREE.Matrix3().setFromMatrix4(dna.phosphateFramesCrick[i]).transpose().toArray();
                let pos = new THREE.Vector3().setFromMatrixPosition(dna.phosphateFramesCrick[i]).toArray();
                for (j = 0; j < 9; j++) {
                    out_str += or[j] + " ";
                }
                for (j = 0; j < 3; j++) {
                    out_str += pos[j];
                    if (j < 2)
                        out_str += " ";
                    else
                        out_str += "\n";
                }
            }
        }

        return out_str;
    },

    makeBPFra : function (index) {
        let mol = this.model.dna_molecules[index];
        let out_str = "";
        let i,j;
        out_str += "#" + mol.sequence + "\n";
        for (i = 0; i < mol.sequence.length; i++) {
            let or = new THREE.Matrix3().setFromMatrix4(mol.bpFrames[i]).transpose().toArray();
            let pos = new THREE.Vector3().setFromMatrixPosition(mol.bpFrames[i]).toArray();
            out_str += "1 "+ (i+1).toString() + " ";
            for (j = 0; j < 9; j++) {
                //out_str += mol.bpFrames[i].or[j] + " ";
                out_str += or[j] + " ";
            }
            for (j = 0; j < 3; j++) {
                //out_str += mol.bpFrames[i].pos[j];
                out_str += pos[j];
                if (j < 2)
                    out_str += " ";
                else
                    out_str += "\n";
            }
        }

        return out_str;
    },

    makePDB : function (index) {
        let DNA = this.model.dna_molecules[index];
        let sequence = DNA.sequence;
        let framesWatson = DNA.baseFramesWatson;
        let framesCrick = DNA.baseFramesCrick;
        let n_atoms = 0;
        let out_str = "";

        let DNA_or = this.view.scene.getObjectByName(`DNA_${index}`).matrix.clone();
        for (let i = 0; i < framesWatson.length; i++) {
            let base_atoms = atomGroups[sequence[i]]['W'].clone();
            for (let atom of base_atoms.getObjectByName("atoms").children) {
                //console.log(atom);
                n_atoms++;
                atom.applyMatrix4(base_atoms.matrix.clone());
                atom.applyMatrix4(framesWatson[i].clone());
                atom.applyMatrix4(DNA_or);
                let pos = new THREE.Vector3().setFromMatrixPosition(atom.matrix.clone());
                let name = atom.name;

                let atom_record = vsprintf('%-6s%5d  %3s  %2s  %4d    %8.3f%8.3f%8.3f \n', ['ATOM', n_atoms, name, "D"+sequence[i], i+1, pos.x, pos.y, pos.z]);

                out_str += atom_record;
            }
            if ((DNA.type === "cgDNA+" && DNA.phosphateFramesWatson[i]) || (DNA.type === "cgRNA+" && DNA.phosphateFramesWatson[i]) || (DNA.type === "cgHYB+" && DNA.phosphateFramesWatson[i])) {
                let phos_atoms = phosphateAtoms.clone();
                for (let atom of phos_atoms.getObjectByName("atoms").children) {
                    n_atoms++;
                    atom.applyMatrix4(phos_atoms.matrix.clone());
                    atom.applyMatrix4(DNA.phosphateFramesWatson[i].clone());
                    atom.applyMatrix4(DNA_or);
                    let pos = new THREE.Vector3().setFromMatrixPosition(atom.matrix.clone());
                    let name = atom.name;

                    let atom_record = vsprintf('%-6s%5d  %3s  %2s  %4d    %8.3f%8.3f%8.3f \n', ['ATOM', n_atoms, name, "D"+sequence[i], i+1, pos.x, pos.y, pos.z]);

                    out_str += atom_record;
                }
            }
        }
        for (let i = 0; i < framesCrick.length; i++) {
            let base_atoms = atomGroups[WCcomplement(sequence[i],DNA)]['C'].clone();
            for (let atom of base_atoms.getObjectByName("atoms").children) {
                //console.log(atom);
                n_atoms++;
                atom.applyMatrix4(base_atoms.matrix.clone());
                atom.applyMatrix4(framesCrick[i].clone());
                atom.applyMatrix4(DNA_or);
                let pos = new THREE.Vector3().setFromMatrixPosition(atom.matrix.clone());
                let name = atom.name;

                let atom_record = vsprintf('%-6s%5d  %3s  %2s  %4d    %8.3f%8.3f%8.3f \n', ['ATOM', n_atoms, name, "D"+WCcomplement(sequence[i],DNA), i+1+sequence.length, pos.x, pos.y, pos.z]);

                out_str += atom_record;
            }
            if ((DNA.type === "cgDNA+" && DNA.phosphateFramesCrick[i]) || (DNA.type === "cgRNA+" && DNA.phosphateFramesCrick[i]) || (DNA.type === "cgHYB+" && DNA.phosphateFramesCrick[i])) {
                let phos_atoms = phosphateAtoms.clone();
                for (let atom of phos_atoms.getObjectByName("atoms").children) {
                    n_atoms++;
                    atom.applyMatrix4(phos_atoms.matrix.clone());
                    atom.applyMatrix4(DNA.phosphateFramesCrick[i].clone());
                    atom.applyMatrix4(DNA_or);
                    let pos = new THREE.Vector3().setFromMatrixPosition(atom.matrix.clone());
                    let name = atom.name;

                    let atom_record = vsprintf('%-6s%5d  %3s  %2s  %4d    %8.3f%8.3f%8.3f \n', ['ATOM', n_atoms, name, "D"+WCcomplement(sequence[i],DNA), i+1+sequence.length, pos.x, pos.y, pos.z]);

                    out_str += atom_record;
                }
            }
        }

        return out_str;
    }
};
