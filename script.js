document.getElementById("city").addEventListener("input", function () {
  var city = this.value;
  getWeather(city);
});

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // Debugging line
        getWeatherByCoordinates(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        getWeather("Delhi"); // Default to Delhi on error
      }
    );
  } else {
    alert("Geolocation is not supported by this browser. Defaulting to Delhi.");
    getWeather("Delhi");
  }
}

document.addEventListener("DOMContentLoaded", getLocation);

async function getWeather(location) {
  try {
    const params = {
      q: location,
      appid: "3e59a8b2bc0b6177832c82258e3e9771",
      units: "metric",
    };

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      { params }
    );

    displayWeather(response.data);
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
  }
}

async function getWeatherByCoordinates(latitude, longitude) {
  try {
    const params = {
      lat: latitude,
      lon: longitude,
      appid: "3e59a8b2bc0b6177832c82258e3e9771",
      units: "metric",
    };

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      { params }
    );

    displayWeather(response.data);
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
  }
}

let tempChart = null;

function displayWeather(data) {
  const currentTemperature = data.list[0].main.temp;
  document.querySelector(".weather-temp").textContent =
    Math.round(currentTemperature) + "ºC";

  const forecastData = data.list;
  const dailyForecast = {};

  forecastData.forEach((data) => {
    const day = new Date(data.dt * 1000).toLocaleDateString("en-US", {
      weekday: "long",
    });
    if (!dailyForecast[day]) {
      dailyForecast[day] = {
        minTemp: data.main.temp_min,
        maxTemp: data.main.temp_max,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
        temps: [],
        times: [],
      };
    }
    dailyForecast[day].minTemp = Math.min(
      dailyForecast[day].minTemp,
      data.main.temp_min
    );
    dailyForecast[day].maxTemp = Math.max(
      dailyForecast[day].maxTemp,
      data.main.temp_max
    );
    dailyForecast[day].temps.push(data.main.temp);
    dailyForecast[day].times.push(new Date(data.dt * 1000).getHours() + ":00");
  });

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayForecast = dailyForecast[today];

  document.querySelector(".date-dayname").textContent = today;
  document.querySelector(".date-day").textContent = new Date()
    .toUTCString()
    .slice(5, 16);
  document.querySelector(".weather-icon").innerHTML = getWeatherIcon(
    todayForecast.icon
  );
  document.querySelector(".location").textContent = data.city.name;
  document.querySelector(".weather-desc").textContent =
    todayForecast.description
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  document.querySelector(".humidity .value").textContent =
    todayForecast.humidity + " %";
  document.querySelector(".wind .value").textContent =
    todayForecast.windSpeed + " m/s";

  const dayElements = document.querySelectorAll(".day-name");
  const tempElements = document.querySelectorAll(".day-temp");
  const iconElements = document.querySelectorAll(".day-icon");

  const days = Object.keys(dailyForecast);
  dayElements.forEach((dayElement, index) => {
    if (index < days.length) {
      const day = days[index];
      const data = dailyForecast[day];
      dayElement.textContent = day.slice(0, 3);
      tempElements[index].textContent = `${Math.round(
        data.minTemp
      )}º / ${Math.round(data.maxTemp)}º`;
      iconElements[index].innerHTML = getWeatherIcon(data.icon);
    }
  });

  updateTemperatureGraph(dailyForecast);
}

function updateTemperatureGraph(dailyForecast) {
  const ctx = document.getElementById("tempChart").getContext("2d");

  if (tempChart) {
    tempChart.destroy();
  }

  const days = Object.keys(dailyForecast);
  const datasets = [];
  const labels = [];

  const minTemps = [];
  const maxTemps = [];

  days.forEach((day) => {
    labels.push(day.slice(0, 3));
    minTemps.push(Math.round(dailyForecast[day].minTemp));
    maxTemps.push(Math.round(dailyForecast[day].maxTemp));
  });

  tempChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Max Temperature",
          data: maxTemps,
          borderColor: "#ff6b6b",
          backgroundColor: "rgba(255, 107, 107, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Min Temperature",
          data: minTemps,
          borderColor: "#4ecdc4",
          backgroundColor: "rgba(78, 205, 196, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#fff",
          },
        },
      },
      scales: {
        y: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "#fff",
          },
        },
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "#fff",
          },
        },
      },
    },
  });
}

function getWeatherIcon(iconCode) {
  const iconBaseUrl = "https://openweathermap.org/img/wn/";
  const iconSize = "@2x.png";
  return `<img src="${iconBaseUrl}${iconCode}${iconSize}" alt="Weather Icon">`;
}

document.addEventListener("DOMContentLoaded", function () {
  getLocation();
  setInterval(getLocation, 900000);
});
