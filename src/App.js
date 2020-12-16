import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import JoinRoom from './components/Join/JoinRoom';
import Room from './components/Room/Room';

function App() {
  return (
    <div>
        <Router>
            <Switch>
                <Route path="/" exact component={JoinRoom} />
                <Route path="/room/:roomName" component={Room} />
                <Redirect to="/" />
                {/* <Route path="/browse" component={Browse} /> */}
            </Switch>
        </Router>
    </div>
  );
}

export default App;
