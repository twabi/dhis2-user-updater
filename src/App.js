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


    useEffect(() => {
        setGroups(props.userGroups);
        setUsers(props.users);
        setRoles(props.userRoles);
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

                setTimeout(() => {
                    setMessageText("Updating users in : " + sheet.sheetName);
                    var perce = (x/sheetState.length)*100 ;
                    var otherNumber = Math.round( perce * 100 + Number.EPSILON ) / 100;
                    setStatus( otherNumber + 2);
                }, 5000);

                if(sheet.sheetName === "Dedza"){



                    var userIndex, roleIndex;
                    var passIndex;
                    var groupIndex;
                    var firstIndex = sheet.rows[0].findIndex(x => x === "First name");
                    var lastIndex = sheet.rows[0].findIndex(x => x === "Surname");
                    userIndex = sheet.rows[0].findIndex(x => x === "Username");
                    passIndex = sheet.rows[0].findIndex(x => x === "Password");
                    groupIndex = sheet.rows[0].findIndex(x => x === "Groups");
                    roleIndex = sheet.rows[0].findIndex(x => x === "Roles");

                    sheet.rows.map((row, index) => {
                        if(index !== 0){
                            var newPassword = row[passIndex];
                            var userRoles = row[roleIndex].split("||");
                            var userGroups = row[groupIndex].split("||");

                            userRoles.map((role, index) => {
                                var dRole = roles[roles.findIndex(x => x.displayName === role.trim())]
                                userRoles[index] = dRole.id;
                            });
                            userGroups.map((group, index) => {
                                var dGroup = groups[groups.findIndex(x => x.displayName === group.trim())];
                                userGroups[index] = dGroup.id;
                            });

                            var user = users[users.findIndex(x => (x.userCredentials.username === row[userIndex]))]//&&
                                //(x.name === (row[firstIndex] + " " + row[lastIndex])))]

                            if(user !== undefined){
                                console.log(user);
                            }
                        }
                    });
                }
            });
        }

    };

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

                    <Text size={600}>
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
