import React, {Fragment, useState} from "react";
import {getInstance} from "d2";
import {Switch, Route} from "react-router-dom";
import App from "./App";

const LoadData = (props) => {

    const [users, setUsers] = React.useState([]);
    const [userGroups, setGroups] = React.useState([]);
    const [roles, setRoles] = React.useState([]);
    const [D2, setD2] = React.useState();
    const [initAuth, setInitAuth] = useState(props.auth);

    React.useEffect(() => {
        setInitAuth(props.auth);

        getInstance().then((d2) => {
            setD2(d2);
            const userPoint = "users.json?fields=id,firstName,surname,name,organisationUnits,userCredentials[id,userInfo,username,userRoles],userGroups";
            const groupPoint = "userGroups.json?paging=false";
            const rolesPoint = "userRoles.json?paging=false"

            //get the users from their endpoint
            d2.Api.getApi().get(userPoint)
                .then((response) => {
                    console.log(response.users);
                    setUsers(response.users);
                })
                .catch((error) => {
                    console.log(error);
                    alert("An error occurred: " + error);
                });

            //get all the user groups defined in the system
            d2.Api.getApi().get(groupPoint)
                .then((response) => {
                    console.log(response.userGroups);
                    setGroups(response.userGroups);
                })
                .catch((error) => {
                    console.log(error);
                    alert("An error occurred: " + error);
                });

            //get all the user roles available in the system
            d2.Api.getApi().get(rolesPoint)
                .then((response) => {
                    console.log(response.userRoles);
                    setRoles(response.userRoles);
                })
                .catch((error) => {
                    console.log(error);
                    alert("An error occurred: " + error);
                });
        });

    }, [props]);


    return (
            <Fragment>
                <Switch>
                    <Route path="/"  render={(props) => (
                        <App {...props}
                             auth={initAuth}
                             d2={D2}
                             users={users}
                             userGroups={userGroups}
                             userRoles={roles}
                        />
                    )} exact/>
                </Switch>
            </Fragment>
    );
}

export default LoadData;