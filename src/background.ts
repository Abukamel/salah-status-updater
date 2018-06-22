import { omit } from "lodash";
import * as moment from "moment";
// import * as schedule from "node-schedule";
import * as config from "./imports/config";
import * as location from "./imports/location";
import * as slack from "./imports/slack";
import * as storage from "./imports/storage";

export interface SlackTeam {
  access_token: string | null;
  team_id: string | null;
  team_name: string | null;
}

chrome.runtime.onInstalled.addListener(() => {
  // Alert user to connect
  if (!storage.get("slackTeams")) {
    chrome.browserAction.setBadgeText({ text: "New!" });
  }

  // Set current geographic location
  location.setOrUpdateCurrent();

  // Set default prayers idle time
  storage.put({ key: "prayersIdleTime", value: config.prayersIdleTime }, false);

  // Update current location and Salah times every hour
  setInterval(() => {
    location.setOrUpdateCurrent();
  }, 3600 * 1000);
});

// chrome.runtime.onConnect.addListener(port => {
//   port.onDisconnect.addListener(currentPort => {
//     console.log(`Disconnected port: ${currentPort}`);
//   });
//
//   port.onMessage.addListener(msg => {
//     if (msg.add_slack_team) {
//       chrome.identity.launchWebAuthFlow(
//         {
//           interactive: true,
//           url: `${config.slackAuthorizeURL}?client_id=${
//             config.slackClientID
//           }&scope=${config.slackScope}&redirect_uri=${config.herokuRedirectURI}`
//         },
//         (redirectURI: string) => {
//           const parsedURL = new URL(redirectURI);
//           const slackCredentials = {
//             access_token: parsedURL.searchParams.get("access_token"),
//             team_id: parsedURL.searchParams.get("team_id"),
//             team_name: parsedURL.searchParams.get("team_name")
//           };
//           storage.put({ key: "slackTeams", value: slackCredentials }, true);
//           chrome.browserAction.setBadgeText({ text: "" });
//           port.postMessage({ added: true });
//         }
//       );
//     } else if (msg.create_alarms) {
//       // Add alarms for prayers
//       const prayerTimes = omit(storage.get("prayerTimes"), [
//         "imsak",
//         "sunrise",
//         "sunset",
//         "midnight"
//       ]);
//
//       for (const currentPrayer of Object.keys(prayerTimes)) {
//         chrome.alarms.create(currentPrayer, {
//           when: Number(moment(prayerTimes[currentPrayer]))
//         });
//       }
//
//       chrome.alarms.onAlarm.addListener(alarm => {
//         for (const team of storage.get("slackTeams")) {
//           slack.setUserStatus(
//             {
//               statusEmoji: ":mosque:",
//               statusText: `Praying ${
//                 alarm.name
//               } now, will be back after in shaa Allah`
//             },
//             team.access_token
//           );
//         }
//       });
//
//       chrome.alarms.getAll(alarms => {
//         for (const alarm of alarms) {
//           console.log(alarm.name);
//         }
//       });
//       port.disconnect();
//     }
//   });
// });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.add_slack_team) {
    chrome.tabs.create({ url: "oauth2.html" }, tab =>
      storage.put({ key: "lastOauth2TabId", value: tab.id }, false)
    );
    sendResponse({ added: true });
    // // Save oauth2 access_token from slack into storage
    // chrome.identity.launchWebAuthFlow(
    //   {
    //     interactive: true,
    //     url: `${config.slackAuthorizeURL}?client_id=${
    //       config.slackClientID
    //     }&scope=${config.slackScope}&redirect_uri=${config.herokuRedirectURI}`
    //   },
    //   (redirectURI: string) => {
    //     const parsedURL = new URL(redirectURI);
    //     const slackCredentials = {
    //       access_token: parsedURL.searchParams.get("access_token"),
    //       team_id: parsedURL.searchParams.get("team_id"),
    //       team_name: parsedURL.searchParams.get("team_name")
    //     };
    //     storage.put({ key: "slackTeams", value: slackCredentials }, true);
    //     chrome.browserAction.setBadgeText({ text: "" });
    //     sendResponse({ added: true });
    //   }
    // );
  } else if (request.create_alarms) {
    chrome.tabs.remove([Number(storage.get("lastOauth2TabId"))]);
    // Add alarms for prayers
    const prayerTimes = omit(storage.get("prayerTimes"), [
      "imsak",
      "sunrise",
      "sunset",
      "midnight"
    ]);

    for (const currentPrayer of Object.keys(prayerTimes)) {
      chrome.alarms.create(currentPrayer, {
        when: Number(moment(prayerTimes[currentPrayer], "HH:mm"))
      });
    }

    chrome.alarms.onAlarm.addListener(alarm => {
      for (const team of storage.get("slackTeams")) {
        slack.setUserStatus(
          {
            statusEmoji: ":mosque:",
            statusText: `Praying ${
              alarm.name
            } now, will be back after in shaa Allah`
          },
          team.access_token
        );
      }
    });

    chrome.alarms.getAll(alarms => {
      for (const alarm of alarms) {
        console.log(alarm.name);
      }
    });
  } else if (request.oauth2_done) {
    sendResponse({ wannaCreateAlarms: true });
  }
  return true;
});
