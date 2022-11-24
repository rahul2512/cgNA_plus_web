function Chart (width, height, coordinateType) {
    this.element = undefined;
    this.svg = undefined;
    this.width = width;
    this.height = height;
    this.margins = {top: height/10, left: width/8, right: width/30, bottom: height/5};
    this.tip = undefined;
    this.tiprect = undefined;

    this.tiprect_h_start = 25;
    this.tiprect_h = 40;
    this.tiprect_w = 85;

    this.xScale = undefined;
    this.yScale = undefined;
    this.colorScale = undefined;

    this.xAxes = [];
    this.yAxes = [];

    this.xLabels = [];
    this.yLabels = [];

    this.lines = [];
    this.data_curves = [null, null, null, null, null];
    this.data_cgDNA = [null, null, null, null, null];
    this.amountData = 0; //amount of data series in this graph
    this.coordType = coordinateType; //'deg', 'rad/5' or '\u212B'
    this.sequences = [null, null, null, null, null];
    this.tip_show_seq_part = 'monomer'; // 'monomer' or 'dimer'
    this.tip_step = undefined; // 'monomer' or 'dimer'

    //legend
    this.legend = undefined;
    this.legendParams = {x: 3*this.width/4, y: this.height/8, vspacing: this.height/20};
}

Chart.prototype = {
    //==========================================================================
    //  Defaults)
    //==========================================================================

    init : function (element) {
        this.element = element;
        this.makeEmptySVG();
        this.makeDefaultScales();
        this.makeDefaultColors();
        this.makeDefaultAxes();
        this.makeDefaultLines();
        this.makeEmptyLegend();


        this.tip_step = 'bp';

        this.addTip();

        this.svg.append('g')
                .attr('class', 'sequences');
        for (var i = 1; i <= 4; i++) {
            this.svg.select(".sequences")
            .append("seq"+i.toString())
        }

        //add axes to svg
        this.svg.append('g')
                .attr('class', 'axis x')
                .attr('transform', 'translate(0,' + (this.height-this.margins.bottom).toString() + ')')
                    .style('font-size', '14px')
                    .style('fill', 'none')
                    //.style('shape-rendering', 'crispEdges')
                    .style('shape-rendering', 'geometricPrecision')
                .call(this.xAxes[0]);

        this.svg.append('g')
                .attr('class', 'axis y')
                .attr('transform', 'translate(' + this.margins.left + ',' + '0)')
                .call(this.yAxes[0])
                    .style('font-size', '14px')
                    .style('fill', 'none')
                    //.style('stroke', 'black')
                    //.style('shape-rendering', 'crispEdges');
                    .style('shape-rendering', 'geometricPrecision');

        //add axis labels to svg
        this.yLabel = this.svg.append("text")
                                .attr("text-anchor", "middle")
                                .attr("transform", "translate("+ this.margins.left/4 +","+(this.height/2 + (-this.margins.bottom + this.margins.top)/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                                .style("font-size", "18px")
                                .text("Value");

        this.xLabel = this.svg.append("text")
                                .attr("text-anchor", "middle")
                                .attr("transform", "translate("+ (this.width/2 + (this.margins.left-this.margins.right)/2) +","+(this.height-(this.margins.bottom/6))+")")  // centre below axis
                                .style("font-size", "18px")
                                .text("basepair");

        /*
        //add grid:
        this.svg.selectAll("line.horizontalGrid").data(this.yScale.ticks()).enter()
            .append("line")
            .attr(
                {
                    "class":"horizontalGrid",
                    "x1" : 0,//this.margins.right,
                    "x2" : 10,//this.svg.width,
                    "y1" : function(d){ console.log("line", d); return this.yScale(d);},
                    "y2" : function(d){ return this.yScale(d);},
                })
            .style({
                    "fill" : "none",
                    "shape-rendering" : "crispEdges",
                    "stroke" : "black",
                    "stroke-width" : "1px"
                });

        this.svg.selectAll("line.horizontalGrid").data(this.yScale.ticks()).each(function (d,i) {
            console.log(d);
        });
        */
        
    },

    makeEmptySVG : function () {
        var that = this;
        this.svg = d3.select(that.element).append('svg')
                                    //.attr('width', this.width)
                                    //.attr('height', this.height)
                                    .attr('preserveAspectRatio', 'xMidYMid meet')
                                    .attr('viewBox', "0 0 "+this.width+" "+this.height)
                                    .attr('class', 'svg-content');
    },

    makeDefaultScales : function () {
        this.xScale = d3.scaleLinear()
                            .domain([0,10])
                            .range([this.margins.left,this.width-this.margins.right])
                            .nice();
        this.yScale = d3.scaleLinear()
                            .domain([-2,2])
                            .range([this.height-this.margins.bottom,this.margins.top])
                            .nice();
    },

    makeDefaultColors : function () {
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        this.colorScale.domain([0,10]);
    },

    makeDefaultAxes : function () {
        this.xAxes.push(d3.axisBottom(this.xScale)
                            .ticks(10));
        this.yAxes.push(d3.axisLeft(this.yScale).ticks(10));
    },

    makeDefaultLines : function () {
        var that = this;
        this.lines.push(
            d3.line()
                .x(function (d,i) {return that.xScale(i+1);})
                .y(function (d,i) {return that.yScale(d);}));

        //add line group to svg:
        this.svg.append('g')
                    .attr('class','lines');
    },

    makeEmptyLegend : function () {
        this.legend = this.svg.append('g')
                          .attr('class', 'legend')
                          .attr('transform', 'translate(' + 10 + ',' + 10 + ')')
                          .style('font-size', '14px');
    },

    addTip : function () {
        var that = this;
        this.tip = this.svg.append('g')
                            .attr("class", "mouse-effects");


        //black vertical line 
        this.tip.append("path")
            .attr("class", "mouse-line")
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .style("opacity", "0");

        //tooltip itself
        var tooltip = this.tip.append('g') //used to be called text
            .attr('class', 'tooltip');
            //.attr('class', 'text');
        //var tip_h = 100;
        //var tip_w = 70;
        tooltip.append('rect')
            .attr('width', that.tiprect_w)
            //.attr('height', tip_h) //normal value
            .attr('height', this.tiprect_h_start) //new value for dynamic changing size
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('opacity', '0.95')
            .attr('transform', 'translate('+ 10 + ',' + ((-that.margins.top+that.height-that.margins.bottom-that.tiprect_h)/3).toString() + ')');
            //.style("opacity", "0");
        var tip_content = tooltip.append('text')
            .attr('transform', 'translate('+ 10 + ',' + ((-that.margins.top+that.height-that.margins.bottom-that.tiprect_h)/3 + 15).toString() + ')')
            .append('tspan');
            //.text('tip\n tip2');

        //rect to see if mouse is over chart
        this.tip.append('rect')
            .attr('class', 'detect')
            .attr('width',that.width-that.margins.left-that.margins.right)
            .attr('height',that.height-that.margins.top-that.margins.bottom)
            .attr("transform", 'translate(' + that.margins.left + ',' + that.margins.top + ')')
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseout', function() { // on mouse out hide line, circles and text
                d3.select(that.element)
                    .select(".mouse-line")
                    .style("opacity", "0");
                d3.select(that.element).selectAll(".mouse-circle circle")
                    .style("opacity", "0");
                tooltip.style("opacity", '0');
            })
            .on('mouseover', function () {
                d3.select(that.element).select(".mouse-line")
                    .style("opacity", "1");
                d3.select(that.element).selectAll(".mouse-circle circle")
                    .style("opacity", "1");
                tooltip.style("opacity", '0.95');
             })
            .on('mousemove', function() { // mouse moving over canvas
                var mouse = d3.mouse(this);
                var x0 = that.xScale.invert(mouse[0]+that.margins.left);
                var x_round = Math.round(x0);
                var x = that.xScale(x_round);
                var x_round_start1 = Math.round(x0)-1;

                // move the vertical line
                var chart = d3.select(that.element);
                chart.select(".mouse-line")
                    .transition().duration(50)
                    .attr("d", function() {
                        var d = "M" + x + "," + (that.height-that.margins.bottom).toString();
                        d += " " + x + "," + that.margins.top;
                        return d;
                    });

                 //move mouse circles:
                var mcs = chart.selectAll(".mouse-circle");
                var data;
                if (that.coordType === 'deg' || that.coordType === '\u212B')
                    data = that.data_curves;
                else
                    data = that.data_cgDNA;

                for (var i = 0; i < data.length; i++) {
                    if (data[i] !== null) {
                        if (data[i][x_round_start1] !== undefined) {
                            chart.select(".mouse-circle.id_"+(i+1).toString()).style('opacity', 1);
                            var cmc = chart.select(".mouse-circle.id_"+(i+1).toString());
                        //console.log(cmc);
                            cmc
                                .transition().duration(50)
                                .attr("transform", 'translate(' + x + ',' + that.yScale(data[i][x_round_start1]) + ')');
                        } else {
                            chart.select(".mouse-circle.id_"+(i+1).toString()).style('opacity', 0);
                        }
                    }
                }

                tooltip
                    .transition().duration(50)
                    .attr("transform", function () {
                        if (x + 10 + that.tiprect_w + parseInt(tooltip.select('rect').attr('width')) > that.width+that.margins.right+that.margins.left) {
                            return 'translate(' + (x-that.tiprect_w-20).toString() + ',' + 0 + ')';
                        } else {
                            return 'translate(' + x + ',' + 0 + ')';
                        }}
                    );
                    //.attr("transform", 'translate(' + x + ',' + 0 + ')');
                tip_content.text(that.tip_step+': ' + x_round)
                            .attr('x','4');
                for (var i = 0; i < data.length; i++) {
                    if (data[i] !== null && data[i][x_round_start1] !== undefined) {
                        if (that.tip_show_seq_part === 'monomer') {
                            tip_content.append('tspan')
                                .attr('x', '4')
                                .attr('dy', '20')
                                //.attr('dx', '4')
                                .style('fill', that.colorScale(i))
                                .text(function () {return (i+1).toString()+': '})
                                .style('font-weight', "bold")
                                .style('font-size', "1.5rem");
                            tip_content.append('tspan')
                                .attr('x', '30')
                                .attr('dy', '0')
                                //.attr('dx', '4')
                                .style('fill', that.colorScale(i))
                                .text(function () {return x_round_start1 === 0 ? " " : ""+ that.sequences[i][x_round_start1-1]});
                            tip_content.append('tspan')
                                .attr('dx', '0')
                                .attr('dy', '0')
                                .style('fill', that.colorScale(i))
                                .text(""+that.sequences[i][x_round_start1])
                                .style('font-weight', "bold")
                                .style('font-size', "1.3rem");
                            tip_content.append('tspan')
                                .attr('dx', '0')
                                .attr('dy', '0')
                                .style('fill', that.colorScale(i))
                                .text(function () {return x_round_start1 < that.sequences[i].length-1 ? ""+ that.sequences[i][x_round_start1+1] : " "});
                        } else if (that.tip_show_seq_part === 'dimer') {
                            tip_content.append('tspan')
                                .attr('x', '4')
                                .attr('dy', '20')
                                //.attr('dx', '4')
                                .style('fill', that.colorScale(i))
                                .text(function () {return (i+1).toString()+': '})
                                .style('font-weight', "bold")
                                .style('font-size', "1.5rem");
                            tip_content.append('tspan')
                                .attr('x', '30')
                                .attr('dy', '0')
                                .style('fill', that.colorScale(i))
                                .text(function () {return x_round_start1 === 0 ? " " : ""+ that.sequences[i][x_round_start1-1]});
                            tip_content.append('tspan')
                                .attr('dx', '0')
                                .attr('dy', '0')
                                .style('fill', that.colorScale(i))
                                .text(""+that.sequences[i][x_round_start1])
                                .style('font-weight', "bold")
                                .style('font-size', "1.3rem");
                            tip_content.append('tspan')
                                .attr('dx', '0')
                                .attr('dy', '0')
                                .style('fill', that.colorScale(i))
                                .text(function () {return x_round_start1 < that.sequences[i].length-1 ? ""+ that.sequences[i][x_round_start1+1] : " "})
                                .style('font-weight', "bold")
                                .style('font-size', "1.3rem");
                            tip_content.append('tspan')
                                .attr('dx', '0')
                                .attr('dy', '0')
                                .style('fill', that.colorScale(i))
                                .text(function () {return x_round_start1 < that.sequences[i].length-2 ? ""+ that.sequences[i][x_round_start1+2] : " "});
                        }


                        //value of coordinate
                        var type = that.coordType==='deg'? '\u00B0' : " "+that.coordType;
                        tip_content.append('tspan')
                            .attr('x', '4')
                            .attr('dy', 20) //dy was 20
                            .style('fill', that.colorScale(i))
                            .text(' '+data[i][x_round_start1].toFixed(3)+ type);
                    }
                }

             });


        //make tip invisible at the start
        d3.select(that.element)
            .select(".mouse-line")
            .style("opacity", "0");
        d3.select(that.element).selectAll(".mouse-circle circle")
            .style("opacity", "0");
        tooltip.style("opacity", '0');

    },

    //==========================================================================
    //  Setters
    //==========================================================================
    setElement : function (new_element) {
        this.element = new_element;
    },

    setSVG : function (new_svg) {
        this.svg = new_svg;
    },

    setH : function (new_h) {
        this.height = new_h;
    },

    setW : function (new_w) {
        this.width = new_w;
    },

    setXLabel : function (xlabel) {
        this.xLabel.text(xlabel);
    },

    setYLabel : function (ylabel) {
        this.yLabel.text(ylabel);
    },

    setType : function (type) {
        this.tip_show_seq_part = type;

        if (type === 'monomer')
            this.tip_step = 'bp'
        else
            this.tip_step = 'bps'
    },

    changeCoordType : function (new_type) {
        if (new_type === 'curves+') {
            if (this.coordType === 'rad/5') {
                this.coordType = 'deg';
            } //otherwise nothing
        } else if (new_type === 'cgDNA') {
            if (this.coordType === 'deg') {
                this.coordType = 'rad/5';
            } //otherwise nothing
        }
        this.refresh();
    },

    //==========================================================================
    //  Refresh
    //==========================================================================

    refresh : function () {
        var data_to_plot;
        if (this.coordType === 'deg')
            data_to_plot = this.data_curves;
        else
            data_to_plot= this.data_cgDNA;
        //FIND NEW MIN/MAX OF ALL

        var yMax = -1e5;//this.data[0][0];
        var yMin = 1e5;//this.data[0][0];
        var xMax = -1e5;//this.data[0].length;
        var xMin = 1;

        if (this.amountData === 0) {
            yMax = -2;//this.data[0][0];
            yMin = 2;//this.data[0][0];
            xMax = 10;//this.data[0].length;
            xMin = 1;
        }

        for (var i = 0; i < data_to_plot.length; i++) {
            if (data_to_plot[i] === null)
                continue;

            var d = data_to_plot[i];
            if (d.length > xMax)
                xMax = d.length;
            if (d3.max(d) > yMax)
                yMax = d3.max(d);
            if (d3.min(d) < yMin)
                yMin = d3.min(d);
        }

        //ADJUST AXES AND SCALES
        this.xScale.domain([xMin,xMax]);
        this.yScale.domain([yMin, yMax]);
        this.xAxes[0].ticks(d3.min(xMax, 10));
        this.yAxes[0].ticks(8);

        this.svg.select('.axis.x')
                .call(this.xAxes[0]);

        this.svg.select('.axis.y')
                .call(this.yAxes[0]);

        var line = this.lines[0];
        for (var i = 0; i < data_to_plot.length; i++) {
            if (data_to_plot[i] === null)
                continue;
            this.svg.select(".line.l"+i)
                    .attr('d', line(data_to_plot[i]));
        }
    },

    //==========================================================================
    //  Adding and removing data
    //==========================================================================

    addData : function (id, seq, data, data_curves, coordTypeToPlot) {
        var that = this;
        //var dataScaled = data.map( function(x) {return that.multFactor*x;});
        //var data_curves;
        //if (this.coordType === '\u212B')
        //    data_curves = data;
        //else
        //    data_curves = data.map( function(x) {return 11.5*x;});

        var index = id-1;


        //CHECK IF THERE IS ALREADY DATA IN THIS SLOT:
        var already_exists = true;
        if (this.data_cgDNA[index] === null)
            already_exists = false;

        //ADD IT OR OVERRIDE IT
        this.data_cgDNA[index] = data;
        this.data_curves[index] = data_curves;
        this.sequences[index] = seq;

        this.svg.select(".sequences")
            .select("seq"+id.toString())
            .attr("seq", seq);


        //============================================================
        //PLOT THINGS
        //============================================================

        //FIND NEW MIN/MAX OF ALL
        var yMax = -1e5;
        var yMin = 1e5;
        var xMax = -1e5;
        var xMin = 1;

        var data_to_plot;
        if (coordTypeToPlot === 'curves+')
            data_to_plot = that.data_curves;
        else
            data_to_plot= that.data_cgDNA;

        console.log(data_to_plot);

        for (var i = 0; i < data_to_plot.length; i++) {
            if (data_to_plot[i] === null)
                continue;

            var d = data_to_plot[i];
            if (d.length > xMax)
                xMax = d.length;
            if (d3.max(d) > yMax)
                yMax = d3.max(d);
            if (d3.min(d) < yMin)
                yMin = d3.min(d);
        }

        //ADJUST AXES AND SCALES
        this.xScale.domain([xMin,xMax]);
        this.yScale.domain([yMin, yMax]);
        this.xAxes[0].ticks(d3.min(xMax, 10));
        this.yAxes[0].ticks(8);

        this.svg.select('.axis.x')
                .call(this.xAxes[0]);

	//REMOVE NON INTEGER TICK MARKS:
	this.svg.selectAll('.axis.x .tick')
		.each(function (d) {
			var da = parseFloat(d3.select(this).select('text').text());
			if ((da*10.0)%2 || (da*10.0)%5)
				d3.select(this).remove();
			d3.select(this).select('text').text(parseInt(da));
		});

        this.svg.select('.axis.y')
                .call(this.yAxes[0]);

        var line = this.lines[0];

        if (!already_exists) {
            this.svg.select('.lines')
                    .append("path")
                    .attr('class', 'line'+' l'+ index.toString())
                    .data(data_to_plot[index])
                    .attr('d', line(data_to_plot[index]))
                    .attr('mix-blend-mode', 'overlay')
                    .attr('stroke', this.colorScale(index))
                    .attr('fill', 'none')
                    .attr('stroke-width', '2px')
                    .style('opacity', '1')
                    .style('shape-rendering', 'geometricPrecision');

            //add to the legend, but only once:
            var legend_entry = this.legend.append('g')
                                .attr('class', 'entry'+index);

            legend_entry.append('rect')
                .attr('width', 10)
                .attr('height', 10)
                .attr('fill', this.colorScale(index))
                .attr('stroke', this.colorScale(index))
                .attr('transform', 'translate(' + this.legendParams.x + ',' + (this.legendParams.y+this.legendParams.vspacing*index).toString() + ')');

            legend_entry.append('text')
                .attr("text-anchor", "start")
                .attr('x', this.legendParams.x + 20)
                .attr('y', this.legendParams.y+this.legendParams.vspacing*index + 9)
                .style('font-size', '18px')
                //.style('text-shadow', '0 0 2px #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 1px 1px #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff')
                .text('seq ' + (index+1).toString());
        } else {
            this.svg.select(".line.l"+index)
                    .attr('d', line(data_to_plot[index]));
        }

        //add tooltip: TODO also only add this once?
        if (!already_exists) {
            //colored circle
            this.tip.append('g')
                    //.attr('class','mouse-circle ' + 'id_'+id.toString())
                    .attr('class','mouse-circle ' + 'id_'+id.toString())
                    .append('circle')
                        .attr('r',6)
                        .attr('stroke', this.colorScale(index))
                        .attr('fill', 'none')
                        .attr('stroke-width', '1.5px')
                        .style('opacity', '0');
            this.tip.select('.detect').raise();
            var current_height = parseInt(this.tip.select('.tooltip').select('rect').attr('height'));
            this.tip.select('.tooltip').select('rect').attr('height',  (current_height+this.tiprect_h).toString());
        }

        //change previous ones:
        for (var i = 0; i < data_to_plot.length; i++) {
            if (data_to_plot[i] === null)
                continue;

            this.svg.select(".line.l"+i)
                    .attr('d', line(data_to_plot[i]));
        }
        

    },

    removeData : function (id) {
        var that = this;
        var index = id-1;

        //CHECK IF THERE IS ALREADY DATA IN THIS SLOT:
        var already_exists = true;
        if (this.data_cgDNA[index] === null)
            already_exists = false;

        this.svg.select(".sequences")
            .select("seq"+id.toString())
            .attr("seq", null);

        this.data_cgDNA[index] = [];//null;
        this.data_curves[index] = [];//null;
        //this.sequences[index] = null;

        //============================================================
        //PLOT THINGS
        //============================================================

        //FIND NEW MIN/MAX OF ALL
        var yMax = -1e5;
        var yMin = 1e5;
        var xMax = -1e5;
        var xMin = 1;

        var data_to_plot;
        if (this.coordType === 'deg')
            data_to_plot = that.data_curves;
        else
            data_to_plot= that.data_cgDNA;

        for (var i = 0; i < data_to_plot.length; i++) {
            if (data_to_plot[i] === null)
                continue;

            var d = data_to_plot[i];
            if (d.length > xMax)
                xMax = d.length;
            if (d3.max(d) > yMax)
                yMax = d3.max(d);
            if (d3.min(d) < yMin)
                yMin = d3.min(d);
        }

        //ADJUST AXES AND SCALES
        this.xScale.domain([xMin,xMax]);
        this.yScale.domain([yMin, yMax]);
        this.xAxes[0].ticks(d3.min(xMax, 10));
        this.yAxes[0].ticks(8);

        this.svg.select('.axis.x')
                .call(this.xAxes[0]);

        this.svg.select('.axis.y')
                .call(this.yAxes[0]);

        var line = this.lines[0];

        if (already_exists) {
            this.svg.select('.lines')
                    .select('.line.l'+ index.toString()).remove();

            //remove from the legend:
            this.legend.select('.entry'+index.toString()).remove();
        }


        //remove tooltip
        if (already_exists) {
            //colored circle
            this.tip.select('.id_'+id.toString()).remove();

            //Make the tip smaller again here:
            //this.tip.select('.detect').raise();
            var current_height = parseInt(this.tip.select('.tooltip').select('rect').attr('height'));
            this.tip.select('.tooltip').select('rect').attr('height',  (current_height-this.tiprect_h).toString());
        }

        this.data_cgDNA[index] = null;
        this.data_curves[index] = null;
        this.sequences[index] = null;

        //change previous ones:
        for (var i = 0; i < data_to_plot.length; i++) {
            if (data_to_plot[i] === null)
                continue;

            this.svg.select(".line.l"+i.toString())
                    .attr('d', line(data_to_plot[i]));
        }

        //if no data is left in the plots, use the default axes again
        var data_left = false;
        for (var i = 0; i < data_to_plot.length; i++) {
            if (data_to_plot[i] !== null)
                data_left = true;
        }

        if (!data_left) {
            this.xScale.domain([0,10]);
            this.yScale.domain([-2, 2]);
            this.xAxes[0].ticks(10);
            this.yAxes[0].ticks(10);

            this.svg.select('.axis.x')
                    .call(this.xAxes[0]);

            this.svg.select('.axis.y')
                    .call(this.yAxes[0]);
        }

    }
};




