// script.js

const params = new URLSearchParams(window.location.search);

const title = params.get("title");
const img = params.get("img");

const roomTitle = document.getElementById("roomTitle");
const roomImage = document.getElementById("roomImage");

if (roomTitle) roomTitle.textContent = `Here are the directions to the ${title}`;
if (roomImage) roomImage.src = img;

const countdownElement = document.getElementById("countdown");
const progressCircle = document.querySelector(".progress-circle");

const radius = 60;
const circumference = 2 * Math.PI * radius;

progressCircle.style.strokeDasharray = circumference;

let timeLeft = 20;

const countdown = setInterval(() => {

  timeLeft--;

  countdownElement.textContent = timeLeft;

  const progress =
    circumference - (timeLeft / 20) * circumference;

  progressCircle.style.strokeDashoffset = progress;

  if (timeLeft <= 0) {
    clearInterval(countdown);

    window.location.href = "index.html";
  }

}, 1000);