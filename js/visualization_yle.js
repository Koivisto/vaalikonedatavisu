/*
Author: Aarne Leinonen 
Code can be found at https://github.com/Koivisto/vaalikonedatavisu
This code is shared under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International 
http://creativecommons.org/licenses/by-nc-sa/4.0/
http://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
*/

$( document ).ready(function() {

/**********************
	Init values
/**********************/

var MAXHEIGHT = 2160; //4k resolution will suffice for few years
var MAXWIDTH = 4096; //#visualizationDiv_yle has attribute "max-width" in css, this adjusts only the svg
var MARGIN = 100;
var LEGENDWIDHT = 200;
var MOBILEBREAKPOINT = 700;
var ALLDISTRICTS = "- Koko maa -"
var narrowerDimension = MAXHEIGHT;
//init axis value domain 
var xMax = 3;var yMax = 3;var xMin = -3;var yMin = -3;

//init some data that is used in logic and visualization
var parties = ["Itsenäisyyspuolue","Kansallinen Kokoomus","Kommunistinen Työväenpuolue - Rauhan ja Sosialismin puolesta","Köyhien Asialla","Muutos 2011","Perussuomalaiset","Piraattipuolue","Pirkanmaan Sitoutumattomat yhteislista","Suomen Keskusta","Suomen Kommunistinen Puolue","Suomen Kristillisdemokraatit (KD)","Suomen ruotsalainen kansanpuolue","Suomen Sosialidemokraattinen Puolue","Suomen Työväenpuolue STP","Vasemmistoliitto","Vihreä liitto"];
// missing candidates "Ahvenanmaan liberaalit","Åländsk Samling",
var partyVisibility = {"Itsenäisyyspuolue" : false,"Ahvenanmaan liberaalit": false,"Kommunistinen Työväenpuolue - Rauhan ja Sosialismin puolesta": false,"Köyhien Asialla": false,"Pirkanmaan Sitoutumattomat yhteislista": false,"Åländsk Samling": false,"Valitsijayhdistys Jaakko Katajisto": false,"Valitsijayhdistys Jani Leinonen": false,"Valitsijayhdistys Jani Pontus Toivanen": false,"Valitsijayhdistys Joni Tikka": false,"Valitsijayhdistys Jyrki Helminen": false,"Valitsijayhdistys Kari Leppäjoki": false,"Valitsijayhdistys Kim Sjöström": false,"Valitsijayhdistys Kristiina Kreisler": false,"Valitsijayhdistys Mika Vähäkangas": false,"Valitsijayhdistys Risto Hintikka": false,"Valitsijayhdistys Sanna Hirvonen": false,"Valitsijayhdistys Tero Poikolainen": false,"Valitsijayhdistys Ville Punto": false,"Valitsijayhdistys Yakup Yilmaz": false,"Suomen Keskusta" : true,"Kansallinen Kokoomus" : true,"Suomen Kristillisdemokraatit (KD)" : true,"Muutos 2011" : true,"Perussuomalaiset" : true,"Piraattipuolue" : false,"Suomen ruotsalainen kansanpuolue" : true,"Suomen Sosialidemokraattinen Puolue" : true,"Suomen Kommunistinen Puolue" : false,"Suomen Työväenpuolue STP" : false,"Vasemmistoliitto" : true,"Vihreä liitto" : true,"Markkinaliberaalit": true,"Konservatiivit": true, "Nationalistikonservatiivit": true,"Liberaalit": true,"Vasemmistoliberaalit": true,"Maltillinen vasemmisto": true};
var partyColors = {"Markkinaliberaalit" : "#006288", "Ahvenanmaan liberaalit": "#FFFFFF","Kommunistinen Työväenpuolue - Rauhan ja Sosialismin puolesta": "#FF0000","Köyhien Asialla": "#FF0000","Pirkanmaan Sitoutumattomat yhteislista": "#FFFFFF","Åländsk Samling": "#000000","Konservatiivit": "#666666", "Nationalistikonservatiivit" : "grey", "Liberaalit" : "#61BF1A", "Vasemmistoliberaalit" : "#55110F", "Maltillinen vasemmisto" : "#E11931", "Kansallinen Kokoomus" : "#006288", "Suomen ruotsalainen kansanpuolue" : "#FFDD93", "Perussuomalaiset" : "#FFDE55", "Suomen Keskusta" : "#01954B", "Vihreä liitto" : "#61BF1A", "Vasemmistoliitto" : "#BF1E24", "Suomen Kommunistinen Puolue" : "#DA2301", "Suomen Kristillisdemokraatit (KD)" : "#18359B", "Itsenäisyyspuolue" : "#017BC4", "Piraattipuolue" : "#660099", "Muutos 2011" : "#004460", "Suomen Sosialidemokraattinen Puolue" : "#E11931", "Suomen Työväenpuolue STP" : "#CC0000" };
var abbreviations = {"Itsenäisyyspuolue" : "IP","Ahvenanmaan liberaalit": "AL","Kommunistinen Työväenpuolue - Rauhan ja Sosialismin puolesta": "KTRJSP","Köyhien Asialla": "KOY","Pirkanmaan Sitoutumattomat yhteislista": "PSY","Åländsk Samling": "AS","Suomen Keskusta" : "KESK","Kansallinen Kokoomus" : "KOK","Suomen Kristillisdemokraatit (KD)" : "KD","Muutos 2011" : "M11","Perussuomalaiset" : "PS","Piraattipuolue" : "PIR","Suomen ruotsalainen kansanpuolue" : "RKP","Suomen Sosialidemokraattinen Puolue" : "SDP","Suomen Kommunistinen Puolue" : "SKP","Suomen Työväenpuolue STP" : "STP","Vasemmistoliitto" : "VAS","Vihreä liitto" : "VIH","Markkinaliberaalit": "mark" , "Konservatiivit": "kons", "Nationalistikonservatiivit": "Nat.konservatiivit","Liberaalit": "vlib","Vasemmistoliberaalit": "vvas","Maltillinen vasemmisto": "Malt.vasemmisto"};
var segments = ["Konservatiivit","Nationalistikonservatiivit","Vasemmistoliberaalit","Liberaalit","Maltillinen vasemmisto", "Markkinaliberaalit"];
var axisValues = ["Talousoikeistolaisuus", "Nationalismikonservatiivisuus", "Arvoliberaalius", "Ikä", "Ehdokasnumero"];
//init "Nationalismikonservatiivisuus" and "Arvoliberaalius" as first axis
var xAxisValue = axisValues[1], yAxisValue = axisValues[2];
var axisValueOpposites = ["Talousvasemmistolaisuus", "Maailmankansalaisuus", "Arvokonservatiivius", "",""];

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
	if( $("#visualizationDiv_yle").width() > MAXWIDTH )	return MAXWIDTH - LEGENDWIDHT-20;
	if ($("#visualizationDiv_yle").width() < MOBILEBREAKPOINT ) return $("#visualizationDiv_yle").width();
	return $("#visualizationDiv_yle").width() -LEGENDWIDHT-20;
}

/*Adjusts the datapoint marginal*/
function adjustVisualizationToScreenSize(){
	if ( $("#visualizationDiv_yle").width() < MOBILEBREAKPOINT+LEGENDWIDHT+20 
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

/*scales the data to screen size, these variables are used as functions when scaling the data. 
Domain and range values are revaluated locally*/
var linearWidthScale = d3.scale.linear()
								.domain([ xMin   , xMax ])
								.range( [ MARGIN , getWidth()-MARGIN ]);
var linearHeigthScale = d3.scale.linear()
								.domain([ yMax   , yMin ])
								.range( [ MARGIN , getHeight()-MARGIN ]);
var linearElementScale = d3.scale.linear()
								.domain([ 0 , MAXHEIGHT ])
								.range( [ 2 , 20 ]);

/**********************
	Init root elements
	for visualization
/**********************/
var svg = d3.select("#visualizationSvg_yle");

svg
.attr("width", getWidth())
.attr("height", getHeight());

/************************************************************************/
/*Data begins*/
d3.csv("data_yle.csv", function(d){

	/**********************
		User interface
	/**********************/

	/*Initializes UI elements inside the form*/
	//name and candidate number filtering
	var searchInput = d3.select("#searchForm_yle").append("input")
		.attr("placeholder", "Etsi nimellä")
		.attr("type", "text")
		.attr("id", "searchInput_yle")
		.on("input", function(){filterCandidates();});

	//District option menu
	var districtSelector = d3.select("#locationForm_yle").append("select");
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
	var axisXSelector = d3.select("#xForm_yle").append("select");
	axisXSelector.append("option")
		.attr("value", "all")
		.text("Valitse X-akseli");
	var axisYSelector = d3.select("#yForm_yle").append("select");
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
	var legendContainer = d3.select("#legendContainer_yle");
	var legendControls = legendContainer.select("#legendControls_yle");
	legendControls.append("span")
		.html("<em class=\"grey\">Näytä väritys:</em><br>");
	var showPartyColors = true;
	var partyRadioBtn = legendControls.append("input")
		.attr("type", "radio")
		.attr("name", "color_yle")
		.attr("value", "party_yle")
		.attr("id", "party_yle")
		.property("checked", true)
		.on("click", function() {showPartyColors = true; setCandidateColor();});
	legendControls.append("label")
		.attr("for", "party_yle")
		.html(" Puolueittain<br>");
	var segmentRadioBtn = legendControls.append("input")
		.attr("type", "radio")
		.attr("name", "color_yle")
		.attr("value", "segment_yle")
		.attr("id", "segment_yle")
		.property("checked", false)
		.on("click", function() {showPartyColors = false; setCandidateColor();});
	legendControls.append("label")
		.attr("for", "segment_yle")
		.html(" Segmenteittäin<br>");

	/*****************************
		Legend (right side bar)
	/*****************************/
	//init legendSvg
	var legendSvg = d3.select("#legendSvg_yle");
	legendSvg.attr("width", LEGENDWIDHT).attr("height", 510);//height has currently a "magic number"
	drawLegend();

	/*Draws party selection UI elements in legendSvg , adds logic to them*/
	function drawLegend(){
		//var guide = "Valitse näytettävät puolueet:"
		var tick = 1;
		//helping function for positioning
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
			.style("opacity", function(parties){return getSelectionOpacity(partyVisibility[parties]);})
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
			.attr("cy", function(segments){return +(getNextTick()*20+15);})
			.attr("r", 10)
			.attr("class", "segments")
			.attr("id", function(segments){return abbreviations[segments]})
			.style("fill", function(segments){return getColor(segments)})
			.style("opacity", function(segments){return getSelectionOpacity(partyVisibility[segments]);})
			.on("click", function(segments){
				toggleSelection(segments);
				filterCandidates();
			});
		tick = 0;
		legendSvg.append("text")
			.attr("x", LEGENDWIDHT/2)
			.attr("y", function(segments){return +(getNextTick()*20);})
			.attr("class", "legendLabel")
			.text("Valitse puolueita:");
		//text labels for circles
		var partyLabels = legendSvg.selectAll("text.parties")
		.data(parties)
		.enter()
			.append("text")
			.attr("x", LEGENDWIDHT-26)
			.attr("y", function(parties){return +(getNextTick()*20 +5);})
			.attr("class", "partyLabels")
			.attr("id", function(parties){return abbreviations[parties]})
			.style("opacity", function(parties){return getSelectionOpacity(partyVisibility[parties]);})
			.text(function(parties){if(parties.length >= 22)return abbreviations[parties];return parties;})
			.on("click", function(parties){
				toggleSelection(parties);
				filterCandidates();
			});
		//Draws separator line, but only once and when something to separate
		legendSvg.append("text")
			.attr("x", LEGENDWIDHT/2)
			.attr("y", function(segments){return +(getNextTick()*20 +15);})
			.attr("class", "legendLabel")
			.text("Valitse segmenttejä:");
		var partyLabels = legendSvg.selectAll("text.segments")
		.data(segments)
		.enter()
			.append("text")
			.attr("x", LEGENDWIDHT-26)
			.attr("y", function(segments){return +(getNextTick()*20 +20);})
			.attr("class", "partyLabels segments")
			.attr("id", function(segments){return abbreviations[segments]})
			.text(function(segments){if(segments.length >= 22)return abbreviations[segments];return segments;})
			.on("click", function(segments){
				toggleSelection(segments);
				filterCandidates();
			});
	}

	function toggleSelection(party){
		partyVisibility[party] = !partyVisibility[party];
		d3.selectAll("#"+abbreviations[party]+"")
			.style("opacity", function(){return getSelectionOpacity(partyVisibility[party]);});
	}

	function getSelectionOpacity(boolean){
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

	/*Lazy enum for axis labels to data*/
	function getXValue(d){
		return getValueFromStr(d, xAxisValue);
	}

	function getYValue(d){
		return getValueFromStr(d, yAxisValue);
	}

	function getValueFromStr(d, str){
		switch(str){
			case "Nationalismikonservatiivisuus": return d.nat;
			case "Talousoikeistolaisuus": return d.oik;
			case "Arvoliberaalius": return d.lib;
			case "Ikä": return d.age;
			case "Ehdokasnumero": return d.votenumber;
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

	/*Updates axis line position and text value*/
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

	/******************
		Candidate
	/******************/

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
			/*	getWidth()/2 is the reason for a spread effect in the start, could have initialized them with:
				function(d){return linearWidthScale(getXValue(d));}*/
			.attr("cx", getWidth()/2)
			.attr("cy", getHeight()/2)
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
			votenumber: d.votenumber,
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

				//party filter
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
		var infoString = "<strong>"+candidate.name+"</strong>, nro. "+candidate.votenumber+"<br>"+
			"<strong style=\"color:"+getColor(candidate.party)+"\">"+candidate.party+"</strong><br>"+
			"segmentti: "+"<em style=\"color:"+getColor(candidate.segment)+"\">\""+candidate.segment+"\"</em><br><br>"+
			candidate.district+"<br>"+
			candidate.age+" vuotias, "+candidate.education+"<br>"+
			"<br><a class=\"infoBoxLink\" target=\"_blank\" href=\""+candidate.url+"\">"+candidate.url+"</a>";

		//infoBox for candidate information
		var infoDiv = document.createElement("div");
		//infobox closing button
		var closeButton = document.createElement("BUTTON");
		document.getElementById("explanations_yle").appendChild(infoDiv);
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
		//TODO: fix over MAXWIDTH delocation due centralization of svg, hotfix was 4096px MAXWIDTH
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
		var explanationsDiv = document.getElementById("explanations_yle");
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

});/*Data ends*/
/***********************************************************************/
});