# Salah Status Updater for Slack
This is an ejected [create-react-app](CRA_README.md) project.

## How to try in local browser
```bash
npm run build # then upload the output in `build` dir to your extensions
```

## How it works
It get's your current location from local browser API and get's your timezone info 
from [timezone db API](https://timezonedb.com).

You connect to a Slack team/s oauth2 API using chrome browser identity.

Every six hours it updates your location and timezone info.

Using provided timezone info and location coordination it uses [prayer times](http://praytimes.org/wiki/Code_Manual)
library to set your five Salah times when installed/started and creates internal app alarms
that are triggered at Salah time to wake up the app to go and change your Slack status and
snoozing, Dnd settings creating another alarm right after setting the status to replace it
with your last status and settings before salah based on the prayers idle default or updated
times through extension preferences/options.

At minute one of every day "00:01" it run an alarm to create alarms for the days 5 prays to
not miss any.

## Features

* Connects to Slack using oauth2 and any personal data are stored in your local browser only.
* Updates your status at every Muslim Salah considering idle times you set yourself.
* Remembers your last status and settings before Salah to not cause you un welcomed
notifications after Salah if you were on snooze or dnd mode.