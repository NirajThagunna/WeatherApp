function initialize(){

    $(document).ready(function () {   
       ko.applyBindings(viewModel);
    });
    
}



function MyViewModel() {
    var self = this;
    self.mapOne = {
        lat: ko.observable(12.24),
        lng:ko.observable(24.54)
    };
    
    
   self.dayWeather_desc= ko.observable('Haze');     // something like Haze
   self.dayWeather_icon= ko.observable(''); // to get custom icon
   self.dayWeather_temp= ko.observable(0);
   self.dayWeather_city=ko.observable('City');
   self.dayWeather_pressure=ko.observable(0);
   self.dayWeather_humidity=ko.observable(0);
   self.dayWeather_windSpeed=ko.observable(0);
   self.dayWeather_minTemp=ko.observable(0);
   self.dayWeather_maxTemp=ko.observable(0);
   self.dayWeather_fullday=ko.observable('Monday');
   self.dayWeather_fullDate=ko.observable('Feb 24; 2016');
   self.dayWeather_time=ko.observable('1=40 am');
    
}


ko.bindingHandlers.map = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                
                
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            
              
              var mapObj = ko.utils.unwrapObservable(valueAccessor());
            
              mapObj.lat= position.coords.latitude;
              mapObj.lng= position.coords.longitude;
        
            
                var latLng = new google.maps.LatLng(
                    mapObj.lat,
                    mapObj.lng);
            
            
                var mapOptions = { center: latLng,
                                  zoom: 5, 
                                  mapTypeId: google.maps.MapTypeId.ROADMAP};
                
                mapObj.googleMap = new google.maps.Map(element, mapOptions);
                
                mapObj.marker = new google.maps.Marker({
                    map: mapObj.googleMap,
                    position: latLng,
                    title: "You Are Here",
                    draggable: true
                });     
            
                loadWeather();
                loadForecast();
                
                
                
                $("#" + element.getAttribute("id")).data("mapObj",mapObj);
            
               
            
                mapObj.marker.addListener('click', function() {
                  mapObj.googleMap.setZoom(6);
                  mapObj.googleMap.setCenter(mapObj.marker.getPosition());
                  var pos = mapObj.marker.getPosition();
                  viewModel.mapOne.lat=pos.lat();      
                  viewModel.mapOne.lng=pos.lng();
                  loadWeather();
                  loadForecast();
                });
            
                mapObj.marker.addListener('dblclick', function() {
                  mapObj.googleMap.setZoom(6);
                  mapObj.googleMap.setCenter(mapObj.marker.getPosition());
                  var pos = mapObj.marker.getPosition();
                  viewModel.mapOne.lat=pos.lat();      
                  viewModel.mapOne.lng=pos.lng();
                  loadWeather();
                  loadForecast();
                });
            
//                mapObj.googleMap.addListener('dblclick', function() {
//                  // 3 seconds after the center of the map has changed, pan back to the
//                  // marker.
//                  alert('YOu selected here');
//                });
             
        });
                                        
       }
      else{
          
                var mapObj = ko.utils.unwrapObservable(valueAccessor());
            
                var latLng = new google.maps.LatLng(
                    mapObj.lat,
                    mapObj.lng);
            
            
                var mapOptions = { center: latLng,
                                  zoom: 5, 
                                  mapTypeId: google.maps.MapTypeId.ROADMAP};
                
                mapObj.googleMap = new google.maps.Map(element, mapOptions);
                
                mapObj.marker = new google.maps.Marker({
                    map: mapObj.googleMap,
                    position: latLng,
                    title: "You Are Here",
                    draggable: true
                });     
//          
//          var infoWindow = new google.maps.InfoWindow({map: map});
//          
//          handleLocationError(false, infoWindow, map.getCenter());
      }
    }
};

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
      }

var viewModel = new MyViewModel();

function loadWeather(){
    $.getJSON("https://secret-mesa-38828.herokuapp.com/?url=api.openweathermap.org/data/2.5/weather?lat="+viewModel.mapOne.lat+"&lon="+viewModel.mapOne.lng+"&units=metric&APPID=e2de3fcf953c365ce224997245da6350", function(data) { 
    // Now use this data to update your view models, 
    // and Knockout will update your UI automatically 
        viewModel.dayWeather_city(data.name);
        viewModel.dayWeather_desc(data.weather[0].main);
        viewModel.dayWeather_icon(data.weather[0].icon);
        viewModel.dayWeather_temp(data.main.temp);
        viewModel.dayWeather_pressure(data.main.pressure);
        viewModel.dayWeather_humidity(data.main.humidity);
        viewModel.dayWeather_windSpeed(data.wind.speed);
        viewModel.dayWeather_minTemp(data.main.temp_min);
        viewModel.dayWeather_maxTemp(data.main.temp_max);
        
        
         $("#weatherIcon").html("<img src='https://openweathermap.org/img/w/"+data.weather[0].icon+".png' alt='Icon depicting current weather.' height='70px'>");
        
        var tmstmp = Math.floor(new Date().getTime()/1000);
        var dt;
        
        $.getJSON("https://maps.googleapis.com/maps/api/timezone/json?location="+viewModel.mapOne.lat+","+viewModel.mapOne.lng+"&timestamp="+tmstmp+"&key=AIzaSyDVRs-SZp5rPBbPVM1PicHHqX-RUke4_WU", function(data) {
            var _date = new Date();
            var _userOffset = _date.getTimezoneOffset()*60*1000;
            dt = new Date((tmstmp + data.dstOffset + data.rawOffset)*1000 + _userOffset);
            var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

            viewModel.dayWeather_fullday(days[dt.getDay()]);
            var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

            var calday = months[dt.getMonth()] + " " + dt.getDate() + ", " + dt.getFullYear();
            viewModel.dayWeather_fullDate(calday);

            var currTime = (dt.getHours()>12?(dt.getHours()-12):dt.getHours()).toString() + ":" + ((dt.getMinutes() < 10 ? '0' : '').toString() + dt.getMinutes().toString()) + (dt.getHours() < 12 ? ' AM' : ' PM').toString();

            viewModel.dayWeather_time(currTime);
        });
        
    });
}

function loadForecast(){
    $.getJSON("https://secret-mesa-38828.herokuapp.com/?url=api.openweathermap.org/data/2.5/forecast?lat="+viewModel.mapOne.lat+"&lon="+viewModel.mapOne.lng+"&units=metric&APPID=e2de3fcf953c365ce224997245da6350", function(resData) { 
        
        
    //alert( data.list[0].main.temp);
        

var parseDate = d3.time.format("%Y-%m-%d %H").parse;   

        
    var data=[];
    
    resData.list.forEach(function(obj){
        data.push({date:parseDate(obj.dt_txt.slice(0,13)),close:obj.main.temp});
    });
        
        
        var margin = {
            top: 30,
            right: 20,
            bottom: 30,
            left: 50
        };
        var width = 600 - margin.left - margin.right;
        var height = 270 - margin.top - margin.bottom;


        var x = d3.time.scale().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg.axis().scale(x)
            .orient("bottom").ticks(6);

        var yAxis = d3.svg.axis().scale(y)
            .orient("left").ticks(5);

        var valueline = d3.svg.line()
            .x(function (d) {
              
              return x(d.date);
            })
            .y(function (d) {
              return y(d.close);
            });
        
        d3.select("#chart").select("svg").remove();

        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data
        x.domain(d3.extent(data, function (d) {
            return d.date;
            }));
        y.domain([0, d3.max(data, function (d) {
            return d.close;
            })]);

        svg.append("path") // Add the valueline path.
        .attr("d", valueline(data));

        svg.append("g") // Add the X Axis
        .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g") // Add the Y Axis
        .attr("class", "y axis")
            .call(yAxis);       

        
    });
}


