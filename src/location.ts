// @ts-ignore
import * as log from "loglevel";
import * as config from "./config";
import * as storage from "./storage";
const options = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 5000
};

// interface LocationInfo {
//   dayLightSaving: number;
//   latitude: number;
//   longitude: number;
//   timezoneOffset: number;
// }

export async function setOrUpdateCurrent() {
  await navigator.geolocation.getCurrentPosition(success, error, options);
  const ret =  await storage.get("currentLocation");
  return ret;
}

function success(pos: any) {
  const crd = pos.coords;
  fetch(
    `http://api.timezonedb.com/v2/get-time-zone?key=${
      config.timeZoneDBAPIKey
    }&by=position&lat=${crd.latitude}&lng=${crd.longitude}&format=json`
  )
    .then(response => {
      response.json().then(async (data) => {
        await storage.put(
          {
            key: "currentLocation",
            value: {
              dayLightSaving: data.dst,
              latitude: crd.latitude,
              longitude: crd.longitude,
              timezoneOffset: data.abbreviation
            }
          },
          false
        );
      });
    })
    .catch(e => log.error(e));
}

function error(err: any) {
  log.warn(`ERROR(${err.code}): ${err.message}`);
}
