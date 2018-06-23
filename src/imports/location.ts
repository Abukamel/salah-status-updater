import * as constants from "./constants";
import * as prayer from "./prayer"
import * as storage from "./storage";

interface LocationInfo {
  dayLightSaving: number;
  latitude: number;
  longitude: number;
  timezoneOffset: number;
}

const timeZoneOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 5000
};

export function setOrUpdateCurrent() {
    navigator.geolocation.getCurrentPosition(success, error, timeZoneOptions);
}

function success(pos: any) {
  const coordinates = pos.coords;
  let locationInfo: LocationInfo | undefined;
    fetch(
      `${constants.TIMEZONE_DB_API_URL}/get-time-zone?key=${
        constants.TIMEZONE_DB_API_KEY
      }&by=position&lat=${coordinates.latitude}&lng=${coordinates.longitude}&format=json`
    )
      .then(response => {
        response.json().then(data => {
          locationInfo = {
            dayLightSaving: Number(data.dst),
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
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
