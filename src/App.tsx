// for debugging popop in inspect console `location.reload(true)`
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Paper from "@material-ui/core/Paper";
import { Theme, withStyles } from "@material-ui/core/styles";
import AssignmentTurnedIn from "@material-ui/icons/AssignmentTurnedIn";
import * as React from "react";
import { SlackCredentials } from "./background";
import * as storage from "./storage";

import { Avatar, ListItemAvatar } from "@material-ui/core";
import { Launch } from "@material-ui/icons";

const styles = (theme: Theme) => ({
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
    root: string;
    paper: string;
    button: string;
  };
}

interface AppState {
  slack_teams: SlackCredentials[];
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = { slack_teams: [] };
  }

  public componentDidMount() {
    const slackConnectButton = document.getElementById("slack-connect");
    const slackFirstConnectButtons = document.querySelectorAll(
      ".first-slack-connect"
    );
    if (slackConnectButton && slackFirstConnectButtons) {
      slackConnectButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({
          add_slack_team: true
        });
      });
      for (const elm of slackFirstConnectButtons) {
        elm.addEventListener("click", () => {
          chrome.runtime.sendMessage({
            add_slack_team: true
          });
        });
      }
    }

    const slackTeams = storage.get("slack_teams");
    if (slackTeams instanceof Array && slackTeams.length > 0) {
      const teamNames: SlackCredentials[] = [];
      for (const team of slackTeams) {
        teamNames.push({
          access_token: team.access_token,
          team_id: team.team_id,
          team_name: team.team_name
        });
      }
      this.setState({ slack_teams: slackTeams });
    }

    // chrome.storage.local.get(["slack_teams"], getResult => {
    //   if (getResult.slack_teams && getResult.slack_teams.length > 0) {
    //     const teamNames: SlackCredentials[] = [];
    //     for (const team of getResult.slack_teams) {
    //       teamNames.push({
    //         access_token: team.access_token,
    //         team_id: team.team_id,
    //         team_name: team.team_name
    //       });
    //     }
    //     this.setState({ slack_teams: teamNames });
    //   }
    // });
  }

  public render() {
    const { classes } = this.props;
    return (
      <div>
        <Paper className={classes.root} elevation={4}>
          <List
            component="nav"
            subheader={
              <ListSubheader component="div">
                Connected Workspaces:
              </ListSubheader>
            }
          >
            {this.state.slack_teams && this.state.slack_teams.length > 0 ? (
              this.state.slack_teams.map(team => {
                return (
                  <ListItem key={team.team_id || undefined} button={true}>
                    <ListItemAvatar>
                      <Avatar>
                        <AssignmentTurnedIn />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      inset={true}
                      primary={team.team_name || null}
                    />
                  </ListItem>
                );
              })
            ) : (
              <ListItem button={true}>
                <ListItemAvatar>
                  <Avatar className={"first-slack-connect"}>
                    <Launch />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  className={"first-slack-connect"}
                  inset={true}
                  primary={"Connect First Workspace"}
                />
              </ListItem>
            )}
          </List>
          <Button variant="contained" color="primary" id={"slack-connect"}>
            Add Workspace
          </Button>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(App);
