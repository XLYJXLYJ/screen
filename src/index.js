import React from 'react'
import ReactDOM from 'react-dom'
import './request/axios'
import './index.scss'
import ErrorBoundary from './errorBoundary'
// import App from './views/app/index'
import App from './views/environment/index'

import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<ErrorBoundary><App /></ErrorBoundary>, document.getElementById('root'));
registerServiceWorker();
