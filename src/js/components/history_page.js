import { Drawer, Form, Button, Col, Row, Input, Select, Switch, InputNumber, Divider, List, Avatar} from 'antd';
import React, { Component } from 'react';
import { FileAddOutlined, ClearOutlined } from '@ant-design/icons';

export default class DrawerForm extends React.Component {

    constructor(props) {
        super(props)
    
        this.state = { 
           
        };
    }

    

    closeHistory = ()=>{
        
        this.props.closeHistory();
    }

    render() {
        const { visible, historys, clearHistory, closeHistory, selectHistory} = this.props;
        return (
            <div>
                {/* <Button type="primary" onClick={this.showDrawer}>
          <PlusOutlined /> New account
        </Button> */}
                <Drawer
                    title={`本地历史（共${historys.length}条）`}
                    width={600}
                    className="history-page"
                    onClose={closeHistory}
                    visible={visible}
                    footer={
                        <div
                          style={{
                            textAlign: 'right',
                          }}
                        >
                          <Button onClick={clearHistory} icon={<ClearOutlined />} style={{ marginRight: 8 }}>
                            清空历史
                          </Button>
                        </div>
                      }
                    bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}>
                    <List
                        itemLayout="horizontal"
                        dataSource={historys}
                        renderItem={(item, index) => (
                        <List.Item
                            extra={
                                <img
                                width={272}
                                alt="logo"
                                src={item.src}
                                />
                            }
                            onClick={()=>selectHistory(item)}
                        >
                            <List.Item.Meta
                            title={`${index + 1}、${item.time}`}
                            description={item.result}
                            />
                        </List.Item>
                        )}
                    />
                </Drawer>
            </div>
        );
    }
}
