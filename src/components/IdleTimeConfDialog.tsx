import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import * as React from "react";
import * as constants from "../imports/constants";
import * as storage from "../imports/storage";

interface IdleTimeConfDialogState {
  asr: number;
  dhuhr: number;
  fajr: number;
  isha: number;
  maghrib: number;
  open: boolean;
}

export default class FormDialog extends React.Component<
  any,
  IdleTimeConfDialogState
> {
  public constructor(props: any) {
    super(props);
    this.state = {
      asr: storage.get("PRAYERS_IDLE_TIME")
        ? storage.get("PRAYERS_IDLE_TIME").asr
        : constants.PRAYERS_IDLE_TIME.asr,
      dhuhr: storage.get("PRAYERS_IDLE_TIME")
        ? storage.get("PRAYERS_IDLE_TIME").dhuhr
        : constants.PRAYERS_IDLE_TIME.dhuhr,
      fajr: storage.get("PRAYERS_IDLE_TIME")
        ? storage.get("PRAYERS_IDLE_TIME").fajr
        : constants.PRAYERS_IDLE_TIME.fajr,
      isha: storage.get("PRAYERS_IDLE_TIME")
        ? storage.get("PRAYERS_IDLE_TIME").isha
        : constants.PRAYERS_IDLE_TIME.isha,
      maghrib: storage.get("PRAYERS_IDLE_TIME")
        ? storage.get("PRAYERS_IDLE_TIME").maghrib
        : constants.PRAYERS_IDLE_TIME.maghrib,
      open: false
    };
    this.handleChange = this.handleChange.bind(this);
  }

  public handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState(
      // @ts-ignore
      { [event.currentTarget.id]: event.currentTarget.value }
    );
  };

  public handleClickOpen = () => {
    this.setState({ open: true });
  };

  public handleClose = () => {
    // this.setState({ open: false });
    this.setState(prevState => {
      return {
        asr: prevState.asr,
        dhuhr: prevState.dhuhr,
        fajr: prevState.fajr,
        isha: prevState.isha,
        maghrib: prevState.maghrib,
        open: !prevState.open
      };
    });
    storage.put(
      {
        key: "PRAYERS_IDLE_TIME",
        value: {
          asr:
            Number(this.state.asr) > 60
              ? 60
              : Number(this.state.asr)
                ? Number(this.state.asr)
                : 30,
          dhuhr:
            Number(this.state.dhuhr) > 60
              ? 60
              : Number(this.state.dhuhr)
                ? Number(this.state.dhuhr)
                : 30,
          fajr:
            Number(this.state.fajr) > 60
              ? 60
              : Number(this.state.fajr)
                ? Number(this.state.fajr)
                : 40,
          isha:
            Number(this.state.isha) > 60
              ? 60
              : Number(this.state.isha)
                ? Number(this.state.isha)
                : 30,
          maghrib:
            Number(this.state.maghrib) > 60
              ? 60
              : Number(this.state.maghrib)
                ? Number(this.state.maghrib)
                : 30
        }
      },
      false
    );
  };

  public render() {
    return (
      <div>
        <Button
          onClick={this.handleClickOpen}
          color={"secondary"}
          variant={"outlined"}
        >
          Idle Salah times
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Time in minutes</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus={false}
              margin="dense"
              id="fajr"
              label="Fajr (default: 40m, max: 60m)"
              type="number"
              defaultValue={this.state.fajr}
              onChange={this.handleChange}
              fullWidth={true}
            />
            <TextField
              autoFocus={true}
              margin="dense"
              id="dhuhr"
              label="Dhuhr (default: 30m, max: 60m)"
              type="number"
              defaultValue={this.state.dhuhr}
              onChange={this.handleChange}
              fullWidth={true}
            />
            <TextField
              autoFocus={false}
              margin="dense"
              id="asr"
              label="Asr (default: 30m, max: 60m)"
              type="number"
              defaultValue={this.state.asr}
              onChange={this.handleChange}
              fullWidth={true}
            />
            <TextField
              autoFocus={false}
              margin="dense"
              id="maghrib"
              label="Maghrib (default: 30m, max: 60m)"
              type="number"
              defaultValue={this.state.maghrib}
              onChange={this.handleChange}
              fullWidth={true}
            />
            <TextField
              autoFocus={false}
              margin="dense"
              id="isha"
              label="Isha (default: 30m, max: 60m)"
              type="number"
              defaultValue={this.state.isha}
              onChange={this.handleChange}
              fullWidth={true}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color={"primary"}>
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
