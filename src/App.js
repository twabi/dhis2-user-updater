import './App.css';
import {Row, Col, Input, Divider, Modal, Progress} from "antd";
import {useState} from "react";
import {getInstance} from "d2";
import HeaderBar from "@dhis2/d2-ui-header-bar"
import {Button, Pane, Text} from "evergreen-ui";
import readXlsxFile from 'read-excel-file'


function App() {

    const [D2, setD2] = useState();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [alertModal, setAlertModal] = useState(false);
    const [status, setStatus] = useState(0);
    const [statusText, setStatusText] = useState("normal");
    const [messageText, setMessageText] = useState("Checking excel sheet.....");
    const [sheetState, setSheetState] = useState([]);

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
            sheetState.map((sheet) => {

                setTimeout(() => {
                    setMessageText("Posting user updates...");
                }, 2000);

                if(sheet.sheetName === "Dedza"){
                    //console.log(sheet.rows);
                    var userIndex, roleIndex;
                    var passIndex;
                    var groupIndex;
                    userIndex = sheet.rows[0].findIndex(x => x === "Username");
                    passIndex = sheet.rows[0].findIndex(x => x === "Password");
                    groupIndex = sheet.rows[0].findIndex(x => x === "Groups");
                    roleIndex = sheet.rows[0].findIndex(x => x === "Roles");

                    sheet.rows.map((row, index) => {
                        if(index !== 0){
                            console.log(userIndex, passIndex, groupIndex);
                            console.log(row[userIndex], row[passIndex], row[groupIndex]);
                        }


                    });
                }
            })


        }

    };

    const otherFunction = () => {
        console.log(sheetState);
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

                    <Text size={800}>
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
