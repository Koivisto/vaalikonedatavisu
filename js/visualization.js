/*
Author: Aarne Leinonen 
Code can be found at https://github.com/Koivisto/vaalikonedatavisu
*/

$( document ).ready(function() {
var MAXHEIGHT = 2160; //4k resolution will suffice for few years
var MAXWIDTH = 4096; //#visualizationDiv has attribute "max-width" in css, this adjusts only the svg
var MARGIN = 100;
var LEGENDWIDHT = 200;
var MOBILEBREAKPOINT = 700;
var ALLDISTRICTS = "- Koko maa -"
var narrowerDimension = MAXHEIGHT;
//init axis value domain 
var xMax = 3;var yMax = 3;var xMin = -3;var yMin = -3;

//init some data that is used in logic and visualization
var parties = ["Itsenäisyyspuolue","Keskusta","Kokoomus","Kristillisdemokraatit","Muutos 2011","Perussuomalaiset",
			"Piraattipuolue","RKP","SDP","SKP","STP","Vasemmistoliitto","Vihreät"];
var partyVisibility = {"Itsenäisyyspuolue" : true,"Keskusta" : true,"Kokoomus" : true,"Kristillisdemokraatit" : true,
			"Muutos 2011" : true,"Perussuomalaiset" : true,"Piraattipuolue" : true,"RKP" : true,"SDP" : true,
			"SKP" : true,"STP" : true,"Vasemmistoliitto" : true,"Vihreät" : true,"Oikeisto": true,
			"Kansalliskonservatiivit": true,"Viherliberaalit": true,"Vihervasemmisto": true,"Demarit": true};
var partyColors = {"Oikeisto" : "#006288", "Kansalliskonservatiivit" : "grey", "Viherliberaalit" : "#61BF1A", 
			"Vihervasemmisto" : "#55110F", "Demarit" : "#E11931", "Kokoomus" : "#006288", "RKP" : "#FFDD93", 
			"Perussuomalaiset" : "#FFDE55", "Keskusta" : "#01954B", "Vihreät" : "#61BF1A", "Vasemmistoliitto" : 
			"#BF1E24", "SKP" : "#DA2301", "Kristillisdemokraatit" : "#18359B", "Itsenäisyyspuolue" : "#017BC4", 
			"Piraattipuolue" : "#660099", "Muutos 2011" : "#004460", "SDP" : "#E11931", "STP" : "#CC0000" };
var abbreviations = {"Itsenäisyyspuolue" : "IP","Keskusta" : "KESK","Kokoomus" : "KOK","Kristillisdemokraatit" : "KD",
			"Muutos 2011" : "M11","Perussuomalaiset" : "PS","Piraattipuolue" : "PIR","RKP" : "RKP","SDP" : "SDP",
			"SKP" : "SKP","STP" : "STP","Vasemmistoliitto" : "VAS","Vihreät" : "VIH","Oikeisto": "oik",
			"Kansalliskonservatiivit": "kans","Viherliberaalit": "vlib","Vihervasemmisto": "vvas","Demarit": "dem"};
var axisValues = ["Impivaaralaisuus", "Talousoikeistolaisuus", "Arvoliberaalius", "Vihreys", "Ikä"];
//init "Impivaaralaisuus" and "Arvoliberaalius" as first axis
var xAxisValue = axisValues[0], yAxisValue = axisValues[2];
var axisValueOpposites = ["Maailmankansalaisuus", "Talousvasemmistolaisuus","Arvokonservatiivius", "\"Epävihreys\"",""];
var segments = ["Oikeisto","Kansalliskonservatiivit","Viherliberaalit","Vihervasemmisto","Demarit"];

/**********************
	Helper functions
/**********************/

/*Maps parties and segments to colors, 
party color from here http://fi.wikipedia.org/wiki/Luokka:Politiikkamallineet */
function getColor(str){
	return partyColors[str];
}

/*Decides proper size for the visualization*/
function getHeight(){
	if( $(window).height() > MAXHEIGHT +100 ) return MAXHEIGHT;
	return $(window).height() - 100;
};

/*Returns width for main svg element*/
function getWidth(){
	if( $("#visualizationDiv").width() > MAXWIDTH )	return MAXWIDTH - LEGENDWIDHT-20;
	if ($("#visualizationDiv").width() < MOBILEBREAKPOINT ) return $("#visualizationDiv").width();
	return $("#visualizationDiv").width() -LEGENDWIDHT-20;
}

/*Adjusts the datapoint marginal*/
function adjustVisualizationToScreenSize(){
	if ( $("#visualizationDiv").width() < MOBILEBREAKPOINT+LEGENDWIDHT+20 
		|| getHeight() < MOBILEBREAKPOINT+LEGENDWIDHT+20){ 
		MARGIN = 20;
	}
	else{
		MARGIN = 100;
	}

	if(getWidth() < getHeight()){ narrowerDimension = getWidth(); }
	else{ narrowerDimension = getHeight(); }
}
adjustVisualizationToScreenSize();


//scales the data to screen size, these variables are used as functions when scaling the data.
var linearWidthScale = d3.scale.linear()
								.domain([ xMin   , xMax ])
								.range( [ MARGIN , getWidth()-MARGIN ]);
var linearHeigthScale = d3.scale.linear()
								.domain([ yMax   , yMin ])
								.range( [ MARGIN , getHeight()-MARGIN ]);
var linearElementScale = d3.scale.linear()
								.domain([ 0 , MAXHEIGHT ])
								.range( [ 2 , 20 ]);

/************************************************************************/
/*Init root elements for visualization*/
var form = d3.select("#visualizationForm");
var svg = d3.select("#visualizationSvg");

svg
.attr("width", getWidth())
.attr("height", getHeight());

/************************************************************************/
/*Data begins*/
d3.csv("data.csv", function(d){

	/**********************
		User interface
	/**********************/

	/*Initializes UI elements inside the form*/
	//name and candidate number filtering
	var searchInput = d3.select("#searchForm").append("input")
		.attr("placeholder", "Etsi nimellä")
		.attr("type", "text")
		.attr("id", "searchInput")
		.on("input", function(){filterCandidates();});

	//District option menu
	var districtSelector = d3.select("#locationForm").append("select");
	districtSelector.append("option")
		.attr("value", "all")
		.text("Valitse alue");

	// Data parsing for voting districts that are present
	var areadict = {}, areas = [];
	d.forEach(function(d) {
		areadict[d.district] = true;
	});
	for (key in areadict) {
		areas.push(key);
	}
	areas.push(ALLDISTRICTS);
	areas.sort();
	//holds the selected district outside the redraw()
	var currentDistrict = null;

	//X and Y axis selection option menus
	var axisXSelector = d3.select("#xForm").append("select");
	axisXSelector.append("option")
		.attr("value", "all")
		.text("Valitse X-akseli");
	var axisYSelector = d3.select("#yForm").append("select");
	axisYSelector.append("option")
		.attr("value", "all")
		.text("Valitse Y-akseli");

	/*UI control for district (needs to be inside resizing)*/
	districtSelector.selectAll("option.local")
		.data(areas)
		.enter().append("option")
			.attr("class", "local")
			.attr("value", function(d) { return d; })
			.text(function(d) { return d; });
	districtSelector.on("change", function(){
		filterCandidates();
	});
	
	/*UI control for axis*/
	axisXSelector.selectAll("option.local")
		.data(axisValues)
		.enter().append("option")
			.attr("class", "local")
			.attr("value", function(d) { return d; })
			.text(function(d) { return d; });
	axisYSelector.selectAll("option.local")
		.data(axisValues)
		.enter().append("option")
			.attr("class", "local")
			.attr("value", function(d) { return d; })
			.text(function(d) { return d; });
	axisXSelector.on("change", function(){redraw();});
	axisYSelector.on("change", function(){redraw();});



	/*Initializes Legend UI elements*/
	//Candidate color toggle on party/segment
	var legendContainer = d3.select("#legendContainer");
	var legendControls = legendContainer.select("#legendControls");
	var showPartyColors = true;
	var partyRadioBtn = legendControls.append("input")
		.attr("type", "radio")
		.attr("name", "color")
		.attr("value", "party")
		.attr("id", "party")
		.property("checked", true)
		.on("click", function() {showPartyColors = true; setCandidateColor();});
	legendControls.append("label")
		.attr("for", "party")
		.html(" Värit puolueittain<br>");
	var segmentRadioBtn = legendControls.append("input")
		.attr("type", "radio")
		.attr("name", "color")
		.attr("value", "segment")
		.attr("id", "segment")
		.property("checked", false)
		.on("click", function() {showPartyColors = false; setCandidateColor();});
	legendControls.append("label")
		.attr("for", "segment")
		.html(" Värit segmenteittäin");

			


	/*****************************
		Legend (right side bar)
	/*****************************/
	//init legendSvg
	var legendSvg = d3.select("#legendSvg");
	legendSvg.attr("width", LEGENDWIDHT).attr("height", 400);//height has currently a "magic number"
	drawLegend();

	function drawLegend(){
		/*Party selection UI elements in legendContainer and logic*/
		//helping function por positioning
		var tick = 0;
		function getNextTick(){tick = tick +1;return tick;}
		//circles presenting the parties
		var partiesSelection = legendSvg.selectAll("circle.parties")
		.data(parties)
		.enter()
			.append("circle")
			.attr("cx", LEGENDWIDHT-13)
			.attr("cy", function(parties){return +(getNextTick()*20);})
			.attr("r", 10)
			.attr("class", "parties")
			.attr("id", function(parties){return abbreviations[parties]})
			.style("fill", function(parties){return getColor(parties)})
			.style("opacity", function(parties){return getOpacity(partyVisibility[parties]);})
			.on("click", function(parties){
				toggleSelection(parties);
				filterCandidates();
			});
		getNextTick();//skip one line
		var segmentsSelection = legendSvg.selectAll("circle.segments")
		.data(segments)
		.enter()
			.append("circle")
			.attr("cx", LEGENDWIDHT-13)
			.attr("cy", function(segments){return +(getNextTick()*20);})
			.attr("r", 10)
			.attr("class", "segments")
			.attr("id", function(segments){return abbreviations[segments]})
			.style("fill", function(segments){return getColor(segments)})
			.style("opacity", function(segments){return getOpacity(partyVisibility[segments]);})
			.on("click", function(segments){
				toggleSelection(segments);
				filterCandidates();
			});
		segments
		tick = 0;
		//text labels for circles
		var partyLabes = legendSvg.selectAll("text")
		.data(parties)
		.enter()
			.append("text")
			.attr("x", LEGENDWIDHT-26)
			.attr("y", function(parties){return +(getNextTick()*20 +5);})
			.attr("class", "partyLabes")
			.attr("id", function(parties){return abbreviations[parties]})
			.text(function(d){return d;})
			.on("click", function(parties){
				toggleSelection(parties);
				filterCandidates();
			});
		//Draws separator line, but only once and when something to separate
		var separatorYposition = getNextTick();
		if (separatorYposition > 1) {
			separatorYposition = separatorYposition*20;
			legendSvg.append("line")
				.attr("x1", 0)
				.attr("y1", separatorYposition)
				.attr("x2", LEGENDWIDHT)
				.attr("y2", separatorYposition)
				.attr("class", "axisLine")
				.attr("stroke-width", 2)
				.attr("stroke", "black");
		};
		//getNextTick();//skip one line
		var partyLabes = legendSvg.selectAll("text.segments")
		.data(segments)
		.enter()
			.append("text")
			.attr("x", LEGENDWIDHT-26)
			.attr("y", function(segments){return +(getNextTick()*20 +5);})
			.attr("class", "partyLabes segments")
			.attr("id", function(segments){return abbreviations[segments]})
			.text(function(d){return d;})
			.on("click", function(segments){
				toggleSelection(segments);
				filterCandidates();
			});
	}

	function toggleSelection(party){
		partyVisibility[party] = !partyVisibility[party];
		//element.style("opacity", function(){return getOpacity(partyVisibility[party]);});
		d3.selectAll("#"+abbreviations[party]+"").style("opacity", function(){return getOpacity(partyVisibility[party]);});
	}

	//TODO rename
	function getOpacity(boolean){
		if(boolean) return 1.0;
		return 0.3;
	}


	/**********************
		Axis
	/**********************/

	/*Init axis elements*/
	var axisGroup = svg.append("g");
	axisGroup.attr("class", "axisGroup");
	var xAxisLine = axisGroup.append("line");
	var xAxisLabelRight = axisGroup.append("text");
	var xAxisLabelLeft = axisGroup.append("text");
	var yAxisLine = axisGroup.append("line");
	var yAxisLabelTop = axisGroup.append("text");
	var yAxisLabelBottom = axisGroup.append("text");

	//Lazy enum for axis labels to data
	function getXValue(d){
		return getValueFromStr(d, xAxisValue);
	}
	function getYValue(d){
		return getValueFromStr(d, yAxisValue);
	}
	function getValueFromStr(d, str){
		switch(str){
			case "Impivaaralaisuus": return d.imp;
			case "Talousoikeistolaisuus": return d.oik;
			case "Arvoliberaalius": return d.lib;
			case "Vihreys": return d.vih;
			case "Ikä": return d.age;
			default: return 0;
		}
	}

	function changeAxisX(){
		if (axisXSelector.property('selectedIndex') > 0) {//if something is selected in menu
			xAxisValue = axisValues[axisXSelector.property('selectedIndex')-1];
		}
	}
	function changeAxisY(){
		if (axisYSelector.property('selectedIndex') > 0) {//if something is selected in menu
			yAxisValue = axisValues[axisYSelector.property('selectedIndex')-1];
		}
	}
	function updateMaxMinForAxis(){
		xMax = d3.max(d, function(d) { return +getValueFromStr(d, xAxisValue); });
		xMin = d3.min(d, function(d) { return +getValueFromStr(d, xAxisValue); });
		yMax = d3.max(d, function(d) { return +getValueFromStr(d, yAxisValue); });
		yMin = d3.min(d, function(d) { return +getValueFromStr(d, yAxisValue); });
	}
	function updateAxis(){
		changeAxisX();
		changeAxisY();
		updateMaxMinForAxis();

		/*Init helpers*/
		var width = getWidth();
		var height = getHeight();
		//horisontal xAxis
		xAxisLine
			.attr("x1", 0)
			.attr("y1", height/2)
			.attr("x2", width)
			.attr("y2", height/2)
			.attr("class", "axisLine")
			.attr("stroke-width", 2)
			.attr("stroke", "black");
		xAxisLabelRight
			.attr("x", width)
			.attr("y", height/2)
			.attr("class", "axisExplanation")
			.attr("transform", "rotate(90 "+width+" "+height/2+") translate(0, 35)")
			.text(xAxisValue);
		xAxisLabelLeft
			.attr("x", 0)
			.attr("y", height/2)
			.attr("class", "axisExplanation")
			.attr("transform", "rotate(270 "+0+" "+height/2+") translate(0, 35)")
			.text(axisValueOpposites[axisValues.indexOf(xAxisValue)]);
		//vertical yAxis
		yAxisLine
			.attr("x1", width/2)
			.attr("y1", 0)
			.attr("x2", width/2)
			.attr("y2", height)
			.attr("class", "axisLine")
			.attr("stroke-width", 2)
			.attr("stroke", "black");
		yAxisLabelTop
			.attr("x", width/2)
			.attr("y", 30)
			.attr("class", "axisExplanation")
			.attr("transform", "translate(0, 5)")
			.text(yAxisValue);
		yAxisLabelBottom
			.attr("x", width/2)
			.attr("y", height)
			.attr("transform", "translate(0, -5)")
			.attr("class", "axisExplanation")
			.text(axisValueOpposites[axisValues.indexOf(yAxisValue)]);
	}

	
	

	/**********************
		Candidate
	/**********************/

	//some helper variables for logic
	var candidate = null;
	var previousCandidate = null;
	var isClicked = false;

	/*Connects the data to svg elements, determines the interaction logic, create DOM elements*/
	var candidateGroup = svg.append("g")
	candidateGroup.attr("class", "candidateGroup")
	var candidates = candidateGroup.selectAll("circle")
		.data(d)
		.enter()
			.append("circle")
			.attr("cx", getWidth()/2)//function(d){return linearWidthScale(getXValue(d));})
			.attr("cy", getHeight()/2)//function(d){return linearHeigthScale(getYValue(d));})
			.attr("r", function(d){return linearElementScale(narrowerDimension);})
			.style("fill", function(d){return getColor(d.party);});

	/*Creates candidate data object containing element, name, party, segment, 
	id (candidate number), district, age, education, url, xCoordinate, yCoordinate*/
	function defineCandidate(d, givenElement){
		candidate = {element: givenElement, 
			name: d.name, 
			party: d.party, 
			segment: d.segment,
			district: d.district,
			age: d.age,
			education: d.education,
			url: d.www,
			xCoordinate: +getXValue(d), 
			yCoordinate: +getYValue(d)};
			return candidate;
	}

	/*Assign actions on candidate elements
	It is possible to click candidate, so the info will keep showing*/
	candidates
		.on("click", function(d){
			isClicked = !isClicked;
			defineCandidate(d, d3.select(this));
			displayInfo(candidate);
			previousCandidate = candidate;
		})
		.on("mouseenter", function(d){
			defineCandidate(d, d3.select(this));
			if(previousCandidate != null && isClicked){
				dontDisplayInfo(previousCandidate);
						isClicked = !isClicked;}//prepares for new a click
						displayInfo(candidate);
					})
		.on("mouseleave", function(d){
			defineCandidate(d, d3.select(this));
			if(!isClicked){dontDisplayInfo(candidate);};
		})
		.on("touchstart", function(d){
			defineCandidate(d, d3.select(this));
			displayInfo(candidate);
		})
		.on("touchend", function(d){
			defineCandidate(d, d3.select(this));
			if(!isClicked){dontDisplayInfo(candidate)};
		});

	/*Sets color for candidate elements based on data and choises*/
	function setCandidateColor(){
		candidates
		.transition()
		.duration(500)
		.style("fill", function(d){
			if(showPartyColors)	return getColor(d.party);
			return getColor(d.segment)
		});
	}

	/*Sets css "display" to "none" for filtered candidate elements*/
	function filterCandidates(){
		//updates district filter
		if (districtSelector.property("selectedIndex") > 0) {
			currentDistrict = areas[districtSelector.property("selectedIndex")-1];
		}
		//updates name and candidate number filter
		var searchValue = searchInput.property("value").toLowerCase();
		var searchArray = searchValue.split(" ");

		//Let the filtering begin!
		candidates
			.attr("display", function(d) {
				//district filter
				if (currentDistrict === ALLDISTRICTS) return "inline";
				else if (currentDistrict && d.district !== currentDistrict) return "none";

				if(!partyVisibility[d.party] || !partyVisibility[d.segment]) return "none";

				//if something in the search box then also filter with that
				if (searchValue) {
					for (var i = 0; i < searchArray.length; i++) {
						if (d.name.toLowerCase().indexOf(searchArray[i].trim()) < 0){
							return "none";
						} 
					}
				}
			})
	}


	/*highlights svg element, creates infoBox div with candidate information*/
	function displayInfo(candidate){
		candidate.element
		.transition()
		.duration(300)
		.attr("r", function(d){return linearElementScale(narrowerDimension)*2;})

		//html text for infoBox
		var infoString = "<strong>"+candidate.name+"</strong><br>"+
			"<strong style=\"color:"+getColor(candidate.party)+"\">"+candidate.party+"</strong><br>"+
			"segmentti: "+"<em style=\"color:"+getColor(candidate.segment)+"\">\""+candidate.segment+"\"</em><br><br>"+
			candidate.district+"<br>"+
			candidate.age+" vuotias, "+candidate.education+"<br>"+
			"<br><a class=\"infoBoxLink\" href=\""+candidate.url+"\">"+candidate.url+"</a>";

		//infoBox for candidate information
		var infoDiv = document.createElement("div");
		//infobox closing button
		var closeButton = document.createElement("BUTTON");
		document.getElementById("explanations").appendChild(infoDiv);
		//if too far to right border, then uses different class
		if(parseInt(candidate.element.attr("cx") + svg.offsetLeft) > (width-220)){
			infoDiv.className = "infoBox toLeft";
			closeButton.className = "infoBoxClose infoBoxCloseLeft";
		}
		else{
			infoDiv.className = "infoBox toRight";
			closeButton.className = "infoBoxClose";
		}
		infoDiv.id = candidate.name;
		infoDiv.innerHTML = infoString;
		//TODO: fix over MAXWIDTH delocation due centralization, hotfix was 2000px maxwidth
		infoDiv.style.left = parseInt(candidate.element.attr("cx") + svg.offsetLeft) + "px";
		infoDiv.style.top = parseInt(candidate.element.attr("cy") + svg.offsetTop) +-10+"px";
		closeButton.appendChild(document.createTextNode("X"));
		closeButton.addEventListener("click",function(d){dontDisplayInfo(candidate);});
		infoDiv.appendChild(closeButton);
	}

	/*restores the svg element size, deletes the infoBox div*/
	function dontDisplayInfo(candidate){
		candidate.element
			.transition()
			.duration(300)
			.attr("r", function(d){return linearElementScale(narrowerDimension);})
		var infoDiv = document.getElementById(candidate.name);
		infoDiv.parentNode.removeChild(infoDiv);
	}

	/*removes all info boxes present*/
	function removeInfoDivs(){
		var explanationsDiv = document.getElementById("explanations");
		while (explanationsDiv.hasChildNodes()) {
			explanationsDiv.removeChild(explanationsDiv.lastChild);
		}
	}

	/****************************************
		Visualization resizing starts
	****************************************/

	function resize() {
		/*Reset key values*/
		width = getWidth();
		var height = getHeight();
		svg
		.attr("width", width)
		.attr("height", height);

		removeInfoDivs();
		adjustVisualizationToScreenSize();
		updateAxis();
		redraw();
	}

	function redraw() {
		adjustVisualizationToScreenSize();
		removeInfoDivs();
		updateAxis();

		//Updates static arrays
		linearWidthScale.domain([ xMin , xMax ]).range([ MARGIN , getWidth()-MARGIN ]);
		linearHeigthScale.domain([ yMax , yMin ]).range([ MARGIN , getHeight()-MARGIN ]);
		linearElementScale.domain([ 0 , MAXHEIGHT ]).range([ 2 , 20 ]);

		candidates
			.transition()
			.duration(750)
			.attr("cx", function(d){return linearWidthScale(+getXValue(d));})
			.attr("cy", function(d){return linearHeigthScale(+getYValue(d));})
			.attr("r", function(d){return linearElementScale(narrowerDimension);});
		filterCandidates();
	}

	d3.select(window).on("resize", resize); 
	resize();
	redraw();
	/****************************************
		Visualization resizing ends
	****************************************/

});/*Data ends*/
/***********************************************************************/
});