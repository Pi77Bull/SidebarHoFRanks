// ==UserScript==
// @name         Sidebar HoF Ranks
// @version      0.2.1
// @description  Displays all Hall of Fame Ranks in the Sidebar.
// @author       Pi77Bull [2082618]
// @match        https://www.torn.com/*
// @grant        GM_addStyle
// ==/UserScript==

let hofranks = JSON.parse(localStorage.getItem("hofranks"));

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

GM_addStyle(`
.shofr_option {
width: 50%;
height: 30px;
font-size: 12px;
line-height: 30px;
display: inline-block;
box-sizing: border-box;
padding: 0 8px;
}

.shofr_row {
padding: 0 4px;
}

.shofr_row span {
margin: 2px 5px;
display: inline-block;
}

.shofr_input {
width: 75%;
height: 20px;
float: right;
border: 1px solid #cccccc;
font-size: 12px;
padding: 0 2px;
margin-top: 4px;
}

.shofr_footer {
padding: 5px 8px;
}

.shofr_status {
display: none;
}

.shofr_status-saved {
display: inline-block;
font-size: 24px;
line-height: 16px;
margin-left: 18px;
animation-name: shofrStatusSaved;
animation-duration: 4s;
}

@keyframes shofrStatusSaved {
0% {color: #008000ff;}
50% {color: #008000ff;}
100% {color: #00800000;}
}

@media screen and (max-width:1000px) {
.shofr_option {
width: 100%;
}
}
`)

if (window.location.pathname == "/preferences.php") {
    $(".content-wrapper").append(`
<div class="m-top10">
<div class="cont-gray border-round">
<div class="title-black top-round">Sidebar HoF Ranks Settings</div>
<div>

<div class="shofr_option">
API-Key: <input id="apikey" class="shofr_input" type="text">
</div><div class="shofr_option">
Refresh (h): <input id="refresh" class="shofr_input" type="text">
</div>

<div class="shofr_row">
<span><input type="checkbox" id="attacks"><label for="attacks"> Attacks</label></span>
<span><input type="checkbox" id="battlestats"><label for="battlestats"> Battlestats</label></span>
<span><input type="checkbox" id="busts"><label for="busts"> Busts</label></span>
<span><input type="checkbox" id="defends"><label for="defends"> Defends</label></span>
<span><input type="checkbox" id="networth"><label for="networth"> Networth</label></span>
<span><input type="checkbox" id="offences"><label for="offences"> Offences</label></span>
<span><input type="checkbox" id="revives"><label for="revives"> Revives</label></span>
<span><input type="checkbox" id="traveled"><label for="traveled"> Traveled</label></span>
<span><input type="checkbox" id="workstats"><label for="workstats"> Workstats</label></span>
<span><input type="checkbox" id="level"><label for="level"> Level</label></span>
<span><input type="checkbox" id="rank"><label for="rank"> Rank</label></span>
<span><input type="checkbox" id="respect"><label for="respect"> Respect</label></span>
</div>

</div>
<div class="shofr_footer">
<input id="shofrSave" value="Save Settings" class="torn-btn" type="submit">
<input id="shofrDelete" value="Delete Settings" class="torn-btn" type="submit">
<span id="shofrStatus" class="shofr_status">✔</span>
</div>
</div>
</div>
`);

    if (hofranks) {
        $("#apikey").val(hofranks.apikey);
        $("#refresh").val(hofranks.refresh);
        for (let stat in hofranks.visiblestats) {
            $(`#${stat}`).attr("checked", "true");
        }
    }

    $("#shofrSave").on("click", function () {
        getData(function(data) {
            hofranks = {
                "date": new Date(),
                "apikey": $("#apikey").val(),
                "refresh": $("#refresh").val(),
                "visiblestats": {},
                "halloffame": data
            };

            $(".shofr_row input:checked").each((i, j) => {
                hofranks.visiblestats[j.id] = 1;
            });

            localStorage.setItem("hofranks", JSON.stringify(hofranks));

            $("#shofrStatus").removeClass().addClass("shofr_status-saved");
            setTimeout(function () {
                $("#shofrStatus").removeClass().addClass("shofr_status");
            }, 4000);
            displayData();
        });
    });

    $("#shofrDelete").on("click", function () {
        localStorage.removeItem("hofranks");
        $(".points___KTUNl > p:not([tabindex='1'])").remove();
    });
}
if (hofranks) {
    if (((new Date() - new Date(Date.parse(hofranks.date))) / 1000 / 60 / 60) >= 1) {
        getData(function(data) {
            hofranks.date = new Date();
            hofranks.halloffame = data;
            localStorage.setItem("hofranks", JSON.stringify(hofranks));
            displayData();
        });
    } else {
        displayData();
    }
}


function getData(callback) {
    $.getJSON(`https://api.torn.com/user/?selections=hof&key=${hofranks.apikey}`, (data) => {
        callback(data.halloffame);
    });
}

function displayData() {
    if (!$(".sidebar-block___1Cqc2").eq(0).hasClass("info___1us3U")) {
        $(".points___KTUNl > p:not([tabindex='1'])").remove();
        for (let stat in hofranks.visiblestats) {
            $(".points___KTUNl").append(`<p class="point-block___xpMEi"><span style="font-weight: bold;">${stat.capitalize()}:</span><span style="float: right;">${hofranks.halloffame[stat].rank}</span></p>`);
        }
    } else {
        var targetNode = $(".sidebar-block___1Cqc2")[0];

        var config = { attributes: true, subtree: true };

        var callback = function(mutationsList, observer) {
            for(var mutation of mutationsList) {
                if (mutation.attributeName == 'class') {
                    $(".points___KTUNl > p:not([tabindex='1'])").remove();
                    for (let stat in hofranks.visiblestats) {
                        $(".points___KTUNl").append(`<p class="point-block___xpMEi"><span style="font-weight: bold;">${stat.capitalize()}:</span><span style="float: right;">${hofranks.halloffame[stat].rank}</span></p>`);
                    }
                    observer.disconnect();
                }
            }
        };

        var observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }
}