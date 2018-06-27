import { RetryOptions, WebClient } from "@slack/client";
import * as Raven from "raven-js";
import { SENTRY_URL } from "./constants";

Raven.config(SENTRY_URL).install();
const webClientRetryOptions: RetryOptions = {
  maxTimeout: 9 * 1000,
  minTimeout: 3 * 1000,
  retries: 3
};

interface StatusObject {
  statusText: string;
  statusEmoji: string;
}

export function setSnooze(
  numberOfMinutes: number,
  accessToken: string,
  limit: number = 0
) {
  const slackWebClient = new WebClient(accessToken, {
    retryConfig: webClientRetryOptions
  }).on("rate_limited", retryAfter => {
    setTimeout(
      () =>
        limit < 5 ? setSnooze(numberOfMinutes, accessToken, limit++) : null,
      (retryAfter + 1) * 1000
    );
  });
  slackWebClient.dnd.setSnooze({ num_minutes: numberOfMinutes }).catch(e => {
    Raven.captureException(e);
    throw new Error(e.message);
  });
}

export function endDnd(accessToken: string, limit: number = 0) {
  const slackWebClient = new WebClient(accessToken, {
    retryConfig: webClientRetryOptions
  }).on("rate_limited", retryAfter => {
    setTimeout(
      () => (limit < 5 ? endDnd(accessToken, limit++) : null),
      (retryAfter + 1) * 1000
    );
  });
  slackWebClient.dnd.endDnd().catch(e => {
    Raven.captureException(e);
    throw new Error(e.message);
  });
}

export function setUserStatus(
  profile: StatusObject,
  accessToken: string,
  limit: number = 0
) {
  const slackWebClient = new WebClient(accessToken, {
    retryConfig: webClientRetryOptions
  }).on(
    "rate_limited",
    () => (limit < 5 ? setUserStatus(profile, accessToken, limit++) : null)
  );
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
