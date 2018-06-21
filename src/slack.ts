// @ts-ignore
import * as log from "loglevel";
import * as qs from "qs";
import * as config from "./config";

export function setDND(numberOfMinutes: number, accessToken: string) {
  fetch(`${config.slackAPIURL}/dnd.setSnooze`, {
    body: qs.stringify({
      num_minutes: numberOfMinutes,
      token: accessToken
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    method: "POST"
  })
    .then(response => log.info(response))
    .catch(e => log.error(e));
}

export function endDND(accessToken: string) {
  fetch(`${config.slackAPIURL}/dnd.endDnd`, {
    body: qs.stringify({
      token: accessToken
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    method: "POST"
  })
    .then(response => log.info(response))
    .catch(e => log.error(e));
}

interface StatusObject {
  statusText: string;
  statusEmoji: string;
}

export function setUserStatus(profile: StatusObject, accessToken: string) {
  fetch(`${config.slackAPIURL}/users.profile.set`, {
    body: qs.stringify({
      profile: {
        status_emoji: profile.statusEmoji,
        status_text: profile.statusText
      },
      token: accessToken
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    method: "POST"
  })
    .then(response => log.info(response))
    .catch(e => log.error(e));
}
