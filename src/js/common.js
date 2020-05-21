import { message } from 'antd';
import localRequest from './localRequest';
// 文档检查
const checkDocument = file => {
    const accept = ['.png', '.jpg', '.bmp', '.jpeg'];
    const index = file.name.lastIndexOf('.');
    if (index < 0 || accept.indexOf(file.name.substr(index).toLowerCase()) < 0) { // 检查文件类型
        message.error('暂不支持该文件格式');
        return false;
    }
    if (file.size > 3 * 1024 * 1024) { // 检查文件大小
        message.error('图片大于3MB，上传失败');
        return false;
    }
    return true;
};
//生成file对象并上传解析
export const genFileAndupload = function({fileName, buffer, ext, base64}){
    let file;
    if(base64){
        file = dataURLtoFile(base64);
    }else{
        file = new File([buffer], fileName, {type:`image/${ext.toLowerCase()}`});
    }
    this.uploadImage(file);

    function dataURLtoFile(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        let filename = `${Math.random().toString('16').slice(2)}.${mime.split('/')[1]}`;
        return new File([u8arr], filename, {type:mime});
    }
}
//上传解析
export const uploadImage = function(file) {
    let config = this.state.config;
    if(!config){
        setTimeout(() => {
            this.uploadImage(file)
        }, 500);
        return
    }
    if(this.state.loading){ return }
    if(!checkDocument(file)) { return }
    this.state.file = file;
    var oFReader = new FileReader();
    var src;
    oFReader.readAsDataURL(file);
    oFReader.onloadend = (oFRevent) => {
        src = oFRevent.target.result;
        this.setSrc(src);
        this.setLoading(true);
        if(config.source == 'remote'){

            let formdata = new FormData();
            formdata.append("file", file);
            fetch("http://down.aka.today/upload_file.php",{
                method:"POST",
                headers:{
                    // Content-Type:'application/x-www-form-urlencoded'
                },
                body:formdata
            }).then(res => res.json())
            .then(resolveCallback)
            .catch(rejectCallback)

        }else if(config.source == 'local'){
            let key = config.keys[config.type] || {};
            let { appId, appKey } = key;
            if (!appId || !appKey) {
                message.error('请在设置中填入申请到的appId和apiKey');
                this.setLoading(false);
                return
            }
            localRequest({
                imgBase64: src,
                resolveCallback, 
                appId,
                appKey,
                rejectCallback
            })
        }
        
    }

    let rejectCallback = () => {
        message.error('请求失败');
        this.setState({
            txt: '请求失败',
            hasError: true,
        })
        this.setLoading(false);
    }
    let resolveCallback = (res) => {
        try{
            this.setLoading(false);
            if (res.code != 0) {
                failResovle(res)
            }else{
                successResolve(res);
            }
        }catch(err){
            message.error(err);
        }
    }
    let successResolve = (res) => {
        let data = res.data;
        let {
            block
        } = data;
        let result = '';
        block.forEach(blockItem => {
            if (blockItem.type == 'text') {
                let lines = blockItem.line.map(blockLineItem => {
                    let words = blockLineItem.word.map(blockLineWordItem => {
                        return blockLineWordItem.content;
                    })
                    return words.join(' ');
                })
                result += lines.join('\n');
            }
        });
        this.setState({
            txt: result,
            hasError: false,
        })
        this.state.config.history && this.pushHistory && this.pushHistory({
            src, 
            result
        })
    }
    let failResovle = (res) => {
        console.log(`sid：${res.sid}`)
        let msg = `发生错误，错误码：${res.code} \n错误原因：${res.desc} sid：${res.sid} \n请前往https://www.xfyun.cn/document/error-code?code=${res.code}查询解决办法`
        message.error(msg);
        this.setState({
            txt: msg,
            hasError: true,
        })
    }
}