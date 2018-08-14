/* global dc, d3, crossfilter, Timeline */

dc.constants.EVENT_DELAY = 0

class App {
    constructor(){
        
        d3.csv('data/points.csv', (d,i) => {
            d.i = i
            d.X = +d.X
            d.Y = +d.Y
            d.date = d3.timeWeek.floor(new Date(d.datacq))
            delete d.datacq
            return d
        })
        .then(this.processData.bind(this))

        this.map = new Map()
        
    }
    
    processData(data){
        //console.log('process data', data)
        const index = crossfilter(data)
        
        //console.log('idGroup', idGroup)
        
        const dateDimension = index.dimension(d => d.date)
        const dateGroup = dateDimension.group().reduceCount()
        
        this.timeline = new Timeline({
            id:'timeline',
            dateDimension,
            dateGroup
        })
        
        this.map.setDimension(index, 'i')
        
        // this.map.setPointData(idDimension.top(Infinity))
        // this.map.setPointGroup(idGroup)
        
        //this.map.createPoints(points)
        //this.map.createClusters(points)
        //this.map.updateHeatmap(points)
        
        dc.renderAll()
    }
}

new App()


/*

new code 









dc.chartRegistry.register({
    render: this.map.render.bind(this),
    redraw: this.map.redraw.bind(this),
    filterAll: ()=>{}
})

this.viewer.camera.moveEnd.addEventListener(map.filterBounds.bind(this))

//update map
const ids = idGroup.all()
for(const point of this.points._pointPrimitives){
    point.show = ids[point.id].value
}


//filter bounds
const cam = this.viewer.camera
const canvas = this.viewer.canvas

const northEast = cam.pickEllipsoid(new Cartesian2(canvas.width, 0), WGS84)
const southWest = cam.pickEllipsoid(new Cartesian2(0, canvas.height), WGS84)

if(northEast && southWest){
    const north = toDegrees(this.viewer.scene.globe.ellipsoid.cartesianToCartographic(northEast).latitude
    const east = toDegrees(this.viewer.scene.globe.ellipsoid.cartesianToCartographic(northEast).longitude
    const south = toDegrees(this.viewer.scene.globe.ellipsoid.cartesianToCartographic(southWest).latitude
    const west = toDegrees(this.viewer.scene.globe.ellipsoid.cartesianToCartographic(southWest).longitude
    
    latDimension.filter(d => d >= south && d <= north)
    lonDimension.filter(d => d >= west && d <= east)
}else{
    latDimension.filterall()
    lonDimension.filterAll()
}

dc.redrawAll()


*/