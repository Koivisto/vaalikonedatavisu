/*
Author: Aarne Leinonen 
Thanks: Juha Törmänen's code at http://peili.kirkas.info/vis/politicianmap15b/js/politicianmap.js
		was an inspiration as well as a guide)
*/

var MAXHEIGHT = 1000;
var MAXWIDTH = 1800;
var MARGIN = 100;
var ALLDISTRICTS = "- Koko maa -"

/*Decides proper size for the visualization*/
function getHeight(){
	if( $(window).height() > MAXHEIGHT ){return MAXHEIGHT;}
	return $(window).height();
};
function getWidth(){
	if( $("#visualizationDiv").width() > MAXWIDTH ){ return MAXWIDTH;}
	return $("#visualizationDiv").width();
}
function adjustElementsToScreenSize(){
	if ( getWidth() < 600 || getHeight() < 600){ 
		MARGIN = 20;
	}
	else{
		MARGIN = 100;
	}
}
adjustElementsToScreenSize();

//init root elements for visualization
var form = d3.select("#visualizationForm");
var svg = d3.select("#visualizationSvg");
svg
.attr("width", getWidth())
.attr("height", getHeight());
//init some data that is used in logic and visualization
var parties = ["Itsenäisyyspuolue","Keskusta","Kokoomus","Kristillisdemokraatit","Muutos 2011","Perussuomalaiset",
				"Piraattipuolue","RKP","SDP","SKP","STP","Vasemmistoliitto","Vihreät"];
var partyVisibility = {"Itsenäisyyspuolue" : true,"Keskusta" : true,"Kokoomus" : true,"Kristillisdemokraatit" : true,
					"Muutos 2011" : true,"Perussuomalaiset" : true,"Piraattipuolue" : true,"RKP" : true,"SDP" : true,
					"SKP" : true,"STP" : true,"Vasemmistoliitto" : true,"Vihreät" : true,"Oikeisto": true,
					"Kansalliskonservatiivit": true,"Viherliberaalit": true,"Vihervasemmisto": true,"Demarit": true};
var axisValues = ["Impivaaralaisuus", "Talousoikeistolaisuus", "Arvoliberaalius", "Vihreys", "Ikä"];
var axisValueOpposites = ["Maailmankansalaisuus", "Talousvasemmistolaisuus","Arvokonservatiivius", "\"Epävihreys\"",""];
var segments = ["Oikeisto","Kansalliskonservatiivit","Viherliberaalit","Vihervasemmisto","Demarit"];
//init axis value domain 
var xMax = 3;var yMax = 3;var xMin = -3;var yMin = -3;
//maps parties and segments to colors <http://fi.wikipedia.org/wiki/Luokka:Politiikkamallineet>
function getColor(str){
	switch(str){
		//segments
		case "Oikeisto": return "#006288";
		case "Kansalliskonservatiivit": return "grey";
		case "Viherliberaalit": return "#61BF1A";
		case "Vihervasemmisto": return "#55110F";
		case "Demarit": return "#E11931";
		//parties
		case "Kokoomus": return "#006288";
		case "RKP": return "#FFDD93";
		case "Perussuomalaiset": return "#FFDE55";
		case "Keskusta": return "#01954B";
		case "Vihreät": return "#61BF1A";
		case "Vasemmistoliitto": return "#BF1E24";
		case "SKP": return "#DA2301";
		case "Kristillisdemokraatit": return "#18359B";
		case "Itsenäisyyspuolue": return "#017BC4";
		case "Piraattipuolue": return "#660099";
		case "Muutos 2011": return "#004460";
		case "SDP": return "#E11931";
		case "STP": return "#CC0000";
		default: return "#FFFFFF";
	}
}

//Data begins
d3.csv("data.csv", function(d){

	/*Initializes UI elements inside the form*/

	//name and candidate number filtering
	var searchInput = form.append('input')
	.attr('placeholder', "Etsi nimellä/numerolla")
	.attr('type', 'text');
	searchInput.on('input', function() {
		redraw();
	});

	//District option menu
	var districtSelector = form.append("select");
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
	var axisXSelector = form.append("select");
	axisXSelector.append("option")
	.attr("value", "all")
	.text("Valitse X-akseli");
	var axisYSelector = form.append("select");
	axisYSelector.append("option")
	.attr("value", "all")
	.text("Valitse Y-akseli");

	//Candidate color toggle on party/segment
	var showPartyColors = true;
	var partyRadioBtn = form.append("input")
	.attr("type", "radio")
	.attr("name", "color")
	.attr("value", "party")
	.attr("id", "party")
	.property("checked", true)
	.on("click", function() {showPartyColors = true; redraw();});
	form.append("label").html("Värit puolueittain");
	var segmentRadioBtn = form.append("input")
	.attr("type", "radio")
	.attr("name", "color")
	.attr("value", "segment")
	.attr("id", "segment")
	.property("checked", false)
	.on("click", function() {showPartyColors = false; redraw();});
	form.append("label").html("Värit segmenteittäin");

/***********************************************************************
	Visualization resizing starts
	***********************************************************************/
	function redraw() {
		//Removing old elements
		svg.selectAll("circle").remove();
		svg.selectAll("text").remove();
		svg.selectAll("line").remove();
		removeInfoDivs();

		adjustElementsToScreenSize();
		width = getWidth(); //$("#visualizationDiv").width();
		var height = getHeight(); //- MARGIN;
		svg
		.attr("width", width)
		.attr("height", height)

		//Axis selection
		var xAxisValue = axisValues[0], yAxisValue = axisValues[2];
		function changeAxisX(){
			if (axisXSelector.property('selectedIndex') > 0) {
				xAxisValue = axisValues[axisXSelector.property('selectedIndex')-1];
			}
			xMax = d3.max(d, function(d) { return +getValueFromStr(d, xAxisValue); });
			xMin = d3.min(d, function(d) { return +getValueFromStr(d, xAxisValue); });
		}
		changeAxisX();//redraw is called when axis are changed
		function changeAxisY(){
			if (axisYSelector.property('selectedIndex') > 0) {
				yAxisValue = axisValues[axisYSelector.property('selectedIndex')-1];
			}
			yMax = d3.max(d, function(d) { return +getValueFromStr(d, yAxisValue); });
			yMin = d3.min(d, function(d) { return +getValueFromStr(d, yAxisValue); });
		}
		changeAxisY();//redraw is called when axis are changed

		//Lazy enum for axis labels
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
				default: return 0;}
			}

		//Draw axis
		//horisontal xAxis
		var line = svg.append("line")
		.attr("x1", 0)
		.attr("y1", height/2)
		.attr("x2", width)
		.attr("y2", height/2)
		.attr("class", "axisLine")
		.attr("stroke-width", 2)
		.attr("stroke", "black");
		var text = svg.append("text")
		.attr("x", width)
		.attr("y", height/2)
		.attr("class", "axisExplanation")
		.text(xAxisValue);
		var text = svg.append("text")
		.attr("x", 0)
		.attr("y", height/2)
		.attr("class", "axisExplanation axisExplanationOpposite")
		.text(axisValueOpposites[axisValues.indexOf(xAxisValue)]);
		//vertical yAxis
		var line = svg.append("line")
		.attr("x1", width/2)
		.attr("y1", 0)
		.attr("x2", width/2)
		.attr("y2", height)
		.attr("class", "axisLine")
		.attr("stroke-width", 2)
		.attr("stroke", "black");
		var text = svg.append("text")
		.attr("x", width/2)
		.attr("y", 30)
		.attr("class", "axisExplanation middle")
		.text(yAxisValue);
		var text = svg.append("text")
		.attr("x", width/2)
		.attr("y", height)
		.attr("class", "axisExplanation middle")
		.text(axisValueOpposites[axisValues.indexOf(yAxisValue)]);

		//scales the data to screen size, these variables are used as functions later on.
		var linearWidthScale = d3.scale.linear()
		.domain([xMin,xMax])
		.range([MARGIN,width-MARGIN]);
		var linearHeigthScale = d3.scale.linear()
		.domain([yMax,yMin])
		.range([MARGIN,height-MARGIN]);
		var linearElementScale = d3.scale.linear()
		.domain([0, MAXHEIGHT])
		.range([2,10]);

		/*Party selection UI elements and logic*/
		var partySelectionGroup = svg.append("g")
		var tick = 0;
		function getNextTick(){tick = tick +1;return tick;}
		//circles presenting the parties
		var partiesSelection = partySelectionGroup.selectAll("circle.ui")
		.data(parties)
		.enter()
		.append("circle")
		.attr("cx", function(parties){return width-20;})
		.attr("cy", function(parties){return +(getNextTick()*20);})
		.attr("r", function(parties){return linearElementScale(height);})
		.attr("class", "ui")
		.style("fill", function(parties){return getColor(parties)})
		.style("opacity", function(parties){return getOpacity(partyVisibility[parties]);})
		.on("click", function(parties){
			toggleSelection(parties, d3.select(this));
			filterCandidates();});
		getNextTick();
		var segmentsSelection = partySelectionGroup.selectAll("circle.segments")
		.data(segments)
		.enter()
		.append("circle")
		.attr("cx", function(segments){return width-20;})
		.attr("cy", function(segments){return +(getNextTick()*20);})
		.attr("r", function(segments){return linearElementScale(height);})
		.attr("class", "segments")
		.style("fill", function(segments){return getColor(segments)})
		.style("opacity", function(segments){return getOpacity(partyVisibility[segments]);})
		.on("click", function(segments){
			toggleSelection(segments, d3.select(this));
			filterCandidates();});
		segments
		tick = 0;
		//text labels for circles
		var partyLabes = partySelectionGroup.selectAll("text")
		.data(parties)
		.enter()
		.append("text")
		.attr("x", function(parties){return width-35;})
		.attr("y", function(parties){return +(getNextTick()*20 +5);})
		.attr("class", "partyLabes")
		.text(function(d){return d;});
		getNextTick();
		var partyLabes = partySelectionGroup.selectAll("text.segments")
		.data(segments)
		.enter()
		.append("text")
		.attr("x", function(segments){return width-35;})
		.attr("y", function(segments){return +(getNextTick()*20 +5);})
		.attr("class", "partyLabes segments")
		.text(function(d){return d;});

		function toggleSelection(party, element){
			partyVisibility[party] = !partyVisibility[party];
			element.style("opacity", function(){return getOpacity(partyVisibility[party]);});
		}

		function getOpacity(boolean){
			if(boolean) return 1.0;
			return 0.3;
		}

		var isClicked = false;
		var previousCandidate = null;
		var candidate= null;

		/*Main logic is here, when data is used to create DOM elements, and events are decided*/
		/*Connects the data to svg elements, determines the interaction logic*/
		var candidateGroup = svg.append("g")
		var candidates = candidateGroup.selectAll("circle")
		.data(d)
		.enter()
		.append("circle")
		.attr("cx", function(d){return linearWidthScale(getXValue(d));})
		.attr("cy", function(d){return linearHeigthScale(getYValue(d));})
		.attr("r", function(d){return linearElementScale(height);});
		
		/*Assign actions on candidate elements
		It is possible to click candidate, so the info will keep showing*/
		candidates
		.on('click', function(d){
			isClicked = !isClicked;
			defineCandidate(d, d3.select(this));
			displayInfo(candidate);
			previousCandidate = candidate;
		})
		.on('mouseenter', function(d){
			defineCandidate(d, d3.select(this));
			if(previousCandidate != null && isClicked){
				dontDisplayInfo(previousCandidate);
						isClicked = !isClicked;}//prepares for new a click
						displayInfo(candidate);
					})
		.on('mouseleave', function(d){
			defineCandidate(d, d3.select(this));
			if(!isClicked){dontDisplayInfo(candidate);};
		})
		.on('touchstart', function(d){
			defineCandidate(d, d3.select(this));
			displayInfo(candidate);
		})
		.on('touchend', function(d){
			defineCandidate(d, d3.select(this));
			if(!isClicked){dontDisplayInfo(candidate)};
		});

		/*Style for candidate elements*/
		candidates.style("fill", function(d){
			if(showPartyColors)	return getColor(d.party);
			return getColor(d.segment)
		});

		/*Sets display to none for filtered candidate elements*/
		function filterCandidates(){
			//updates district filter
			if (districtSelector.property('selectedIndex') > 0) {
				currentDistrict = areas[districtSelector.property('selectedIndex')-1];
			}
			//updates name and candidate number filter
			var searchValue = searchInput.property('value').toLowerCase();
			var searchArray = searchValue.split(' ');

			//Let the filtering begin!
			candidates
			.attr('display', function(d) { 
					//district filter
					if (currentDistrict === ALLDISTRICTS) return "inline";
					else if (currentDistrict && d.district !== currentDistrict) return 'none';

					if(!partyVisibility[d.party] || !partyVisibility[d.segment]) return "none";

					//if something in the search box then also filter with that
					if (searchValue) {
						for (var i = 0; i < searchArray.length; i++) {
							//name as default
							if (d.name.toLowerCase().indexOf(searchArray[i].trim()) < 0){
								//candidate voting number as secondary quess for input
								if (d.id.toLowerCase().indexOf(searchArray[i].trim()) < 0){
									return "none";	}
								} 
							}
						}
					})
		}
		filterCandidates();

		/*Creates candidate data object containing element, name, party, segment, 
		id (candidate number), district, age, education, url, xCoordinate, yCoordinate*/
		function defineCandidate(d, givenElement){
			candidate = {element: givenElement, 
				name: d.name, 
				party: d.party, 
				segment: d.segment,
				id: d.id,
				district: d.district,
				age: d.age,
				education: d.education,
				url: d.www,
				xCoordinate: +getXValue(d), 
				yCoordinate: +getYValue(d)};
				return candidate;
			}

			/*highlights svg element, creates infoBox div with candidate information*/
			function displayInfo(candidate){
				candidate.element
				.transition()
				.duration(300)
				.attr("r", function(d){return linearElementScale(height)*2;})

			//html text for infoBox
			var infoString = "<strong>"+candidate.name+"</strong>, nro: "+ candidate.id+"<br>"+
			candidate.party+"<br>"+
			"<em>segmentti: \""+candidate.segment+"\"</em><br><br>"+
			candidate.district+"<br>"+
			candidate.age+" vuotias, "+candidate.education+"<br>"+
			"<br><a class=\"infoBoxLink\" href=\""+candidate.url+"\">"+candidate.url+"</a>";

			//infoBox above candidates
			var infoDiv = document.createElement('div');
			//infobox closing button
			var closeButton = document.createElement("BUTTON");
			document.getElementById('explanations').appendChild(infoDiv);
			//if too far to right border, then uses different class
			if(parseInt(candidate.element.attr("cx") + svg.offsetLeft) > (width-200)){
				infoDiv.className = "infoBox toLeft";
				closeButton.className = "infoBoxClose infoBoxCloseLeft";}
				else{
					infoDiv.className = "infoBox toRight";
					closeButton.className = "infoBoxClose";}
					infoDiv.id = candidate.name;
					infoDiv.innerHTML = infoString;
					infoDiv.style.position = "absolute";
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
					.attr("r", function(d){return linearElementScale(height);})

					var infoDiv= document.getElementById(candidate.name);
					infoDiv.parentNode.removeChild(infoDiv);
				}

				/*removes all info boxes present*/
				function removeInfoDivs(){
					var explanationsDiv = document.getElementById("explanations");
					while (explanationsDiv.hasChildNodes()) {
						explanationsDiv.removeChild(explanationsDiv.lastChild);
					}
				}

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
			}
/***********************************************************************
	Visualization resizing ends
	***********************************************************************/

	d3.select(window).on("resize", redraw); 
	redraw();

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

});//Data ends