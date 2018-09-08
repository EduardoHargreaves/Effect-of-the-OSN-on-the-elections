// ==UserScript==
// @name         autoscroll
// @namespace    autoscroll
// @version      1.18
// @description  autoscroller to be used with https://facebook.tracking.exposed, This userscript works with TamperMoneky extension.
// @author       Claudio Agosti @_vecna
// @match        https://www.facebook.com/*
// @connect      autoscroll
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash-compat/3.10.2/lodash.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js
// ==/UserScript==

var SCROLL_TIMES = 30;
var AWAITSECS = 5;
var fixedH = 800;

var plan = [
    "00:00",
"00:05",
"00:10",
"00:15",
"00:20",
"00:25",
"00:30",
"00:35",
"00:40",
"00:45",
"00:50",
"00:55",
"01:00",
"01:05",
"01:10",
"01:15",
"01:20",
"01:25",
"01:30",
"01:35",
"01:40",
"01:45",
"01:50",
"01:55",
"02:00",
"02:05",
"02:10",
"02:15",
"02:20",
"02:25",
"02:30",
"02:35",
"02:40",
"02:45",
"02:50",
"02:55",
"03:00",
"03:05",
"03:10",
"03:15",
"03:20",
"03:25",
"03:30",
"03:35",
"03:40",
"03:45",
"03:50",
"03:55",
"04:00",
"04:05",
"04:10",
"04:15",
"04:20",
"04:25",
"04:30",
"04:35",
"04:40",
"04:45",
"04:50",
"04:55",
"05:00",
"05:05",
"05:10",
"05:15",
"05:20",
"05:25",
"05:30",
"05:35",
"05:40",
"05:45",
"05:50",
"05:55",
"06:00",
"06:05",
"06:10",
"06:15",
"06:20",
"06:25",
"06:30",
"06:35",
"06:40",
"06:45",
"06:50",
"06:55",
"07:00",
"07:05",
"07:10",
"07:15",
"07:20",
"07:25",
"07:30",
"07:35",
"07:40",
"07:45",
"07:50",
"07:55",
"08:00",
"08:05",
"08:10",
"08:15",
"08:20",
"08:25",
"08:30",
"08:35",
"08:40",
"08:45",
"08:50",
"08:55",
"09:00",
"09:05",
"09:10",
"09:15",
"09:20",
"09:25",
"09:30",
"09:35",
"09:40",
"09:45",
"09:50",
"09:55",
"10:00",
"10:05",
"10:10",
"10:15",
"10:20",
"10:25",
"10:30",
"10:35",
"10:40",
"10:45",
"10:50",
"10:55",
"11:00",
"11:05",
"11:10",
"11:15",
"11:20",
"11:25",
"11:30",
"11:35",
"11:40",
"11:45",
"11:50",
"11:55",
"12:00",
"12:05",
"12:10",
"12:15",
"12:20",
"12:25",
"12:30",
"12:35",
"12:40",
"12:45",
"12:50",
"12:55",
"13:00",
"13:05",
"13:10",
"13:15",
"13:20",
"13:25",
"13:30",
"13:35",
"13:40",
"13:45",
"13:50",
"13:55",
"14:00",
"14:05",
"14:10",
"14:15",
"14:20",
"14:25",
"14:30",
"14:35",
"14:40",
"14:45",
"14:50",
"14:55",
"15:00",
"15:05",
"15:10",
"15:15",
"15:20",
"15:25",
"15:30",
"15:35",
"15:40",
"15:45",
"15:50",
"15:55",
"16:00",
"16:05",
"16:10",
"16:15",
"16:20",
"16:25",
"16:30",
"16:35",
"16:40",
"16:45",
"16:50",
"16:55",
"17:00",
"17:05",
"17:10",
"17:15",
"17:20",
"17:25",
"17:30",
"17:35",
"17:40",
"17:45",
"17:50",
"17:55",
"18:00",
"18:05",
"18:10",
"18:15",
"18:20",
"18:25",
"18:30",
"18:35",
"18:40",
"18:45",
"18:50",
"18:55",
"19:00",
"19:05",
"19:10",
"19:15",
"19:20",
"19:25",
"19:30",
"19:35",
"19:40",
"19:45",
"19:50",
"19:55",
"20:00",
"20:05",
"20:10",
"20:15",
"20:20",
"20:25",
"20:30",
"20:35",
"20:40",
"20:45",
"20:50",
"20:55",
"21:00",
"21:05",
"21:10",
"21:15",
"21:20",
"21:25",
"21:30",
"21:35",
"21:40",
"21:45",
"21:50",
"21:55",
"22:00",
"22:05",
"22:10",
"22:15",
"22:20",
"22:25",
"22:30",
"22:35",
"22:40",
"22:45",
"22:50",
"22:55",
"23:00",
"23:05",
"23:10",
"23:15",
"23:20",
"23:25",
"23:30",
"23:35",
"23:40",
"23:45",
"23:50",
"23:55"
    ];

function timeline(reference) {

    var s = GM_getValue("scrolling");
    if(s)
        console.log("timeline(), [scrolling] is present:",
            s, moment.duration(moment() - moment(s)).humanize() );

    if(!reference) {

        if(s && moment(s).add(50, 's').isBefore(moment())) {
            // the variable is not supposed to be found
            console.log("a previous scroll interrupted?");
        }

        if(s && moment(s).add(50, 's').isAfter(moment())) {
            // this means the timeline() got call to early
            console.log("timeline() function called too early?");
            return;
        }

        console.log("setting GM_setValue 'scrolling'", moment().format() );
        GM_setValue("scrolling", moment().format());

        reference = {
            counter: 0,
            y: 0
        };
    }

    if(reference.counter === SCROLL_TIMES) {
        console.log("Timeline counter reach", SCROLL_TIMES);
        if(s) {
            console.log(s, "'scrolling': is present, -> doTheNext, removing GM_[scrolling]", s);
            GM_setValue("scrolling", null);
            return _.delay(doTheNext, 1);
        } else {
            console.log("GM_[scrolling] is null", s, "killed ramification");
        }
    } else {
        reference.counter += 1;
        reference.y = reference.counter * fixedH;
        GM_setValue("scrolling", moment().format());

        console.log("scrolling", reference.counter, "at",
                  moment().format("HH:mm:ss"), "a the Y", reference.y);

        scrollTo(0, reference.y);

        return _.delay(timeline, AWAITSECS * 1000, reference);
    }
}

function doTheNext() {

    /* this is not anymore timezone robust, it is intended to be run in the right place */
    var next = null;
    _.each(plan, function(t) {

		var hour = _.parseInt(t.split(':')[0]);
		var minute = _.parseInt(t.split(':')[1]);

        var target = moment().startOf('day').add(hour, 'h').add(minute, 'm');

        if(!next && moment().isBefore( target ) ) {
            console.log("The next refresh will be at", t);
            next = moment.duration(target - moment()).asSeconds();
        }
    });

    if(!next) {
        console.log("strange condition before midnight, check in 1 hour");
        GM_setValue("refresh", true);
        return _.delay(doTheNext, 3600 * 1000);
    } else {
        console.log("Setting the next timeline in", next, "seconds");
        GM_setValue("refresh", true);
        return _.delay(cleanAndReload, next * 1000);
    }
};

function cleanAndReload() {
    GM_setValue("scrolling", null);
    // this value 'refresh' is not used because remain dirty in case a browser restart
    GM_setValue("refresh", null);
    location.reload();
};

(function() {

    var s = GM_getValue("scrolling");

    if( s && moment(s).add(50, 's').isBefore(moment())) {
        console.log("Considering the diff of", 
                moment.duration(moment() - moment(s)).humanize(), "...");
        timeline();
    }
    else if(!s) {
        var r = GM_getValue("refresh");
        console.log("beginning tampermonkey, scrolling", s, "refresh", r);
        timeline();
    } else
        console.log("Nope, recorded is", moment(s).format("HH:mm:ss"), "now is:", moment().format("HH:mm:ss"));
})();
