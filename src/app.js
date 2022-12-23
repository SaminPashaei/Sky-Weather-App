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

function twoDigit(number) {
  return String(number).padStart(2, "0");
}

function getHour(time) {
  let timeHour = twoDigit(time.getHours());
  let timeMinute = twoDigit(time.getMinutes());
  return `${timeHour}:${timeMinute}`;
}

function getDay(time) {
  let dayName = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return dayName[time.getDay()];
}

function getWeatherData(response) {
  let updateDate = new Date(response.data.dt * 1000);

  document.querySelector("#current-temp").innerHTML = Math.round(
    response.data.main.temp
  );
  document.querySelector("#city-name").innerHTML = response.data.name;
  document.querySelector("#weather-description").innerHTML =
    response.data.weather[0].description;
  document.querySelector("#current-min-temp").innerHTML = Math.round(
    response.data.main.temp_min
  );
  document.querySelector("#current-max-temp").innerHTML = Math.round(
    response.data.main.temp_max
  );
  document.querySelector("#current-feels-like").innerHTML = Math.round(
    response.data.main.feels_like
  );
  document.querySelector("#last-update-time").innerHTML = `${getDay(
    updateDate
  )}, ${getHour(updateDate)}`;

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

  document.querySelector("#sunrise-time").innerHTML = getHour(
    new Date(response.data.sys.sunrise * 1000)
  );
  document.querySelector("#sunset-time").innerHTML = getHour(
    new Date(response.data.sys.sunset * 1000)
  );
}

function callApi(input) {
  let apiEndpoint = "https://api.openweathermap.org/data/2.5/weather";
  let apiKey = "9c76791214fe9c90d314ec57f7743bcd";
  let usedUnit = "metric";
  let searchedInput;

  if (Array.isArray(input)) {
    searchedInput = `lat=${input[0]}&lon=${input[1]}`;
  } else {
    searchedInput = `q=${input}`;
  }

  let apiUrl = `${apiEndpoint}?${searchedInput}&appid=${apiKey}&units=${usedUnit}`;
  axios.get(apiUrl).then(getWeatherData);
}

function getPosition(position) {
  let currentPosition = [position.coords.latitude, position.coords.longitude];
  callApi(currentPosition);
}

function findLocation() {
  navigator.geolocation.getCurrentPosition(getPosition);
}

function fixSearchedCity(event) {
  event.preventDefault();
  let searchedCityName = document
    .querySelector("#searched-city-name")
    .value.trim()
    .toLowerCase();
  document.querySelector("#searched-city-name").value = "";

  if (searchedCityName.length > 0) {
    callApi(searchedCityName);
  }
}

function searchEngine() {
  document
    .querySelector("#search-city-form")
    .addEventListener("submit", fixSearchedCity);

  let locationButton = document.querySelectorAll(".location-button");
  for (let button = 0; button < 2; button++) {
    locationButton[button].addEventListener("click", findLocation);
  }
}

function mostSearched() {
  let mostSearchedCity = document.querySelectorAll(".most-searched-city");

  for (let index = 0; index < mostSearchedCity.length; index++) {
    mostSearchedCity[index].addEventListener("click", function (event) {
      event.preventDefault();
      callApi(mostSearchedCity[index].textContent);
    });
  }
}

searchEngine();
mostSearched();

callApi("Tehran");
