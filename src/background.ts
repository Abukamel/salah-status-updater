// @ts-ignore
import * as log from "loglevel";
import * as config from "./config";
import * as location from "./location";
import * as prayer from "./prayer";
import * as storage from "./storage";

export interface SlackTeam {
  access_token: string | null;
  team_id: string | null;
  team_name: string | null;
}

chrome.runtime.onInstalled.addListener(async () => {
  // Alert user to connect
  if (!storage.get("slackTeams")[0]) {
    chrome.browserAction.setBadgeText({ text: "New!" });
  }

  // Set current geographic location
  await location.setOrUpdateCurrent();

  // Set default prayers idle time
  await storage.put(
    { key: "prayersIdleTime", value: config.prayersIdleTime },
    false
  );
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.add_slack_team) {
    // Save oauth2 access_token from slack into storage
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
        chrome.browserAction.setBadgeText({ text: "" });

        // Save Salah times into storage
        prayer
          .setOrUpdateTimes(await storage.get("currentLocation"))
          .then(response => log.info(response))
          .catch(e => log.error(e));

        sendResponse({ added: true });
      }
    );
  }
});

// Update current location and Salah times every hour
setInterval(async () => {
  log.info(`Updated location info: ${await location.setOrUpdateCurrent()}`);
  prayer
    .setOrUpdateTimes(await storage.get("currentLocation"))
    .then(response => log.info(`Prayer times updated: ${response}`))
    .catch(e => log.error(e));
}, 3600 * 1000);
