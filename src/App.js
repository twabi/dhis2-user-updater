import './App.css';
import { Row, Col, Input, Divider} from "antd";
import {useState} from "react";
import {getInstance} from "d2";
import HeaderBar from "@dhis2/d2-ui-header-bar"
import {Button, Pane, Text} from "evergreen-ui";


function App() {

    const [D2, setD2] = useState();
    getInstance().then(d2 =>{
        setD2(d2);
    });

    const handleFileUpload = (e) => {
        console.log(e.target.files[0]);
    }

    return (
        <div className="App">
          <div>
              {D2 && <HeaderBar className="mb-5" d2={D2}/>}
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
                            <Button appearance="primary">
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
