import Paper from "@material-ui/core/Paper";
import { Theme, withStyles } from "@material-ui/core/styles";
import * as React from "react";

import Typography from "@material-ui/core/Typography";
import Copyrights from "./Copyrights";
import IdleTimeConfDialog from "./IdleTimeConfDialog";

const styles = (theme: Theme) => ({
  root: theme.mixins.gutters({
    height: "100%",
    marginTop: theme.spacing.unit * 2,
    // maxHeight: 1000,
    // maxWidth: 700,
    paddingBottom: 16,
    paddingTop: 16,
    // width: theme.spacing.unit * 40
  })
});

class Options extends React.Component<any, any> {
  public render() {
    const { classes } = this.props;
    return (
      <div>
        <Paper className={classes.root} elevation={0}>
          <Typography variant={"subheading"} color={"primary"}>
            Update idle Salah times between changing status and removing it
          </Typography>
          <IdleTimeConfDialog />
          <Copyrights />
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(Options);
