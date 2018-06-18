import * as storage from "./storage";

const options = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 5000
};

export function putOrUpdateCurrent() {
  navigator.geolocation.getCurrentPosition(success, error, options);
}

function success(pos: any) {
  const crd = pos.coords;
  const timestamp = Math.round(new Date().getTime() / 1000);
  fetch(
    `https://maps.googleapis.com/maps/api/timezone/json?timestamp=${timestamp}&location=${
      crd.latitude
    },${crd.longitude}`
  )
    .then(response => {
      response.json().then(data => {
        storage.put(
          {
            key: "currentLocation",
            value: {
              dayLightSaving: Boolean(data.dstOffset),
              latitude: crd.latitude,
              longitude: crd.longitude,
              timezoneOffset: String(data.rawOffset / 3600),
            }
          },
          false
        );
      });
    })
    .catch(e => console.error(e));
}

function error(err: any) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}
