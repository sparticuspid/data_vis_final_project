/**
 * Constructor for the Bar Chart
 *
 * @param electoralVoteChart instance of ElectoralVoteChart
 * @param tileChart instance of TileChart
 * @param votePercentageChart instance of Vote Percentage Chart
 * @param electionInfo instance of ElectionInfo
 * @param electionWinners data corresponding to the winning parties over mutiple election years
 */
function FilterPanel(barChart, schoolData, similarityData) {
    var self = this;

    self.barChart = barChart
    self.schoolData = schoolData
    self.similarityData = similarityData
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
FilterPanel.prototype.init = function(){
    var self = this;
    self.tuitionBrushCoordinates = [d3.min(self.schoolData, function (d) {return +d['COST']}),
                                    d3.max(self.schoolData, function (d) {return +d['COST']})]
    self.sizeBrushCoordinates = [d3.min(self.schoolData, function (d) {return +d['CCSIZSET']}),
                                    d3.max(self.schoolData, function (d) {return +d['CCSIZSET']})]
    self.SAT_BrushCoordinates = [d3.min(self.schoolData, function (d) {return +d['SAT_AVG_ALL']}),
                                    d3.max(self.schoolData, function (d) {return +d['SAT_AVG_ALL']})]
    self.admRateBrushCoordinates = [d3.min(self.schoolData, function (d) {return +d['ADM_RATE_ALL']}),
                                    d3.max(self.schoolData, function (d) {return +d['ADM_RATE_ALL']})]
    self.selectedSchools = []

    self.margin = {top: 10, right: 20, bottom: 20, left: 20};

    self.filterDiv = d3.select('body').append('div')
        .attr('id', 'filterDiv')
        .style('position', 'fixed')
        .style('background-color', 'gray')
        .style('border-radius', '25px')
        .style('left','200px')
        .style('top', '100px')
        .style('z-index',10)
        .style('opacity', 1)


    // //Gets access to the div element created for this chart from HTML
    self.svgWidth = window.innerWidth - 400;
    self.svgHeight = window.innerHeight - 200;
    self.sliderWidth = self.svgWidth/2;
    self.sliderHeight = 10
    self.sliderSpacing = 75
    self.firstSliderPosition = 40
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

    //creates svg element within the div
    self.svg = self.filterDiv
        .append('svg')
        .attr('width', self.svgWidth)
        .attr('height', self.svgHeight)

    self.filterOptionsData = [
        {'filter':'Tuition'}
        ,{'filter':'Admission Rate'}
        ,{'filter':'School Size'}
        ,{'filter':'Avg SAT Score'}
        ,{'filter':'State'}
    ]

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
            var innerSelf = this
            d3.select(innerSelf)
                .classed('filterHovered', true)
                .classed('filterNotHovered', false)
            d3.selectAll('.textOptions')
                .filter(function (d) {
                    return this.id == innerSelf.id
                })
                .classed('textFilterHovered', true)
                .classed('textFilterNotHovered', false)
        })
        .on('mouseout', function (d) {
            var innerSelf = this
            d3.select(innerSelf)
                .classed('filterHovered', false)
                .classed('filterNotHovered', true)
            d3.selectAll('.textOptions')
                .filter(function (d) {
                    return this.id == innerSelf.id
                })
                .classed('textFilterHovered', false)
                .classed('textFilterNotHovered', true)
        })
        .on('click', function (d) {
            var innerSelf = this
            d3.selectAll('.textOptions')
                .classed('textFilterClicked', false)
                .classed('textFilterNotClicked', true)
                .filter(function (d) {
                    return this.id == innerSelf.id
                })
                .classed('textFilterClicked', true)
                .classed('textFilterNotClicked', false)
            d3.selectAll('.options')
                .classed('filterClicked', false)
                .classed('filterNotClicked', true)
            d3.select(innerSelf)
                .classed('filterNotClicked', false)
                .classed('filterClicked', true)

        })

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
            var innerSelf = this
            d3.select(innerSelf)
                .classed('textFilterHovered', true)
                .classed('textFilterNotHovered', false)
            d3.selectAll('.options')
                .filter(function (d) {return this.id == innerSelf.id})
                .classed('filterHovered', true)
                .classed('filterNotHovered', false)
        })
        .on('mouseout', function (d) {
            var innerSelf = this
            d3.select(innerSelf)
                .classed('textFilterHovered', false)
                .classed('textFilterNotHovered', true)
            d3.selectAll('.options')
                .filter(function (d) {
                    return this.id == innerSelf.id
                })
                .classed('filterHovered', false)
                .classed('filterNotHovered', true)
        })
        .on('click', function (d) {
            var innerSelf = this
            d3.selectAll('.options')
                .classed('filterClicked', false)
                .classed('filterNotClicked', true)
                .filter(function (d) {
                    return this.id == innerSelf.id
                })
                .classed('filterClicked', true)
                .classed('filterNotClicked', false)
            d3.selectAll('.textOptions')
                .classed('textFilterNotClicked', true)
                .classed('textFilterClicked', false)
            d3.select(innerSelf)
                .classed('textFilterNotClicked', false)
                .classed('textFilterClicked', true)
        })

    self.svg
        .append('rect')
        .attr('height',self.buttonHeight)
        .attr('width',self.buttonWidth)
        .attr('fill', 'blue')
        .attr('rx',"15")
        .attr('ry',"15")
        .attr('x', self.svgWidth - self.margin.right - self.buttonWidth)
        .attr('y', self.svgHeight - self.margin.bottom - self.buttonHeight)
        .style('cursor', 'pointer')
        .attr('stroke', 'black')
        .on('click', function (d) {self.applyFilters()})


    self.svg
        .append('rect')
        .attr('height',self.buttonHeight)
        .attr('width',self.buttonWidth)
        .attr('fill', 'red')
        .attr('rx',"15")
        .attr('ry',"15")
        .attr('x', self.svgWidth - self.margin.right*2 - self.buttonWidth*2)
        .attr('y', self.svgHeight - self.margin.bottom - self.buttonHeight)
        .style('cursor', 'pointer')
        .attr('stroke', 'black')
        .on('click', function (d) {
            d3.select('#filterDiv').remove()
            delete self
        })
        

    self.applyText  = self.svg
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
        

    self.cancelText = self.svg
        .append('text')
        .text('Cancel')
        .attr('x', self.svgWidth - self.margin.right*2 - self.buttonWidth*1.5)
        .attr('y', self.svgHeight - self.margin.bottom - self.buttonHeight/2)
        .attr('fill','white')
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central") 
        .style('cursor', 'pointer')
        .on('click', function (d) {
            d3.select('#filterDiv').remove()
            delete self
        })

};

/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */

FilterPanel.prototype.update = function () { //function(selectedDimension){
    var self = this;

    d3.json("data/us-states.json", function (error, nation) {
        if (error) throw error;
        self.drawMap(nation);
    });

    var tuitionScale = d3.scaleLinear()
        .domain([0, d3.max(self.schoolData, function (d) {
            return +d['COST'];
        })])
        .range([0, self.sliderWidth]);

    var sizeScale = d3.scaleLinear()
        .domain([0, d3.max(self.schoolData, function (d) {
            return +d['CCSIZSET'];
        })])
        .range([0, self.sliderWidth]);

    var SAT_Scale = d3.scaleLinear()
        .domain([0, d3.max(self.schoolData, function (d) {
            return +d['SAT_AVG_ALL'];
        })])
        .range([0, self.sliderWidth]);

    var admRateScale = d3.scaleLinear()
        .domain([0, d3.max(self.schoolData, function (d) {
            return +d['ADM_RATE_ALL'];
        })])
        .range([0, self.sliderWidth]);

    var tuitionSliderGroup = self.svg
        .append('g')
        .attr('id', 'tuitionSlider')

    self.svg
        .append('text')
        .text('What tuition range are you interested in?')
        .attr('y', self.firstTextPosition + self.sliderSpacing*0)
        .attr('x', self.margin.left)
        .style('cursor', 'default')

    self.svg
        .append('text')
        .text('What school size range are you interested in?')
        .attr('y', self.firstTextPosition + self.sliderSpacing*1)
        .attr('x', self.margin.left)
        .style('cursor', 'default')

    self.svg
        .append('text')
        .text('What SAT range are you interested in?')
        .attr('y', self.firstTextPosition + self.sliderSpacing*2)
        .attr('x', self.margin.left)
        .style('cursor', 'default')

    self.svg
        .append('text')
        .text('What admission rate range are you interested in?')
        .attr('y', self.firstTextPosition + self.sliderSpacing*3)
        .attr('x', self.margin.left)
        .style('cursor', 'default')

    tuitionSliderGroup
        .append('rect')
        .attr('id', 'tuitionBar')
        .attr('width', self.sliderWidth)
        .attr('height', self.sliderHeight)
        .attr('x', self.margin.left)
        .attr('y', self.firstSliderPosition + self.sliderSpacing*0)

    var sizeSliderGroup = self.svg
        .append('g')
        .attr('id', 'sizeSlider')

    sizeSliderGroup
        .append('rect')
        .attr('id', 'sizeBar')
        .attr('width', self.sliderWidth)
        .attr('height', self.sliderHeight)
        .attr('x', self.margin.left)
        .attr('y', self.firstSliderPosition + self.sliderSpacing*1)

    var SAT_SliderGroup = self.svg
        .append('g')
        .attr('id', 'SAT_Slider')

    SAT_SliderGroup
        .append('rect')
        .attr('id', 'SAT_Bar')
        .attr('width', self.sliderWidth)
        .attr('height', self.sliderHeight)
        .attr('x', self.margin.left)
        .attr('y', self.firstSliderPosition + self.sliderSpacing*2)

    var admRateSliderGroup = self.svg
        .append('g')
        .attr('id', 'admRateSlider')

    admRateSliderGroup
        .append('rect')
        .attr('id', 'admRateBar')
        .attr('width', self.sliderWidth)
        .attr('height', self.sliderHeight)
        .attr('x', self.margin.left)
        .attr('y', self.firstSliderPosition + self.sliderSpacing*3)

    // create a new Slider that has the ticks and labels on the bottom
    var tuitionAxis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(tuitionScale)

    tuitionSliderGroup
        .append('g')
        .attr("transform", "translate(" + self.margin.left + "," + (self.firstSliderPosition + self.sliderHeight + self.sliderSpacing*0) + ")")
        .call(tuitionAxis)

    // create a new Slider that has the ticks and labels on the bottom
    var sizeAxis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(sizeScale)

    sizeSliderGroup
        .append('g')
        .attr("transform", "translate(" + self.margin.left + "," + (self.firstSliderPosition + self.sliderHeight + self.sliderSpacing*1) + ")")
        .call(sizeAxis)

    // create a new Slider that has the ticks and labels on the bottom
    var SAT_Axis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(SAT_Scale)

    SAT_SliderGroup
        .append('g')
        .attr("transform", "translate(" + self.margin.left + "," + (self.firstSliderPosition + self.sliderHeight + self.sliderSpacing*2) + ")")
        .call(SAT_Axis)

    // create a new Slider that has the ticks and labels on the bottom
    var admRateAxis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(admRateScale)

    admRateSliderGroup
        .append('g')
        .attr("transform", "translate(" + self.margin.left + "," + (self.firstSliderPosition + self.sliderHeight + self.sliderSpacing*3) + ")")
        .call(admRateAxis)

    var tuitionBrush = d3.brushX().extent([[self.margin.left,self.firstSliderPosition + self.sliderSpacing*0],[self.margin.left + self.sliderWidth,self.firstSliderPosition + self.sliderSpacing*0 + self.sliderHeight + 1]])

    tuitionSliderGroup.append("g").attr("class", "brush").call(tuitionBrush);

    tuitionBrush
        .on("end", function(d){ self.tuitionBrushed(d)})

    var sizeBrush = d3.brushX().extent([[self.margin.left,self.firstSliderPosition + self.sliderSpacing*1],[self.margin.left + self.sliderWidth,self.firstSliderPosition + self.sliderSpacing*1 + self.sliderHeight + 1]])

    sizeSliderGroup.append("g").attr("class", "brush").call(sizeBrush);

    sizeBrush
        .on("end", function(d){ self.sizeBrushed(d)})

    var SAT_Brush = d3.brushX().extent([[self.margin.left,self.firstSliderPosition + self.sliderSpacing*2],[self.margin.left + self.sliderWidth,self.firstSliderPosition + self.sliderSpacing*2 + self.sliderHeight + 1]])

    SAT_SliderGroup.append("g").attr("class", "brush").call(SAT_Brush);

    SAT_Brush
        .on("end", function(d){ self.SAT_Brushed(d)})

    var admRateBrush = d3.brushX().extent([[self.margin.left,self.firstSliderPosition + self.sliderSpacing*3],[self.margin.left + self.sliderWidth,self.firstSliderPosition + self.sliderSpacing*3 +self.sliderHeight + 1]])

    admRateSliderGroup.append("g").attr("class", "brush").call(admRateBrush);

    admRateBrush
        .on("end", function(d){ self.admRateBrushed(d)})
}

FilterPanel.prototype.tuitionBrushed = function(d) {
    var self = this;

    var reverseTuitionScale = d3.scaleLinear()
    .domain([self.margin.left, self.sliderWidth])
    .range([0, d3.max(self.schoolData, function (d) {
            return +d['COST'];
        })])

    d3.event.selection.forEach(function(coordinate, index) {
        self.tuitionBrushCoordinates[index] = reverseTuitionScale(coordinate);
    });
};

FilterPanel.prototype.sizeBrushed = function(d) {
    var self = this;    

    var reverseSizeScale = d3.scaleLinear()
    .domain([self.margin.left, self.sliderWidth])
    .range([0, d3.max(self.schoolData, function (d) {
            return +d['CCSIZSET'];
        })])

    d3.event.selection.forEach(function(coordinate, index) {
        self.sizeBrushCoordinates[index] = reverseSizeScale(coordinate);
    });
};

FilterPanel.prototype.SAT_Brushed = function(d) {
    var self = this;

    var reverseSAT_Scale = d3.scaleLinear()
    .domain([self.margin.left, self.sliderWidth])
    .range([0, d3.max(self.schoolData, function (d) {
            return +d['SAT_AVG_ALL'];
        })])

    d3.event.selection.forEach(function(coordinate, index) {
        self.SAT_BrushCoordinates[index] = reverseSAT_Scale(coordinate);
    });
    
};

FilterPanel.prototype.admRateBrushed = function(d) {
    var self = this;

    var reverseAdmRateScale = d3.scaleLinear()
    .domain([self.margin.left, self.sliderWidth])
    .range([0, d3.max(self.schoolData, function (d) {
            return +d['ADM_RATE_ALL'];
        })])

    d3.event.selection.forEach(function(coordinate, index) {
        self.admRateBrushCoordinates[index] = reverseAdmRateScale(coordinate);
    });
    
};

FilterPanel.prototype.selectData = function(d) {
    var self = this;

    self.selectedSchools = self.schoolData.filter(function (d) {


            return (
                d['COST'] >= self.tuitionBrushCoordinates[0] &
                d['COST'] <= self.tuitionBrushCoordinates[1] &
                d['CCSIZSET'] >= self.sizeBrushCoordinates[0] &
                d['CCSIZSET'] <= self.sizeBrushCoordinates[1] &
                d['SAT_AVG_ALL'] >= self.SAT_BrushCoordinates[0] &
                d['SAT_AVG_ALL'] <= self.SAT_BrushCoordinates[1] &
                d['ADM_RATE_ALL'] >= self.admRateBrushCoordinates[0] &
                d['ADM_RATE_ALL'] <= self.admRateBrushCoordinates[1]
            )
        });

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
                //console.log('delete ' + similarSchoolId)
            }
            else {
                schoolData.similarSchools[similarSchoolId] = schools[similarSchoolId]
            }
        }
        //schoolData.similarSchools = Object.keys(schoolData.similarSchools).slice(0,15)
        schoolData.similarSchools = Object.values(schoolData.similarSchools).slice(0,15)
    }

    self.selectedSchools = Object.values(schools);
    
    
};

FilterPanel.prototype.drawMap = function (nation) {
    var self = this;
    var mapGroup = self.svg
        .append('g')
        //.attr("transform", "translate(" + self.svgWidth/4 + "," + self.margin.top + ")")

    var projection = d3.geoAlbersUsa()
            .translate([self.margin.left + self.sliderWidth + self.margin.right*5, self.margin.top + self.svgHeight/3])
            .scale([self.svgWidth - self.margin.left - self.sliderWidth]);

    var path = d3.geoPath()
            .projection(projection);
    
    mapGroup.selectAll("path")
        .data(nation.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('fill', 'green')
}    

FilterPanel.prototype.applyFilters = function () {
    var self = this
    self.selectData()
    self.barChart.updateData(self.selectedSchools)
    d3.select('#filterDiv').remove()
    delete self
}