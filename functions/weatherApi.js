async function checkWeather(station) {
  const appId = process.env.WEATHER_API_KEY;
  const lati = station.latitude;
  const longi = station.longitude;
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lati}&lon=${longi}&appid=${appId}&lang=kr&units=metric`;
  const response = await fetch(apiUrl);
  return await response.json();
}

module.exports = {
  checkWeather,
};
