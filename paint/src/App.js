import React, {Component} from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    ...theme.typography.button,
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing.unit,
  },
});


class App extends Component {
    render() {
        return (
            <React.Fragment>
                <CssBaseline/>
                <Button variant="contained" color="primary">
                    Hello World
                </Button>
            </React.Fragment>
        );
    }
}

export default App;
