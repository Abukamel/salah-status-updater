// for debugging popup in inspect console run statement `location.reload(true)`
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Paper from "@material-ui/core/Paper";
import { Theme, withStyles } from "@material-ui/core/styles";
import Delete from "@material-ui/icons/Delete";
import SentimentVerySatisfied from "@material-ui/icons/SentimentVerySatisfied";
import * as React from "react";
import { SlackTeam } from "../background";
import * as storage from "../imports/storage";

import { Avatar, ListItemAvatar } from "@material-ui/core";

const styles = (theme: Theme) => ({
  button: {
    margin: theme.spacing.unit
  },
  root: theme.mixins.gutters({
    height: "100%",
    marginTop: theme.spacing.unit * 2,
    maxHeight: 1000,
    maxWidth: 700,
    paddingBottom: 16,
    paddingTop: 16,
    width: theme.spacing.unit * 40
  })
});

interface AppProps {
  classes: {
    button: string;
    paper: string;
    progress: string;
    root: string;
  };
}

interface AppState {
  slackTeams: SlackTeam[];
  connectInProgress: boolean;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = { slackTeams: [], connectInProgress: false };
    this.connectToSlackWorkspace = this.connectToSlackWorkspace.bind(this);
    this.openOptionsPage = this.openOptionsPage.bind(this);
    this.deleteSlackWorkspace = this.deleteSlackWorkspace.bind(this);
  }

  public deleteSlackWorkspace(e: any) {
    storage.deleteSlackTeam(e.currentTarget.id);
    this.setState({ slackTeams: storage.get("slackTeams") });
  }

  public openOptionsPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
  }

  public connectToSlackWorkspace() {
    chrome.runtime.sendMessage(
      {
        add_slack_team: true
      },
      response => {
        if (response) {
          chrome.runtime.sendMessage({ create_alarms: true });
        }
      }
    );
  }

  public componentDidMount() {
    const slackTeams = storage.get("slackTeams");
    if (slackTeams instanceof Array && slackTeams.length > 0) {
      this.setState({ slackTeams });
    }
  }

  public render() {
    const { classes } = this.props;
    return (
      <div>
        <Paper className={classes.root} elevation={0}>
          <List
            component="nav"
            subheader={
              <ListSubheader component="div">
                Connected Slack Workspaces ({this.state.slackTeams &&
                this.state.slackTeams.length > 0
                  ? this.state.slackTeams.length
                  : 0}):
              </ListSubheader>
            }
          >
            {this.state.slackTeams && this.state.slackTeams.length > 0
              ? this.state.slackTeams.map(team => {
                  return (
                    <ListItem key={team.team_id || undefined} button={true}>
                      <ListItemAvatar>
                        <Avatar>
                          <SentimentVerySatisfied />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        inset={true}
                        primary={team.team_name || null}
                      />
                      <Avatar>
                        <Delete
                          onClick={this.deleteSlackWorkspace}
                          id={team.team_id || undefined}
                        />
                      </Avatar>
                    </ListItem>
                  );
                })
              : null}
          </List>
          <Button
            onClick={this.connectToSlackWorkspace}
            className={classes.button}
            variant="contained"
            color="primary"
            id={"slack-connect"}
          >
            Connect Slack
          </Button>
          <Button
            onClick={this.openOptionsPage}
            className={classes.button}
            variant="contained"
            color="secondary"
            id={"options-page"}
          >
            Preferences
          </Button>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(App);
