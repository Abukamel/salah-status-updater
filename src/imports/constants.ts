export const TIMEZONE_DB_API_KEY: string = "8CF211EJWHQ2";
export const SLACK_CLIENT_ID: string = "382835922887.381571407876";
export const SLACK_SCOPE: string = "dnd:write, users.profile:write, users.profile:read, dnd:read";
export const SLACK_AUTHORIZE_URL: string = "https://slack.com/oauth/authorize";
export const TIMEZONE_DB_API_URL: string = "http://api.timezonedb.com/v2";
export const HEROKU_REDIRECT_URL: string =
  "https://slack-oauth-middleware.herokuapp.com/oauth2";
export const TIME_FORMAT = "24h";
export const PRAYERS_IDLE_TIME = {
  asr: 30,
  dhuhr: 30,
  fajr: 40,
  isha: 30,
  maghrib: 30
};
export const PRAYER_NAMES: string[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
export const PRAYERS_STATUS_REMOVE_ALARM_NAMES: string[] = ["remove_fajr_status", "remove_dhuhr_status", "remove_asr_status", "remove_maghrib_status", "remove_isha_status"];
