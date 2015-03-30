/*This is the logic for legend display toggle _yle*/
//TODO DRY

var isVisible = true;

function toggleLegendVisibility_yle(){
	if(isVisible){
		$("#legendControls_yle").hide(200);
		$("#legendSvg_yle").hide(200);
		$("#legendToggle_yle").html("Näytä valinnat");
	}
	else{
		$("#legendControls_yle").show(200);
		$("#legendSvg_yle").show(200);
		$("#legendToggle_yle").html("Piilota valinnat");
	}
	isVisible = !isVisible
}
function minimizeLegend(){
	if(!isVisible) isVisible = !isVisible;
	toggleLegendVisibility_yle();
}
function showLegend(){
	if(isVisible) isVisible = !isVisible;
	toggleLegendVisibility_yle();
}