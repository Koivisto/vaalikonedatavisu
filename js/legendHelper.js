/*This is the logic for legend display toggle*/
var isVisible = true;

function toggleLegendVisibility(){
	if(isVisible){
		$("#legendControls").hide(200);
		$("#legendSvg").hide(200);
		$("#legendToggle").html("Näytä selite");
	}
	else{
		$("#legendControls").show(200);
		$("#legendSvg").show(200);
		$("#legendToggle").html("Piilota selite");
	}
	isVisible = !isVisible
}
function minimizeLegend(){
	if(!isVisible) isVisible = !isVisible;
	toggleLegendVisibility();
}
function showLegend(){
	if(isVisible) isVisible = !isVisible;
	toggleLegendVisibility();
}