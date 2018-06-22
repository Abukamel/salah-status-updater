import { WebClient } from "@slack/client";

interface StatusObject {
  statusText: string;
  statusEmoji: string;
}

export function setDND(numberOfMinutes: number, accessToken: string) {
  const web = new WebClient(accessToken);
  web.dnd
    .setSnooze({ num_minutes: numberOfMinutes })
    .then(res => console.log(res))
    .catch(e => {
      throw new Error(e);
    });
}

export function endDND(accessToken: string) {
  const web = new WebClient(accessToken);
  web.dnd
    .endDnd()
    .then(res => console.log(res))
    .catch(e => {
      throw new Error(e);
    });
}

export function setUserStatus(profile: StatusObject, accessToken: string) {
  const web = new WebClient(accessToken);
  web.users.profile
    .set({
      profile: JSON.stringify({
        status_emoji: profile.statusEmoji,
        status_text: profile.statusText
      })
    })
    .then(res => console.log(res))
    .catch(e => {
      throw new Error(e);
    });
}
