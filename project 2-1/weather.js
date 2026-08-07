const url =
"https://api.open-meteo.com/v1/forecast?latitude=-37.5622&longitude=143.8503&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&forecast_days=1";

fetch(url)
.then(response => response.json())
.then(data => {

    const current = data.current;

    document.getElementById("temperature").textContent =
        current.temperature_2m + " °C";

    document.getElementById("humidity").textContent =
        current.relative_humidity_2m + " %";

    document.getElementById("wind").textContent =
        current.wind_speed_10m + " km/h";

    document.getElementById("condition").textContent =
        weatherDescription(current.weather_code);

    document.getElementById("updated").textContent =
        "Last updated: " + current.time;
        
    document.getElementById("maxTemp").textContent =
        data.daily.temperature_2m_max[0] + " °C";

    document.getElementById("minTemp").textContent =
        data.daily.temperature_2m_min[0] + " °C";
});

function weatherDescription(code){

    switch(code){

        case 0: return "Clear Sky";

        case 1:
        case 2:
        case 3:
            return "Partly Cloudy";

        case 45:
        case 48:
            return "Fog";

        case 51:
        case 53:
        case 55:
            return "Drizzle";

        case 61:
        case 63:
        case 65:
            return "Rain";

        case 71:
        case 73:
        case 75:
            return "Snow";

        case 80:
        case 81:
        case 82:
            return "Rain Showers";

        case 95:
            return "Thunderstorm";

        default:
            return "Unknown";

    }

}