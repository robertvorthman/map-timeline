/* global Cesium, dc, d3, supercluster */

class Map {
    constructor(){
        
        //set default zoom
        const west  = 125.0;
        const south = 31.0;
        const east  = 131.0;
        const north = 46.0;
        
        
        const rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);
        Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
        Cesium.Camera.DEFAULT_VIEW_RECTANGLE = rectangle;
        
        this.viewer = new Cesium.Viewer('map-container', {
            sceneMode : Cesium.SceneMode.SCENE2D,
            timeline: false,
            animation: false,
            geocoder: false,
            //imageryProvider: new Cesium.IonImageryProvider({ assetId: 3812 }),
            homeButton: false,
            navigationHelpButton: false,
            fullscreenButton: false,
            // imageryProvider : new Cesium.createTileMapServiceImageryProvider({
            //     url : 'blackmarble',
            //     fileExtension: 'png',
            //     maximumLevel : 8
            // }),
            baseLayerPicker : true,
            imageryProvider: new Cesium.MapboxImageryProvider({
                mapId: 'mapbox.dark',
                accessToken: 'pk.eyJ1Ijoicm9iZXJ0dm9ydGhtYW4iLCJhIjoiY2lmNDNqZWRsNGt2bnN4bHZ0d2UxcDR2bCJ9.EF829Ye-4PmvSbNnKVGPqQ'
            })
        })
        
        this.viewer.scene.globe.depthTestAgainstTerrain = true
        
        
        dc.chartRegistry.register({
            render: this.render.bind(this),
            redraw: this.redraw.bind(this),
            filterAll: ()=>{}
        })
        
        //this.createHeatmap()
    }
    
    setDimension(index, field){
        this.pointDimension = index.dimension(d => d[field])
        this.pointGroup = this.pointDimension.group().reduceCount()
    }

    
    render(){
        this.renderPoints()
        this.renderClusters()
    }
    
    redraw(){
        this.redrawPoints()
        this.redrawClusters()
    }
    
    renderPoints(){
        this.points = this.viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection())
        
        for(const d of this.pointDimension.top(Infinity)){
            this.points.add({
                position : new Cesium.Cartesian3.fromDegrees(d.X, d.Y),
                color : new Cesium.Color(1, 0, 0, 0.25),
                pixelSize : 3,
                heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
            })
        }
    }
    
    redrawPoints(){
        for(const d of this.pointGroup.all()){
            this.points.get(d.key).show = d.value
        }
    }
    
    renderClusters(){
        this.clusterLayer = new Cesium.CustomDataSource('clusters');
        this.viewer.dataSources.add(this.clusterLayer)
        this.redrawClusters()
    }
    
    redrawClusters(){
        this.clusterLayer.entities.removeAll()
        
        this.clusterer = supercluster({
            radius: 1,
            maxZoom: 16
        })

        //convert points to geojson
        const features = this.pointDimension.top(Infinity).map(d => {
            return {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [d.X, d.Y]
                }
            }
        })

        
        this.clusterer.load(features)
        
        const bounds = {
            west: 124,
            east: 133,
            south: 31,
            north: 46
        };
        
        const clusters = this.clusterer.getClusters([bounds.west, bounds.south, bounds.east, bounds.north], 5);
        
        const minClusterSize = 10
        
        const pixelSizeScale = d3.scalePow().exponent(0.5).range([2,40])
            .domain([minClusterSize, d3.max([minClusterSize,d3.max(clusters, d => (d.properties) ? d.properties.point_count : null)])])
        
        for(const d of clusters){
            
            if(!d.properties || !d.properties.point_count || d.properties.point_count < minClusterSize){
                continue
            }
            
            let name = (d.properties) ? d.properties.point_count_abbreviated : ' '
            

            let lat = d.geometry.coordinates[1]
            let lon = d.geometry.coordinates[0]

            this.clusterLayer.entities.add({
                name: name,
                position : Cesium.Cartesian3.fromDegrees(lon, lat),
                point: {
                    pixelSize: pixelSizeScale(d.properties.point_count),
                    color : Cesium.Color.ORANGE,
                    outlineColor : Cesium.Color.WHITE,
                    outlineWidth : 2,
                    //heightReference : Cesium.HeightReference.CLAMP_TO_GROUND //this breaks clusters for some reason
                },
                // label : {
                //     text : '# '+name,
                //     font : '24px Helvetica',
                //     fillColor : Cesium.Color.SKYBLUE,
                //     outlineColor : Cesium.Color.BLACK,
                //     outlineWidth : 2,
                //     style : Cesium.LabelStyle.FILL_AND_OUTLINE,
                //     horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                //     pixeloffset: new Cesium.Cartesian2(5, 15),
                //     eyeOffset: new Cesium.Cartesian3(0,80,0)
                // }
            })
        }
    }
    
    createClusters(data){
        
        
        
        
    }
    
    createHeatmap(){
        const bounds = {
            west: 124,
            east: 133,
            south: 31,
            north: 46
        };

        // init heatmap
        this.heatMap = CesiumHeatmap.create(
            this.viewer, // your cesium viewer
            bounds, // bounds for heatmap layer
            {
                onExtremaChange: (extremaData) =>{
                    console.log('heatmap extremaData', extremaData)
                }
            }
            
        );
    }
    
    updateHeatmap(data){
        let valueMin = 1
        let valueMax = 50
        
        let heatmapData = []
        for(const d of data){
            heatmapData.push({
                x: d.X,
                y: d.Y,
                value: 1
            })
        }
        
        // add data to heatmap
        this.heatMap.setWGS84Data(valueMin, valueMax, heatmapData);
    }
    
    
}