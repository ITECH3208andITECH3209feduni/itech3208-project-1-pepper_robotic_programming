// script.js - Pepper compatible ES5
 
function getQueryParam(name) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
 
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
 
        if (decodeURIComponent(pair[0]) === name) {
            return decodeURIComponent(pair[1] || "");
        }
    }
 
    return "";
}
 
window.onload = function () {
    var title = getQueryParam("title");
    var img = getQueryParam("img");
 
    var roomTitle = document.getElementById("roomTitle");
    var roomImage = document.getElementById("roomImage");
 
    if (roomTitle) {
        roomTitle.innerHTML = "Here are the directions to the " + title;
    }
 
    if (roomImage && img) {
        roomImage.src = img;
    }
 
    var countdownElement = document.getElementById("countdown");
    var progressCircle = document.querySelector(".progress-circle");
 
    var radius = 60;
    var circumference = 2 * Math.PI * radius;
 
    if (progressCircle) {
        progressCircle.style.strokeDasharray = circumference;
    }
 
    var timeLeft = 20;
 
    var countdown = setInterval(function () {
        timeLeft = timeLeft - 1;
 
        if (countdownElement) {
            countdownElement.innerHTML = timeLeft;
        }
 
        if (progressCircle) {
            var progress = circumference - (timeLeft / 20) * circumference;
            progressCircle.style.strokeDashoffset = progress;
        }
 
        if (timeLeft <= 0) {
            clearInterval(countdown);
            window.location.href = "index.html";
        }
 
    }, 1000);
};