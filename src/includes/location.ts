import * as config from "./config";
import * as storage from "./storage";

interface LocationInfo {
  dayLightSaving: number;
  latitude: number;
  longitude: number;
  timezoneOffset: number;
}

async function getCurrentPosition(tzOptions: any) {
  if (navigator.geolocation) {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, tzOptions)
    );
  } else {
    return new Promise(resolve => resolve({}));
  }
}

export function setOrUpdateCurrent(): LocationInfo | undefined {
  let ret: LocationInfo | undefined;
  const options = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  };

  getCurrentPosition(options)
    .then(async position => {
      ret = await success(position);
    })
    .catch(e => {
      throw e;
    });

  // await navigator.geolocation.getCurrentPosition(success, error, options);
  return ret;
}

function success(pos: any): LocationInfo | undefined {
  const crd = pos.coords;
  let locationInfo: LocationInfo | undefined;
  (async () => {
    await fetch(
      `${config.tzDBAPIURL}/get-time-zone?key=${
        config.timeZoneDBAPIKey
      }&by=position&lat=${crd.latitude}&lng=${crd.longitude}&format=json`
    )
      .then(async response => {
        await response.json().then(data => {
          locationInfo = {
            dayLightSaving: Number(data.dst),
            latitude: crd.latitude,
            longitude: crd.longitude,
            timezoneOffset: Number(data.abbreviation)
          };
          storage.put(
            {
              key: "currentLocation",
              value: locationInfo
            },
            false
          );
        });
      })
      .catch(e => {
        throw e;
      });
  })();
  return locationInfo;
}
