import React, {Fragment}from "react";
import {getInstance} from "d2";
import {Switch, Route} from "react-router-dom";
import App from "./App";

const LoadData = () => {

    const [users, setUsers] = React.useState([]);
    const [userGroups, setUsergroups] = React.useState([]);
    const [D2, setD2] = React.useState();

    React.useEffect(() => {

        getInstance().then((d2) => {
            setD2(d2);
            const userPoint = "users.json?fields=id,name,userCredentials[username,userRoles],userGroups";
            const groupPoint = "userGroups.json?paging=false";

            d2.Api.getApi().get(userPoint)
                .then((response) => {
                    console.log(response.users);
                    setUsers(response.users);
                })
                .catch((error) => {
                    console.log(error);
                    alert("An error occurred: " + error);
                });

            d2.Api.getApi().get(groupPoint)
                .then((response) => {
                    console.log(response.userGroups);
                    setUsergroups(response.userGroups);
                })
                .catch((error) => {
                    console.log(error);
                    alert("An error occurred: " + error);
                });
        });

    }, []);


    return (
            <Fragment>
                <Switch>
                    <Route path="/"  render={(props) => (
                        <App {...props}
                                  d2={D2}
                                  users={users}/>
                    )} exact/>
                </Switch>
            </Fragment>
    );
}

export default LoadData;