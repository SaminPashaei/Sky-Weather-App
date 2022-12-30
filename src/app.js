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
    response.data.current.weather[0].description;

  document.querySelector("#current-humidity").innerHTML =
    response.data.current.humidity;
  document.querySelector("#current-uvi").innerHTML = Math.round(
    response.data.current.uvi
  );
  document.querySelector("#current-pressure").innerHTML =
    response.data.current.pressure;
  document.querySelector("#current-wind-speed").innerHTML = Math.round(
    response.data.current.wind_speed
  );
  document.querySelector("#current-wind-degree").innerHTML = `${
    response.data.current.wind_deg
  } (${windDirection(response.data.current.wind_deg)})`;

  chnageIcon(
    response.data.current.weather[0].icon,
    response.data.current.weather[0].main
  );

  document.querySelector("#current-time").innerHTML = getTime(
    response.data.timezone,
    null
  );

  changeTemperature(response.data.current);
  changeForecast(response.data.daily);
  changeHorizon(response.data);
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

function chnageIcon(icon, text) {
  let currentIcon = document.querySelector("#current-icon");
  currentIcon.src = `media/${icon}.svg`;
  currentIcon.alt = text;
}

function getTime(zone, time) {
  localOptions = {
    timeZone: zone,
    hour12: false,
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
  };

  horizonOptions = {
    timeZone: zone,
    hour12: false,
    timeStyle: "short",
  };

  forecastOptions = {
    weekday: "long",
  };

  if (time === null) {
    return new Date().toLocaleString("en-US", localOptions);
  } else if (zone === null) {
    return new Date(time * 1000).toLocaleString("en-US", forecastOptions);
  } else {
    return new Date(time * 1000).toLocaleString("en-US", horizonOptions);
  }
}

function changeTemperature(api) {
  centigradeDegree = document.querySelector("#centigrade-degree");
  currentTemp = document.querySelector("#current-temp");
  currentFeelsLike = document.querySelector("#current-feels-like");

  centigradeTemp = {
    current: api.temp,
    feel: api.feels_like,
  };

  fahrenheitTemp = {
    current: api.temp * 1.8 + 32,
    feel: api.feels_like * 1.8 + 32,
  };

  if (centigradeDegree.classList.contains("disabled-degree-style")) {
    showCentigrade();
  } else {
    showFahrenheit();
  }
}

function changeForecast(daily) {
  let forecastHTML = `<div class="row">`;
  for (let col = 0; col < 2; col++) {
    let dayNum;
    if (col === 0) {
      dayNum = 1;
    } else {
      dayNum = 4;
    }

    forecastHTML += `
                      <div class="col-md-6">
                        <ul class="forecast-list">
                    `;
    for (let index = dayNum; index < dayNum + 3; index++) {
      forecastHTML += `
                        <li class="row card-list-item forecast-list-item">
                          <div class="col-4 day-title">${getTime(
                            null,
                            daily[index].dt
                          )}</div>
                          <div class="col-4 text-end">
                            <img src="media/${
                              daily[index].weather[0].icon
                            }.svg" class="day-icon" />
                          </div>
                          <div class="col-4 text-end day-degree">
                            ${Math.round(daily[index].temp.max)}°   
                              
                            <span class="min-temp">
                              ${Math.round(daily[index].temp.min)}°
                            </span>
                          </div>
                        </li>
                      `;
    }
    forecastHTML += `
                        </ul>
                      </div>
                    `;
  }
  forecastHTML += `</div>`;

  document.querySelector("#forecast-card-body").innerHTML = forecastHTML;
}

function changeHorizon(api) {
  let horizon = ["sunrise", "sunset", "moonrise", "moonset"];
  let horizonTime = [
    api.current.sunrise,
    api.current.sunset,
    api.daily[0].moonrise,
    api.daily[0].moonset,
  ];

  let horizonHTML = `<div class="row text-center">`;
  for (let index = 0; index < 4; index++) {
    horizonHTML += `
                      <div class="col-md-6">
                        <div class="row card-list-item">
                          <div class="col-6">
                            <img
                              src="media/${horizon[index]}.svg"
                              alt="${horizon[index]}"
                              class="horizon-icon"
                          />
                          </div>

                          <div class="col-6">
                            <ul class="horizon-list">
                              <li class="horizon-title">${horizon[index]}</li>
                              <li class="horizon-time">${getTime(
                                api.timezone,
                                horizonTime[index]
                              )}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    `;
  }
  horizonHTML += `</div>`;

  document.querySelector("#horizon-card-body").innerHTML = horizonHTML;
}

function showCentigrade() {
  currentTemp.innerHTML = Math.round(centigradeTemp.current);
  currentFeelsLike.innerHTML = Math.round(centigradeTemp.feel);
}

function showFahrenheit() {
  currentTemp.innerHTML = Math.round(fahrenheitTemp.current);
  currentFeelsLike.innerHTML = Math.round(fahrenheitTemp.feel);
}

function changeScale() {
  fahrenheitDegree = document.querySelector("#fahrenheit-degree");
  centigradeDegree = document.querySelector("#centigrade-degree");

  fahrenheitDegree.addEventListener("click", convertToFahrenheit);
  centigradeDegree.addEventListener("click", convertToCentigrade);
}

function convertToFahrenheit(event) {
  event.preventDefault();
  fahrenheitDegree.classList.replace("degree-style", "disabled-degree-style");
  centigradeDegree.classList.replace("disabled-degree-style", "degree-style");
  showFahrenheit();
}

function convertToCentigrade(event) {
  event.preventDefault();
  fahrenheitDegree.classList.replace("disabled-degree-style", "degree-style");
  centigradeDegree.classList.replace("degree-style", "disabled-degree-style");
  showCentigrade();
}

let apiKey = "7746bdeabca928cfedcad71e52fd9d66";
let centigradeDegree,
  fahrenheitDegree,
  currentTemp,
  currentFeelsLike,
  centigradeTemp,
  fahrenheitTemp;

getCityApi("Frankfurt");
searchEngine();
changeScale();
