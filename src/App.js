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

    const handleCancel = () => {
        setAlertModal(false);
    };

    getInstance().then(d2 =>{
        setD2(d2);
    });

    const handleFileUpload = (e) => {
        setUploadedFile(e.target.files[0]);
    };

    const  processFile = async () => {

        if(uploadedFile == null){
            setAlertModal(true);
            setMessageText("Select a file first!");
            setStatusText("exception");
        } else {

            const results = await readXlsxFile(uploadedFile,  { getSheets: true }).then((sheets) => {
                var sheetsArray = [];
                // `rows` is an array of rows
                // each row being an array of cells.
                console.log(sheets);
                sheets.map((sheet) => {
                    readXlsxFile(uploadedFile, { sheet: sheet.name }).then((rows) => {
                        //console.log(rows);
                        sheetsArray.push({
                            "sheetName" : sheet.name,
                            "rows" : rows
                        });
                    });
                });

                return sheetsArray;
            });

            console.log(results);
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
