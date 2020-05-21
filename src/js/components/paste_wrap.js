import React, { PureComponent } from 'react';
import { message } from 'antd';

export class paste_wrap extends PureComponent {
    handlePaste = (event)=>{
        if (!(event.clipboardData && event.clipboardData.items)) {
            return;
        }
        console.log('paste warp')
        for (var i = 0, len = event.clipboardData.items.length; i < len; i++) {
            var item = event.clipboardData.items[i];

            if (item.kind === "string") {
                item.getAsString(function (str) {
                    // str 是获取到的字符串
                })
            } else if (item.kind === "file") {
                var pasteFile = item.getAsFile();
                // console.log(pasteFile);
                this.props.uploadImage && this.props.uploadImage(pasteFile); 
                return;
                // pasteFile就是获取到的文件
            }
        }
    }
    handleOnDrop = (e)=>{
        e.preventDefault();
        let files = e.dataTransfer.files;
        if (!files.length) {
            return
        }
        let file = files[0];
        if (files.length > 1) {
            message.error('仅支持上传一个文件');
            return;
        }
        this.props.uploadImage && this.props.uploadImage(file); 
        // if (!checkDocument(file)) {
        //     // 上传失败直接退出
        //     e.target.value = '';
        //     return;
        // }
        // uploadImage(file); // 上传文件
    }
    handleOnDragover = (e)=>{
        e.preventDefault();
    }
    handleOnDragenter = (e)=>{
        e.preventDefault();
    }
    render() {
        return (
            <div className='paste-wrap' onPaste={this.handlePaste}
            onDragEnter={this.handleOnDragenter} onDragOver={this.handleOnDragover} onDrop={this.handleOnDrop}>
                {this.props.children}
            </div>
        )
    }
}

export default paste_wrap

