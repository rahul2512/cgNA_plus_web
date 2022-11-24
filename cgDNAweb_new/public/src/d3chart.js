import * as d3 from 'd3';

export default class Chart {
    constructor(width, height, coordinateType, chartType) {
        this.element = undefined;
        this.svg = undefined;
        this.width = width;
        this.height = height;
        this.margins = {top: height/5, left: width/8, right: width/30, bottom: height/5};
        this.tip = undefined;

        this.xScale = undefined;
        this.yScale = undefined;
        this.colorScale = undefined;

        this.xAxis = undefined;
        this.yAxis = undefined;

        this.line = undefined;
        this.coordType = coordinateType; //'deg', 'rad/5' or '\u212B'
        this.coords_to_show = 'curves'; //'curves' or 'cgDNA'
        this.chart_type = chartType; // 'monomer' or 'dimer'
        this.tip_step = undefined; // 'bp' or 'bps'

        //legend
        this.legend = undefined;
        this.legendParams = {x: (1/6)*this.width, y: (1/25)*this.height, hspacing: 0.2*this.width};
    }

    //==========================================================================
    //  Defaults)
    //==========================================================================

    init(element) {
        this.element = element;
        this.makeEmptySVG();
        this.makeDefaultScales();
        this.makeDefaultColors();
        this.makeDefaultAxes();
        this.makeDefaultLine();
        this.makeEmptyLegend();

        this.tip_step = 'bp';

        //Add groups to contain the data
        this.svg.append('g')
                .attr('class', 'data')
                .append('g')
                    .attr('class', 'curves')

        this.svg.select(".data")
            .append('g')
            .attr('class', 'sequences');
        for (let i = 1; i <= 4; i++) {
            this.svg.select(".data .sequences")
            .append(`seq_${i}`);
        }
        for (let i = 0; i < 4; i++) {
            this.svg.select('.data .curves')
                    .append('g')
                    .attr('id', `seq_${i+1}`)
                    .attr('class', 'coords')
                    .append('g')
                    .attr('class', 'circles');
        }
        this.svg.select('.data')
                .append('g')
                    .attr('class', 'cgDNA');
        for (let i = 0; i < 4; i++) {
            this.svg.select('.data .cgDNA')
                    .append('g')
                    .attr('id', `seq_${i+1}`)
                    .attr('class', 'coords')
                    .append('g')
                    .attr('class', 'circles');
        }

        this.addTip();

        //add grid:
        //this.svg.selectAll("line.horizontalGrid").data(this.yScale.ticks()).enter()
        //    .append("line")
        //    .attr(
        //        {
        //            "class":"horizontalGrid",
        //            "x1" : 0,//this.margins.right,
        //            "x2" : 10,//this.svg.width,
        //            "y1" : function(d){ console.log("line", d); return this.yScale(d);},
        //            "y2" : function(d){ return this.yScale(d);},
        //        })
        //    .style({
        //            "fill" : "none",
        //            "shape-rendering" : "crispEdges",
        //            "stroke" : "black",
        //            "stroke-width" : "1px"
        //        });

        //this.svg.selectAll("line.horizontalGrid").data(this.yScale.ticks()).each(function (d,i) {
        //    console.log(d);
        //});

    }

    makeEmptySVG() {
        const that = this;
        this.svg = d3.select(that.element).append('svg')
                                    .attr('preserveAspectRatio', 'xMidYMid meet')
                                    .attr('viewBox', `0 0 ${this.width} ${this.height}`)
                                    .attr('class', 'svg-content');
    }

    makeDefaultScales() {
        this.xScale = d3.scaleLinear()
                            .domain([0,10])
                            .range([this.margins.left, this.width-this.margins.right])
                            .clamp(true) //this is very important!! solves all problems of going outside domain
                            .nice();
        this.yScale = d3.scaleLinear()
                            .domain([-2,2])
                            .range([this.height-this.margins.bottom, this.margins.top])
                            .nice();
    }

    makeDefaultColors() {
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        this.colorScale.domain([0,10]);
    }

    makeDefaultAxes() {
        this.xAxis = d3.axisBottom(this.xScale)
                        .ticks(10);
        this.yAxis = d3.axisLeft(this.yScale)
                        .ticks(10);

        //add axes to svg
        this.svg.append('g')
                .attr('class', 'x-axis noselect')
                .attr('transform', `translate(0, ${this.height-this.margins.bottom})`)
                    .style('font-size', '14px')
                    .style('fill', 'none')
                    //.style('shape-rendering', 'crispEdges')
                    .style('shape-rendering', 'geometricPrecision')
                .call(this.xAxis);

        this.svg.append('g')
                .attr('class', 'y-axis noselect')
                .attr('transform', `translate(${this.margins.left}, 0)`)
                .call(this.yAxis)
                    .style('font-size', '14px')
                    .style('fill', 'none')
                    //.style('stroke', 'black')
                    //.style('shape-rendering', 'crispEdges');
                    .style('shape-rendering', 'geometricPrecision');

        //add axis labels to svg
        this.svg.select('.y-axis').append("text")
            .attr("transform", `translate(${-0.75*this.margins.left}, ${0.5*(this.height + this.margins.top - this.margins.bottom)})rotate(-90)`)  // text is drawn off the screen top left, move down and out and rotate
            .append('tspan')
            .style('fill', 'black')
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .text("Value");

        this.svg.select('.x-axis').append("text")
            .attr("transform", `translate(${0.5*(this.width + this.margins.left - this.margins.right)},${0.75*this.margins.bottom})`)  // centre below axis
            .append('tspan')
            .style('fill', 'black')
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .text("basepair");
    }

    makeDefaultLine() {
        const that = this;
        this.line =
            d3.line()
            .curve(d3.curveLinear)
            //.curve(d3.curveMonotoneX)
                //.defined(d => !isNaN(d))
                .x(function (d,i) {return that.xScale(i+1);})
                .y(function (d,i) {return that.yScale(d);});

        //add line group to svg:
        //this.svg.append('g')
                    //.attr('class','lines');
    }

    makeEmptyLegend() {
        this.legend = this.svg.append('g')
                          .attr('class', 'legend')
                          .style('font-size', '14px');

        this.legend.append('text')
            .style("font-size", "18px")
            .attr('transform', `translate(${0.1*this.legendParams.x}, ${4.*this.legendParams.y})`)
            .append('tspan')
            .attr('class', 'noselect')
            .attr('id', 'xtip');
    }

    addTip() {
        const that = this;
        this.tip = this.svg.append('g')
                        .attr("class", "mouse-effects");

        //black vertical line
        this.tip.append("path")
            .attr("class", "mouse-line")
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .style("opacity", "0");

        //rect to see if mouse is over chart
        this.tip.append('rect')
            .attr('class', 'detect')
            .attr('width',  that.width-that.margins.left-that.margins.right)
            .attr('height', that.height-that.margins.top-that.margins.bottom)
            .attr("transform", `translate(${that.margins.left},${that.margins.top})`)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseout', function() { // on mouse out hide line, circles and text
                d3.select(that.element)
                    .select(".mouse-line")
                    .style("opacity", "0");
                d3.select(that.element).selectAll(".mouse-circle circle")
                    .style("opacity", "0");
                that.legend.select('text')
                    .style("opacity", "0");
                that.legend.selectAll('.entry').select('.value')
                    .style("opacity", "0");
                that.legend.selectAll('.entry').select('.local_seq')
                    .style("opacity", "0");
            })
            .on('mouseover', function () {
                d3.select(that.element).select(".mouse-line")
                    .style("opacity", "1");
                d3.select(that.element).selectAll(".mouse-circle circle")
                    .style("opacity", "1");
                that.legend.select('text')
                    .style("opacity", "1");
                that.legend.selectAll('.entry').select('.value')
                    .style("opacity", "1");
                that.legend.selectAll('.entry').select('.local_seq')
                    .style("opacity", "1");
             })
            .on('mousemove', function() { // mouse moving over canvas
                let mouse = d3.mouse(this);
                let x0 = that.xScale.invert(mouse[0]+that.margins.left);
                let x_round = Math.round(x0);
                let x = that.xScale(x_round);
                let x_round_start1 = Math.round(x0)-1;

                // move the vertical line
                let chart = d3.select(that.element);
                chart.select(".mouse-line")
                    .transition().duration(50)
                    .attr("d", function() {
                        let eff_h = that.height-that.margins.bottom;
                        return `M${x},${eff_h} ${x},${that.margins.top}`;
                    });

                //move mouse circles:
                let data = that.svg.select(`.data .${that.coords_to_show}`);

                data.selectAll('.coords')
                    .each(function(d,i){
                        let coords = [];
                        if (!d3.select(this).select('path').empty())
                            coords = d3.select(this).select('path').datum();
                        else
                            return;

                        //console.log(coords);
                        let circle = that.svg.select(`.mouse-circle.id_${i+1}`);

                        let type = that.coordType === 'deg' ? '\u00B0' : ` ${that.coordType}`;
                        if (x_round_start1 < coords.length && x0>0) {
                            circle.style('opacity', 1);
                            circle
                                .transition().duration(50)
                                .attr("transform", `translate(${x},${that.yScale(coords[x_round_start1])})`);
                            that.legend.select('#entry'+i)
                                .select('.value > tspan')
                                .attr('x', '48')
                                .style('text-anchor', 'end')
                                .attr('y', '25')
                                .style('fill', that.colorScale(i))
                                .style('font-size', '1.0em')
                                .text(` ${coords[x_round_start1].toFixed(3) + type}`);
                        } else {
                            circle.style('opacity', 0);
                            that.legend.select('#entry'+i)
                                .select('tspan')
                                .text('');

                        }
                    });

                that.svg.select(".sequences").selectAll('.sequence')
                    .each(function(d,i) {
                        let padding_left = "  "
                        let padding_right = "  "
                        let unpadded_seq = d3.select(this).attr('seq');
                        let seq = padding_left+unpadded_seq+padding_right;
                        let entry_i = that.legend.select(`#entry${i}`);

                        if (that.chart_type=="dimer") {
                            if (x_round_start1 > unpadded_seq.length-2) {
                                entry_i
                                    .select('.local_seq')
                                    .style('opacity', '0');
                            } else {
                                entry_i
                                    .select('.local_seq')
                                    .style('opacity', '1');
                            }
                        } else {
                            if (x_round_start1 > unpadded_seq.length-1) {
                                entry_i
                                    .select('.local_seq')
                                    .style('opacity', '0');
                            } else {
                                entry_i
                                    .select('.local_seq')
                                    .style('opacity', '1');
                            }

                        }

                        entry_i
                            .select('.local_seq > tspan.left')
                            .attr('x', '9')
                            .attr('y', '10')
                            .style('fill', that.colorScale(i))
                            .style('font-size', '0.9em')
                            .text(function () {
                                return that.chart_type == "dimer"
                                    ? seq.substring(x_round_start1+padding_left.length-1, x_round_start1+padding_left.length)
                                    : seq.substring(x_round_start1+padding_left.length-1, x_round_start1+padding_left.length);
                            });

                        entry_i
                            .select('.local_seq > tspan.middle')
                            .attr('x', '18')
                            .attr('y', 10)
                            .style('fill', that.colorScale(i))
                            .style('font-size', '1.0em')
                            .style('font-weight', 'bold')
                            .text(function () {
                                return that.chart_type == "dimer"
                                    ? seq.substring(x_round_start1+padding_left.length, x_round_start1+padding_left.length+2)
                                    : seq.substring(x_round_start1+padding_left.length, x_round_start1+padding_left.length+1);
                            });

                        entry_i
                            .select('.local_seq > tspan.right')
                            //.attr('x', '38')
                            .attr('x', function () { return that.chart_type == "dimer" ? '38' : '28';})
                            .attr('y', 10)
                            .style('fill', that.colorScale(i))
                            .style('font-size', '0.9em')
                            .text(function () {
                                return that.chart_type == "dimer"
                                    ? seq.substring(x_round_start1+padding_left.length+2, x_round_start1+padding_left.length+3)
                                    : seq.substring(x_round_start1+padding_left.length+1, x_round_start1+padding_left.length+2);
                            });
                    });

                //add bp or bps index:
                that.legend.select('text > tspan')
                    .attr('y', '0')
                    .text(`${that.tip_step}: ${x_round}`);
             });


        //make tip invisible at the start
        d3.select(that.element)
            .select(".mouse-line")
            .style("opacity", "0");
        d3.select(that.element).selectAll(".mouse-circle circle")
            .style("opacity", "0");
        //tooltip.style("opacity", '0');
    }

    //==========================================================================
    //  Setters
    //==========================================================================

    setElement(new_element) {
        this.element = new_element;
    }

    setSVG(new_svg) {
        this.svg = new_svg;
    }

    setH(new_h) {
        this.height = new_h;
    }

    setW(new_w) {
        this.width = new_w;
    }

    setXLabel(xlabel) {
        this.svg.select('.x-axis').select("text > tspan")
                .text(xlabel);
    }

    setYLabel(ylabel) {
        this.svg.select('.y-axis').select("text > tspan")
                .text(ylabel);
    }

    setType(type) {
        this.tip_show_seq_part = type;

        if (type === 'monomer')
            this.tip_step = 'bp'
        else
            this.tip_step = 'bps'
    }

    changeCoordType(new_type) {
        if (new_type === 'curves') {
            this.coordType = 'deg';
            this.coords_to_show = 'curves';
        } else if (new_type === 'cgDNA') {
            this.coordType = 'rad/5';
            this.coords_to_show = 'cgDNA';
        }

        if (this.coords_to_show === 'curves') {
            this.svg.select('.data .cgDNA')
                .style('visibility', 'hidden');
            this.svg.select('.data .curves')
                .style('visibility', 'visible');
        } else if (this.coords_to_show === 'cgDNA') {
            this.svg.select('.data .cgDNA')
                .style('visibility', 'visible');
            this.svg.select('.data .curves')
                .style('visibility', 'hidden');
        }
        this.redraw_everything();
    }

    //==========================================================================
    //  Redraw
    //==========================================================================

    redraw_everything() {
        let [yMin, yMax] = this.findMaximalYRange();
        const middle = 0.5*(yMax-yMin)
        const offset = 0.2*Math.abs(middle);


        //ADJUST AXES AND SCALES
        let [xMin, xMax] = this.findMaximalXRange();
        if (this.chart_type == "dimer")
            xMax -= 1;
        this.xScale.domain([xMin+0.5,xMax+0.5]);
        this.yScale.domain([yMin-offset, yMax+offset]);
        this.xAxis.ticks(d3.min(xMax, 10));
        this.yAxis.ticks(8);

        this.svg.select('.x-axis')
                .call(this.xAxis);
        this.svg.select('.y-axis')
                .call(this.yAxis);

        //remove non-integer ticks
        this.svg.selectAll('.x-axis .tick')
		    .each(function (d) {
		    	const da = parseFloat(d3.select(this).select('text').text());
		    	if ((da*10.0)%2 || (da*10.0)%5)
		    		d3.select(this).remove();
		    	d3.select(this).select('text').text(parseInt(da));
		    });

        let draw_circles = true;
        if ((this.chart_type === "monomer" && xMax > 30) || (this.chart_type === "dimer" && xMax > 29)) {
            draw_circles = false;
        }
        for (let i=1; i<5;i++)
            this.redraw(i, this.coordType, draw_circles);

        //console.log(yMin, yMax)
        if (yMin === undefined) {
            this.xScale.domain([0,10]);
            this.yScale.domain([-2, 2]);
            this.xAxis.ticks(10);
            this.yAxis.ticks(10);

            this.svg.select('.x-axis')
                    .call(this.xAxis);

            this.svg.select('.y-axis')
                    .call(this.yAxis);
        }
    }

    redraw(id, coordTypeToPlot, draw_circles=true) {
        const that = this;

        //CHECK IF THERE IS ACTUALLY DATA IN THIS SLOT:
        if (this.svg.select(".data .sequences").select(`seq_${id}`).empty()) {
            return;
        }

        let line = this.line;

        //redraw circles and lines:
        this.svg.select(`.data .curves #seq_${id} .circles`)
            .selectAll('circle')
                .each(function(d,i){
                    d3.select(this)
                        .attr('cx', that.xScale(i+1))
                        .attr('cy', that.yScale(d))
                        .style('opacity', '1');

                    if (!draw_circles) {
                        d3.select(this)
                            .style('opacity', '0');
                    }
                });


        this.svg.select(`.data .curves #seq_${id}`)
                .selectAll("path")
                    .each(function(d,i) {
                        //console.log(d);
                        d3.select(this)
                            .attr('d', line(d));
                    });

        this.svg.select(`.data .cgDNA #seq_${id} .circles`)
            .selectAll('circle')
                .each(function(d,i){
                    d3.select(this)
                        .attr('cx', that.xScale(i+1))
                        .attr('cy', that.yScale(d))
                        .style('opacity', '1');
                    if (!draw_circles) {
                        d3.select(this)
                            .style('opacity', '0');
                    }
                });

        this.svg.select(`.data .cgDNA #seq_${id}`)
                .selectAll("path")
                    .each(function(d,i) {
                        d3.select(this)
                            .attr('d', line(d));
                    });

        if (this.coordType === 'deg') {
            this.svg.select('.data .cgDNA')
                .style('visibility', 'hidden');
        } else if (this.coordType === 'rad/5') {
            this.svg.select('.data .curves')
                .style('visibility', 'hidden');
        }
    }

    findMaximalXRange() {
        let seq_lengths = [];
        this.svg.selectAll('.data .sequences .sequence')
                .each(function() {
                    seq_lengths.push(d3.select(this).attr('seq').length);//.select('path.line').data());
                });

        return [0, d3.max(seq_lengths)];
    }

    findMaximalYRange() {
        let maxes = [];
        let mins = [];
        this.svg.selectAll(`.data .${this.coords_to_show} .coords`)
                .each(function() {
                    if (!d3.select(this).select('path.line').empty()) {
                        maxes.push(d3.max(d3.select(this).select('path.line').datum()));
                        mins.push(d3.min(d3.select(this).select('path.line').datum()));
                    }
                });

        return [d3.min(mins), d3.max(maxes)];
    }

    //==========================================================================
    //  Adding and removing data
    //==========================================================================

    addData(id, seq, data_cgDNA, data_curves, coordTypeToPlot) {
        const that = this;
        const index = id-1;

        //CHECK IF THERE IS ALREADY DATA IN THIS SLOT:
        if (!this.svg.select(".data .sequences").select(`seq_${id}`).empty()) {
            //remove it:
            this.svg.select(".data .sequences")
                .select(`seq_${id}`)
                .attr('seq', '');
            //console.log(this.svg.select(".data .curves .seq_"+id.toString()))
            this.svg.select(`.data .curves #seq_${id}`).select("path")
                    .remove();
            this.svg.select(`.data .cgDNA #seq_${id} .line`)
                    .remove();
            this.svg.selectAll(`.data .curves #seq_${id} .circles circle`)
                    .remove();
            this.svg.selectAll(`.data .cgDNA #seq_${id} .circles circle`)
                    .remove();
        }

        this.svg.select(".data .sequences")
            .select(`seq_${id}`)
            .attr("class", "sequence")
            .attr("seq", seq);


        //============================================================
        //PLOT THINGS
        //============================================================

        let line = this.line;

        //add little circles:
        //console.log(data_curves)
        this.svg.select(`.data .curves #seq_${id} .circles`)
            .selectAll('circle')
                .data(data_curves)
                .enter().append('circle')
                .attr('cx', function(d,i){return that.xScale(i+1);})
                .attr('cy', function(d){return that.yScale(d);})
                .attr('stroke', this.colorScale(index))
                .attr('fill', this.colorScale(index))

        this.svg.select(`.data .curves #seq_${id}`)
                .append("path")
                .attr('class', 'line')
                .data([data_curves])
                .attr('d', line(data_curves))
                .attr('stroke', this.colorScale(index))

        this.svg.select(`.data .cgDNA #seq_${id} .circles`)
            .selectAll('circle')
                .data(data_cgDNA)
                .enter().append('circle')
                .attr('cx', function(d,i){return that.xScale(i+1);})
                .attr('cy', function(d){return that.yScale(d);})
                .attr('stroke', this.colorScale(index))
                .attr('fill', this.colorScale(index))

        this.svg.select(`.data .cgDNA #seq_${id}`)
                .append("path")
                .attr('class', 'line')
                .data([data_cgDNA])
                .attr('d', line(data_cgDNA))
                .attr('stroke', this.colorScale(index))

        this.svg.selectAll(`.data .circles`).selectAll('circle')
                .attr('r', "2.5")
                .attr('mix-blend-mode', 'overlay')
                .attr('stroke-width', '2px')
                .style('opacity', '1')
                .style('shape-rendering', 'geometricPrecision');

        this.svg.selectAll(`.data .line`)
                .attr('mix-blend-mode', 'overlay')
                .attr('fill', 'none')
                .attr('stroke-width', '2px')
                .style('opacity', '1')
                .style('shape-rendering', 'geometricPrecision');

        this.redraw_everything();

        if (this.coords_to_show === 'curves') {
            this.svg.select('.data .cgDNA')
                .style('visibility', 'hidden');
            this.svg.select('.data .curves')
                .style('visibility', 'visible');
        } else if (this.coords_to_show === 'cgDNA') {
            this.svg.select('.data .cgDNA')
                .style('visibility', 'visible');
            this.svg.select('.data .curves')
                .style('visibility', 'hidden');
        }

        //add to the legend, but only once:
        if (this.legend.select(`#entry${index}`).empty()) {
            let legend_entry = this.legend.append('g')
                                .attr('class', 'entry')
                                .attr('id', `entry${index}`);

            legend_entry.append('rect')
                .attr('class', 'color_rect')
                .attr('width', 10)
                .attr('height', 10)
                .attr('fill', this.colorScale(index))
                .attr('stroke', this.colorScale(index))
                .attr('fill-opacity', '1')
                .attr('transform', `translate(0,0)`);

            legend_entry.append('text')
                .attr("text-anchor", "start")
                .attr('transform', `translate(20,11)`)
                .style('font-size', '18px')
                .attr('class', 'noselect')
                .text(`seq ${index+1}`);

            //a tooltip
            legend_entry.append('text')
                .attr('class', 'value')
                .attr('transform', `translate(10,15)`)
                .append('tspan')
                .attr('class', 'noselect');

            let local_seq = legend_entry.append('text')
                .attr('class', 'local_seq')
                .attr('transform', `translate(10,15)`)

            local_seq.append('tspan')
                .attr('class', 'left noselect');
            local_seq.append('tspan')
                .attr('class', 'middle noselect');
            local_seq.append('tspan')
                .attr('class', 'right noselect');

            legend_entry
                .attr('transform', `translate(${this.legendParams.x+this.legendParams.hspacing*index},${this.legendParams.y})`);

            //TODO make rect over legend entry and have these two operate on that, so no effects on both little coloured box AND text.
            //legend_entry
            legend_entry.append('rect')
                .attr('class', 'legend_detect')
                .attr('width', 0.8*this.legendParams.x)
                .attr('height', this.legendParams.y)
                .style('opacity', '0')
                .on('mouseout', function() { //not sure if I need this at all
                    that.svg.selectAll(`.data #seq_${id} .line`)
                        .attr('stroke-width', '2px')
                    that.svg.selectAll(`.data #seq_${id} .circles`).selectAll('circle')
                        .attr("r", "2.5");
                })
                .on('mouseover', function () {
                    that.svg.selectAll(`.data #seq_${id} .line`)
                        .attr('stroke-width', '4px')
                    that.svg.selectAll(`.data #seq_${id} .circles`).selectAll('circle')
                        .attr("r", "5.5");
                 })
                //.on('click', function () {
                //    console.log("clicked legend entry")
                //    //TODO DOESN'T WORK IF MAKING LINE INVISIBLE, THEN CHANGING COORDINATES. actually, after changing them a few times, weirder things seem to be happening.... but that maybe due to the axes not scaling properly atm.
                //    console.log(d3.select(this.parentNode).select('.color_rect'));
                //    let rect = d3.select(this.parentNode).select('.color_rect');
                //    console.log({rect});
                //    if (rect.attr('fill-opacity') == '1') {
                //        rect.attr('fill-opacity', '0');
                //        console.log(rect.node().parentNode.parentNode);
                //        that.svg.select(`.data .${+that.coords_to_show} #seq_${id}`)
                //            .style('visibility', 'hidden');
                //        that.tip.select(`.mouse-circle.id_'${id}`)
                //            .style('visibility', 'hidden');
                //        legend_entry.select('text.value')
                //            .style('visibility', 'hidden');
                //    } else {
                //        rect.attr('fill-opacity', '1');
                //        that.svg.select(`.data .${that.coords_to_show} #seq_'+id`)
                //            .style('visibility', 'visible');
                //        that.tip.select(`.mouse-circle.id_${id}`)
                //            .style('visibility', 'visible');
                //        legend_entry.select('text.value')
                //            .style('visibility', 'visible');
                //    }
                //})
                //.raise();

            //colored circle
            this.tip.append('g')
                    .attr('class',`mouse-circle id_${id}`)
                    .append('circle')
                        .attr('r',6)
                        .attr('stroke', this.colorScale(index))
                        .attr('fill', 'none')
                        .attr('stroke-width', '1.5px')
                        .style('opacity', '0');
            this.tip.select('.detect').raise();
        }
    }

    removeData(id) {
        const that = this;
        const index = id-1;

        //CHECK IF THERE IS ALREADY DATA IN THIS SLOT:
        if (this.svg.select(".data .sequences").select(`seq_${id}`).empty())
            return;

        this.svg.select(".data .sequences")
            .select(`seq_${id}`)
                .attr('seq','');

        this.svg.select(`.data .curves #seq_${id} .line`)
                .remove();
        this.svg.select(`.data .cgDNA #seq_${id} .line`)
                .remove();
        this.svg.selectAll(`.data .curves #seq_${id} .circles circle`)
                .remove();
        this.svg.selectAll(`.data .cgDNA #seq_${id} .circles circle`)
                .remove();
        this.svg.select(`.legend #entry${index}`)
                .remove();

        this.redraw_everything();

        //remove colored circle
        //this.tip.select('.id_'+id.toString()).remove();
        this.svg.select(`.mouse-circle.id_${id}`).style('opacity', 0);
    }
}
