function searchEngine() {
  document
    .querySelector("#search-city-form")
    .addEventListener("submit", fixSearchedCity);

  let mostSearchedCity = document.querySelectorAll(".most-searched-city");
  for (let index = 0; index < mostSearchedCity.length; index++) {
    mostSearchedCity[index].addEventListener("click", function (event) {
      event.preventDefault();
      getCityApi(mostSearchedCity[index].textContent);
    });
  }

  let locationButton = document.querySelectorAll(".location-button");
  for (let button = 0; button < 2; button++) {
    locationButton[button].addEventListener("click", findLocation);
  }
}

function fixSearchedCity(event) {
  event.preventDefault();
  let searchedCityName = document
    .querySelector("#searched-city-name")
    .value.trim()
    .toLowerCase();
  document.querySelector("#searched-city-name").value = "";

  if (searchedCityName.length > 0) {
    getCityApi(searchedCityName);
  } else {
    alert("You didn't enter a city. Please try again.");
  }
}

function findLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      getCityApi([position.coords.latitude, position.coords.longitude]);
    }, geolocationError);
  } else {
    alert("Geolocation API is not supported by this browser.");
  }
}

function geolocationError() {
  alert("Unfortunately, we don't have access to your location.");
}

function getCityApi(input) {
  let apiEndpoint = "https://api.openweathermap.org/data/2.5/weather";
  let usedUnit = "metric";
  let searchedInput;

  if (Array.isArray(input)) {
    searchedInput = `lat=${input[0]}&lon=${input[1]}`;
  } else {
    searchedInput = `q=${input}`;
  }

  let apiUrl = `${apiEndpoint}?${searchedInput}&appid=${apiKey}&units=${usedUnit}`;
  axios.get(apiUrl).then(changeCityName, apiError);
}

function apiError() {
  alert("Unfortunately, we don't have weather information for this city.");
}

function changeCityName(response) {
  document.querySelector("#city-name").innerHTML = response.data.name;
  oneCallApi(response.data.coord.lat, response.data.coord.lon);
}

function oneCallApi(lat, lon) {
  let apiEndpoint = "https://api.openweathermap.org/data/2.5/onecall";
  let exclude = "minutely,hourly,alerts";
  let usedUnit = "metric";
  let apiUrl = `${apiEndpoint}?lat=${lat}&lon=${lon}&exclude=${exclude}&appid=${apiKey}&units=${usedUnit}`;
  axios.get(apiUrl).then(getWeatherData);
}

function getWeatherData(response) {
  document.querySelector("#weather-description").innerHTML =
    response.data.weather[0].description;
  document.querySelector("#current-humidity").innerHTML =
    response.data.main.humidity;
  document.querySelector("#current-pressure").innerHTML =
    response.data.main.pressure;
  document.querySelector("#current-wind-speed").innerHTML =
    response.data.wind.speed;
  document.querySelector("#current-wind-degree").innerHTML =
    response.data.wind.deg;
  document.querySelector("#current-wind-direction").innerHTML = windDirection(
    response.data.wind.deg
  );

  chnageIcon(response.data.weather[0].icon, response.data.weather[0].main);
  changeDate(new Date(response.data.dt * 1000));
  changeHorizon(
    response.data.sys.sunrise * 1000,
    response.data.sys.sunset * 1000
  );
  changeTemperature(response.data.main);
}

function showFahrenheit() {
  currentTemp.innerHTML = Math.round(fahrenheitTemp.current);
  currentMinTemp.innerHTML = Math.round(fahrenheitTemp.min);
  currentMaxTemp.innerHTML = Math.round(fahrenheitTemp.max);
  currentFeelsLike.innerHTML = Math.round(fahrenheitTemp.feel);
}

function showCentigrade() {
  currentTemp.innerHTML = Math.round(centigradeTemp.current);
  currentMinTemp.innerHTML = Math.round(centigradeTemp.min);
  currentMaxTemp.innerHTML = Math.round(centigradeTemp.max);
  currentFeelsLike.innerHTML = Math.round(centigradeTemp.feel);
}

function convertToCentigrade(event) {
  event.preventDefault();
  fahrenheitDegree.classList.replace("disabled-degree-style", "degree-style");
  centigradeDegree.classList.replace("degree-style", "disabled-degree-style");
  showCentigrade();
}

function convertToFahrenheit(event) {
  event.preventDefault();
  fahrenheitDegree.classList.replace("degree-style", "disabled-degree-style");
  centigradeDegree.classList.replace("disabled-degree-style", "degree-style");
  showFahrenheit();
}

function changeScale() {
  fahrenheitDegree = document.querySelector("#fahrenheit-degree");
  centigradeDegree = document.querySelector("#centigrade-degree");

  fahrenheitDegree.addEventListener("click", convertToFahrenheit);
  centigradeDegree.addEventListener("click", convertToCentigrade);
}

function changeTemperature(api) {
  centigradeDegree = document.querySelector("#centigrade-degree");
  currentTemp = document.querySelector("#current-temp");
  currentMinTemp = document.querySelector("#current-min-temp");
  currentMaxTemp = document.querySelector("#current-max-temp");
  currentFeelsLike = document.querySelector("#current-feels-like");

  centigradeTemp = {
    current: api.temp,
    min: api.temp_min,
    max: api.temp_max,
    feel: api.feels_like,
  };

  fahrenheitTemp = {
    current: api.temp * 1.8 + 32,
    min: api.temp_min * 1.8 + 32,
    max: api.temp_max * 1.8 + 32,
    feel: api.feels_like * 1.8 + 32,
  };

  if (centigradeDegree.classList.contains("disabled-degree-style")) {
    showCentigrade();
  } else {
    showFahrenheit();
  }
}

function twoDigit(number) {
  return String(number).padStart(2, "0");
}

function getHour(time) {
  let timeHour = twoDigit(time.getHours());
  let timeMinute = twoDigit(time.getMinutes());
  return `${timeHour}:${timeMinute}`;
}

function changeHorizon(rise, set) {
  document.querySelector("#sunrise-time").innerHTML = getHour(new Date(rise));
  document.querySelector("#sunset-time").innerHTML = getHour(new Date(set));
}

function changeDate(date) {
  let dayName = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  document.querySelector("#last-update-time").innerHTML = `${
    dayName[date.getDay()]
  }, ${getHour(date)}`;
}

function chnageIcon(icon, text) {
  let currentIcon = document.querySelector("#current-icon");
  currentIcon.src = `media/${icon}.svg`;
  currentIcon.alt = text;
}

function windDirection(degree) {
  if ((degree >= 0 && degree <= 23) || (degree >= 337 && degree <= 360)) {
    return "N";
  } else if (degree >= 24 && degree <= 68) {
    return "NE";
  } else if (degree >= 69 && degree <= 113) {
    return "E";
  } else if (degree >= 114 && degree <= 158) {
    return "SE";
  } else if (degree >= 159 && degree <= 203) {
    return "S";
  } else if (degree >= 204 && degree <= 248) {
    return "SW";
  } else if (degree >= 249 && degree <= 293) {
    return "W";
  } else {
    return "NW";
  }
}

let apiKey = "7746bdeabca928cfedcad71e52fd9d66";
let centigradeDegree,
  fahrenheitDegree,
  currentTemp,
  currentMinTemp,
  currentMaxTemp,
  currentFeelsLike,
  centigradeTemp,
  fahrenheitTemp;

getCityApi("Frankfurt");
changeScale();
searchEngine();
