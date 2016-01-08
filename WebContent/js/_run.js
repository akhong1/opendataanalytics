 
var appMod = angular.module('odApp', ['ngMaterial']);

appMod.config(function($mdThemingProvider) {
	  $mdThemingProvider.theme('altTheme')
	    .primaryPalette('grey');
	  $mdThemingProvider.setDefaultTheme('altTheme');
});



appMod.controller('cesiumController', function($scope,$mdSidenav, $document, $mdDialog,$mdToast,$timeout) {
	cesium_app.initCesium(); 
	$scope.layers = _buildDataLayer();
	
	var pattern = {title:"Pattern of Life 1"};
	$scope.patterns =[];
	for (var i=0;i<10;i++){
		pattern = {title:"Pattern of Life "+(i+1)};
		$scope.patterns.push(pattern);
	}
	
	
	
	
	// temp function - keybinding
	$scope.keybinding = function()
	{
		$document.bind("keypress", function(event)
		{
			if(event.keyCode == 49)
			{
				cesium_app.randomChange();
			}
		});
	}
	$scope.keybinding();
	// temp function - keybinding
 
	
	
	// function init
	$scope.toggleDataPanel = _buildToggler("dataPanel");
	$scope.closeDataPanel = _close("dataPanel"); 
	$scope.togglePOL = _togglePOL(event);
	$scope.togglePOL_switch = false;
	$scope.polDialog = _polDialog();
	$scope.closeDialog = _closeDialog(); 
	$scope.toggleLayer = _toggleLayer();
	$scope.loadData = _loadData();
	// end function init
	
	function _togglePOL(event){
		return function(){
			if($scope.togglePOL_switch)
			{ 
				cesium_app.gridVizClose();
				$scope.togglePOL_switch = false;	
			}
			else
			{ 
				cesium_app.gridViz();
				cesium_app.gridSelection($scope); // enable the selection of entity..
				$scope.togglePOL_switch = true;			
			}
		}
	}
	function _buildToggler(navID) {
	      return function() {
	        $mdSidenav(navID)
	          .toggle()
	          .then(function () {
	            //$log.debug("toggle " + navID + " is done");
	          });
	      }
	  }
	
	function _close(navID){
		return function(){
		$mdSidenav(navID).close()
        .then(function () {
          //$log.debug("close LEFT is done");
        });
		}
	}
	 
	function _buildDataLayer()
	{
		var imgPath_down="img/icons/ic_keyboard_arrow_down_white_24px.svg"; 
		var alayer = {title:"Amenities", img:imgPath_down,clicked:"false", layList:["Child-Care","Food-Center","HDB","Market","Police","School","Shop","Wifi Hotspots","Park Connector","Cycling (LTA)"]};
		var ltlayer = {title:"Land Transport",img:imgPath_down,clicked:"false", layList:["Bus Stops","Taxi Stands","MRT / LRT", "Train Lines"]};
		var dylayer = {title:"Dynamic" ,img:imgPath_down,clicked:"false", layList:["Taxis","Carpark Lot(HDB)","BCA Activity","PUB Sensor","Cameras", "Traffic Speed(QI)","Google Traffic"]};
		var calayer = {title:"Civil Aviation" ,img:imgPath_down,clicked:"false", layList:["Terminal Approaches","CAAS Notice-Airmen"]};
		var mslayer = {title:"Marine Shipping" ,img:imgPath_down,clicked:"false", layList:["MPA Notice-Mariners","Marine Zones","Navigation Aids","Basemap - NOAA Contour","Basemap - SCS","Basemap - Sea Charts"]};
		var hadrwlayer = {title:"HADR Weather" ,img:imgPath_down,clicked:"false", layList:["Disaster Alerts","Wave Height","Wind","Precipitation","Pressure","Temperature"]};
		var hadrslayer = {title:"HADR Static/Dynamic" ,img:imgPath_down,clicked:"false", layList:["Air - Runway (ICAO)","Air (Flight Radar24)","Shipping Routes","Sea (Marine Traffic)","Hospitals","Land - Roads","Restricted Airspace","Traffic News"]};
		var layers=[];
		layers.push(alayer);
		layers.push(ltlayer);
		layers.push(dylayer);
		layers.push(calayer);
		layers.push(mslayer);
		layers.push(hadrwlayer);
		layers.push(hadrslayer);
		return layers;
	}
	
	function _toggleLayer()
	{
		return function(layer)
		{
			var imgPath_down="img/icons/ic_keyboard_arrow_down_white_24px.svg";
			var imgPath_up="img/icons/ic_keyboard_arrow_up_white_24px.svg";
			// iterate thru scope layers & check for title..
			for(var i=0;i<$scope.layers.length;i++)
			{
				$scope.tmpIndex= i;
				if($scope.layers[i].title==layer.title)
				{
					if($scope.layers[i].clicked=="false")
					{
						$scope.layers[i].img = imgPath_up;
						$scope.layers[$scope.tmpIndex].clicked="true";
						//$timeout(function(){ $scope.layers[$scope.tmpIndex].clicked="true"; } ,1000);
						
					}else
					{
						$scope.layers[i].img = imgPath_down;
						//$timeout(function(){ $scope.layers[$scope.tmpIndex].clicked="false"; }  ,1000);
						$scope.layers[$scope.tmpIndex].clicked="false";
					}
				}
				
			}
		}
	}
	
	function _loadData()
	{
		return function(lay)
		{
			if(lay=="Bus Stops")
			{
				cesium_app.loadData("datasets/busstops_all.geojson");
			}
			else if(lay=="Taxi Stands")
			{
				cesium_app.loadData("datasets/taxi_list_P.geojson");
			}
		}
	}
	 
	function _polDialog()
	{ 
		return function(pickedObj)
		{
			var dScope = $scope.$new();
	    	dScope.pickedObj = pickedObj; 
	    	$mdDialog.show({
				scope: dScope,
				templateUrl: 'partials/polDashboard.html',
				parent: angular.element(document.body),
				targetEvent: $scope.originatorEv,
				clickOutsideToClose: true
			});
	    	dScope.bmToast = _bmToast();
	    	dScope.bookmark = _bookmark();
	    	
		}
	}

	function _bmToast()
	{
		return function(){  
			$mdToast.show($mdToast.simple().textContent('Location Bookmarked!').position('top right').hideDelay(2000));
		}
	}
	function _bookmark()
	{
		return function(pickedObj){  
			this.bmToast();
			// make function call to create corridor corner.
			cesium_app.corridorBookMark(pickedObj); 
			//this.pickedObj.id.rectangle.outlineColor = Cesium.Color.BLUE;
			//this.pickedObj.id.rectangle.outlineWidth = 6;
		}
	}
	
	function _closeDialog () {
		return function(){
			$mdDialog.hide();
		}
	};
	
	
	
	
	// temp dd function
	$scope.initDD=function(){
		  $(function() { 
		    $( ".column" ).sortable({
		      connectWith: ".column",
		      handle: ".portlet-header",
		      cancel: ".portlet-toggle",
		      placeholder: "portlet-placeholder ui-corner-all"
		    });
		 
		    $( ".portlet" )
		      .addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
		      .find( ".portlet-header" )
		        .addClass( "ui-widget-header ui-corner-all" )
		        .prepend( "<span class='ui-icon ui-icon-minusthick portlet-toggle'></span>");
		 
		    $( ".portlet-toggle" ).click(function() {
		      var icon = $( this );
		      icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
		      icon.closest( ".portlet" ).find( ".portlet-content" ).toggle();
		    });
		  });
	}
}); 