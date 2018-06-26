import { RetryOptions, WebClient } from "@slack/client";
import * as Raven from "raven-js";
import { SENTRY_URL } from "./constants";

Raven.config(SENTRY_URL).install();
const webClientRetryOptions: RetryOptions = {
  minTimeout: 3 * 1000,
  maxTimeout: 9 * 1000,
  retries: 3
};

interface StatusObject {
  statusText: string;
  statusEmoji: string;
}

export function setSnooze(numberOfMinutes: number, accessToken: string) {
  const slackWebClient = new WebClient(accessToken, {
    retryConfig: webClientRetryOptions
  });
  slackWebClient.dnd.setSnooze({ num_minutes: numberOfMinutes }).catch(e => {
    Raven.captureException(e);
    throw new Error(e.message);
  });
}

export function endDnd(accessToken: string) {
  const slackWebClient = new WebClient(accessToken, {
    retryConfig: webClientRetryOptions
  });
  slackWebClient.dnd.endDnd().catch(e => {
    Raven.captureException(e);
    throw new Error(e.message);
  });
}

export function setUserStatus(profile: StatusObject, accessToken: string) {
  const slackWebClient = new WebClient(accessToken, {
    retryConfig: webClientRetryOptions
  });
  slackWebClient.users.profile
    .set({
      profile: JSON.stringify({
        status_emoji: profile.statusEmoji,
        status_text: profile.statusText
      })
    })
    .catch(e => {
      Raven.captureException(e);
      throw new Error(e.message);
    });
}
