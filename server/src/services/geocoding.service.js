const axios = require('axios');

const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://catalog.api.2gis.com/3.0/items/geocode', {
      params: {
        q: address,
        key: process.env.VITE_2GIS_API_KEY,
        fields: 'items.point'
      }
    });

    if (response.data.result.items && response.data.result.items.length > 0) {
      const point = response.data.result.items[0].point;
      return {
        address,
        coordinates: {
          latitude: point.lat,
          longitude: point.lon
        }
      };
    }
    throw new Error('Адрес не найден');
  } catch (error) {
    throw new Error('Ошибка геокодирования адреса');
  }
};

const reverseGeocode = async (lat, lon) => {
  try {
    const response = await axios.get('https://catalog.api.2gis.com/3.0/items/geocode', {
      params: {
        lat,
        lon,
        key: process.env.VITE_2GIS_API_KEY,
        fields: 'items.full_name'
      }
    });

    if (response.data.result.items && response.data.result.items.length > 0) {
      return response.data.result.items[0].full_name;
    }
    return 'Без адреса';
  } catch (error) {
    return 'Без адреса';
  }
};

module.exports = { geocodeAddress, reverseGeocode }; 