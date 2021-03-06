import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Row, Spin, message, Input, Button } from 'antd';
import { ScissorOutlined, LoadingOutlined, ReloadOutlined, SettingOutlined, CopyOutlined,
     TranslationOutlined, HistoryOutlined, MergeCellsOutlined } from '@ant-design/icons';
import Paste_wrap from './components/paste_wrap';
import Img_box from './components/img_box';
import SettingPage from './components/setting_page';
import HistoryPage from './components/history_page';
import { uploadImage, genFileAndupload } from './common';
import { defaultConfig } from './default_config';
if(window.matchMedia('(prefers-color-scheme: dark)').matches){
    import('antd/dist/antd.dark.css').finally(e=>{
        mount()
    });
}else{
    import('antd/dist/antd.css').finally(e=>{
        mount()
    });
}
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
            config: null,
            pos:{
                left: 0,
                top: 0,
                show: false
            }
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

    handleSelet = (e) => {
        e.stopPropagation();
        let {offsetX, offsetY} = e.nativeEvent;
        let area = document.querySelector('.edit-box');
        if(!area) {return}
        let start = area.selectionStart;
        let end = area.selectionEnd;
        let offset = 20;

        let {width, height} = area.getBoundingClientRect();
        let halfX = width / 2;
        let halfY = height / 2;
        if(offsetX > width - offset){
            offsetX = halfX
        }
        if(offsetY > height - offset){
            offsetY = halfY
        }

        if(!offsetX || !offsetY){
            offsetX = halfX;
            offsetY = halfY;
        }

        if(document.activeElement == area && start !== end){
            this.setState({
                pos:{
                    left: offsetX + offset,
                    top: offsetY - offset,
                    show: true
                }
            })
        }else{
            this.setState({
                pos:{
                    show: false
                }
            })
        }
        
    }

    handleAction = (action) => {
        let {txt} = this.state;
        let area = document.querySelector('.edit-box');
        let start = area.selectionStart;
        let end = area.selectionEnd;
        let selectTxt = txt.slice(start, end);
        switch(action){
            case 'copy':
                if(!selectTxt) return
                if(window.bapp && window.bapp.copyText(selectTxt)){
                    message.success('复制成功');
                }else{
                    message.error('复制失败');
                }
                break;
            case 'cut':
                if(!selectTxt) return
                if(window.bapp && window.bapp.copyText(selectTxt)){
                    message.success('复制成功');
                    let newTxt = `${txt.slice(0, start)}${txt.slice(end)}`
                    this.setState({
                        txt: newTxt
                    })
                }else{
                    message.error('复制失败');
                }
                break;
            case 'merge':
                if(!selectTxt) return
                selectTxt = selectTxt.replace(/\n/g, '');
                let newTxt = `${txt.slice(0, start)}${selectTxt}${txt.slice(end)}`
                this.setState({
                    txt: newTxt
                })
                break;
        }
    }

    handleMergeAll = (params) => {
        let area = document.querySelector('.edit-box');
        area.select();
        this.handleAction('merge')
    }
    
    
    
    render() {
        const { txt, src, loading, settingVisible, historyVisible, historys, hasError, config, pos} = this.state;
        return (
            <div className="main-page">
                <Paste_wrap uploadImage={this.uploadImage}>
                    <Spin spinning={loading} indicator={antIcon} onClick={this.handleSelet}>
                            <div className='head-menu'>
                                <span className='type-title'>{this.showCurrentType()}</span>
                                { hasError && <Button type="dashed" icon={<ReloadOutlined />} onClick={this.reUpload}>重新识别</Button> }
                                <Button type="dashed" icon={<ScissorOutlined />} onClick={this.handleScreenCapture}>截图</Button>
                                { txt && <Button type="dashed" icon={<CopyOutlined />} onClick={this.handleCopy}>复制</Button> }
                                { txt && <Button type="dashed" icon={<MergeCellsOutlined />} onClick={this.handleMergeAll}>合并行</Button> }
                                { txt && <Button type="dashed" icon={<TranslationOutlined />} onClick={this.handleRedirct}>翻译</Button> }
                                { (config && config.history && !!historys.length) && <Button type="dashed" icon={<HistoryOutlined />} onClick={this.openHistory}>历史</Button>}
                                <Button type="dashed" shape="circle" type="primary" icon={<SettingOutlined />} onClick={this.openSetting}></Button>
                            </div>
                            <div className='main-content'>
                                    <Img_box uploadImage={this.uploadImage} src={src} clearImg={this.clearImg}/>
                                    { (txt || src) && (
                                    <div className="right-box">
                                        <TextArea rows={4} className="edit-box" value={txt} 
                                        placeholder='没有内容' onChange={this.handleTextChange} 
                                        onSelect={this.handleSelet} />
                                        {pos.show && <div className="sectionBtns" style={{left: pos.left, top: pos.top}}>
                                            <Button size='small' onClick={this.handleAction.bind(this, 'copy')}>复制</Button>
                                            <Button size='small' onClick={this.handleAction.bind(this, 'cut')}>剪切</Button>
                                            <Button size='small' onClick={this.handleAction.bind(this, 'merge')}>合并行</Button>
                                        </div>}
                                    </div>)}
                                    
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

function mount(){
    ReactDOM.render(<App />, document.getElementById('root'));
}
