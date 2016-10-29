//CS-5630/6630
//University of Utah
//Assignment #3
//Dylan Zwick
//u0075213

function Script (barChart, schoolData) {
    var self = this;
    self.barChart = barChart
    // self.electoralVoteChart = electoralVoteChart;
    // self.tileChart = tileChart;
    // self.votePercentageChart = votePercentageChart;
    // self.shiftChart = shiftChart;
    self.schoolData = schoolData;
    self.init();
};

Script.prototype.init = function(){
    var self = this;
    console.log('5')
    self.update()
};

Script.prototype.update = function() {
    var self = this;

    console.log('6')
    schoolNames = self.schoolData.map(function(d,i){return d.INSTNM});
    $( function() {
    $("#schoolchoice").autocomplete({
        source:schoolNames,
        max:10,
        autoFocus:true,
        select: function(event, ui){
        self.updateMainInfo(ui.item.value);
        }
    });
    });

// var schoolData

var schooMatrix

// var schoolNames

// d3.csv("data/School_Data.csv", function(data) {
//     schoolData = data;
//     schoolNames = schoolData.map(function(d,i){return d.INSTNM});
//     $( function() {
// 	$("#schoolchoice").autocomplete({
// 	    source:schoolNames,
// 	    max:10,
// 	    autoFocus:true,
// 	    select: function(event, ui){
// 		updateMainInfo(ui.item.value);
// 	    }
// 	});
//     });
// });

d3.csv("data/similarity_rankings.csv", function (data) {
    schoolMatrix = data;
});

d3.json("data/us-states.json", function (error, nation) {
    if (error) throw error;
    self.drawMap(nation);
});

}

Script.prototype.updateMainInfo = function (selectedSchool) {
    var self = this
    self.clearSimilarInfo()
    
    var selectedSchoolData = self.schoolData.filter(function(d){return d.INSTNM == selectedSchool})[0];
    var similarSchools = schoolMatrix.filter(function(d){
	return d.UNITID == selectedSchoolData.UNITID})[0];
    var similarSchoolIDs = $.map(similarSchools, function(d,i){return[d]});
    var similarSchoolsArray = [];
    console.log('sim: ' + similarSchools)
    for(var i = 0; i < similarSchoolIDs.length; i++)
    {
	similarSchoolsArray.push(
	    self.schoolData.filter(function(d){
		return d.UNITID == similarSchoolIDs[i]})[0]
	);
    }

    self.barChart.update(similarSchoolsArray)
    
    //Pretty straightforward.
    d3.select('#topschool').select('#schoolname').text(selectedSchoolData.INSTNM);
    d3.select('#topschool').select('#tuition').text(selectedSchoolData.COST);
    d3.select('#topschool').select('#SAT').text(selectedSchoolData.SAT_AVG_ALL);
    d3.select('#topschool').select('#admission').text(selectedSchoolData.ADM_RATE_ALL);
    d3.select('#topschool').select('#location').text((selectedSchoolData.CITY).concat(", ".concat(selectedSchoolData.STABBR)));
    
    var schoolnames = d3.select("#school-list")
	.selectAll("li")
	.data(similarSchoolsArray.slice(1))

    schoolnames
	.exit()
	.remove()
    
    schoolnames = schoolnames
	.enter()
	.append("li")
	.attr("id",function(d) {
	    return d.INSTNM.replace(/\s/g,'').replace("'","");
	})
	.on("click", function(d) {
	    self.updateSimilarInfo(d)})
	.text(function(d) {return d.INSTNM})
	.merge(schoolnames);

    schoolnames
	.attr("id",function(d) {
	    return d.INSTNM.replace(/\s/g,'');
	})
	.on("mouseover", function(d) {
	    self.updateHoverInfo(d)})
	.on("mouseout", function() {
	    self.clearHoverInfo()})
	.on("click", function(d) {
	    self.updateSimilarInfo(d)})
	.text(function(d) {return d.INSTNM})
    
    var mapsvg = d3.select("#map-layout");
    
    var projection = d3.geoAlbersUsa()
        .translate([800 / 2, 400 / 2])
        .scale([700]);

    mapsvg.selectAll("circle").data([]).exit().remove();
    
    mapsvg.selectAll("circle")
        .data(similarSchoolsArray.slice(1))
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return projection([d.LONGITUDE, d.LATITUDE])[0];
        })
        .attr("cy", function (d) {
            return projection([d.LONGITUDE, d.LATITUDE])[1];
        })
        .attr("r", function(d) {
	    return Math.sqrt(d.COST)/30;
	})
	.attr("id",function(d) {
	    return d.INSTNM.replace(/\s/g,'').replace("'","");
	})
	.classed("similar-school",true)
	.on("mouseover", function(d) {
	    self.updateHoverInfo(d)})
	.on("mouseout", function() {
	    self.clearHoverInfo()})
	.on("click", function(d){
	    self.updateSimilarInfo(d)});

    mapsvg
	.append("circle")
        .attr("cx", projection([selectedSchoolData.LONGITUDE, selectedSchoolData.LATITUDE])[0])
        .attr("cy", projection([selectedSchoolData.LONGITUDE, selectedSchoolData.LATITUDE])[1])
        .attr("r", Math.sqrt(selectedSchoolData.COST)/30)
	.classed("top-school",true);
}

Script.prototype.clearSimilarInfo = function() {
    var self = this;

    //Pretty straightforward.
    d3.select('#choiceschool').select('#schoolname').text("");
    d3.select('#choiceschool').select('#tuition').text("");
    d3.select('#choiceschool').select('#SAT').text("");
    d3.select('#choiceschool').select('#admission').text("");
    d3.select('#choiceschool').select('#location').text("");

    d3.select('#school-list').selectAll("li")
	.classed("selected-school",false)
    
    self.clearHoverInfo();
}

Script.prototype.clearHoverInfo = function () {
    var self = this
    d3.select('#school-list').selectAll("li")
	.classed("school-hover",false)

    d3.select("#map-layout").selectAll("circle")
	.classed("school-hover",false)
}

Script.prototype.updateHoverInfo = function (selectedSchool) {
    var self = this;
    d3.select('#school-list').selectAll("li")
	.classed("school-hover",false)

    d3.select('#school-list')
	.select('#'.concat(selectedSchool.INSTNM.replace(/\s/g,'').replace("'","")))
	.classed("school-hover",true)

    d3.select("#map-layout").selectAll("circle")
	.classed("school-hover",false)

    d3.select('#map-layout')
	.select('#'.concat(selectedSchool.INSTNM.replace(/\s/g,'').replace("'","")))
	.classed("school-hover",true)
}

Script.prototype.updateSimilarInfo = function (selectedSchool) {
    var self = this;
    //Pretty straightforward.
    d3.select('#choiceschool').select('#schoolname').text(selectedSchool.INSTNM);
    d3.select('#choiceschool').select('#tuition').text(selectedSchool.COST);
    d3.select('#choiceschool').select('#SAT').text(selectedSchool.SAT_AVG_ALL);
    d3.select('#choiceschool').select('#admission').text(selectedSchool.ADM_RATE_ALL);
    d3.select('#choiceschool').select('#location').text((selectedSchool.CITY).concat(", ".concat(selectedSchool.STABBR)));
    
    d3.select('#school-list').selectAll("li")
	.classed("selected-school",false)

    d3.select('#school-list')
	.select('#'.concat(selectedSchool.INSTNM.replace(/\s/g,'').replace("'","")))
	.classed("selected-school",true)
    
    d3.select("#map-layout").selectAll("circle")
	.classed("selected-school",false)
    
    d3.select('#map-layout')
	.select('#'.concat(selectedSchool.INSTNM.replace(/\s/g,'').replace("'","")))
	.classed("selected-school",true)
}

Script.prototype.drawMap = function (nation) {
    var self = this;
    var mapsvg = d3.select("#map-layout");

    var projection = d3.geoAlbersUsa()
            .translate([800 / 2, 400 / 2])
            .scale([700]);

    var path = d3.geoPath()
            .projection(projection);
    
    mapsvg.selectAll("path")
        .data(nation.features)
        .enter()
        .append("path")
        .attr("d", path);
}    








/**
 * Renders and updated the map and the highlights on top of it
 *
 * @param the json data with the shape of all countries
 */
/*
function drawMap(world) {

    //(note that projection is global!
    // updateMap() will need it to add the winner/runner_up markers.)

    projection = d3.geoConicConformal().scale(150).translate([400, 350]);

    // ******* TODO: PART IV *******

    // Draw the background (country outlines; hint: use #map)
    // Make sure and add gridlines to the map

    // Hint: assign an id to each country path to make it easier to select afterwards
    // we suggest you use the variable in the data element's .id field to set the id

    // Make sure and give your paths the appropriate class (see the .css selectors at
    // the top of the provided html file)

    var path = d3.geoPath().projection(projection);

    //Some documentation on geoGraticule, in either the lecture notes
    //or the textbook, would have been nice.
    var graticule = d3.geoGraticule();
    
    var map = d3.select('#map');

    //Creates the gridlines.
    //Note, I added the field fill:none to the .grat css property list.
    //Otherwise, the gridline background was an ugly grey.
    map.append("path")
	.datum(graticule)
	.attr("class","grat")
	.attr("d",path);

    //Draws the map. Note that the id value (the country's abbreviation) is
    //bound to each country path. This is how we identify particular countries
    //later in the code.
    map.selectAll("path")
	.data(topojson.feature(world,world.objects.countries).features)
	.enter()
	.append("path")
	.attr("d",path)
	.attr("class","countries")
	.attr("id",function (d){return d.id});
}

/**
 * Clears the map
 */
/*
function clearMap() {

    // ******* TODO: PART V*******
    //Clear the map of any colors/markers; You can do this with inline styling or by
    //defining a class style in styles.css

    //Hint: If you followed our suggestion of using classes to style
    //the colors and markers for hosts/teams/winners, you can use
    //d3 selection and .classed to set these classes on and off here.

    //No surprises here. Done using classes, as suggested.
    d3.select('#map').selectAll('path').classed("countries",true).classed("host",false).classed("team",false);
    d3.select('#map').selectAll('circle').remove();

}


/**
 * Update Map with info for a specific FIFA World Cup
 * @param the data for one specific world cup
 */
/*
function updateMap(worldcupData) {

    //Clear any previous selections;
    clearMap();

    // ******* TODO: PART V *******

    // Add a marker for the winner and runner up to the map.

    //Hint: remember we have a conveniently labeled class called .winner
    // as well as a .silver. These have styling attributes for the two
    //markers.


    //Select the host country and change it's color accordingly.

    //Iterate through all participating teams and change their color as well.

    //We strongly suggest using classes to style the selected countries.

    var teamnames = worldcupData['TEAM_LIST'].split(",")

    var map = d3.select('#map');

    //I spent HOURS trying to find a clever d3 way to do this. Couldn't do it.
    //Would love to know one. So, I just used a for loop, and it was super
    //simple.
    for (var i = 0; i < teamnames.length; i++) {
	map.select('#'+teamnames[i]).attr("class","team")
    }

    //Colors the host country.
    map.select('#'+worldcupData['host_country_code']).classed("host",true)

    //Puts a gold circle on the country that one.
    map.append("circle")
	.classed("gold",true)
	.attr("cx",projection([worldcupData['WIN_LON'],worldcupData['WIN_LAT']])[0])
	.attr("cy",projection([worldcupData['WIN_LON'],worldcupData['WIN_LAT']])[1])
	.attr("r", 8);

    //Puts a silver circle on the first loser.
    map.append("circle")
	.classed("silver",true)
	.attr("cx",projection([worldcupData['RUP_LON'],worldcupData['RUP_LAT']])[0])
	.attr("cy",projection([worldcupData['RUP_LON'],worldcupData['RUP_LAT']])[1])
	.attr("r", 8);
}
*/
