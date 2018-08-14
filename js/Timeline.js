/* global d3, dc */

class Timeline{
    constructor(options){
        
        const dateExtent = d3.extent(options.dateGroup.all(), d => d.key)

        dc.barChart('#'+options.id)
            .height(240)
            .width(640)
            .dimension(options.dateDimension)
            .group(options.dateGroup)
            .x(d3.scaleTime().domain(dateExtent))
            .y(d3.scaleLinear().domain(d3.extent(options.dateGroup.all(), d => d.value)))
            .xUnits(d3.timeWeeks)
            //.gap(2)
            //.elasticY(true)
            .margins({top:10,right:30,bottom:30,left:40})
            // .on('filtered', (chart, filter) => {
                
            // })
            
    }
}