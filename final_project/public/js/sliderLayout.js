/**
 * Constructor for the Bar Chart
 *
 * @param electoralVoteChart instance of ElectoralVoteChart
 * @param tileChart instance of TileChart
 * @param votePercentageChart instance of Vote Percentage Chart
 * @param electionInfo instance of ElectionInfo
 * @param electionWinners data corresponding to the winning parties over mutiple election years
 */
function SliderLayout(schoolData) {
    var self = this;
    self.schools = schoolData
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
SliderLayout.prototype.init = function(){
    var self = this;

    self.margin = {top: 10, right: 20, bottom: 30, left: 50};
    var divSliderLayout = d3.select("#sliderLayout").classed("content", true);

    // //Gets access to the div element created for this chart from HTML
    self.svgBounds = divSliderLayout.node().getBoundingClientRect();
    self.svgWidth = 500 //self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 300 //self.svgBounds.height;
    self.sliderWidth = self.svgHeight - 20

    //creates svg element within the div
    self.svg = divSliderLayout
        .append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)

};

/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */

SliderLayout.prototype.update = function () { //function(selectedDimension){
    var self = this;

    console.log(self.schools)

    var tuitionScale = d3.scaleLinear()
        .domain([0, d3.max(self.schools, function (d) {
            return +d['COST'];
        })])
        .range([0, self.sliderWidth]);

    var sizeScale = d3.scaleLinear()
        .domain([0, d3.max(self.schools, function (d) {
            return +d['CCSIZSET'];
        })])
        .range([0, self.sliderWidth]);

    var SAT_Scale = d3.scaleLinear()
        .domain([0, d3.max(self.schools, function (d) {
            return +d['SAT_AVG_ALL'];
        })])
        .range([0, self.sliderWidth]);

    var admRateScale = d3.scaleLinear()
        .domain([0, d3.max(self.schools, function (d) {
            return +d['ADM_RATE_ALL'];
        })])
        .range([0, self.sliderWidth]);

    var tuitionSliderGroup = self.svg
        .append('g')
        .attr('id', 'tuitionSlider')

    tuitionSliderGroup
        .append('rect')
        .attr('id', 'tuitionBar')
        .attr('width', self.sliderWidth)
        .attr('height', 10)
        .attr('x', 10)
        .attr('y', 0)

    var sizeSliderGroup = self.svg
        .append('g')
        .attr('id', 'sizeSlider')

    sizeSliderGroup
        .append('rect')
        .attr('id', 'sizeBar')
        .attr('width', self.sliderWidth)
        .attr('height', 10)
        .attr('x', 10)
        .attr('y', 50)

    var SAT_SliderGroup = self.svg
        .append('g')
        .attr('id', 'SAT_Slider')

    SAT_SliderGroup
        .append('rect')
        .attr('id', 'SAT_Bar')
        .attr('width', self.sliderWidth)
        .attr('height', 10)
        .attr('x', 10)
        .attr('y', 100)

    var admRateSliderGroup = self.svg
        .append('g')
        .attr('id', 'admRateSlider')

    admRateSliderGroup
        .append('rect')
        .attr('id', 'admRateBar')
        .attr('width', self.sliderWidth)
        .attr('height', 10)
        .attr('x', 10)
        .attr('y', 150)

    // create a new Slider that has the ticks and labels on the bottom
    var tuitionAxis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(tuitionScale)

    tuitionSliderGroup
        .append('g')
        .attr("transform", "translate(10, 10)")
        .attr('y', 10)
        .call(tuitionAxis)

    // create a new Slider that has the ticks and labels on the bottom
    var sizeAxis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(sizeScale)

    sizeSliderGroup
        .append('g')
        .attr("transform", "translate(10, 60)")
        .attr('y', 10)
        .call(sizeAxis)

    // create a new Slider that has the ticks and labels on the bottom
    var SAT_Axis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(SAT_Scale)

    SAT_SliderGroup
        .append('g')
        .attr("transform", "translate(10, 110)")
        .attr('y', 10)
        .call(SAT_Axis)

    // create a new Slider that has the ticks and labels on the bottom
    var admRateAxis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(admRateScale)

    admRateSliderGroup
        .append('g')
        .attr("transform", "translate(10, 160)")
        .attr('y', 10)
        .call(admRateAxis)


    var plotSelector = d3.select("#SliderLayout").select("#plot-selector").select('#dataset')
        .on('change', function (d) {return self.chooseMetric()})

    var SliderLayout = d3.select("#SliderLayout").select('svg').select('g')

    var bars = SliderLayout.selectAll('rect').data(self.schools)

    bars
        .enter()
        .append('rect')
        .merge(bars)
        .attr('x', function (d,i) {return xScale(d.INSTNM)})
        .attr('y', 0)
        .attr('height', function (d) {return yScale(+d[self.selectedMetric])})
        .attr('width', xScale.bandwidth())
        .attr('fill', 'blue')

    //Append text information of each year right below the corresponding circle
    //HINT: Use .yeartext class to style your text elements

    // yearChart.selectAll('text').data(self.electionWinners)
    //     .enter()
    //     .append('text')
    //     .classed('yeartext', true)
    //     .text(function (d) {return d.YEAR})
    //     .attr('x', function (d, i) {return yearScale(i)})
    //     .attr('y', self.yearPosition)

    // //Clicking on any specific year should highlight that circle and  update the rest of the visualizations
    // //HINT: Use .highlighted class to style the highlighted circle

    // years
    //     .on("click", function(d){ self.yearClickEvent(d.YEAR)})

    //Election information corresponding to that year should be loaded and passed to
    // the update methods of other visualizations


    //******* TODO: EXTRA CREDIT *******

    //Implement brush on the year chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of shiftChart and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.
}

// SliderLayout.prototype.chooseMetric = function() {
//     var self = this
//     self.selectedMetric = document.getElementById('dataset').value
//     console.log(self.selectedMetric)
//     self.update();
// }
// // SliderLayout.prototype.yearClickEvent = function(d) {
// //     // body...

// //     var self = this;
// //     var selectedYear = d
// //     var states = []

// //     circles = d3.select('#year-chart').select('svg').selectAll('circle')
// //         .classed('highlighted', false);

// //     circles
// //         .filter(function (d) {return d.YEAR == selectedYear})
// //         .classed('highlighted', true)

// //     d3.csv('data/Year_Timeline_' + selectedYear + '.csv', function (error, csv) {
// //         var electionYearData = csv;
// //         self.electoralVoteChart.update(electionYearData, self.colorScale)
// //         self.votePercentageChart.update(electionYearData)
// //         self.tileChart.update(electionYearData, self.colorScale)
// //         self.shiftChart.update(states)

// //     })
// // };

// SliderLayout.prototype.updateData = function (schools) {
//     var self = this
//     self.schools = schools
//     self.update()
// }
