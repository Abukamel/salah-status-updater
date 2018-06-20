// for debugging popup in inspect console run statement `location.reload(true)`
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Paper from "@material-ui/core/Paper";
import { Theme, withStyles } from "@material-ui/core/styles";
import AssignmentTurnedIn from "@material-ui/icons/AssignmentTurnedIn";
// @ts-ignore
import * as log from "loglevel";
import * as React from "react";
import { SlackTeam } from "./background";
import { extensionID } from "./config";
import * as storage from "./storage";

import { Avatar, ListItemAvatar } from "@material-ui/core";
import { Launch } from "@material-ui/icons";
import CircleProgress from "./CircleProgress";
import IdleTimeConfDialog from "./IdleTimeConfDialog";

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
  }

  public connectToSlackWorkspace() {
    this.setState(
      prevState => {
        return { connectInProgress: !prevState.connectInProgress };
      },
      () => {
        chrome.runtime.sendMessage(
          extensionID,
          {
            add_slack_team: true
          },
          response => {
            if (chrome.runtime.lastError) {
              log.error(chrome.runtime.lastError.message);
            } else {
              this.setState(prevState => {
                return { connectInProgress: !prevState.connectInProgress };
              });
            }
          }
        );
      }
    );
  }

  public componentDidMount() {
    const slackTeams = storage.get("slackTeams");
    if (slackTeams instanceof Array && slackTeams.length > 0) {
      // const teamNames: SlackTeam[] = [];
      // for (const team of slackTeams) {
      //   teamNames.push({
      //     access_token: team.access_token,
      //     team_id: team.team_id,
      //     team_name: team.team_name
      //   });
      // }
      this.setState({ slackTeams });
    }
  }

  public render() {
    const { classes } = this.props;
    return (
      <div>
        <Paper className={classes.root} elevation={0}>
          <IdleTimeConfDialog />
          <List
            component="nav"
            subheader={
              <ListSubheader component="div">
                Connected Workspaces:
              </ListSubheader>
            }
          >
            {this.state.slackTeams && this.state.slackTeams.length > 0 ? (
              this.state.slackTeams.map(team => {
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
              <ListItem button={true} onClick={this.connectToSlackWorkspace}>
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
          <Button
            onClick={this.connectToSlackWorkspace}
            variant="contained"
            color="primary"
            id={"slack-connect"}
          >
            Add Workspace
          </Button>
          {this.state.connectInProgress ? <CircleProgress /> : null}
        </Paper>
        <span>
          Icon made by{" "}
          <a href="https://www.flaticon.com/authors/eucalyp" title="Eucalyp">
            Eucalyp
          </a>{" "}
          from{" "}
          <a href="https://www.flaticon.com/" title="Flaticon">
            www.flaticon.com
          </a>{" "}
          is licensed by{" "}
          <a
            href="http://creativecommons.org/licenses/by/3.0/"
            title="Creative Commons BY 3.0"
            target="_blank"
          >
            CC 3.0 BY
          </a>
        </span>
      </div>
    );
  }
}

export default withStyles(styles)(App);
