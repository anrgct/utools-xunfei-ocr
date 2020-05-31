import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Row, Spin, message, Input, Button } from 'antd';
import { ScissorOutlined, LoadingOutlined, ReloadOutlined, SettingOutlined, CopyOutlined, TranslationOutlined, HistoryOutlined } from '@ant-design/icons';
import Paste_wrap from './components/paste_wrap';
import Img_box from './components/img_box';
import SettingPage from './components/setting_page';
import HistoryPage from './components/history_page';
import { uploadImage, genFileAndupload } from './common';
import { defaultConfig } from './default_config';
import 'antd/dist/antd.css';
import '../less/main.less';
import TextArea from 'antd/es/input/TextArea.js';
// const { TextArea } = Input;

const antIcon = <LoadingOutlined style={{ fontSize: 40 }} spin />;

export class App extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            txt:'',
            src:'',
            loading:false,
            settingVisible:false,
            historyVisible:false,
            historys:[],
            hasError:false,
            file:null,
            config:null
        }
        this.genFileAndupload = genFileAndupload.bind(this);
        this.uploadImage = uploadImage.bind(this);
        this.initConfig = this.initConfig.bind(this);
        this.initHistory = this.initHistory.bind(this);

        window.app = {
            genFileAndupload: this.genFileAndupload,
            initConfig: this.initConfig,
            initHistory: this.initHistory
        }
    }

    initConfig(config){
        if(!config){
            config = defaultConfig;
        }
        this.setState({
            config
        })
    }

    initHistory(historys){
        if(historys && historys.length){
            this.setState({
                historys
            })
        }
    }

    setSrc = (src)=> {
        this.setState({ 
            src
        })
    }

    setLoading = (loading)=>{
        this.setState({ loading })
    }

    openSetting = () => {
        this.setState({ settingVisible : true })
    }

    updateConfig = (config) => {
        this.setState({ config })
    }

    closeSetting = () => {
        this.setState({ settingVisible : false })
    }

    openHistory = () => {
        this.setState({ historyVisible : true })
    }

    closeHistory = () => {
        this.setState({ historyVisible : false })
    }

    selectHistory = ({result, src})=> {
        this.setState({
            src: src,
            txt: result,
            historyVisible: false
        })
    }

    handleCopy = ()=>{
        let txt = this.state.txt;
        if(!txt){
            message.error('没有文本');
            return 
        }
        
        if(bapp && bapp.copyText(txt)){
            message.success('复制成功');
        }else{
            message.error('复制失败');
        }
    }

    handleRedirct = ()=>{
        let txt = this.state.txt;
        let translate = this.state.config.translate;
        if(!txt){
            message.error('没有文本');
            return 
        }
        bapp && bapp.redirect(translate, txt)
    }

    handleScreenCapture = () => {
        bapp && bapp.screenCapture((base64)=>{
            this.genFileAndupload({ base64 })
        })
    }

    reUpload = ()=>{
        this.state.file && this.uploadImage(this.state.file)
    }

    clearImg = ()=>{
        this.setState({
            src:'',
            txt: '',
            hasError:false
        })
    }

    pushHistory = ({src, result}) => {
        let {histroyLength} = this.state.config;
        let historys = [
            {
                src,
                result,
                time:(new Date()).toLocaleString()
            },
            ...this.state.historys,
        ];
        if(historys.length > histroyLength){
            historys = historys.slice(0, histroyLength);
        }
        this.setState({
            historys
        },()=>{
            bapp && bapp.writeHistory(this.state.historys)
        })
    }

    clearHistory = ()=>{
        this.setState({
            historys:[]
        },()=>{
            bapp && bapp.writeHistory(this.state.historys)
        })
    }

    handleTextChange = (e)=>{
        let value = e.currentTarget.value;
        this.setState({ txt: value })
    }

    showCurrentType = ()=>{
        if(this.state.config && this.state.config.type){
            let trans = {
                print:'印刷文字识别',
                handwrite:'手写文字识别',
                multilang:'印刷文字识别（多语种）',
            }
            return trans[this.state.config.type]
        }
    }
    
    render() {
        const { txt, src, loading, settingVisible, historyVisible, historys, hasError, config} = this.state;
        return (
            <div className="main-page">
                <Paste_wrap uploadImage={this.uploadImage}>
                    <Spin spinning={loading} indicator={antIcon}>
                            <div className='head-menu'>
                                <span className='type-title'>{this.showCurrentType()}</span>
                                { hasError && <Button type="dashed" icon={<ReloadOutlined />} onClick={this.reUpload}>重新识别</Button> }
                                <Button type="dashed" icon={<ScissorOutlined />} onClick={this.handleScreenCapture}>截图</Button>
                                { txt && <Button type="dashed" icon={<CopyOutlined />} onClick={this.handleCopy}>复制</Button> }
                                { txt && <Button type="dashed" icon={<TranslationOutlined />} onClick={this.handleRedirct}>翻译</Button> }
                                { (config && config.history && !!historys.length) && <Button type="dashed" icon={<HistoryOutlined />} onClick={this.openHistory}>历史</Button>}
                                <Button type="dashed" shape="circle" type="primary" icon={<SettingOutlined />} onClick={this.openSetting}></Button>
                            </div>
                            <div className='main-content'>
                                    <Img_box uploadImage={this.uploadImage} src={src} clearImg={this.clearImg}/>
                                    { (txt || src) && (<TextArea rows={4} className="edit-box" value={txt} 
                                        placeholder='没有内容' onChange={this.handleTextChange}/>)
                                    }
                            </div>
                            {src && <p className="warm-tip">拖拽图片到桌面保存</p>}
                    </Spin>
                </Paste_wrap>
                {config && <SettingPage visible={settingVisible} closeSetting={this.closeSetting} 
                updateConfig={this.updateConfig} config={config}/>}
                <HistoryPage visible={historyVisible} closeHistory={this.closeHistory} 
                historys={historys} clearHistory={this.clearHistory} selectHistory={this.selectHistory}/>
            </div>
        )
    }
}


ReactDOM.render(<App />, document.getElementById('root'));
