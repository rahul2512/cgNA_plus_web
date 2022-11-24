function dnaController (_model, _view, _charts) {
    "use strict";
    this.view = _view;
    this.model = _model;
    this.charts = _charts;

    this.menu = undefined;
    this.dna_info_tooltip = undefined;

    this.mouseControls = undefined;
    this.selected = [];
    this.CTRL_held = false;
    this.SHIFT_held = false;
    this.domElement = undefined;
}

dnaController.prototype = {
    init : function () {
        "use strict";
        this.domElement = document;

        //Window resizes:
        var that = this;
        window.addEventListener('resize', function () {
            console.log(that.view.camera);
            that.view.camera.aspect = (document.body.clientWidth/document.body.clientHeight);
            that.view.camera.updateProjectionMatrix();
            that.view.renderer.setSize(document.body.clientWidth,document.body.clientHeight);
            //console.log(window);
            }, false);

        //================================================================================
        // SUBMITTING SEQUENCES
        //================================================================================

        document.getElementById("submit_seq1").addEventListener('click', function (event) {
            that.onSubmit(event, 1);}, false);

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

        document.getElementById("submit_viewer_settings").addEventListener('click', function (event) {

            //================================================================================
            //  Background
            //================================================================================

            if (document.getElementById("bg_black").checked) {
                that.view.setBackgroundColor(0x000000);
            } else if (document.getElementById("bg_white").checked) {
                that.view.setBackgroundColor(0xffffff);
            }

            //================================================================================
            //  Bases
            //================================================================================

            if (document.getElementById("type_base").checked)
                that.view.renderBases = true;
            else 
                that.view.renderBases = false;

            if (document.getElementById("type_basepair").checked)
                that.view.renderBasepairs = true;
            else 
                that.view.renderBasepairs = false;

            if (document.getElementById("type_atoms").checked)
                that.view.renderAtoms = true;
            else 
                that.view.renderAtoms = false;

            //================================================================================
            //  Backbone
            //================================================================================

            if (document.getElementById("check_backbone").checked) {
                that.view.renderBackboneWatson = true;
                that.view.renderBackboneCrick = true;
            } else {
                that.view.renderBackboneWatson = false;
                that.view.renderBackboneCrick = false;
            }

            //================================================================================
            //  Frames
            //================================================================================

            if (document.getElementById("check_baseframes").checked)
                that.view.renderBaseFrames = true;
            else
                that.view.renderBaseFrames = false;

            if (document.getElementById("check_basepairframes").checked)
                that.view.renderBpFrames = true;
            else
                that.view.renderBpFrames = false;

            //if (document.getElementById("check_phosphateframes").checked)
            //    that.view.renderPhosphateFrames = true;
            //else
            //    that.view.renderPhosphateFrames = false;

            //================================================================================
            //  Grid
            //================================================================================

            if (document.getElementById("check_grid").checked)
                that.view.showGrid(true);
            else
                that.view.showGrid(false);

            that.view.update_dna();
        }, false);

        //================================================================================
        // SETTING PLOTS OPTIONS
        //================================================================================

        document.getElementById("submit_plots_settings").addEventListener('click', function (event) {

            if (document.getElementById("coords_c+").checked) {
                that.charts.changeCoords('curves+');
            } else if (document.getElementById("coords_cg").checked) {
                that.charts.changeCoords('cgDNA');
            }
        }, false);

        //================================================================================
        // MAKE DNA INVISIBLE WHEN NOT IN 3D VIEW TAB
        //================================================================================

        //console.log('just here');
        var view_radio = document.getElementById('radio_3dview');

        view_radio.addEventListener('change', function (event) {
            var id;
            if (!view_radio.checked) {
                for (id = 1; id < 5; id++)
                    that.view.renderDNA(id, false);
            } else if (view_radio.checked){
                for (id = 1; id < 5; id++)
                    that.view.renderDNA(id, true);
            }
        }, false);

        //================================================================================
        // MOUSE MOVES, CLICKS (in viewer)
        //================================================================================

        document.getElementById("viewer").addEventListener( 'mousemove', function (event) {
            that.onDocumentMouseMove(event);} , false );

        document.getElementById("viewer").addEventListener( 'contextmenu', function (event) {
            if (event.which === 3 || event.which === 2) {
                that.onRightMouseClick(event);
            }
        }, false );

        document.addEventListener('click', function (event) {
            //console.log(event.target);
            if (event.target.tagName !== "CANVAS")
                that.hideTooltip();

            if (event.target.id === "viewer") {
                that.onMouseClick(event);
            } else {
                var clickedInsideContext = that.clickInsideElement(event, 'cmenu-item');
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
            zip.useWebWorkers=false;
            zip.createWriter(new zip.BlobWriter("application/zip"), function(writer) {
                var files = ["buckle", "propeller", "opening", "shear", "stretch", "stagger", "tilt", "roll", "twist", "shift", "slide", "rise"];
                var f = 0;

                function nextFile(f) {
                    var serializer = new XMLSerializer();
                    var svg = document.getElementById(files[f]).children[0];
                    var svg_str = serializer.serializeToString(svg);
                    var fblob = new Blob([svg_str], {type: "image/svg+xml"});
                    writer.add(files[f]+".svg", new zip.BlobReader(fblob), function() {
                        f++;
                        if (f < files.length) {
                            nextFile(f);
                        } else close();
                    });
                }

                function close() {
                    // close the writer
                    writer.close(function(zipfile) {
                        // save with FileSaver.js
                        saveAs(zipfile, "plots.zip");
                    });
                }

                nextFile(f);

            }, onerror);
            console.log(files);
        }, false);

        document.getElementById("download_charts_txt").addEventListener('click', function (event) {
            zip.useWebWorkers=false;
            zip.createWriter(new zip.BlobWriter("application/zip"), function(writer) {
                var files = [];
                for (var i = 0; i < that.model.dna_molecules.length; i++) {
                    var mol = that.model.dna_molecules[i];
                    if (mol !== undefined && mol.baseFramesWatson !== undefined)
                        files.push('dna_'+i);
                }
                var f = 0;

                function nextFile(f) {
                    var index = parseInt(files[f].split('_')[1]);
                    var str = "";
                    var mol = that.model.dna_molecules[index];
                    if (mol !== undefined && mol.shapes !== undefined) {
                        str += "#"+mol.sequence + "\n";
                        for (var j = 0; j < mol.shapes.length; j++) {
                            str += mol.shapes[j] + "\n";
                        }
                    }

                    var fblob = new Blob([str], {type: "text/plain"});
                    writer.add(files[f]+".txt", new zip.BlobReader(fblob), function() {
                        // callback
                        f++;
                        if (f < files.length) {
                            nextFile(f);
                        } else close();
                    });
                }

                function close() {
                    // close the writer
                    writer.close(function(zipfile) {
                        // save with FileSaver.js
                        saveAs(zipfile, "shapes.zip");
                    });
                }

                if (files.length > 0)
                    nextFile(f);

            }, onerror);
        }, false);

        document.getElementById("download_coords_fra").addEventListener('click', function (event) {
            zip.useWebWorkers=false;
            zip.createWriter(new zip.BlobWriter("application/zip"), function(writer) {
                var files = [];
                for (var i = 0; i < that.model.dna_molecules.length; i++) {
                    var mol = that.model.dna_molecules[i];
                    if (mol !== undefined && mol.baseFramesWatson !== undefined)
                        files.push('dna_'+i);
                }
                var f = 0;

                function nextFile(f) {
                    var str = that.makeFra(files[f].split('_')[1]);
                    var fblob = new Blob([str], {type: "text/plain"});
                    writer.add(files[f]+".fra", new zip.BlobReader(fblob), function() {
                        // callback
                        f++;
                        if (f < files.length) {
                            nextFile(f);
                        } else close();
                    });
                }

                function close() {
                    // close the writer
                    writer.close(function(zipfile) {
                        // save with FileSaver.js
                        saveAs(zipfile, "frames.zip");
                    });
                }

                if (files.length > 0)
                    nextFile(f);

            }, onerror);
        }, false);

        document.getElementById("download_coords_bp_fra").addEventListener('click', function (event) {
            zip.useWebWorkers=false;
            zip.createWriter(new zip.BlobWriter("application/zip"), function(writer) {
                var files = [];
                for (var i = 0; i < that.model.dna_molecules.length; i++) {
                    var mol = that.model.dna_molecules[i];
                    if (mol !== undefined && mol.bpFrames !== undefined)
                        files.push('dna_'+i);
                }
                var f = 0;

                function nextFile(f) {
                    var str = that.makeBPFra(files[f].split('_')[1]);
                    var fblob = new Blob([str], {type: "text/plain"});
                    writer.add(files[f]+".fra", new zip.BlobReader(fblob), function() {
                        // callback
                        f++;
                        if (f < files.length) {
                            nextFile(f);
                        } else close();
                    });
                }

                function close() {
                    // close the writer
                    writer.close(function(zipfile) {
                        // save with FileSaver.js
                        saveAs(zipfile, "bpframes.zip");
                    });
                }

                if (files.length > 0)
                    nextFile(f);

            }, onerror);
        }, false);

        document.getElementById("download_coords_pdb").addEventListener('click', function (event) {
            zip.useWebWorkers=false;
            zip.createWriter(new zip.BlobWriter("application/zip"), function(writer) {
                var files = [];
                for (var i = 0; i < that.model.dna_molecules.length; i++) {
                    var mol = that.model.dna_molecules[i];
                    if (mol !== undefined && mol.baseFramesWatson !== undefined)
                        files.push('dna_'+i);
                }
                var f = 0;

                function nextFile(f) {
                    var str = that.makePDB(files[f].split('_')[1]);
                    var fblob = new Blob([str], {type: "text/plain"});
                    writer.add(files[f]+".pdb", new zip.BlobReader(fblob), function() {
                        // callback
                        f++;
                        if (f < files.length) {
                            nextFile(f);
                        } else close();
                    });
                }

                function close() {
                    // close the writer
                    writer.close(function(zipfile) {
                        // save with FileSaver.js
                        saveAs(zipfile, "atoms_pdb.zip");
                    });
                }

                if (files.length > 0)
                    nextFile(f);

            }, onerror);
        }, false);

        document.getElementById("download_stiff_csc").addEventListener('click', function (event) {
            var stiffness_matrices = [null, undefined, undefined, undefined, undefined];
            var promises = [];
            for (var id = 1; id <= 4; id++) {
                var seq = document.getElementById("seq_input".concat(id.toString())).value;
                /*
                if (seq === "") {
                    stiffness_matrices[id] = null;
                    continue;
                }
                */

                //var param_query = "#slide".concat(id.toString())+" .search_wrapper .params_dd_label";
                //console.log(param_query);
                var param = window.getComputedStyle(document.querySelector("#slide".concat(id.toString())+" .search_wrapper .params_dd_label"), ':before').content;
                
                console.log(param);
                //console.log(seq);
                //console.log("id:", "loading"+id.toString());
                  
                var that = this;
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
                //console.log(stiffness_matrices);
                //console.log(arguments);
                for (var i = 0; i < arguments.length; i++) {
                    //console.log(arguments[i][0]);
                    if (arguments[i][0].error === 'none') {
                        stiffness_matrices[i+1] = arguments[i][0];
                    }
                }
                //console.log(stiffness_matrices);
                //now have all necessary data, put in zip
                zip.useWebWorkers=false;
                zip.createWriter(new zip.BlobWriter("application/zip"), function(writer) {
                    var files = [];
                    for (var i = 0; i < stiffness_matrices.length; i++) {
                        if (stiffness_matrices[i] !== null && stiffness_matrices[i] !== undefined)
                            files.push('dna_'+i);
                    }
                    var f = 0;

                    function nextFile(f) {
                        var str = JSON.stringify(stiffness_matrices[files[f].split('_')[1]]);
                        console.log(str);

                        var fblob = new Blob([str], {type: "text/json"});
                        writer.add(files[f]+".json", new zip.BlobReader(fblob), function() {
                            // callback
                            f++;
                            if (f < files.length) {
                                nextFile(f);
                            } else close();
                        });
                    }

                    function close() {
                        // close the writer
                        writer.close(function(zipfile) {
                            // save with FileSaver.js
                            saveAs(zipfile, "stiffness_matrices.zip");
                        });
                    }

                    if (files.length > 0)
                        nextFile(f);

                }, onerror);
                
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
        this.mouseControls = new THREE.OrbitControls(this.view.camera, this.view.renderer.domElement);
    },

    onDocumentMouseMove : function ( event ) {
        event.preventDefault();
        var elem = this.view.renderer.domElement;
        var rect = this.view.renderer.domElement.getBoundingClientRect();

        this.view.mouse.x = ( (event.clientX - rect.left)/ rect.width ) * 2 - 1;
        this.view.mouse.y = - ( (event.clientY - rect.top) / rect.height) * 2 + 1;
    },

    onMouseClick : function (event) {
        event.preventDefault();
        //put up information about the clicked base
        var intersects = this.view.getIntersects();
        
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

        var clickedInsideContext = this.clickInsideElement(event, 'cmenu-item'); //'cmenu' should be contextmenu links, not the whole thing
        if (clickedInsideContext) {
            this.hideContextMenu();
        } else {
            this.hideContextMenu();
        }
    },

    onRightMouseClick : function (event) {
        event.preventDefault();
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
        var that = this;
        var style = window.getComputedStyle(that.dna_info_tooltip);
        var tt_width = parseInt(style.width.slice(0,-2)); //take of the px from "#px"
        this.dna_info_tooltip.style.left = (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft-0.5*tt_width).toString()+'px';
        this.dna_info_tooltip.style.top = (event.clientY + document.body.scrollTop + document.documentElement.scrollTop + 10).toString()+'px';
        this.dna_info_tooltip.style.visibility = 'visible';
        this.dna_info_tooltip.style.display = 'block';

        //console.log(intersected.object);
        //var names = [intersected.object.parent.parent.parent.name, intersected.object.parent.parent.name, intersected.object.parent.name];
        var hit_name = intersected.object.parent.name;
        var hit = intersected.object.parent.name.split('_');

        var type = hit[2];
        var seq_no;
        var bp_no;
        var strand;
        var nuc;
        var atom;
        if (type === "atom") {
            seq_no = intersected.object.parent.parent.parent.name.split('_')[1];
            bp_no = (parseInt(hit[4])+1).toString();
            strand = hit[3];
            atom = intersected.object.name;
            nuc = hit[0]+', '+atom;
        } else if (type === "base") {
            seq_no = intersected.object.parent.parent.parent.name.split('_')[1];
            bp_no = (parseInt(hit[4])+1).toString();
            strand = hit[3];
            nuc = hit[0];
            //...
        } else if (type === "bp") {
            hit = intersected.object.name.split('_');
            seq_no = intersected.object.parent.parent.parent.name.split('_')[1];
            bp_no = (parseInt(hit[4])+1).toString();
            strand = hit[3];
            nuc = hit[0];
        }

        document.getElementById("dna_info_seq_no").innerHTML = seq_no;
        document.getElementById("dna_info_bp_no").innerHTML = bp_no;
        document.getElementById("dna_info_strand").innerHTML = strand;
        document.getElementById("dna_info_nuc").innerHTML = nuc;
    },

    hideTooltip : function () {
        this.dna_info_tooltip.style.visibility = 'hidden';
        this.dna_info_tooltip.style.display = 'none';
    },

    clickInsideElement : function (e, className) {
        var el = e.srcElement || e.target;
        
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
        var intersects;
        var to_remove;
        var names;
        var i;
        if (target.id === "center_base") {
            this.view.raycaster.setFromCamera( this.view.mouse, this.view.camera );
            intersects = this.view.getIntersects();
            
            if (intersects.length > 0) {
                if (intersects[0].object.type === "Mesh") {
                    names = [intersects[0].object.parent.parent.name, intersects[0].object.parent.name, intersects[0].object.name];
                    this.view.centerDNAAtFrame(intersects[0].object.parent.parent.parent.name, intersects[0].object.parent.name);
                }
            }
        }
        if (target.id === "center_bp") {
            this.view.raycaster.setFromCamera( this.view.mouse, this.view.camera );
            intersects = this.view.getIntersects();
            
            if (intersects.length > 0) {
                if (intersects[0].object.type === "Mesh") {
                    names = [intersects[0].object.parent.parent.name, intersects[0].object.parent.name, intersects[0].object.name];
                    index = parseInt(names[1].split('_')[4]);
                    this.view.centerDNAAtFrame(intersects[0].object.parent.parent.parent.name, intersects[0].object.parent.parent.parent.getObjectByName("basepairs", true).children[index].name);
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
        var mol = this.model.dna_molecules[index];
        var out_str = "";
        var i,j;
        out_str += "#" + mol.sequence + "\n";
        for (i = 0; i < mol.sequence.length; i++) {
            out_str += "1 "+ (i+1).toString() + " ";
            for (j = 0; j < 9; j++) {
                out_str += mol.baseFramesWatson[i].or[j] + " ";
            }
            for (j = 0; j < 3; j++) {
                out_str += mol.baseFramesWatson[i].pos[j];
                if (j < 2)
                    out_str += " ";
                else 
                    out_str += "\n";
            }
        }
        for (i = 0; i < mol.sequence.length; i++) {
            out_str += "2 "+ (i+1).toString() + " ";
            for (j = 0; j < 9; j++) {
                out_str += mol.baseFramesCrick[i].or[j] + " ";
            }
            for (j = 0; j < 3; j++) {
                out_str += mol.baseFramesCrick[i].pos[j];
                if (j < 2)
                    out_str += " ";
                else 
                    out_str += "\n";
            }
        }

        return out_str;
    },

    makeBPFra : function (index) {
        var mol = this.model.dna_molecules[index];
        var out_str = "";
        var i,j;
        out_str += "#" + mol.sequence + "\n";
        for (i = 0; i < mol.sequence.length; i++) {
            out_str += "1 "+ (i+1).toString() + " ";
            for (j = 0; j < 9; j++) {
                out_str += mol.bpFrames[i].or[j] + " ";
            }
            for (j = 0; j < 3; j++) {
                out_str += mol.bpFrames[i].pos[j];
                if (j < 2)
                    out_str += " ";
                else 
                    out_str += "\n";
            }
        }

        return out_str;
    },

    makePDB : function (index) {
        var sequence = this.model.dna_molecules[index].sequence;
        var framesWatson = this.model.dna_molecules[index].baseFramesWatson;
        var framesCrick = this.model.dna_molecules[index].baseFramesCrick;
        var i,j;
        var total_atoms = 0;
        var out_str = "";
        var frame_or, frame_pos;
        var relative_atom_pos;
        var rel_pos, abs_pos;
        var name, atom_record;
        
        for (i = 0; i < framesWatson.length; i++) {
            frame_or = new THREE.Matrix3().fromArray(framesWatson[i].or).transpose();
            frame_pos = new THREE.Vector3().fromArray(framesWatson[i].pos);
            for (j = 0; j < idealBasesNames[sequence[i]].length; j++) {
                total_atoms++;
                relative_atom_pos = new THREE.Vector3().fromArray(idealBasesPositions[sequence[i]][j]);
                rel_pos = new THREE.Vector3().copy(relative_atom_pos).applyMatrix3(frame_or);
                abs_pos = new THREE.Vector3().copy(frame_pos).add(rel_pos);
                name = idealBasesNames[sequence[i]][j];

                atom_record = vsprintf('%-6s%5d  %3s  %2s  %4d    %8.3f%8.3f%8.3f \n', ['ATOM', total_atoms, name, "D"+sequence[i], i+1, abs_pos.x, abs_pos.y, abs_pos.z]);

                out_str += atom_record;
            }
        }
        for (i = 0; i < framesCrick.length; i++) {
            frame_or = new THREE.Matrix3().fromArray(framesCrick[i].or).transpose();
            //flip x and z axes
            frame_or.elements[3] = -frame_or.elements[3];
            frame_or.elements[4] = -frame_or.elements[4];
            frame_or.elements[5] = -frame_or.elements[5];
            frame_or.elements[6] = -frame_or.elements[6];
            frame_or.elements[7] = -frame_or.elements[7];
            frame_or.elements[8] = -frame_or.elements[8];
            frame_pos = new THREE.Vector3().fromArray(framesCrick[i].pos);
            for (j = 0; j < idealBasesNames[WCcomplement(sequence[i])].length; j++) {
                total_atoms++;
                atom_record = "";
                relative_atom_pos = new THREE.Vector3().fromArray(idealBasesPositions[WCcomplement(sequence[i])][j]);
                rel_pos = new THREE.Vector3().copy(relative_atom_pos).applyMatrix3(frame_or);
                abs_pos = new THREE.Vector3().copy(frame_pos).add(rel_pos);
                name = idealBasesNames[WCcomplement(sequence[i])][j];

                atom_record = vsprintf('%-6s%5d  %3s  %2s  %4d    %8.3f%8.3f%8.3f \n', ['ATOM', total_atoms, name, "D"+WCcomplement(sequence[i]), i+1+sequence.length, abs_pos.x, abs_pos.y, abs_pos.z]);

                out_str += atom_record;
            }
        }

        return out_str;
    }
};

