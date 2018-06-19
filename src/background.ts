// tslint:disable:no-console
import * as config from "./config";
import * as location from "./location";
import * as prayer from "./prayer";
import * as storage from "./storage";

export interface SlackTeam {
  access_token: string | null;
  team_id: string | null;
  team_name: string | null;
}

setInterval(() => {
  storage.get("slackTeams")
    ? chrome.browserAction.setBadgeText({ text: "" })
    : chrome.browserAction.setBadgeText({ text: "!!!" });
}, 10 * 1000);

chrome.runtime.onInstalled.addListener(async () => {
  // Set current geographic location
  const currentLocationInfo = await location.setOrUpdateCurrent();

  // Set current prayer times
  prayer.setOrUpdateTimes({
    dayLightSaving: currentLocationInfo.dayLightSaving,
    latitude: currentLocationInfo.latitude,
    longitude: currentLocationInfo.longitude,
    timeFormat: config.TIME_FORMAT,
    timezoneOffset: currentLocationInfo.timezoneOffset
  });

  // Set default prayers idle time
  storage.put({key: "prayersIdleTime", value: config.prayersIdleTime}, false)
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.add_slack_team) {
    chrome.identity.launchWebAuthFlow(
      {
        interactive: true,
        url: `${config.slackAuthorizeURL}?client_id=${
          config.slackClientID
        }&scope=${config.slackScope}&redirect_uri=${config.herokuRedirectURI}`
      },
      async (redirectURI: string) => {
        const parsedURL = new URL(redirectURI);
        const slackCredentials = {
          access_token: parsedURL.searchParams.get("access_token"),
          team_id: parsedURL.searchParams.get("team_id"),
          team_name: parsedURL.searchParams.get("team_name")
        };
        await storage.put({ key: "slackTeams", value: slackCredentials }, true);
        sendResponse({ added: true });
      }
    );
  }
});

// setInterval(
//   () => navigator.geolocation.getCurrentPosition(success, error, options),
//   60 * 1000
// );
