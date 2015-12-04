'use strict';/* 
* @Author: tturt
* @Date:   2015-12-04 14:55:40
* @Last Modified by:   tturt
* @Last Modified time: 2015-12-04 18:02:52
*/

var colorList = [
    "#0099cc",
    "#ffd700",
    "#f6546a",
    "#40e0d0",
    "#c0c0c0",
    "#468499",
    "#66cdaa",
    "#660066",
    "#ffa500",
    "#b0e0e6",
    "#008000",
    "#D3212D",
    "#D3212D",
    "#D3212D",
];
var colorCount = 0;
$( document ).ready(function() {
    $("#loading").hide();
    $("#create").click(function (event){
        event.preventDefault();
        colorCount = 0;
        $(".timetable").hide("fast");
        $("#loading").show();
        var sem = $("#sem").val();
        var sid = $("#sid").val();
        var timetable = new Timetable()
        timetable.setScope(8,20) // 8.00 - 20.00 
        timetable.addLocations(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
        var url = "api.php";
        $.get(url, {'sem':sem, 'sid':sid} , function (data){
            var ret = [];
            var count = 0;
            $("table[bgcolor='#0068D0'][width='100%'] tbody",data).map(function (index, elem){
                $('tr.msan8', this).each(function () {
                    count++;
                    var td = [];
                    $('td', this).each(function () {
                        var d = $(this).html();
                        td.push(d);
                        console.log(d);
                    });
                    if(count>2)
                        ret.push(td);
                });
            });
            count = 0;
            $("table[bgcolor='#FFCC99'][width='100%'] tbody",data).map(function (index, elem){
                $('tr.msan8', this).each(function () {
                    count++;
                    var td = [];
                    $('td', this).each(function () {
                        var d = $(this).html();
                        td.push(d);
                        console.log(d);
                    });
                    td[2] += " (LAB)";
                    if(count>2)
                        ret.push(td);
                });
            });

            console.log(ret);

            ret.forEach(function (val, index, ar) {
                var cno = val[1];
                var title = val[2];

                var time = val[8].split('<br><font color="#CC0000">');
                var time1 = null;
                var time2 = null;
                if(time.length>1) // Have 2 differnce time
                {
                    time1 = time[0].split(" - ");
                    time2 = time[1].slice(0,-8).split(" - ");
                }else{ // Normal one
                    time1 = time[0].split(" - ");
                }

                var day = val[7];
                var day1 = null;
                var day2 = null;
                if( day.length > 3 ) // Have 2 differnce time
                {   
                    day = day.split('<br><font color="#CC0000">');
                    day1 = day[0];
                    day2 = day[1].slice(0,-7);
                }else{ // Normal one
                    day1 = day;
                }

                console.log("No."+cno+" "+title+" day "+day1+day2+" time "+time1+" time2 "+time2);

                var color = colorList[colorCount++];
                parseDay(day1, cno, title, time1, color);
                if( day2 != null )
                    parseDay(day2, cno, title+" (LAB)", time2, color);
            });

            var renderer = new Timetable.Renderer(timetable);
            renderer.draw('.timetable');
            $(".timetable").show("fast");
            $("#loading").hide();
        });

        function addDay (day) {
            try {
                timetable.addLocations([day,]);
            }catch (e) {
                console.log(e);
            }
        }
        
        function parseDay (day, no, title, time, color) {
            var starttime = time[0];
            var starthr = parseInt(starttime.slice(0,2));
            var startmi = parseInt(starttime.slice(2,4));
            var endtime = time[1];
            var endhr = parseInt(endtime.slice(0,2));
            var endmi = parseInt(endtime.slice(2,4));
            console.log(starthr+""+startmi+""+endhr+""+endmi);
            switch(day)
            {
                case 'Mo':
                    timetable.addEvent(title, 'Monday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color);
                    break;
                case 'MTh':
                    timetable.addEvent(title, 'Monday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color);
                    timetable.addEvent(title, 'Thursday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color);
                    break;
                case 'Tu':
                    timetable.addEvent(title, 'Tuesday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color);
                    break;
                case 'TuF':
                    timetable.addEvent(title, 'Tuesday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color);
                    timetable.addEvent(title, 'Friday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color);
                    break;
                case 'We':
                    timetable.addEvent(title, 'Wednesday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color);
                    break;
                case 'Th':
                    timetable.addEvent(title, 'Thursday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color);
                    break;
                case 'Fr':
                    timetable.addEvent(title, 'Friday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color);
                    break;
                case 'Sa':
                    addDay('Saturday');
                    timetable.addEvent(title, 'Saturday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color);
                    break;
                case 'Su':
                    addDay('Sunday');
                    timetable.addEvent(title, 'Sunday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color);

                    break;
                default:
                    alert("Unknow day!!("+day+"), please contact fb.me/TuR10S for update");
            }
        }
    });
});