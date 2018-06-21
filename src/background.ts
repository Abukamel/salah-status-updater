import { omit } from "lodash";
import * as moment from "moment";
import * as schedule from "node-schedule";
import * as config from "./includes/config";
import * as location from "./includes/location";
import * as prayer from "./includes/prayer";
import * as slack from "./includes/slack";
import * as storage from "./includes/storage";

export interface SlackTeam {
  access_token: string | null;
  team_id: string | null;
  team_name: string | null;
}

chrome.runtime.onInstalled.addListener(async () => {
  // Alert user to connect
  if (!storage.get("slackTeams")) {
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
        prayer.setOrUpdateTimes(await storage.get("currentLocation"));

        // Update current location and Salah times every hour
        setInterval(() => {
          prayer.setOrUpdateTimes(storage.get("currentLocation"));
        }, 3600 * 1000);

        const prayerTimes = omit(storage.get("prayerTimes"), [
          "imsak",
          "sunrise",
          "sunset",
          "midnight"
        ]);

        for (const currentPrayer of Object.keys(prayerTimes)) {
          schedule.scheduleJob(
            moment(prayerTimes[currentPrayer], "HH:mm").format(),
            () => {
              slack.setUserStatus(
                {
                  statusEmoji: ":mosque:",
                  statusText: `Praying ${currentPrayer} now, will be back after in shaa Allah`
                },
                storage.get("slackTeams")[0].access_token
              );
            }
          );
        }
        sendResponse({ added: true });
      }
    );
  }
});
