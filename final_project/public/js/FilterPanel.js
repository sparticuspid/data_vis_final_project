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
    // console.log(self.sizeBrushCoordinates)
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
    console.log(self.filterOptionsData)
    self.filterSelections = self.svg
        .append('g')

    self.filterSelections
        .append('rect')
        .attr('height',self.svgHeight/2)
        .attr('width', self.svgWidth/5)
        .attr('fill', 'black')
        .attr('rx',"15")
        .attr('ry',"15")
        .attr('x', self.svgWidth*(4/5) - self.margin.right)
        .attr('y', self.svgHeight/5)

    filterSelections = self.filterSelections.selectAll('.option').data(self.filterOptionsData)
        .enter()
        .append('rect')
        .attr('id', 'option')
        .attr('height',30)
        .attr('width', 100)
        .attr('fill', 'white')
        .attr('rx',"15")
        .attr('ry',"15")
        .attr('x', self.svgWidth*(4/5) - self.margin.right)
        .attr('y', function (d,i) {return self.svgHeight/5 + (i+1)*40})
    
    filterSelections
        .append('txt')    
        .text(function (d) {return d.filter})

    self.svg
        .append('rect')
        .attr('height',30)
        .attr('width',100)
        .attr('fill', 'blue')
        .attr('rx',"15")
        .attr('ry',"15")
        .style('cursor', 'pointer')
        .attr('x', self.svgWidth - self.margin.right - 100)
        .attr('y', self.svgHeight - self.margin.bottom - 30)
        .on('click', function (d) {self.applyFilters()})


    self.svg
        .append('rect')
        .attr('height',30)
        .attr('width',100)
        .attr('fill', 'red')
        .attr('rx',"15")
        .attr('ry',"15")
        .attr('x', self.svgWidth - self.margin.right*2 - 100*2)
        .attr('y', self.svgHeight - self.margin.bottom - 30)
        .style('cursor', 'pointer')
        .on('click', function (d) {
            d3.select('#filterDiv').remove()
            delete self
        })
        

    self.svg
        .append('text')
        .text('Cancel')
        .style('position','fixed')
        .style('display', 'inline-block')
        .style('vertical-align','middle')
        .style('cursor', 'pointer')
        .on('click', function (d) {d3.select('#filterDiv').remove()})

    self.applyText  = self.svg
        .append('text')
        .attr('width', 100)
        .attr('x', self.svgWidth - self.margin.right - 100)
        .attr('y', self.svgHeight - self.margin.bottom - 50)
        .style('cursor', 'pointer')
        .text('Apply')
        .style('text-anchor', 'middle')
        .on('click', function (d) {self.applyFilters()})
        

    self.cancelText = self.svg
        .append('text')
        .text('Cancel')
        .attr('x', self.svgWidth - self.margin.right*2 - 100*2)
        .attr('y', self.svgHeight - self.margin.bottom - 30)
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

    // console.log(self.schoolData)

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

    // console.log(self.tuitionBrushCoordinates)
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
    
    // console.log(self.sizeBrushCoordinates)
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
    
    // console.log(self.admRateBrushCoordinates)
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

    //console.log(self.selectedSchools)
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
    console.log(self.selectedSchools)
    // var result = self.similarityData.filter(function(n) {
    //       return arr2.indexOf(n) > -1;
    //     });
    
    //console.log(self.similarityData)
    // for (school in self.similarityData) {
    //     simSchools = []
    //     for (simSchool=0; simSchool<10; simSchool++) {
    //             simSchools.push(self.similarityData[school]['Similar School ' + simSchool])
    //             result = schools.filter(function(n) {
    //               return simSchools.indexOf(n) > -1;
    //             });
    //     }
    // }


    // //console.log(result)
    
    
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