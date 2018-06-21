import CircularProgress from '@material-ui/core/CircularProgress';
import purple from '@material-ui/core/colors/purple';
import {Theme, withStyles} from '@material-ui/core/styles';
import * as React from 'react';

interface CirleProgressProps {
  classes: {
    button: string;
    paper: string;
    progress: string;
    root: string;
  };
}

const styles = (theme: Theme) => ({
  progress: {
    margin: theme.spacing.unit * 2,
  },
});

function CircularIndeterminate(props: CirleProgressProps) {
  const { classes } = props;
  return (
    <div>
      <CircularProgress className={classes.progress} style={{ color: purple[500] }} thickness={7} />
    </div>
  );
}

export default withStyles(styles)(CircularIndeterminate);
