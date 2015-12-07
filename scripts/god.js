'use strict';/* 
* @Author: tturt
* @Date:   2015-12-04 14:55:40
* @Last Modified by:   tturt
* @Last Modified time: 2015-12-06 22:34:41
*/


/*
*  TODO
*  1 ใช้ Bootstrab ทำ layout ใหม่
*  2 เปลี่ยนไปใช้ object แทน ง่ายต่อการส่งค่า
*  3 ทำ data collection จะได้ง่ายในการดึงมาใช้
*  4 เพิ่มตาราง Enrollment แสดงข้อมูลแต่ละวิชาพร้อมวันสอบ
*/

// edit time-entry's color here
var colorList = [
    "#6dc066", // light green
    "#ff7373", // light red
    "#4099ff", // light blue
    "#800080", // light purple
    "#999", // light gray
    "#ffa500", // orange
    "#4169e1", // blue
    "#f6546a", // pink
    "#66cdaa", // light green2
    "#404040", // dark dray
    "#660066", // dark purple
    "#468499", // dim blue
    "#008080", // dark green
    "#fd482f", // red
    "#3b5998", // dark blue
];
var colorCount = 0;

$( document ).ready(function() {
    // Hide loader first
    $("#loading").hide();

    $("#create").click(function (event){
        event.preventDefault();
        colorCount = 0;
        $(".timetable").hide("fast");
        $("#loading").show();

        var sem = $("#sem").val();
        var sid = $("#sid").val();

        // init Timetable
        var timetable = new Timetable()
        timetable.setScope(8,20) // 8.00 - 20.00 
        timetable.addLocations(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

        // Fetch and Process All DATA
        var url = "api.php";
        $.get(url, {'sem':sem, 'sid':sid} , function (data){
            var ret = [];
            var count = 0;

            // get enrolls
            $("table[bgcolor='#0068D0'][width='100%'] tbody",data).map(function (index, elem){
                $('tr.msan8', this).each(function () {
                    count++;
                    var td = [];
                    $('td', this).each(function () {
                        var d = $(this).html();
                        td.push(d);
                        // console.log(d);
                    });
                    if(td[10]=="W")
                        return true;
                    if(count>2)
                        ret.push(td);
                });
            });

            // get lab enrolls
            count = 0;
            $("table[bgcolor='#FFCC99'][width='100%'] tbody",data).map(function (index, elem){
                $('tr.msan8', this).each(function () {
                    count++;
                    var td = [];
                    $('td', this).each(function () {
                        var d = $(this).html();
                        td.push(d);
                    });
                    td[2] += " (LAB)";
                    if(td[10]=="W")
                        return true;
                    if(count>2)
                        ret.push(td);
                });
            });

            // create time-entry
            ret.forEach(function (val, index, ar) {
                var title = val[2].split('  ').join(''); // sometime it has long whitespace after title
                var course = val[1];
                var lec = val[3];
                var lab = val[4];
                var time = val[8].split(/<br><font color="#CC0000">/i); // case insensitive
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
                // console.log( day );
                if( day.length > 3 ) // Have 2 differnce day
                {   
                    day = day.split(/<br><font color="#CC0000">/i); // case insensitive
                    day1 = day[0];
                    day2 = day[1].slice(0,-7);
                }else{ // Normal one
                    day1 = day;
                }

                // console.log("No."+course+" "+title+" day "+day1+day2+" time "+time1+" time2 "+time2);

                var color = colorList[colorCount++];

                var room = getRoom(sem, course, lec, lab );
                var room1 = null;
                var room2 = null;
                if( typeof room === 'string' ) // sometime it will be string
                {
                    room1 = room;
                }else{
                    try{ // room is usually array with 1 element. access room[1] will cause error
                        room1 = room[0];
                        room2 = room[1].split('<')[0];
                    }
                    catch (e){
                        // nothing serious here
                        // console.log(title+" dont have another room");
                    }
                }

                parseDay(day1, title, time1, course, lec, lab, room1, color);
                if( day2 != null )
                    parseDay(day2, title+" (LAB)", time2, course, lec, lab, room2, color);
            });
    
            var renderer = new Timetable.Renderer(timetable);
            renderer.draw('.timetable');
            // After render timetable load Tooltip
             // $(".time-entry").tooltip(); 
            $(".timetable").show("fast");
            $("#loading").hide();
        });

        // add special day to timetable
        function addDay (day) {
            try {
                timetable.addLocations([day,]);
            }catch (e) {
                console.log(e);
            }
        }

        // return array()
        // TODO Support lab section, only lecture section can see room now
        function getRoom (sem, c, lec, lab) {
            var room = null;
            $.ajax({
                url: "api.php",
                data: {sem:sem, c:c, lec:lec, lab:lab},
                type: 'get',
                dataType: 'html',
                async: false,
                success: function(data) {
                    var ret = null;
                    $("tr[coursedata]", data).map(function (index, elem){
                        var td = [];
                        $('td', this).each(function () {
                            var d = $(this).html();
                            td.push(d);
                        });
                        ret = td[9]; // room info is in column 10
                    });
                    try
                    {
                        room = ret.split('<br><red>');
                    }
                    catch (e){ // will catch sometime return string
                        room = ret;
                    }
                } 
            });
            return room;
        }

        // TODO pass object instead
        function parseDay (day, title, time, course, lec, lab, room, color) {
            var starttime = time[0];
            var starthr = parseInt(starttime.slice(0,2));
            var startmi = parseInt(starttime.slice(2,4));
            var endtime = time[1];
            var endhr = parseInt(endtime.slice(0,2));
            var endmi = parseInt(endtime.slice(2,4));
            // console.log(starthr+""+startmi+""+endhr+""+endmi);
            switch(day)
            {
                case 'Mo':
                    timetable.addEvent(title, 'Monday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color, course, lec, lab, room);
                    break;
                case 'MTh':
                    timetable.addEvent(title, 'Monday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color, course, lec, lab, room);
                    timetable.addEvent(title, 'Thursday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color, course, lec, lab, room);
                    break;
                case 'Tu':
                    timetable.addEvent(title, 'Tuesday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color, course, lec, lab, room);
                    break;
                case 'TuF':
                    timetable.addEvent(title, 'Tuesday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color, course, lec, lab, room);
                    timetable.addEvent(title, 'Friday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color, course, lec, lab, room);
                    break;
                case 'We':
                    timetable.addEvent(title, 'Wednesday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color, course, lec, lab, room);
                    break;
                case 'Th':
                    timetable.addEvent(title, 'Thursday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color, course, lec, lab, room);
                    break;
                case 'Fr':
                    timetable.addEvent(title, 'Friday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color, course, lec, lab, room);
                    break;
                case 'Sa':
                    addDay('Saturday');
                    timetable.addEvent(title, 'Saturday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color, course, lec, lab, room);
                    break;
                case 'Su':
                    addDay('Sunday');
                    timetable.addEvent(title, 'Sunday', new Date(2015,7,17,starthr,startmi), new Date(2015,7,17,endhr,endmi), '#', color, course, lec, lab, room);
                    break;
                case 'TBA':
                    console.log("DO NOTHING!!!!");
                    break;
                default:
                    alert("Unknow day!!("+day+"), please contact fb.me/TuR10S for update");
            }
        }
    });
});