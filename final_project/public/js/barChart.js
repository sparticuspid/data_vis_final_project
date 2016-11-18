/**
 * Constructor for the Bar Chart
 */
function BarChart() {
    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
BarChart.prototype.init = function(){
    var self = this;
    var divBarChart = d3.select("#barChart").classed("view", true);

    // //Gets access to the div element created for this chart from HTML
    self.margin =    {top: 10, right: 20, bottom: 30, left: 50};
    self.svgBounds = divBarChart.node().getBoundingClientRect();
    self.svgWidth = 500 //self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 300 //self.svgBounds.height;
    self.padding = 25;
    self.textWidth = 50;

    //creates svg element within the div
    self.svg = divBarChart.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
        .attr('y', 50)

    self.svg
        .append('g')
        .attr('id','bars')
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
        .attr("transform", "translate(" + (self.textWidth + self.padding) + "," +  (self.svgHeight - self.padding) + ") scale(1, -1)")

    self.svg
        .append('g')
        .attr('id','yAxis')
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
        .attr("transform", "translate(" + (self.textWidth + self.padding) + "," +  self.padding + ")")

    self.schoolData = []
    self.selectedMetric = 'COST'
    self.selectedSchool = 'University of Utah'
};

/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */

BarChart.prototype.update = function () {
    var self = this;

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(self.schoolData, function (d) {
            return +d[self.selectedMetric];
        })])
        .range([self.svgHeight - self.padding*2,0]);

    var xScale = d3.scaleBand()
        .domain(self.schoolData.map(function (d) {
            return d.INSTNM; 
    }))
        .range([self.svgWidth - self.textWidth - self.padding, 0]).padding(.1)

    var plotSelector = d3.select("#barChart").select("#plot-selector").select('#dataset')
        .on('change', function (d) {return self.chooseMetric()})

    var yAxisGroup = d3.select('#yAxis')

    var yAxis = d3.axisLeft();

    // assign the scale to the axis
    yAxis.scale(yScale);
    yAxisGroup.call(yAxis);

    var bars = d3.select('#bars').selectAll('rect').data(self.schoolData)

    bars
        .exit()
        .remove()

    bars = bars
        .enter()
        .append('rect')
        .merge(bars)
        .attr('x', function (d,i) {return xScale(d.INSTNM)})
        .attr('height', function (d) {return yScale(0) - yScale(+d[self.selectedMetric])})
        .attr('width', xScale.bandwidth())
        .attr('fill', 'blue')
        .classed('selected', false)

    bars
        .filter(function (d) {console.log('selected school: ' + d.INSTNM + self.selectedSchool); return d.INSTNM == self.selectedSchool })
        .classed('selected', true)


}

BarChart.prototype.chooseMetric = function() {
    var self = this
    self.selectedMetric = document.getElementById('dataset').value
    console.log(self.selectedMetric)
    self.update();
}

BarChart.prototype.updateData = function (schools, selectedSchool) {
    var self = this
    self.schoolData = schools
    self.selectedSchool = selectedSchool
    self.update()
}
