/**
 * Constructor for the Bar Chart
 *
 * @param electoralVoteChart instance of ElectoralVoteChart
 * @param tileChart instance of TileChart
 * @param votePercentageChart instance of Vote Percentage Chart
 * @param electionInfo instance of ElectionInfo
 * @param electionWinners data corresponding to the winning parties over mutiple election years
 */
function BarChart() {
    console.log('2')
    var self = this;
    // self.electoralVoteChart = electoralVoteChart;
    // self.tileChart = tileChart;
    // self.votePercentageChart = votePercentageChart;
    // self.shiftChart = shiftChart;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
BarChart.prototype.init = function(){
    var self = this;
    console.log('3')
    self.margin = {top: 10, right: 20, bottom: 30, left: 50};
    var divBarChart = d3.select("#barChart").classed("content", true);

    // //Gets access to the div element created for this chart from HTML
    self.svgBounds = divBarChart.node().getBoundingClientRect();
    self.svgWidth = 500 //self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 500 //self.svgBounds.height;

    //creates svg element within the div
    self.svg = divBarChart.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)

    self.svg
        .append('g')
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
        .attr("transform", "translate(0," +  self.svgHeight + ") scale(1, -1)")

    self.schools
    self.selectedMetric = 'COST'
};

/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */

BarChart.prototype.update = function () { //function(selectedDimension){
    var self = this;
    console.log(self.schools)
    //var chartWidth = 
    //Domain definition for global color scale
    // var domain = [-60,-50,-40,-30,-20,-10,0,10,20,30,40,50,60 ];

    // //Color range for global color scale
    // var range = ["#0066CC", "#0080FF", "#3399FF", "#66B2FF", "#99ccff", "#CCE5FF", "#ffcccc", "#ff9999", "#ff6666", "#ff3333", "#FF0000", "#CC0000"];

    // //Global colorScale to be used consistently by all the charts
    // self.colorScale = d3.scaleQuantile()
    //     .domain(domain).range(range);


    // // ******* TODO: PART I *******

    // // Create the chart by adding circle elements representing each election year
    // //The circles should be colored based on the winning party for that year
    // //HINT: Use the .yearChart class to style your circle elements
    // //HINT: Use the chooseClass method to choose the color corresponding to the winning party.

    // var xScale = d3.scaleBand()
    //     .domain(schools.map(function (d) {
    //         return d.school_name; 
    // }))
    //     .range([self.svgWidth, 0]).padding(.1)

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(self.schools, function (d) {
            return +d[self.selectedMetric];
        })])
        .range([0, self.svgHeight]);

    var xScale = d3.scaleBand()
        .domain(self.schools.map(function (d) {
            return d.INSTNM; 
    }))
        .range([self.svgWidth, 0]).padding(.1)

    var plotSelector = d3.select("#barChart").select("#plot-selector").select('#dataset')
        .on('change', function (d) {return self.chooseMetric()})

    var barChart = d3.select("#barChart").select('svg').select('g')

    var bars = barChart.selectAll('rect').data(self.schools)

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

BarChart.prototype.chooseMetric = function() {
    var self = this
    self.selectedMetric = document.getElementById('dataset').value
    console.log(self.selectedMetric)
    self.update();
}
// BarChart.prototype.yearClickEvent = function(d) {
//     // body...

//     var self = this;
//     var selectedYear = d
//     var states = []

//     circles = d3.select('#year-chart').select('svg').selectAll('circle')
//         .classed('highlighted', false);

//     circles
//         .filter(function (d) {return d.YEAR == selectedYear})
//         .classed('highlighted', true)

//     d3.csv('data/Year_Timeline_' + selectedYear + '.csv', function (error, csv) {
//         var electionYearData = csv;
//         self.electoralVoteChart.update(electionYearData, self.colorScale)
//         self.votePercentageChart.update(electionYearData)
//         self.tileChart.update(electionYearData, self.colorScale)
//         self.shiftChart.update(states)

//     })
// };

BarChart.prototype.updateData = function (schools) {
    var self = this
    self.schools = schools
    self.update()
}
