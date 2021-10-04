import './App.css';
import {Row, Col, Input, Divider, Modal, Progress} from "antd";
import {useEffect, useState} from "react";
import {getInstance} from "d2";
import HeaderBar from "@dhis2/d2-ui-header-bar"
import {Button, Pane, Text} from "evergreen-ui";
import readXlsxFile from 'read-excel-file'


function App(props) {

    const [D2, setD2] = useState();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [alertModal, setAlertModal] = useState(false);
    const [status, setStatus] = useState(0);
    const [statusText, setStatusText] = useState("normal");
    const [messageText, setMessageText] = useState("Checking excel sheet.....");
    const [sheetState, setSheetState] = useState([]);
    const [groups, setGroups] = useState(props.userGroups);
    const [roles, setRoles] = useState(props.userRoles);
    const [users, setUsers] = useState(props.users);
    const [auth, setAuth] = useState(props.auth);
    const [orgUnits, setOrgUnits] = useState(props.orgUnits);


    useEffect(() => {
        setAuth(props.auth);
        setGroups(props.userGroups);
        setUsers(props.users);
        setRoles(props.userRoles);
        setOrgUnits(props.orgUnits);
    }, [props]);

    const handleCancel = () => {
        setAlertModal(false);
    };

    getInstance().then(d2 =>{
        setD2(d2);
    });

    const handleFileUpload = async (e) => {
        setUploadedFile(e.target.files[0]);
        setSheetState([]);
        var array = await readXlsxFile(e.target.files[0],  { getSheets: true }).then((sheets) => {
            setStatus(15);
            return sheets;
        });

        var sheetsArray = [];
        array.map(async (sheet) => {
            var rowArray =  await readXlsxFile(e.target.files[0], { sheet: sheet.name }).then((rows) => {
                return rows;
            });

            var object = {
                "sheetName" : sheet.name,
                "rows" : rowArray
            }

            sheetsArray.push(object);
            setSheetState(sheetsArray);

        });
    };

    const  processFile = async () => {
        setStatus(0);
        setStatusText("normal");

        if(uploadedFile == null){
            setAlertModal(true);
            setMessageText("Select a file first!");
            setStatusText("exception");
        } else {
            setAlertModal(true);
            setTimeout(() => {
                setStatus(10);
            }, 2000);
            setMessageText("Reading excel file...");


            console.log(sheetState);
            sheetState.map((sheet, x) => {
                //if(sheet.sheetName === "Dedza"){

                    var perce = (x/sheetState.length)*100 ;
                    setTimeout(() => {
                        setMessageText("Updating users in : " + sheet.sheetName);
                        var otherNumber = Math.round( perce * 100 + Number.EPSILON ) / 100;
                        setStatus(otherNumber + 10);
                    }, 2000);

                    var firstIndex = sheet.rows[0].findIndex(x => x.toLowerCase() === "first name");
                    var lastIndex = sheet.rows[0].findIndex(x => x.toLowerCase() === "surname");
                    var userIndex = sheet.rows[0].findIndex(x => x.toLowerCase() === "username");
                    var passIndex = sheet.rows[0].findIndex(x => x.toLowerCase() === "password");
                    var groupIndex = sheet.rows[0].findIndex(x => x.toLowerCase() === "groups");
                    var roleIndex = sheet.rows[0].findIndex(x => x.toLowerCase() === "roles");
                    var oucaptureIndex = sheet.rows[0].findIndex(x => x.toLowerCase() === "oucapture");


                    sheet.rows.map(async (row, index) => {
                        var perce2 = (x/sheet.rows.length)*100;

                        setTimeout(() => {
                            var otherNumber = Math.round( perce2 * 100 + Number.EPSILON ) / 100;
                            setStatus(otherNumber + 10);
                        }, 3000);
                        if(index !== 0){
                            var newPassword = row[passIndex];
                            var userRoles = row[roleIndex].split("||");
                            var userGroups = row[groupIndex].split("||");
                            var orgUs = row[oucaptureIndex].split("||")

                            userRoles.map((role, index) => {
                                var dRole = roles[roles.findIndex(x => x.displayName === role.trim())]
                                if(dRole === undefined){
                                    userRoles[index] = {"id" : role.trim()};
                                } else {
                                    userRoles[index] = {"id" : dRole&&dRole.id};
                                }

                            });
                            userGroups.map((group, index) => {
                                var dGroup = groups[groups.findIndex(x => x.displayName === group.trim())];
                                if(dGroup === undefined){
                                    userGroups[index] = {"id" : group.trim()};
                                } else {
                                    userGroups[index] = {"id" : dGroup&&dGroup.id};
                                }

                            });

                            orgUs.map((org, index) => {
                                var dOrg = orgUnits[orgUnits.findIndex(x => x.name === org.trim())];
                                console.log(dOrg)
                                if(dOrg === undefined){
                                    orgUs[index] = {"id" : org.trim()};
                                } else {
                                    orgUs[index] = {"id" : dOrg&&dOrg.id};
                                }

                            })

                            //console.log(userRoles);
                            var user = users[users.findIndex(x => (x.userCredentials.username === row[userIndex])&&
                                (String(x.firstName).trim() === row[firstIndex]))]//&&
                            //(x.name === (row[firstIndex] + " " + row[lastIndex])))]
                            console.log(row[userIndex], row[firstIndex])
                            console.log(user);
                            console.log(users);
                            if(user !== undefined){
                                console.log(user);

                                var payload = {
                                    "id": user.id,
                                    "firstName": user.firstName,
                                    "surname": user.surname,
                                    "userCredentials": {
                                        "id": user.id,
                                        "userInfo": {
                                            "id": user.userCredentials.userInfo.id
                                        },
                                        "username": user.userCredentials.username,
                                        "password": newPassword,
                                        "userRoles": userRoles
                                    },
                                    "organisationUnits": orgUs,
                                    "userGroups": userGroups,
                                    "dataViewOrganisationUnits": orgUs
                                }

                                //console.log(payload);


                                fetch(`https://covmw.com/namistest/api/users/${user.id}`, {
                                    method: 'PUT',
                                    body: JSON.stringify(payload),
                                    headers: {
                                        'Authorization' : auth,
                                        'Content-type': 'application/json',
                                    },
                                    credentials: "include"

                                }).then(response => {
                                        console.log(response);

                                        if(response.status === 200 || response.status === 201){
                                            setTimeout(() => {
                                                setMessageText("User updated");
                                                setStatusText("success");
                                            }, 2000);

                                        } else {
                                            setMessageText("Unable to update user : error");
                                            setStatusText("exception");
                                        }
                                    });



                            } else {

                                var user1 = users[users.findIndex(x => (x.userCredentials.username === row[userIndex]))]
                                var username = row[userIndex];
                                if(user1 !== undefined){
                                    username = username + "1";
                                }

                                console.log(username);

                                const id = await getID();
                                const credID = await getID();

                                var secondPay = {
                                    "id": id,
                                    "firstName": row[firstIndex],
                                    "surname": row[lastIndex],
                                    "userCredentials": {
                                        "id": credID,
                                        "userInfo": {
                                            "id": id
                                        },
                                        "username": username,
                                        "password": newPassword,
                                        "userRoles": userRoles
                                    },
                                    "organisationUnits": orgUs,
                                    "userGroups": userGroups,
                                    "dataViewOrganisationUnits": orgUs
                                }

                                //console.log(secondPay);


                                fetch(`https://covmw.com/namistest/api/users`, {
                                    method: 'POST',
                                    body: JSON.stringify(secondPay),
                                    headers: {
                                        'Authorization' : auth,
                                        'Content-type': 'application/json',
                                    },
                                    credentials: "include"

                                }).then(response => {
                                    console.log(response);

                                    if(response.status === 200 || response.status === 201){
                                        setTimeout(() => {
                                            setMessageText("User Created");
                                            setStatusText("success");
                                        }, 2000);

                                    } else {
                                        setMessageText("Unable to create User : error");
                                        setStatusText("exception");
                                    }
                                });


                            }
                        }
                    });
                //}

            });
        }

    };

    const getID = async () => {
        return await fetch(`https://covmw.com/namistest/api/system/id`, {
            method: 'GET',
            headers: {
                'Authorization' : auth,
                'Content-type': 'application/json',
            },
            credentials: "include"

        }).then(response => response.json()).then((result) => {
            //console.log(result);
            return result.codes[0];
        });
    }

    return (
        <div className="App">
          <div>
              {D2 && <HeaderBar className="mb-5" d2={D2}/>}
              <Modal visible={alertModal} onOk={()=>{handleCancel()}} onCancel={()=>{handleCancel()}} footer={false}>
                  <div className="d-flex flex-column w-100 align-items-center py-4">
                      <Text size={800} classname="mb-3">
                          <b>{messageText}</b>
                      </Text>
                      <Progress type="circle" className="mt-3" percent={status} status={statusText}/>
                  </div>

              </Modal>
            <div className="mt-5 d-flex justify-content-center align-items-center">
                <Pane
                    elevation={1}
                    float="left"
                    margin={24}
                    className="w-75 p-4"
                    display="flex"
                    background="tint2"
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="column"
                >
                    <h5>
                        <strong>User Updates</strong>
                    </h5>

                    <Text size={500}>
                        <strong>Select the excel file with user updates</strong>
                    </Text>

                    {[].length !== 0 ? <div className="spinner-border mx-2 indigo-text spinner-border-sm" role="status">
                        <span className="sr-only">Loading...</span>
                    </div> : null}

                    <Divider className="mx-2" plain/>

                    <Row className="w-50 mt-3">
                        <Col span={24}>
                            <Input
                                type="file"
                                style={{ width: "100%" }}
                                accept=".xlsx, .xls, .csv"
                                placeholder="select excel file"
                                size="large"
                                className="mt-2 w-100"
                                onChange={handleFileUpload}/>
                        </Col>

                    </Row>
                    <Row className="w-25 mt-4">
                        <Col span={24}>
                            <Button appearance="primary" onClick={processFile}>
                                POST
                            </Button>
                        </Col>
                    </Row>
                </Pane>
            </div>
          </div>
        </div>
    );
}

export default App;
