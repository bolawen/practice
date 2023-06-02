import React from 'react';
import A from './a';
import B from './b';
import C from './c';
import {
    Route,
    Switch,
    Redirect,
    useHistory,
    useLocation,
} from 'react-router-dom';
import Test from './test';

function RouterPage() {
    const location = useLocation();
    console.log('location', location);

    const renderRouter = () => {
        return (
            <Switch>
                <Route path="/a" component={A} />
                <Route path="/b" component={B} />
                <Route path="/c" component={() => <C />} />
                <Redirect from="/*" to="/a" />
            </Switch>
        );
    };

    return (
        <div>
            <Test>{renderRouter()}</Test>
        </div>
    );
}

export default RouterPage;
