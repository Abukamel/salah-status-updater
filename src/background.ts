// tslint:disable:no-console
import * as config from "./config";
import { prayTimes } from "./PrayTimes";
import * as storage from "./storage";

export interface SlackCredentials {
  access_token: string | null;
  team_id: string | null;
  team_name: string | null;
}

setInterval(() => {
  storage.get("slack_teams")
    ? chrome.browserAction.setBadgeText({ text: "" })
    : chrome.browserAction.setBadgeText({ text: "ADD" });
}, 10 * 1000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.add_slack_team) {
    chrome.identity.launchWebAuthFlow(
      {
        interactive: true,
        url: `${config.slackAuthorizeURL}?client_id=${
          config.slackClientID
        }&scope=${config.slackScope}&redirect_uri=${config.herokuRedirectURI}`
      },
      (redirectURI: string) => {
        const parsedURL = new URL(redirectURI);
        const slackCredentials = {
          access_token: parsedURL.searchParams.get("access_token"),
          team_id: parsedURL.searchParams.get("team_id"),
          team_name: parsedURL.searchParams.get("team_name")
        };
        storage.put({ key: "slack_teams", value: slackCredentials }, true);
        console.log(storage.get("slack_teams"));
      }
    );
  }
});

const options = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 5000
};

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
        const tz = {
          dst: data.dstOffset,
          format: "24h",
          zone: String(data.rawOffset / 3600)
        };
        storage.put(
          {
            key: "pray_times",
            value: prayTimes.getTimes(
              new Date(),
              [crd.latitude, crd.longitude],
              tz.zone,
              tz.dst,
              tz.format
            )
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

setInterval(
  () => navigator.geolocation.getCurrentPosition(success, error, options),
  60 * 1000
);
