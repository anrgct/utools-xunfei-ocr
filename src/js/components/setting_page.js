import { Drawer, Form, Button, Col, Row, Input, Select, Switch, InputNumber, Divider } from 'antd';
import React, { Component } from 'react';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { omit, isEqual } from 'lodash';
const { Option } = Select;

export default class DrawerForm extends React.Component {

    constructor(props) {
        super(props)
    
        this.state = { 
            visible: false,
            translateOption: props.config.translateOption,
            newTransName: '',
            count: 0,
            keys: props.config.keys
        };
    }

    formRef = React.createRef();

    componentWillReceiveProps(nextProp){
        
        if(nextProp.visible && (this.props.visible != nextProp.visible)){// 首次展开获取不到form的getFieldsValue
            setTimeout(() => {
                this.triggerRender();
            }, 50);
        }
    }

    closeSetting = ()=>{
        let values = this.formRef.current.getFieldsValue();
        values = omit(values, ['appId', 'appKey']);
        values.keys = this.state.keys;
        values.translateOption = this.state.translateOption;
        values = {...this.props.config, ...values};
        // console.log(values)
        if(!isEqual(this.props.config, values)){
            // console.log('值变化，需保存')
            bapp && bapp.saveConfig(values);
            this.props.updateConfig(values);
        }
        this.props.closeSetting(values);
    }

    handleNewTransNameChange = event => {
        this.setState({
            newTransName: event.target.value,
        });
    };

    
    handleAddTranslateOption = () => {
        const { newTransName, translateOption } = this.state;
        if( !newTransName ) return
        if( translateOption.includes(newTransName)) return
        this.setState({
            translateOption: [...translateOption, newTransName],
            newTransName: '',
        });
    };

    handleClearTranslateOption = ()=>{
        this.formRef.current.setFieldsValue({
            translate:'沙拉查词'
        })
        this.setState({
            translateOption: this.props.config.defautTranslateOption,
            newTransName: '',
        });
    }

    handleTypeChange = ()=>{
        let type = this.getFieldValue('type');
        let key = this.state.keys;
        if(key){
            let { appId, appKey } = key;
            this.formRef.current.setFieldsValue({
                appId, appKey
            })
            this.triggerRender();
        }
    }

    getFieldValue = (...args)=>{
        return this.formRef.current && this.formRef.current.getFieldValue(...args)
    }

    getFieldsValue = (...args)=>{
        return this.formRef.current && this.formRef.current.getFieldsValue(...args)
    }

    getSourceTip = (currentValue)=>{
        if(currentValue.source == 'local'){
            return '请到(https://www.xfyun.cn)申请appid和apiKey，并设置ip白名单'
        }
    }

    getKeyShowTip = (currentValue)=>{
        let trans = {
            print:'印刷文字识别',
            handwrite:'手写文字识别',
            multilang:'印刷文字识别（多语种）',
        }
        return trans[currentValue.type]
    }

    getKeyShowValue = (currentValue, attr)=> {
        let obj = this.state.keys;
        if(obj){
            return obj[attr]
        }
    }

    setKeyShowValue = (currentValue, attr, value)=> {
        let type = [currentValue.type];
        if(type){
            this.setState({
                // [`keys.${type}.${attr}`]:value
                keys:{
                    ...this.state.keys,
                    [attr]:value
                }
            })
        }
    }


    triggerRender = ()=>{
        this.setState({
            count: this.state.count++
        })
    }
    

    render() {
        const { visible, config } = this.props;
        const { closeSetting, getFieldsValue, getKeyShowTip, getKeyShowValue, setKeyShowValue} = this;
        const { newTransName, translateOption } = this.state;
        const currentValue = getFieldsValue() || {};
        return (
            <div>
                {/* <Button type="primary" onClick={this.showDrawer}>
          <PlusOutlined /> New account
        </Button> */}
                <Drawer
                    title="设置"
                    width={600}
                    className="setting-page"
                    onClose={closeSetting}
                    visible={visible}>
                    <Form layout="vertical" hideRequiredMark ref={this.formRef}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="type"
                                    label="识别类型"
                                    initialValue={config.type}>
                                    <Select placeholder="请选择图片识别类型" onChange={this.handleTypeChange}>
                                        <Option value="print">印刷文字识别</Option>
                                        <Option value="handwrite">手写文字识别</Option>
                                        <Option value="multilang">印刷文字识别（多语种）</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Divider />
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="source"
                                    label="接口来源"
                                    extra={this.getSourceTip(currentValue)}
                                    initialValue={config.source}>
                                    <Select placeholder="选择接口来源" onChange={this.triggerRender}>
                                        <Option value="remote">测试服务</Option>
                                        <Option value="local">自定义</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            {
                                currentValue.source === 'local' ? (
                                    <>
                                        <Col span={12}>
                                            <Form.Item
                                                name="appId"
                                                label={`appId`}
                                                initialValue={getKeyShowValue(config, "appId")}>
                                                <Input
                                                    placeholder="请输入appId" onChange={e=>setKeyShowValue(currentValue,'appId',e.target.value)}/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="appKey"
                                                label={`appKey`}
                                                initialValue={getKeyShowValue(config, "appKey")}>
                                                <Input placeholder="请输入appKey" onChange={e=>setKeyShowValue(currentValue,'appKey',e.target.value)}/>
                                            </Form.Item>
                                        </Col>
                                    </>
                                ) : null
                            }
                        </Row>
                        <Divider />
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="translate"
                                    label="翻译选项"
                                    initialValue={config.translate}>
                                    <Select placeholder="选择接口来源"
                                        dropdownRender={menu => (
                                            <div>
                                            {menu}
                                            <Divider style={{ margin: '4px 0' }} />
                                            <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                                                <Input style={{ flex: 'auto' }} value={newTransName} onChange={this.handleNewTransNameChange} />
                                                <a
                                                style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                                                onClick={this.handleAddTranslateOption}
                                                >
                                                <PlusOutlined /> 添加
                                                </a>
                                                <a
                                                style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                                                onClick={this.handleClearTranslateOption}
                                                >
                                                <DeleteOutlined /> 清除
                                                </a>
                                            </div>
                                            </div>
                                        )}>
                                        {
                                            translateOption.map(it=>(
                                                <Option value={it} key={it}>{it}</Option>
                                            ))
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Divider />
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="history"
                                    initialValue={config.history}
                                    valuePropName="checked"
                                    label="启用本地历史记录">
                                    <Switch 
                                    checkedChildren="开" unCheckedChildren="关" onChange={this.triggerRender}/>
                                </Form.Item>
                            </Col>
                            { currentValue.history ? (
                                <Col span={12}>
                                    <Form.Item
                                        name='histroyLength'
                                        initialValue={config.histroyLength}
                                        label="历史记录数量">
                                        <InputNumber max={200} min={1} precision={0}/>
                                    </Form.Item>
                                </Col>) : null }
                        </Row>
                    </Form>
                </Drawer>
            </div>
        );
    }
}
