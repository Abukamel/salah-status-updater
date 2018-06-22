import * as constants from "./constants";
import * as prayer from "./prayer"
import * as storage from "./storage";

interface LocationInfo {
  dayLightSaving: number;
  latitude: number;
  longitude: number;
  timezoneOffset: number;
}

const tzOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 5000
};

export function setOrUpdateCurrent() {
    navigator.geolocation.getCurrentPosition(success, error, tzOptions);
}

function success(pos: any) {
  const crd = pos.coords;
  let locationInfo: LocationInfo | undefined;
    fetch(
      `${constants.tzDBAPIURL}/get-time-zone?key=${
        constants.timeZoneDBAPIKey
      }&by=position&lat=${crd.latitude}&lng=${crd.longitude}&format=json`
    )
      .then(response => {
        response.json().then(data => {
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
          prayer.setOrUpdateTimes(storage.get("currentLocation"));
        });
      })
      .catch(e => {
        throw e;
      });
}

function error(e: any) {
  throw e;
}
