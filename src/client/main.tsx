import { configure } from 'mobx';
import React from 'react';
import ReactDOM from 'react-dom';
import { installDash } from './components/dash/install';

const { Dashboard } = installDash();

configure({ enforceActions: 'observed' });
ReactDOM.render(<Dashboard/>, document.getElementById('root'));
