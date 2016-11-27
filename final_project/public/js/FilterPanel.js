/**
 * Constructor for the Bar Chart
 *
 * @param electoralVoteChart instance of ElectoralVoteChart
 * @param tileChart instance of TileChart
 * @param votePercentageChart instance of Vote Percentage Chart
 * @param electionInfo instance of ElectionInfo
 * @param electionWinners data corresponding to the winning parties over mutiple election years
 */
function FilterPanel(barChart, schoolData, nation, similarityData) {
    var self = this;

    self.barChart = barChart
    self.schoolData = schoolData
    self.nation = nation
    self.similarityData = similarityData
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
FilterPanel.prototype.init = function(){
    var self = this;

    self.filterOptionsData = [
        {'filter':'COST'}
        ,{'filter':'ADM_RATE_ALL'}
        ,{'filter':'CCSIZSET'}
        ,{'filter':'SAT_AVG_ALL'}
        ,{'filter':'State'}
    ]

    self.tuitionBrushCoordinates = [d3.min(self.schoolData, function (d) {return +d['COST']}),
                                    d3.max(self.schoolData, function (d) {return +d['COST']})]
    self.sizeBrushCoordinates = [d3.min(self.schoolData, function (d) {return +d['CCSIZSET']}),
                                    d3.max(self.schoolData, function (d) {return +d['CCSIZSET']})]
    self.SAT_BrushCoordinates = [d3.min(self.schoolData, function (d) {return +d['SAT_AVG_ALL']}),
                                    d3.max(self.schoolData, function (d) {return +d['SAT_AVG_ALL']})]
    self.admRateBrushCoordinates = [d3.min(self.schoolData, function (d) {return +d['ADM_RATE_ALL']}),
                                    d3.max(self.schoolData, function (d) {return +d['ADM_RATE_ALL']})]
    
    self.brushCoordinates = {}


    for (i = 0; i < self.filterOptionsData.length - 1; i++) {
        var coordinates = []
        coordinates[0] = 0 //d3.min(self.schoolData, function (d) {return +d[self.filterOptionsData[i]['filter']]})
        coordinates[1] = d3.max(self.schoolData, function (d) {return +d[self.filterOptionsData[i]['filter']]})
        self.brushCoordinates[self.filterOptionsData[i]['filter']] = coordinates
    }

    console.log(self.brushCoordinates)

    self.selectedSchools = self.schoolData
    self.histogram_arr_alt = {}

    self.margin = {top: 30, right: 30, bottom: 30, left: 30};


    // //Gets access to the div element created for this chart from HTML
    self.svgWidth = window.innerWidth - 600;
    self.svgHeight = window.innerHeight - 200;
    self.firstTextPosition = 30
    self.mapWidth = 300
    self.mapHeight = 200
    self.optionsPanel_posX = self.svgWidth*(4/5) - self.margin.right
    self.optionsPanel_posY = self.svgHeight/5
    self.optionsPanelWidth = self.svgWidth/5
    self.optionsPanelHeight = self.svgHeight/2
    self.optionsWidth = self.svgWidth/6
    self.optionsHeight = 30
    self.options_posX = self.optionsPanel_posX + (self.optionsPanelWidth - self.optionsWidth)/2
    self.options_posY_start = self.optionsPanel_posY + 40
    self.optionsText_posX = self.options_posX + self.optionsWidth/2
    self.optionsText_posY_start = self.options_posY_start
    self.buttonHeight = 30
    self.buttonWidth = self.svgWidth/7
    self.ApplyButton_posX = self.svgWidth - self.margin.right - self.buttonWidth
    self.ApplyButton_posY = self.svgHeight - self.margin.bottom - self.buttonHeight
    self.CancelButton_posX = self.svgWidth - self.margin.right*2 - self.buttonWidth*2
    self.CancelButton_posY = self.svgHeight - self.margin.bottom - self.buttonHeight
    self.filterPanelWidth = self.optionsPanel_posX - 2
    self.filterPanelHeight = self.ApplyButton_posY - 60
    self.filterDiv_posX = 300
    self.filterDiv_posY = 100
    self.filterPanelsDiv_posX = self.filterDiv_posX + 1
    self.filterPanelsDiv_posY = self.filterDiv_posY + 1
    self.sliderWidth = self.filterPanelWidth - self.margin.left - self.margin.right
    self.sliderHeight = 20
    self.slider_posX = self.margin.left
    self.slider_posY = self.filterPanelHeight*(3/4)
    self.axis_posX = self.slider_posX
    self.axis_posY = self.slider_posY + self.sliderHeight
    self.brush_posX1 = self.slider_posX
    self.brush_posX2 = self.slider_posX + self.sliderWidth
    self.brush_posY1 = self.slider_posY
    self.brush_posY2 = self.slider_posY + self.sliderHeight
    self.freqDistGroup_posX = self.slider_posX
    self.freqDistGroup_posY = self.slider_posY - 10
    self.freqDistGroupHeight = self.freqDistGroup_posY - self.margin.top
    self.freqDistGroupWidth = self.sliderWidth
    self.ticksCount = 10
    self.selectedSchoolCountContainerWidth = 80
    self.selectedSchoolCountContainerHeight = 60
    self.selectedSchoolCountContainer_posX = self.margin.left
    self.selectedSchoolCountContainer_posY = self.svgHeight - self.margin.bottom - self.selectedSchoolCountContainerHeight

    d3.select('body').append('div')
        .style('position', 'fixed')
        .style('background-color', 'grey')
        .style('opacity', .8)
        .style('left','0px')
        .style('top', '0px')
        .append('svg')
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight)
        //.attr('fill', 'black')
        

    self.filterDiv = d3.select('body').append('div')
        .attr('id', 'filterDiv')
        .style('position', 'fixed')
        .style('background-color', 'white')
        .style('border-radius', '15px')
        // .style('left','800px')
        // .style('top', '800px')
        .style('left','' + self.filterDiv_posX + 'px')
        .style('top', '' + self.filterDiv_posY + 'px')

    //creates svg element within the div
    self.svg = self.filterDiv
        .append('svg')
        .attr('id','filterSVG')
        // .attr('width', 0)
        // .attr('height', 0)
        // .transition()
        // .duration(2000)
        .attr('width', self.svgWidth)
        .attr('height', self.svgHeight)

    self.filterOptionsPanel = self.svg

    self.filterOptionsPanel
        .append('rect')
        .attr('height',self.optionsPanelHeight)
        .attr('width', self.optionsPanelWidth)
        .attr('fill', 'black')
        .attr('rx',"15")
        .attr('ry',"15")
        .attr('x', self.optionsPanel_posX)
        .attr('y', self.optionsPanel_posY)

    self.filterSelections = self.filterOptionsPanel.selectAll('.options').data(self.filterOptionsData)
        .enter()
        .append('rect')
        .attr('id',function(d){return d.filter})
        .classed('options', true)
        .attr('height',self.optionsHeight)
        .attr('width', self.optionsWidth)
        .attr('rx',"10")
        .attr('ry',"10")
        .attr('x', self.options_posX)
        .attr('y', function (d,i) {return self.options_posY_start + i*40})
        .style('cursor', 'pointer')
        .on('mouseover', function (d) {
            var optionSelf = this
            d3.select(optionSelf)
                .classed('filterHovered', true)
                .classed('filterNotHovered', false)
            d3.selectAll('.textOptions')
                .filter(function (d) {
                    return this.id == optionSelf.id
                })
                .classed('textFilterHovered', true)
                .classed('textFilterNotHovered', false)
        })
        .on('mouseout', function (d) {
            var optionSelf = this
            d3.select(optionSelf)
                .classed('filterHovered', false)
                .classed('filterNotHovered', true)
            d3.selectAll('.textOptions')
                .filter(function (d) {
                    return this.id == optionSelf.id
                })
                .classed('textFilterHovered', false)
                .classed('textFilterNotHovered', true)
        })
        .on('click', function (d) {
            var optionSelf = this
            d3.selectAll('.textOptions')
                .classed('textFilterClicked', false)
                .classed('textFilterNotClicked', true)
                .filter(function (d) {
                    return this.id == optionSelf.id
                })
                .classed('textFilterClicked', true)
                .classed('textFilterNotClicked', false)

            d3.selectAll('.options')
                .classed('filterClicked', false)
                .classed('filterNotClicked', true)

            d3.select(optionSelf)
                .classed('filterNotClicked', false)
                .classed('filterClicked', true)

            d3.selectAll('.FilterPanelDiv')
                .style('z-index',-100)
                .filter(function (d) {
                    return this.id == optionSelf.id + 'FilterPanelDiv'
                })
                .style('z-index',100)

        })

    self.filterSelected = self.filterOptionsPanel.selectAll('.options')
        .filter(function (d) {return d.filter == self.filterOptionsData[0]['filter']})
        .classed('filterClicked',true)
        .classed('filterNotClicked', true)
        .classed('filterNotHovered',true)
        .classed('filterHovered',false)

    self.textFilterSelections = self.filterOptionsPanel.selectAll('.textOptions').data(self.filterOptionsData)
        .enter()    
        .append('text')
        .attr('id',function(d){return d.filter})
        .attr('width', 100) 
        .attr('fill',"white")   
        .classed('textOptions',true)
        //.style("text-anchor", "middle")
        .text(function (d) {return d.filter})
        .attr('width',self.optionsWidth)
        .attr('x', self.optionsText_posX)
        .attr('y', function (d,i) {return self.optionsText_posY_start + self.optionsHeight/2 + i*40})
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central")       
        .style('cursor', 'pointer')
        .on('mouseover', function (d) {
            var textOptionSelf = this
            d3.select(textOptionSelf)
                .classed('textFilterHovered', true)
                .classed('textFilterNotHovered', false)

            d3.selectAll('.options')
                .filter(function (d) {return this.id == textOptionSelf.id})
                .classed('filterHovered', true)
                .classed('filterNotHovered', false)
        })
        .on('mouseout', function (d) {
            var textOptionSelf = this
            d3.select(textOptionSelf)
                .classed('textFilterHovered', false)
                .classed('textFilterNotHovered', true)

            d3.selectAll('.options')
                .filter(function (d) {
                    return this.id == textOptionSelf.id
                })
                .classed('filterHovered', false)
                .classed('filterNotHovered', true)
        })
        .on('click', function (d) {
            var textOptionSelf = this
            d3.selectAll('.options')
                .classed('filterClicked', false)
                .classed('filterNotClicked', true)
                .filter(function (d) {
                    return this.id == textOptionSelf.id
                })
                .classed('filterClicked', true)
                .classed('filterNotClicked', false)

            d3.selectAll('.textOptions')
                .classed('textFilterNotClicked', true)
                .classed('textFilterClicked', false)

            d3.select(textOptionSelf)
                .classed('textFilterNotClicked', false)
                .classed('textFilterClicked', true)

            d3.selectAll('.FilterPanelDiv')
                .style('z-index',-100)
                .filter(function (d) {
                    return this.id == textOptionSelf.id + 'FilterPanelDiv'
                })
                .style('z-index',100)
        })

    self.filterSelected = self.filterOptionsPanel.selectAll('.textOptions')
        .filter(function (d) {return d.filter == self.filterOptionsData[0]['filter']})
        .classed('textFilterClicked',true)
        .classed('textFilterNotClicked', true)
        .classed('textFilterNotHovered',true)
        .classed('textFilterHovered',false)

    self.filterPanels = d3.select('body').selectAll('.FilterPanelDiv').data(self.filterOptionsData)
        .enter()
        .append('div')
        .attr('class', 'FilterPanelDiv')
        .attr('id', function (d) {return d.filter + 'FilterPanelDiv'})
        .style('position', 'fixed')
        .style('background-color', 'white')
        .style('border-radius', '15px')
        .style('left','' + self.filterPanelsDiv_posX + 'px')
        .style('top','' + self.filterPanelsDiv_posY + 'px')
        .style('z-index',1)
        .style('opacity', 1)

    self.filterPanels
        .filter(function (d) {return d.filter == self.filterOptionsData[0]['filter']})
        .style('z-index',5)

    self.filterPanelSVG = self.filterPanels
        .append('svg')
        .attr('id', function (d) {return d.filter + 'FilterPanelSVG'})
        .attr('class','FilterPanelSVG')
        .attr('width', self.filterPanelWidth)
        .attr('height', self.filterPanelHeight)   

    self.drawMap()
    // self.drawSlider(self.filterOptionsData[0]['filter'])
    // self.drawSlider(self.filterOptionsData[1]['filter'])
    // self.drawSlider(self.filterOptionsData[2]['filter'])
    // self.drawSlider(self.filterOptionsData[3]['filter'])

    for (i = 0; i < self.filterOptionsData.length - 1; i++) {
        self.drawSlider(self.filterOptionsData[i]['filter'])
    }

    self.applyButton = self.svg
        .append('rect')
        .attr('height',self.buttonHeight)
        .attr('width',self.buttonWidth)
        .attr('fill', 'blue')
        .attr('rx',"15")
        .attr('ry',"15")
        .attr('x', self.ApplyButton_posX)
        .attr('y', self.ApplyButton_posY)
        .style('cursor', 'pointer')
        .attr('stroke', 'black')
        .on('click', function (d) {self.applyFilters()})


    self.cancelButton = self.svg
        .append('rect')
        .attr('height',self.buttonHeight)
        .attr('width',self.buttonWidth)
        .attr('fill', 'red')
        .attr('rx',"15")
        .attr('ry',"15")
        .attr('x', self.CancelButton_posX)
        .attr('y', self.CancelButton_posY)
        .style('cursor', 'pointer')
        .attr('stroke', 'black')
        .on('click', function (d) {
            d3.selectAll('.FilterPanelDiv').remove()
            d3.select('#filterDiv').remove()
            delete self
        })
        

    self.applyButtonText = self.svg
        .append('text')
        .text('Apply')
        .attr('width', 100)
        .attr('x', self.svgWidth - self.margin.right - self.buttonWidth/2)
        .attr('y', self.svgHeight - self.margin.bottom - self.buttonHeight/2)
        .attr('fill','white')
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central")
        .style('cursor', 'pointer') 
        .on('click', function (d) {self.applyFilters()})
        

    self.cancelButtonText = self.svg
        .append('text')
        .text('Cancel')
        .attr('x', self.svgWidth - self.margin.right*2 - self.buttonWidth*1.5)
        .attr('y', self.svgHeight - self.margin.bottom - self.buttonHeight/2)
        .attr('fill','white')
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central") 
        .style('cursor', 'pointer')
        .on('click', function (d) {
            d3.selectAll('.FilterPanelDiv').remove()
            d3.select('#filterDiv').remove()
            delete self
        })

    self.selectedSchoolCount = self.svg
        .append('rect')
        .attr('stroke', 'black')
        .attr('stroke-width', 5)
        .attr('height',self.selectedSchoolCountContainerHeight)
        .attr('width',self.selectedSchoolCountContainerWidth)
        .attr('fill', 'red')
        .attr('x', self.selectedSchoolCountContainer_posX)
        .attr('y', self.selectedSchoolCountContainer_posY)  

    self.selectedSchoolCountText = self.svg
        .append('text')
        .attr('id','selectedSchoolCountText')
        .text(self.schoolData.length)
        .attr('x', self.selectedSchoolCountContainer_posX + self.selectedSchoolCountContainerWidth/2)
        .attr('y', self.selectedSchoolCountContainer_posY + self.selectedSchoolCountContainerHeight/2) 
        .attr('fill', 'black')
        .attr('font-size',25)
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central") 
};

/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */

FilterPanel.prototype.update = function () { //function(selectedDimension){
    var self = this;
    console.log('update')
    d3.select('#selectedSchoolCountText') //self.selectedSchoolCountText
        .text(self.selectedSchools.length)

}

FilterPanel.prototype.brushed = function(filterName) {
    var self = this;

    var reverseScale = d3.scaleLinear()
    .domain([self.slider_posX, self.slider_posX + self.sliderWidth])
    .range([0, d3.max(self.schoolData, function (d) {
            return +d[filterName];
        })])

    d3.event.selection.forEach(function(coordinate, index) {
        self.brushCoordinates[filterName][index] = reverseScale(coordinate);
    });



    // if (filterName == self.filterOptionsData[0]['filter']) {
    //     d3.event.selection.forEach(function(coordinate, index) {
    //         self.tuitionBrushCoordinates[index] = reverseScale(coordinate);
    //     });
    // }
    // else if (filterName == self.filterOptionsData[1]['filter']) {
    //     d3.event.selection.forEach(function(coordinate, index) {
    //         self.admRateBrushCoordinates[index] = reverseScale(coordinate);
    //     });
    // }
    // else if (filterName == self.filterOptionsData[2]['filter']) {
    //     d3.event.selection.forEach(function(coordinate, index) {
    //         self.sizeBrushCoordinates[index] = reverseScale(coordinate);
    //     });
    // }
    // else if (filterName == self.filterOptionsData[3]['filter']) {
    //     d3.event.selection.forEach(function(coordinate, index) {
    //         self.SAT_BrushCoordinates[index] = reverseScale(coordinate);
    //     });
    // }

    self.selectData()

};

FilterPanel.prototype.selectData = function(d) {
    var self = this;

    // self.selectedSchools = self.schoolData.filter(function (d) {
    //         return (
    //             d['COST'] >= self.tuitionBrushCoordinates[0] &
    //             d['COST'] <= self.tuitionBrushCoordinates[1] &
    //             d['CCSIZSET'] >= self.sizeBrushCoordinates[0] &
    //             d['CCSIZSET'] <= self.sizeBrushCoordinates[1] &
    //             d['SAT_AVG_ALL'] >= self.SAT_BrushCoordinates[0] &
    //             d['SAT_AVG_ALL'] <= self.SAT_BrushCoordinates[1] &
    //             d['ADM_RATE_ALL'] >= self.admRateBrushCoordinates[0] &
    //             d['ADM_RATE_ALL'] <= self.admRateBrushCoordinates[1]
    //         )
    //     });

    self.selectedSchools = self.schoolData.filter(function (d) {
            return (
                d[self.filterOptionsData[0]['filter']] >= self.brushCoordinates[self.filterOptionsData[0]['filter']][0] &
                d[self.filterOptionsData[0]['filter']] <= self.brushCoordinates[self.filterOptionsData[0]['filter']][1] &
                d[self.filterOptionsData[1]['filter']] >= self.brushCoordinates[self.filterOptionsData[1]['filter']][0] &
                d[self.filterOptionsData[1]['filter']] <= self.brushCoordinates[self.filterOptionsData[1]['filter']][1] &
                d[self.filterOptionsData[2]['filter']] >= self.brushCoordinates[self.filterOptionsData[2]['filter']][0] &
                d[self.filterOptionsData[2]['filter']] <= self.brushCoordinates[self.filterOptionsData[2]['filter']][1] &
                d[self.filterOptionsData[3]['filter']] >= self.brushCoordinates[self.filterOptionsData[3]['filter']][0] &
                d[self.filterOptionsData[3]['filter']] <= self.brushCoordinates[self.filterOptionsData[3]['filter']][1]
            )
        });

    self.update()

}

FilterPanel.prototype.drawMap = function () {
    var self = this;

    console.log('draw map')
    var mapGroup = d3.selectAll('.FilterPanelSVG')
        .filter(function (d) {return this.id == 'StateFilterPanelSVG'})
        .append('g')
        .attr('id','thisMap')
        //.attr("transform", "translate(" + self.svgWidth/4 + "," + self.margin.top + ")")

    var projection = d3.geoAlbersUsa()
            .translate([(self.svgWidth - self.margin.right - self.optionsPanelWidth)/2, self.margin.top + self.svgHeight/3])
            .scale([self.svgWidth*(4/5)]);

    var path = d3.geoPath()
            .projection(projection);

    mapGroup.selectAll("path")
        .data(self.nation.features)
        .enter()
        .append("path")
        .style('fill','red')
        .attr("d", path)
        .classed('stateSelected', true)
        .style('cursor', 'pointer')

    self.country = d3.select("#thisMap").selectAll("path")
    
    self.country.on("click", function (d) {
        selectedState = d3.select(this)
    
        if (selectedState.classed('stateSelected')) {
            selectedState
                .style('fill','black')
                .classed('stateSelected',false)
        }
        else {
            selectedState
                .style('fill','red')
                .classed('stateSelected',true)
        }
    })
}    

FilterPanel.prototype.drawSlider = function (filterName) {
    var self = this

    console.log('draw slider')

    var slider_xScale = d3.scaleLinear()
        .domain([0, d3.max(self.schoolData, function (d) {
            return +d[filterName];
        })])
        .range([0, self.sliderWidth]);

    // create a new Slider that has the ticks and labels on the bottom
    var axis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(slider_xScale)

    var filterPanelSVG = d3.selectAll('.FilterPanelSVG')
        .filter(function (d) {
            return this.id == filterName + 'FilterPanelSVG'
        })

    var sliderGroup = filterPanelSVG
        .append('g')
        .append('rect')
        .attr('width', self.sliderWidth)
        .attr('height', self.sliderHeight)
        .attr('x', self.slider_posX)
        .attr('y', self.slider_posY)

    var axisGroup = filterPanelSVG
        .append('g')
        .attr("transform", "translate(" + self.axis_posX + "," + self.axis_posY + ")")
        .call(axis)

    var brush = d3.brushX().extent([[self.brush_posX1,self.brush_posY1],[self.brush_posX2,self.brush_posY2]])

    var brushGroup = filterPanelSVG
        .append("g")
        .attr("class", "brush")
        .call(brush);

    brush
        .on("end", function (d) {self.brushed(filterName)})

    var histogram_arr = []
    

    //self.schoolData.sort(function (a,b) {return d3.ascending(a.value[filterName], b.value[filterName])})

    self.schoolData.forEach(function (d) {histogram_arr.push(d[filterName])})

    self.histogram_arr_alt[filterName] = histogram_arr

    histogram_arr = self.histogram_arr_alt[filterName].sort(d3.ascending)

    var histogram = d3.histogram()
        .domain(slider_xScale.domain())
        .thresholds(slider_xScale.ticks(self.ticksCount))

    var bins = histogram(histogram_arr)
        
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) {return d.length})])
        .range([0, self.freqDistGroupHeight]);

    var line_xScale = d3.scaleLinear()
        .domain([d3.min(bins, function (d) {return (d.x0 + d.x1)/2}), d3.max(bins, function(d) {return (d.x0 + d.x1)/2})])
        .range([0, self.freqDistGroupWidth]);

    var freqDistGroup = filterPanelSVG
        .append("g")
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .selectAll('circle')
        .data(bins)
        .enter()
        .append('circle')   
        .attr('cx', function (d) {return line_xScale((d.x0 + d.x1)/2)})
        .attr('cy', function (d) {return yScale(d.length)})
        .attr('r', 5)
        .attr('fill','purple')

    var valueline = d3.line()
        // .interpolate("basis")
        .x(function(d) { return line_xScale((d.x0 + d.x1)/2); })
        .y(function(d) { return yScale(d.length); })
        .curve(d3.curveBasis)
        //.curve(d3.curveCardinal);

    var lineGroup = filterPanelSVG
        .append('g')
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .append("path")
        .attr("class", "line")
        .attr("d", valueline(bins));

    var areaBelowLine = d3.area()
        .x(function(d) { return line_xScale((d.x0 + d.x1)/2); })
        .y0(0)
        .y1(function(d) { return yScale(d.length);})
        .curve(d3.curveBasis)

    var areaAboveLine = d3.area()
        .x(function(d) { return line_xScale((d.x0 + d.x1)/2); })
        .y0(self.freqDistGroupHeight)
        .y1(function(d) { return yScale(d.length);})
        .curve(d3.curveBasis)


    var area_test = d3.area()
        .x(function(d) { return line_xScale((d.x0 + d.x1)/2); })
        .y0(0)
        .y1(function(d) { return yScale(d.length);})
        .curve(d3.curveBasis)

    var areaBelowLineGroup = filterPanelSVG
        .append('g')
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .append("path")
        .attr("class", "area")
        .attr("d", areaBelowLine(bins))
        .style('fill', 'blue')

    var areaSelection = filterPanelSVG
        .append('g')
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .append('rect')
        .attr('width',100)
        .attr('height',self.freqDistGroupHeight)
        .attr('fill','green')

    var areaAboveLineGroup = filterPanelSVG
        .append('g')
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .append("path")
        .attr("class", "area")
        .attr("d", areaAboveLine(bins))
        .style('fill', 'white')
        .style('stroke','white')

}

FilterPanel.prototype.applyFilters = function () {
    var self = this

    //console.log('apply filters')
    var schools = {}

    for (index in self.selectedSchools) {
        var schoolData = self.selectedSchools[index];
        var similarSchools = {};
        for (var id in self.similarityData[schoolData['UNITID']]) {
            similarSchools[id] = id;
        }
        schoolData.similarSchools = similarSchools;
        schools[schoolData['UNITID']] = schoolData;
    }

    for (schoolId in schools) {
        var schoolData = schools[schoolId];
        for (similarSchoolId in schoolData.similarSchools) {
            if (!schools[similarSchoolId]) {
                delete schoolData.similarSchools[similarSchoolId]
            }
            else {
                schoolData.similarSchools[similarSchoolId] = schools[similarSchoolId]
            }
        }
        //schoolData.similarSchools = Object.keys(schoolData.similarSchools).slice(0,15)
        schoolData.similarSchools = Object.values(schoolData.similarSchools).slice(0,15)
    }

    self.selectedSchools = Object.values(schools);

    self.barChart.updateData(self.selectedSchools)

    d3.selectAll('.FilterPanelDiv').remove()
    d3.select('#filterDiv').remove()
    delete self
}

