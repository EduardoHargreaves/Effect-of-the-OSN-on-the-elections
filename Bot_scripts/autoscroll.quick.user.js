// ==UserScript==
// @name         autoscroll
// @namespace    autoscroll
// @version      1.20
// @description  autoscroller to be used with https://facebook.tracking.exposed, This userscript works with TamperMoneky extension.
// @author       Claudio Agosti @_vecna, Eduardo Hargreaves
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
"00:10",
"00:20",
"00:30",
"00:40",
"00:50",
"01:00",
"01:10",
"01:20",
"01:30",
"01:40",
"01:50",
"02:00",
"02:10",
"02:20",
"02:30",
"02:40",
"02:50",
"03:00",
"03:10",
"03:20",
"03:30",
"03:40",
"03:50",
"04:00",
"04:10",
"04:20",
"04:30",
"04:40",
"04:50",
"05:00",
"05:10",
"05:20",
"05:30",
"05:40",
"05:50",
"06:00",
"06:10",
"06:20",
"06:30",
"06:40",
"06:50",
"07:00",
"07:10",
"07:20",
"07:30",
"07:40",
"07:50",
"08:00",
"08:10",
"08:20",
"08:30",
"08:40",
"08:50",
"09:00",
"09:10",
"09:20",
"09:30",
"09:40",
"09:50",
"10:00",
"10:10",
"10:20",
"10:30",
"10:40",
"10:50",
"11:00",
"11:10",
"11:20",
"11:30",
"11:40",
"11:50",
"12:00",
"12:10",
"12:20",
"12:30",
"12:40",
"12:50",
"13:00",
"13:10",
"13:20",
"13:30",
"13:40",
"13:50",
"14:00",
"14:10",
"14:20",
"14:30",
"14:40",
"14:50",
"15:00",
"15:10",
"15:20",
"15:30",
"15:40",
"15:50",
"16:00",
"16:10",
"16:20",
"16:30",
"16:40",
"16:50",
"17:00",
"17:10",
"17:20",
"17:30",
"17:40",
"17:50",
"18:00",
"18:10",
"18:20",
"18:30",
"18:40",
"18:50",
"19:00",
"19:10",
"19:20",
"19:30",
"19:40",
"19:50",
"20:00",
"20:10",
"20:20",
"20:30",
"20:40",
"20:50",
"21:00",
"21:10",
"21:20",
"21:30",
"21:40",
"21:50",
"22:00",
"22:10",
"22:20",
"22:30",
"22:40",
"22:50",
"23:00",
"23:10",
"23:20",
"23:30",
"23:40",
"23:50",
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

        return _.delay(timeline, AWAITSECS * 100, reference);
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
