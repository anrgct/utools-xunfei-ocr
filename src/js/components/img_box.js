import React, { Component } from 'react'
import { FileImageOutlined, ClearOutlined } from '@ant-design/icons';
import { Button } from 'antd';

export class img_box extends Component {
    openFile = ()=>{
        bapp && bapp.openFile()
    }
    render() {
        let { src } = this.props;
        return (
            <div className={`img-box ${src?'has-src':null}`}>
                {
                    src ? (
                        <>
                            <Button shape="circle" type="primary" icon={<ClearOutlined />}  className='clear-btn' title='清除' onClick={this.props.clearImg} />
                            <img src={src}/>
                        </>
                    ) : (
                        <div className='img-box__intro' onClick={this.openFile}>
                           <p><FileImageOutlined style={{fontSize:30}}/></p>
                           <p>粘贴图片或拖拽至此处</p>
                        </div>
                    )
                }
            </div>
        )
    }
}

export default img_box
