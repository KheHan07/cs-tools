// Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface IdleTimeoutDialogProps {
  open: boolean;
  onContinue: () => void;
  onLogout: () => void;
}

const IdleTimeoutDialog: React.FC<IdleTimeoutDialogProps> = ({
  open,
  onContinue,
  onLogout,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onContinue}
      aria-labelledby="idle-dialog-title"
      aria-describedby="idle-dialog-description"
    >
      <DialogTitle id="idle-dialog-title">Are you still there?</DialogTitle>
      <DialogContent>
        <DialogContentText id="idle-dialog-description">
          It looks like you've been inactive for a while. Would you like to
          continue?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onContinue} variant="contained">
          Continue
        </Button>
        <Button onClick={onLogout} variant="outlined" color="error">
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IdleTimeoutDialog;
