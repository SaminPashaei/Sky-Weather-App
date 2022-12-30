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
  weatherApiData = response.data;

  document.querySelector("#weather-description").innerHTML =
    weatherApiData.current.weather[0].description;

  document.querySelector("#current-time").innerHTML = getTime(
    weatherApiData.timezone,
    null
  );

  chnageIcon(
    weatherApiData.current.weather[0].icon,
    weatherApiData.current.weather[0].main
  );

  changeInfo(weatherApiData.current);
  changeForecast(weatherApiData.daily);
  changeHorizon(weatherApiData);
  changeMoonPhase(weatherApiData.daily[0].moon_phase);
  changeTakeUmbrella(weatherApiData.daily[0].pop);

  centigradeDegree = document.querySelector("#centigrade-degree");
  if (centigradeDegree.classList.contains("disabled-degree-style")) {
    getCentigradeData();
  } else {
    getFahrenheitData();
  }
}

function getTime(zone, time) {
  localOptions = {
    timeZone: zone,
    hour12: false,
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
  };

  forecastOptions = {
    weekday: "long",
  };

  horizonOptions = {
    timeZone: zone,
    hour12: false,
    timeStyle: "short",
  };

  if (time === null) {
    return new Date().toLocaleString("en-US", localOptions);
  } else if (zone === null) {
    return new Date(time * 1000).toLocaleString("en-US", forecastOptions);
  } else {
    return new Date(time * 1000).toLocaleString("en-US", horizonOptions);
  }
}

function chnageIcon(icon, text) {
  let currentIcon = document.querySelector("#current-icon");
  currentIcon.src = `media/${icon}.svg`;
  currentIcon.alt = text;
}

function changeInfo(current) {
  let infoData = [
    {
      name: "Humidity",
      icon: "humidity",
      value: current.humidity,
      unit: "%",
    },
    {
      name: "UV Index",
      icon: "uv-index",
      value: current.uvi,
      unit: "",
    },
    {
      name: "Pressure",
      icon: "barometer",
      value: current.pressure,
      unit: "Pa",
    },
    {
      name: "Wind Speed",
      icon: "windsock",
      value: Math.round(current.wind_speed),
      unit: "km/h",
    },
    {
      name: "Wind Degree",
      icon: "compass",
      value: `${current.wind_deg} (${windDirection(current.wind_deg)})`,
      unit: "",
    },
  ];

  let infoHTML = `<ul class="info-list disable-list">`;
  for (let index = 0; index < 5; index++) {
    infoHTML += `
                  <li class="row">
                    <div class="col-6 p-0">
                      <img src="media/${infoData[index].icon}.svg" class="info-icon" />
                      <span class="info-title">${infoData[index].name}</span>
                    </div>
                    <div class="col-6 text-end">
                      ${infoData[index].value} ${infoData[index].unit}
                    </div>
                  </li>
                `;
  }
  infoHTML += `</ul>`;

  document.querySelector("#info-card-body").innerHTML = infoHTML;
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
                        <ul class="forecast-list disable-list">
                    `;
    for (let index = dayNum; index < dayNum + 3; index++) {
      forecastHTML += `
                        <li class="row card-item forecast-item">
                          <div class="col-4 day-title">
                            ${getTime(null, daily[index].dt)}
                          </div>
                          <div class="col-4 text-end">
                            <img 
                              src="media/${daily[index].weather[0].icon}.svg"
                              class="day-icon"
                            />
                          </div>
                          <div class="col-4 text-end day-degree">
                            <span class="daily-max-temp"></span>
                            <span class="min-temp daily-min-temp"></span>
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

function changeHorizon(data) {
  let horizon = ["sunrise", "sunset", "moonrise", "moonset"];
  let horizonTime = [
    data.current.sunrise,
    data.current.sunset,
    data.daily[0].moonrise,
    data.daily[0].moonset,
  ];

  let horizonHTML = `<div class="row text-center">`;
  for (let index = 0; index < 4; index++) {
    horizonHTML += `
                      <div class="col-md-6">
                        <div class="row card-item horizon-item">
                          <div class="col-4">
                            <img
                              src="media/${horizon[index]}.svg"
                              alt="${horizon[index]}"
                              class="horizon-icon"
                          />
                          </div>

                          <div class="col-8">
                            <ul class="horizon-list disable-list">
                              <li class="horizon-title">${horizon[index]}</li>
                              <li class="horizon-time">
                                ${getTime(data.timezone, horizonTime[index])}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    `;
  }
  horizonHTML += `</div>`;

  document.querySelector("#horizon-card-body").innerHTML = horizonHTML;
}

function changeMoonPhase(phase) {
  let moonPhaseName, moonPhaseIcon;
  if (phase === 0 || phase === 1) {
    moonPhaseName = "New Moon";
    moonPhaseIcon = "moon-new";
  } else if (phase > 0 && phase < 0.25) {
    moonPhaseName = "Waxing Crescent";
    moonPhaseIcon = "moon-waxing-crescent";
  } else if (phase === 0.25) {
    moonPhaseName = "First Quarter";
    moonPhaseIcon = "moon-first-quarter";
  } else if (phase > 0.25 && phase < 0.5) {
    moonPhaseName = "Waxing Gibbous";
    moonPhaseIcon = "moon-waxing-gibbous";
  } else if (phase === 0.5) {
    moonPhaseName = "Full Moon";
    moonPhaseIcon = "moon-full";
  } else if (phase > 0.5 && phase < 0.75) {
    moonPhaseName = "Waning Gibbous";
    moonPhaseIcon = "moon-waning-gibbous";
  } else if (phase === 0.75) {
    moonPhaseName = "Last Quarter";
    moonPhaseIcon = "moon-last-quarter";
  } else if (phase > 0.75 && phase < 1) {
    moonPhaseName = "Waning Crescent";
    moonPhaseIcon = "moon-waning-crescent";
  }

  document.querySelector("#moon-phase-icon").src = `media/${moonPhaseIcon}.svg`;
  document.querySelector("#moon-phase-name").innerHTML = moonPhaseName;
}

function changeTakeUmbrella(pop) {
  let umbrellaMsg;
  if (pop >= 0 && pop < 0.3) {
    umbrellaMsg = "No need for an umbrella";
  } else if (pop >= 0.3 && pop <= 0.6) {
    umbrellaMsg = "It's better to take an umbrella";
  } else if (pop > 0.6 && pop <= 1) {
    umbrellaMsg = "You should take an umbrella";
  }

  document.querySelector("#umbrella-msg").innerHTML = umbrellaMsg;
}

function getCentigradeData() {
  weatherTemp = [
    {
      current: weatherApiData.current.temp,
      feel: weatherApiData.current.feels_like,
      max: weatherApiData.daily[0].temp.max,
      min: weatherApiData.daily[0].temp.min,
    },
    {
      max: weatherApiData.daily[1].temp.max,
      min: weatherApiData.daily[1].temp.min,
    },
    {
      max: weatherApiData.daily[2].temp.max,
      min: weatherApiData.daily[2].temp.min,
    },
    {
      max: weatherApiData.daily[3].temp.max,
      min: weatherApiData.daily[3].temp.min,
    },
    {
      max: weatherApiData.daily[4].temp.max,
      min: weatherApiData.daily[4].temp.min,
    },
    {
      max: weatherApiData.daily[5].temp.max,
      min: weatherApiData.daily[5].temp.min,
    },
    {
      max: weatherApiData.daily[6].temp.max,
      min: weatherApiData.daily[6].temp.min,
    },
  ];
  changeTemperature();
}

function getFahrenheitData() {
  weatherTemp = [
    {
      current: weatherApiData.current.temp * 1.8 + 32,
      max: weatherApiData.daily[0].temp.max * 1.8 + 32,
      min: weatherApiData.daily[0].temp.min * 1.8 + 32,
      feel: weatherApiData.current.feels_like * 1.8 + 32,
    },
    {
      max: weatherApiData.daily[1].temp.max * 1.8 + 32,
      min: weatherApiData.daily[1].temp.min * 1.8 + 32,
    },
    {
      max: weatherApiData.daily[2].temp.max * 1.8 + 32,
      min: weatherApiData.daily[2].temp.min * 1.8 + 32,
    },
    {
      max: weatherApiData.daily[3].temp.max * 1.8 + 32,
      min: weatherApiData.daily[3].temp.min * 1.8 + 32,
    },
    {
      max: weatherApiData.daily[4].temp.max * 1.8 + 32,
      min: weatherApiData.daily[4].temp.min * 1.8 + 32,
    },
    {
      max: weatherApiData.daily[5].temp.max * 1.8 + 32,
      min: weatherApiData.daily[5].temp.min * 1.8 + 32,
    },
    {
      max: weatherApiData.daily[6].temp.max * 1.8 + 32,
      min: weatherApiData.daily[6].temp.min * 1.8 + 32,
    },
  ];
  changeTemperature();
}

function changeTemperature() {
  document.querySelector("#current-temp").innerHTML = Math.round(
    weatherTemp[0].current
  );
  document.querySelector("#current-max-temp").innerHTML = Math.round(
    weatherTemp[0].max
  );
  document.querySelector("#current-min-temp").innerHTML = Math.round(
    weatherTemp[0].min
  );
  document.querySelector("#current-feels-like").innerHTML = Math.round(
    weatherTemp[0].feel
  );

  let dailyMaxTemp = document.querySelectorAll(".daily-max-temp");
  let dailyMinTemp = document.querySelectorAll(".daily-min-temp");
  for (let day = 0; day < 6; day++) {
    dailyMaxTemp[day].innerHTML = `${Math.round(weatherTemp[day + 1].max)}°`;
    dailyMinTemp[day].innerHTML = `${Math.round(weatherTemp[day + 1].min)}°`;
  }
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
  getFahrenheitData();
}

function convertToCentigrade(event) {
  event.preventDefault();
  fahrenheitDegree.classList.replace("disabled-degree-style", "degree-style");
  centigradeDegree.classList.replace("degree-style", "disabled-degree-style");
  getCentigradeData();
}

let apiKey = "7746bdeabca928cfedcad71e52fd9d66";
let centigradeDegree,
  fahrenheitDegree,
  currentTemp,
  currentMaxTemp,
  currentMinTemp,
  currentFeelsLike;

var weatherTemp, weatherApiData;

getCityApi("Tehran");
searchEngine();
changeScale();
