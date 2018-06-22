import * as config from "./imports/config";
import * as storage from "./imports/storage";

window.onload = () => {
  NProgress.start();
  // Save oauth2 access_token from slack into storage
  chrome.identity.launchWebAuthFlow(
    {
      interactive: true,
      url: `${config.slackAuthorizeURL}?client_id=${
        config.slackClientID
        }&scope=${config.slackScope}&redirect_uri=${config.herokuRedirectURI}`
    },
    (redirectURI: string) => {
      NProgress.done();
      const parsedURL = new URL(redirectURI);
      const slackCredentials = {
        access_token: parsedURL.searchParams.get("access_token"),
        team_id: parsedURL.searchParams.get("team_id"),
        team_name: parsedURL.searchParams.get("team_name")
      };
      storage.put({ key: "slackTeams", value: slackCredentials }, true);
      chrome.browserAction.setBadgeText({ text: "" });
      chrome.runtime.sendMessage({oauth2_done: true}, (msg)=>{
        if (msg) {
         chrome.runtime.sendMessage({create_alarms: true})
        }
      });
    }
  );
};