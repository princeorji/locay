const express = require('express');
const unirest = require('unirest');
require('dotenv').config();

const app = express();
const port = 3030;

app.get('/', (req, res) => {
  res.redirect('/api/hello');
});

app.get('/api/hello', (req, res) => {
  const visitorName = req.query.visitor_name || 'Guest';

  unirest('GET', 'https://get.geojs.io/v1/ip/geo.json')
    .end((geoResult) => {
      if (geoResult.error) {
        console.error('Geo API error:', geoResult.error);
        res.status(500).send('Error fetching geo data');
        return;
      }

      const { ip, region, latitude, longitude } = geoResult.body;

      unirest('GET', 'http://api.weatherapi.com/v1/current.json')
        .query({
          key: process.env.WEATHER_API_KEY,
          q: `${latitude},${longitude}`
        })
        .end((weatherResult) => {
          if (weatherResult.error) {
            console.error('Weather API error:', weatherResult.error);
            res.status(500).send('Error fetching weather data');
            return;
          }

          const temperature = weatherResult.body.current.temp_c;

          const response = {
            client_ip: ip,
            location: region,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${region}.`,
          };

          res.send(response);
        });
    });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
