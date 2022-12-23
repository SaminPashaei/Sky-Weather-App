function updateDate(date) {
  return "Friday, 16:00";
}

function getWeatherData(response) {
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
  document.querySelector("#last-update-time").innerHTML = updateDate(
    new Date(response.data.dt * 1000)
  );
  document.querySelector("#current-humidity").innerHTML =
    response.data.main.humidity;
  document.querySelector("#current-pressure").innerHTML =
    response.data.main.pressure;
  document.querySelector("#current-wind-speed").innerHTML =
    response.data.wind.speed;
  document.querySelector("#current-wind-degree").innerHTML =
    response.data.wind.deg;
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
