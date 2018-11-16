// ==UserScript==
// @name         Hall of Fame Ranks in Sidebar
// @version      0.1
// @description  Displays all Hall of Fame Ranks in the Sidebar.
// @author       Pi77Bull [2082618]
// @match        https://www.torn.com/*
// @grant        none
// ==/UserScript==

let apikey = "";
let hofranks = JSON.parse(localStorage.getItem("hofranks"));

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

if (hofranks) {
    if (new Date(Date.parse(hofranks.date)).getDate() != new Date().getDate()) {
        getData();
    } else {
        displayData();
    }
} else {
    getData();
}

function getData() {
    $.getJSON(`https://api.torn.com/user/?selections=hof&key=${apikey}`, (data) => {
        hofranks = data;
        hofranks["date"] = new Date();
        localStorage.setItem("hofranks", JSON.stringify(hofranks));
        displayData();
    });
}

function displayData() {
    if ($("#sidebarroot")) {
        for (let stat in hofranks.halloffame) {
            $(".points___KTUNl").append(`<p class="point-block___xpMEi"><span style="font-weight: bold;">${stat.capitalize()}:</span><span style="float: right;">${hofranks.halloffame[stat].rank}</span></p>`);
        }
    }
}