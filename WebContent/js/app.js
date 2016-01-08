var cesium_app = (function () {
    var viewer = {};
    var horizontalGridCnt = 20;
	var verticalGridCnt = 11;
    var polId = "polGrid";
    var corId = "corGrid";
    var dsId = "dsGrid";
    var polGridLayer = new Cesium.EntityCollection(polId);
    var corridorLayer = new Cesium.EntityCollection(corId);
    var dataSourceLayer = new Cesium.DataSourceCollection(dsId);
    var excludedGrid = [[2,14],[2,15],[2,16],[2,17],[2,18],[2,19],[1,13],[1,14],[1,15],[1,16],[1,17],[1,18],[1,19],[0,11],[0,12],[0,13],[0,14],[0,15],[0,16],[0,17],[0,18],[0,19],[0,9],[0,8],[0,7],[0,6],[0,5],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[5,1],[6,1],[7,1],[8,1],[9,1],[6,2],[7,2],[8,2],[9,2],[9,3],[9,4],[9,12],[9,13],[9,14],[9,15],[9,16],[9,17],[9,18],[9,19],[8,15],[8,16],[8,17],[8,14],[8,18],[8,19],[7,15],[7,16],[7,17],[7,18],[7,19],[6,19],[5,19],[4,19],[3,19],[10,8],[10,7],[10,6],[10,5],[10,4],[10,3],[10,2],[10,1],[10,0],[10,11],[10,12],[10,13],[10,14],[10,15],[10,16],[10,17],[10,18],[10,19]];
    
    //var link_html_start = "<input type='checkbox' onclick='app.loadRandomPoints(this)'";
    //var link_html_end = "</input>";
    // this pattern is known as amd pattern
    // local function starts with underscore..
    
    var _initCesium = function () {
        
    	/*var html = "";
        // mock up for loading from database.. 
        for (i = 0; i < 20; i++) {
            html = html + "<br>" + link_html_start + "name='DS" + (i + 1) + "'>" + "Data Source " + (i + 1) + link_html_end;
        }
        document.getElementById("sidePanel1").innerHTML = html;*/
        /*
        var clock = new Cesium.Clock({
        startTime: Cesium.JulianDate.fromIso8601('0000-01-01'),
        stopTime: Cesium.JulianDate.fromIso8601('0001-10-25'),
        multiplier: 1000,
        clockRange: Cesium.ClockRange.LOOP_STOP

        });*/
    	var lat=1.3068951 ,lon=103.819775, height =65000;
        viewer = new Cesium.Viewer('cesiumContainer'); //,{clock:clock}
        viewer.camera.flyTo({
        	destination: Cesium.Cartesian3.fromDegrees(lon,lat,height),
        	orientation: { 
        		pitch: Cesium.Math.toRadians(-45.0),
        		roll:0
        	}
        });
    }
     
    
    var _gridViz = function(){  
    	var left_lat = 103.589737;
    	var left_lon = 1.208895; 
    	var left = 103.589737;
    	var right = 104.050476;
		var top = 1.471121;
		var down = 1.208895;
		var diff = right - left;
		sqrWidth = diff/horizontalGridCnt;
		var sqrGrid;
		//var sqrGridArr = create2DArray(verticalGridCnt); // sqrgridArr consists of sqrgrid obj starting from bottom left. [1][0] refers to 2nd last row, 1st column
		
		for (var y=0;y<verticalGridCnt;y++)
    	{
			for(var i=0;i<horizontalGridCnt;i++)
			{
				// for each square, check against geocoder, find out if location is within sg
				if(!containsExclusion(y,i))
				{
				// adding of 1 sqr..
				sqrGrid = viewer.entities.add({ 
			    		id: y+","+i, // west, south, east, north
			    		tlLatLon: [left_lat+(i*sqrWidth),left_lon+((y+1)*sqrWidth),left_lat+((i+1)*sqrWidth),left_lon+((y+2)*sqrWidth)],
		    			rectangle: {
			    			coordinates : Cesium.Rectangle.fromDegrees(left_lat+(i*sqrWidth),left_lon+((y+1)*sqrWidth),left_lat+((i+1)*sqrWidth),left_lon+((y+2)*sqrWidth)),
			    			material : Cesium.Color.GREEN.withAlpha(0.3),
			    			outline: true,
			    			outlineWidth: 4,
			    			outlineColor : Cesium.Color.GREEN
			    		}
			    	}); 
		    	polGridLayer.add(sqrGrid);
		    	//sqrGridArr[y][i] = sqrGrid;
				}
			}
    	} 
    } 
    
    var _gridVizClose = function(){ 
    	removeLayer(polGridLayer);
    	removeLayer(corridorLayer);
    }
    
    function removeLayer(layer)
    {
    	var layerArr = layer.values;
    	for(var i=0;i<layerArr.length;i++)
    	{
    		viewer.entities.removeById(layerArr[i].id);        	
    	}
    	layer.removeAll();
    }
    
    function create2DArray(rows)
    {
    	var arr=[];
    	for (var i=0;i<rows;i++)
    	{
    		arr[i] = [];
    	}
    	return arr;
    }
    
    function _gridSelection(scope)
    {
    	viewer.screenSpaceEventHandler.setInputAction(function (click) {
	        var pickedObject = viewer.scene.pick(click.position);
	        scope.polDialog(pickedObject);
	    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
    
    
    function _corridorBookMark(pickedObject)
    {
    	// viewer add corridor entity to bookmarked box
    	  
    	var west =  pickedObject.id.tlLatLon[0];
    	var east =  pickedObject.id.tlLatLon[2];
    	var north =  pickedObject.id.tlLatLon[3];
    	var south =  pickedObject.id.tlLatLon[1];
    	//var cart = new Cesium.Cartesian3(west,north,0);
    	//var carto = new Cesium.Cartographic(cart);
    	console.log(pickedObject.id.tlLatLon);
    	console.log([ west+((east-west)/2), north, west,north, south+((north-south))/2, west]);
    	
    	var cor = viewer.entities.add({
    		corridor : {
    			positions: Cesium.Cartesian3.fromDegreesArray([ west+((east-west)/2), north, west,north, west,south+((north-south))/2 ]),
    			height:10,
    			width:250,
    			cornerType: Cesium.CornerType.MITERED,
    			material: Cesium.Color.BLUE,
    			outline:true
    		} 
    	})
    	corridorLayer.add(cor);
    }
    
    function _loadData(path)
    {
    	var geojson = new Cesium.GeoJsonDataSource('geojson');
        var promise = geojson.load(path);
        promise.then(function (geojson) {
            viewer.dataSources.add(geojson);
            var entities = geojson.entities.values;
            var i;
            for (i = 0; i < entities.length; i++) {
                if (i % 2 == 0) {
                    var entity = entities[i];
                    entity.polygon.material = Cesium.Color.fromRandom();
                }
            }
        })

        //var esri = new Cesium.ArcGisMapServerImageryProvider({
        //    url: "http://gis.srh.noaa.gov/arcgis/rest/services/national_snow_anlys/MapServer"
        //});
       // viewer.imageryLayers.addImageryProvider(esri);

    }
    
    // temp function
    function _randomChange()
    {
    	var randomIndex = parseInt(Math.random()* (verticalGridCnt*horizontalGridCnt)); 
    	polGridLayer.values[randomIndex].rectangle.material = Cesium.Color.RED.withAlpha(0.3);
    	polGridLayer.values[randomIndex].rectangle.outlineColor = Cesium.Color.RED;
    }
    
    function containsExclusion(x,y)
    {
    	for (var i=0;i<excludedGrid.length;i++)
    	{
    		if(excludedGrid[i][0] == x && excludedGrid[i][1] == y)
    		{
    			return true;
    		}
    	}
    	return false;
    }
    
    
    // Sample Cesium Code
    
    var _shapesVolumes = function () {
        var box = new Cesium.Entity({
            id: 'box1',
            name: 'My Box',
            position: Cesium.Cartesian3.fromDegrees(-100, 30, 300000),
            box: { dimensions: new Cesium.Cartesian3(30000, 30000, 30000),
                outline: true
            }

        });
        viewer.entities.add(box);

        var pts = Cesium.Cartesian3.fromDegreesArray([
        -115, 32,
        -115, 41,
        -106, 41,
        -106, 32
        ]);
        var wall = new Cesium.Entity({
            id: 'wall1',
            name: 'The Great Wall of America',
            wall: {
                positions: pts,
                maximumHeights: [120000, 50000, 150000, 30000]
            }
        })
        wall.wall.material = new Cesium.ImageMaterialProperty({
            image: 'data/colorado.jpg',
            repeat: new Cesium.Cartesian2(4, 1)
        });
        viewer.entities.add(wall);

        var polygon = new Cesium.Entity({
            id: 'polygon1',
            name: 'The Great Wall of America',
            polygon: {
                hierarchy: {
                    position: pts
                },
                material: 'data/colorado.jpg'
            }
        })
        viewer.entities.add(polygon);
        viewer.flyTo([box, wall], { duration: 5 });
    };

    var _markersModels = function () {
        var billboard = new Cesium.Entity({
            name: 'My Fac',
            position: Cesium.Cartesian3.fromDegrees(105, -50),
            billboard: {
                image: "data/Facility.png",
                scale: 2.0
            },
            label: {
                text: "Area 51"
            }
        });
        viewer.entities.add(billboard);

        var model = new Cesium.Entity({
            id: 'model1',
            name: 'Cesium Man',
            position: Cesium.Cartesian3.fromDegrees(105, -50),
            model: {
                uri: 'data/Cesium_Man.gltf',
                scale: 1000000
            }
        });
        viewer.entities.add(model);


    };

    var _toggle = function () {
        var html = "";
        if (document.getElementById("sidePanel1").style.display == "none") {
            document.getElementById("sidePanel1").style.display = "";
        } else {
            document.getElementById("sidePanel1").style.display = "none";
        }

    };

    var _picking = function () {
        var ellip = viewer.scene.globe.ellipsoid;
        var scene = viewer.scene;
        var camera = viewer.camera;
        viewer.screenSpaceEventHandler.setInputAction(function (click) {


            //viewer.scene.pickPosition(click.position);

        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK, Cesium.KeyboardEventModifier.SHIFT);

        var label = new Cesium.Entity({
            id: 'label1',
            label: {
                text: ''

            }
        })
        viewer.entities.add(label);
        viewer.screenSpaceEventHandler.setInputAction(function (movement) {
            var cartesian = camera.pickEllipsoid(movement.endPosition, ellip, new Cesium.Cartesian3());
            var cartographic = ellip.cartesianToCartographic(cartesian);
            label.position = cartesian;
            label.label.text = cartographic.longitude + ", " + cartographic.latitude;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }



    var _loadRandomPoints = function (domObj) {
        // lat -90 to 90
        // lon 180 to 180  
        var box, i, lat_negative, lon_negative, lat, lon, r, g, b, a;
        if (!(domObj.checked)) {
            viewer.entities.removeAll();
        }
        else {

            /*var cObj = Cesium.Color.GOLD;
            var cObj2 = Cesium.Color.fromRandom(); // bug here.

            lat_negative = Math.floor(Math.random() * 10) % 2;
            lon_negative = Math.floor(Math.random() * 10) % 2;
            lat = Math.floor(Math.random() * 90);
            lon = Math.floor(Math.random() * 180);
            if (lat_negative == 0) { lat = lat * -1; }
            if (lon_negative == 0) { lon = lon * -1; }
            box = new Cesium.Entity({
            name: 'My Box',
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 300000),
            box: { dimensions: new Cesium.Cartesian3(300000, 300000, 300000)
            //outline: true,
            //material: new Cesium.ColorMaterialProperty(Cesium.Color.GOLD)
            }

            });
            var colorProperty = new Cesium.SampledProperty(Cesium.Color);
            var nowTime = Cesium.JulianDate.now();
            var plusOneHour = Cesium.JulianDate.addHours(nowTime, 1, new Cesium.JulianDate());
            colorProperty.addSample(nowTime, cObj);
            colorProperty.addSample(plusOneHour, cObj2);
            box.box.material = new Cesium.ColorMaterialProperty(colorProperty);
            viewer.entities.add(box);



            // billboard!
            lat_negative = Math.floor(Math.random() * 10) % 2;
            lon_negative = Math.floor(Math.random() * 10) % 2;
            lat = Math.floor(Math.random() * 90);
            lon = Math.floor(Math.random() * 180);
            if (lat_negative == 0) { lat = lat * -1; }
            if (lon_negative == 0) { lon = lon * -1; }
            var billboard = new Cesium.Entity({
            name: 'My Fac',
            position: Cesium.Cartesian3.fromDegrees(lon, lat),
            billboard: {
            image: "data/Facility.png",
            scale: 2.0
            },
            label: {
            text: "Area 51"
            }
            });
            viewer.entities.add(billboard);
            */
            if (domObj.name == "DS1") {
                for (i = 0; i < 200; i++) {
                    // model!
                    lat_negative = Math.floor(Math.random() * 10) % 2;
                    lon_negative = Math.floor(Math.random() * 10) % 2;
                    lat = Math.floor(Math.random() * 90);
                    lon = Math.floor(Math.random() * 180);
                    if (lat_negative == 0) { lat = lat * -1; }
                    if (lon_negative == 0) { lon = lon * -1; }
                    var pos1 = Cesium.Cartesian3.fromDegrees(lon, lat);
                    lat_negative = Math.floor(Math.random() * 10) % 2;
                    lon_negative = Math.floor(Math.random() * 10) % 2;
                    lat = Math.floor(Math.random() * 90);
                    lon = Math.floor(Math.random() * 180);
                    if (lat_negative == 0) { lat = lat * -1; }
                    if (lon_negative == 0) { lon = lon * -1; }
                    var pos2 = Cesium.Cartesian3.fromDegrees(lon, lat);
                    var modelProperty = new Cesium.SampledPositionProperty();
                    var nowTime = Cesium.JulianDate.now();
                    var plusOneHour = Cesium.JulianDate.addSeconds(nowTime, 10, new Cesium.JulianDate());
                    var plusTwoHour = Cesium.JulianDate.addSeconds(plusOneHour, 20, new Cesium.JulianDate());
                    modelProperty.addSample(nowTime, pos1);
                    modelProperty.addSample(plusOneHour, pos2);
                    modelProperty.addSample(plusTwoHour, pos1);

                    modelProperty.setInterpolationOptions({
                        interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
                        interpolationDegree: 5
                    });

                    var model = new Cesium.Entity({
                        name: 'Cesium Man',
                        position: modelProperty,
                        orientation: new Cesium.VelocityOrientationProperty(modelProperty),
                        model: {
                            uri: 'data/Cesium_Man.gltf',
                            scale: 1000000
                        },
                        description: "<h1>Alien Invasion!!!</h1>"
                    });
                    viewer.entities.add(model);
                    viewer.trackedEntity=model;
                }
            }
            else if (domObj.name == "DS2") {
                for (i = 0; i < 100; i++) {
                    var cObj = Cesium.Color.GREEN(); // bug here.
                    var cObj2 = Cesium.Color.GOLD;

                    lat_negative = Math.floor(Math.random() * 10) % 2;
                    lon_negative = Math.floor(Math.random() * 10) % 2;
                    lat = Math.floor(Math.random() * 90);
                    lon = Math.floor(Math.random() * 180);
                    if (lat_negative == 0) { lat = lat * -1; }
                    if (lon_negative == 0) { lon = lon * -1; }
                    box = new Cesium.Entity({
                        name: 'My Box',
                        position: Cesium.Cartesian3.fromDegrees(lon, lat, 300000),
                        box: { dimensions: new Cesium.Cartesian3(300000, 300000, 300000)
                            //outline: true,
                            //material: new Cesium.ColorMaterialProperty(Cesium.Color.GOLD)
                        }

                    });
                    var colorProperty = new Cesium.SampledProperty(Cesium.Color);
                    var nowTime = Cesium.JulianDate.now();
                    var plusOneHour = Cesium.JulianDate.addHours(nowTime, 1, new Cesium.JulianDate());
                    colorProperty.addSample(nowTime, cObj);
                    colorProperty.addSample(plusOneHour, cObj2);
                    box.box.material = new Cesium.ColorMaterialProperty(colorProperty);
                    viewer.entities.add(box);


                }
            }
            else if (domObj.name == "DS19") {


            }
            else if (domObj.name == "DS20") {
                _dataSources();
            }
            else {
                // model!
                for (i = 0; i < 25; i++) {
                    lat_negative = Math.floor(Math.random() * 10) % 2;
                    lon_negative = Math.floor(Math.random() * 10) % 2;
                    lat = Math.floor(Math.random() * 90);
                    lon = Math.floor(Math.random() * 180);
                    if (lat_negative == 0) { lat = lat * -1; }
                    if (lon_negative == 0) { lon = lon * -1; }
                    var pos1 = new Cesium.Cartesian3.fromDegrees(lon, lat);
                    lat_negative = Math.floor(Math.random() * 10) % 2;
                    lon_negative = Math.floor(Math.random() * 10) % 2;
                    lat = Math.floor(Math.random() * 90);
                    lon = Math.floor(Math.random() * 180);
                    if (lat_negative == 0) { lat = lat * -1; }
                    if (lon_negative == 0) { lon = lon * -1; }
                    var pos2 = new Cesium.Cartesian3.fromDegrees(lon, lat);
                    var modelProperty = new Cesium.SampledPositionProperty();
                    var nowTime = Cesium.JulianDate.now();
                    var plusOneHour = Cesium.JulianDate.addSeconds(nowTime, 30, new Cesium.JulianDate());
                    var plusTwoHour = Cesium.JulianDate.addSeconds(plusOneHour, 20, new Cesium.JulianDate());

                    modelProperty.addSample(nowTime, pos1);
                    modelProperty.addSample(plusOneHour, pos2);
                    modelProperty.addSample(plusTwoHour, pos1);


                    var model = new Cesium.Entity({
                        name: 'Cesium Man',
                        position: modelProperty,
                        orientation: new Cesium.VelocityOrientationProperty(modelProperty),
                        model: {
                            uri: 'data/frog.bgltf',
                            scale: 1000000
                        },
                        description: "<h1>Alien Invasion!!!</h1>"
                    });


                    viewer.entities.add(model);
                }
            }


        }

    }

    var _dataSources = function () {
        var geojson = new Cesium.GeoJsonDataSource('geojson');
        var promise = geojson.load("data/us_county.json");
        promise.then(function (geojson) {
            viewer.dataSources.add(geojson);
            var entities = geojson.entities.values;
            var i;
            for (i = 0; i < entities.length; i++) {
                if (i % 2 == 0) {
                    var entity = entities[i];
                    entity.polygon.material = Cesium.Color.fromRandom();
                }
            }
        })

        var esri = new Cesium.ArcGisMapServerImageryProvider({
            url: "http://gis.srh.noaa.gov/arcgis/rest/services/national_snow_anlys/MapServer"
        });
        viewer.imageryLayers.addImageryProvider(esri);
    }
    // End -  Sample Cesium Code 
    
    return {
        initCesium: _initCesium,
        shapesVolumes: _shapesVolumes,
        toggle: _toggle,
        loadRandomPoints: _loadRandomPoints,
        markersModel: _markersModels,
        dataSources: _dataSources,
        picking: _picking,
        gridViz: _gridViz,
        gridVizClose: _gridVizClose,
        gridSelection:_gridSelection,
        corridorBookMark: _corridorBookMark,
        randomChange: _randomChange,
        loadData: _loadData

    };
})();