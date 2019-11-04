import $ from '../assets/jquery-3.4.1.min';

import Noty from 'noty';
import 'noty/lib/themes/mint.css';
import 'noty/lib/noty.css';
import '../css/spinkit.min.css';
import '../css/formbase.min.css';
import '../css/animate.css';
import '../css/base.less';

let localConfig = {
    source:'remote'
}

const alert = (msg, opt = {}) => {
    let defaultOption = {
        text: msg,
        type: 'error',
        layout: 'topRight',
        timeout: 3000
    } 
    new Noty({
        ...defaultOption,
        ...opt
    }).show();
}
// 文档检查
const checkDocument = file => {
    const accept = ['.png', '.jpg', '.bmp', '.jpeg'];
    const index = file.name.lastIndexOf('.');
    if (index < 0 || accept.indexOf(file.name.substr(index).toLowerCase()) < 0) { // 检查文件类型
        alert('暂不支持该文件格式');
        return false;
    }
    if (file.size > 3 * 1024 * 1024) { // 检查文件大小
        alert('图片大于3MB，上传失败');
        return false;
    }
    return true;
};
//上传解析
const uploadImage = file => {
    var oFReader = new FileReader();
    oFReader.readAsDataURL(file);
    oFReader.onloadend = function (oFRevent) {
        var src = oFRevent.target.result;
        $('.main-box__show-img').attr('src', src).show();
        $('.main-box__place-holder').hide();
        $('.main-box__loading').show();
        if(localConfig.source == 'remote'){
            if(bapp){
                bapp.saveConfig(localConfig);
            }
            var fd = new FormData();
            fd.append("file", file);
            $.ajax({
                url: "http://down.aka.today/upload_file.php",
                type: "POST",
                processData: false,
                contentType: false,
                data: fd,
                success: function(body) {
                    try{
                        let res = JSON.parse(body)
                        if (res.code != 0) {
                            fail(err, res)
                            return
                        }
                        success(res);
                    }catch(e){
                        $('.main-box__loading').hide();
                        alert(body);
                    }
                },
                error(){
                    $('.main-box__loading').hide();
                    alert('请求失败');
                }
            });
        }else{
            if (!localConfig.appid || !localConfig.apiKey) {
                alert('请填入appid和apiKey, 请到“https://www.xfyun.cn/services/textRecg”申请”印刷文字识别“的appid和apiKey', {timeout:8000,closeWith:[]});
                $('.main-box__loading').hide();
                return
            }
            if(bapp){
                bapp.localRequest(src, localConfig, success, fail)
            }
        }
    }
    function success(res){
        $('.main-box__loading').hide();
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
        $('.main-box__show-result').val(result).trigger('change');
    }
    function fail(err, res){
        $('.main-box__loading').hide();
        console.log(err)
        console.log(`sid：${res.sid}`)
        let msg = `发生错误，错误码：${res.code} 错误原因：${res.desc} sid：${res.sid}`
        msg += `请前往https://www.xfyun.cn/document/error-code?code=${res.code}查询解决办法`;

        $('.main-box__show-result').val(msg).trigger('change');
        alert(msg);

    }
}
//生成file对象并上传解析
const genFileAndupload = function({fileName, buffer, ext, base64}){
    let file;
    if(base64){
        file = dataURLtoFile(base64);
    }else{
        file = new File([buffer], fileName, {type:`image/${ext.toLowerCase()}`});
    }
    console.log(file)
    uploadImage(file);

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
//绑定事件
const bindEvent = function () {
    //粘贴图片事件
    $(document).on('paste', function (e) {
        let event = e.originalEvent;
        if (!(event.clipboardData && event.clipboardData.items)) {
            return;
        }

        for (var i = 0, len = event.clipboardData.items.length; i < len; i++) {
            var item = event.clipboardData.items[i];

            if (item.kind === "string") {
                item.getAsString(function (str) {
                    // str 是获取到的字符串
                })
            } else if (item.kind === "file") {
                var pasteFile = item.getAsFile();
                uploadImage(pasteFile); // 上传文件
                // console.log(pasteFile)
                // pasteFile就是获取到的文件
            }
        }
    })
    $('.main-box__left').on('dragover', function (e) {
        e.preventDefault();
    })
    $('.main-box__left').on('dragenter', function (e) {
        e.preventDefault();
    })
    $('.main-box__left').on('drop', function (e) {
        e.preventDefault();
        let files = e.originalEvent.dataTransfer.files;
        if (!files.length) {
            return
        }
        let file = files[0];
        if (files.length > 1) {
            alert('仅支持上传一个文件');
            return;
        }
        if (!checkDocument(file)) {
            // 上传失败直接退出
            e.target.value = '';
            return;
        }
        uploadImage(file); // 上传文件
    })
    //隐藏配置面板
    $(document).on('click',function(e){
        let $target = $(e.target);
        let $setting_config = $('.setting_config');
        if($target.is('.setting_config') || $target.parents('.setting_config').length || !$setting_config.is(':visible')){
            return
        }
        $setting_config.addClass('flipOutX')
    })
    $('.setting__icon').on('click',function(e){
        e.stopPropagation();
        let $setting_config = $('.setting_config');
        if($setting_config.is(':visible')){
            $setting_config.addClass('flipOutX')
        }else{
            $setting_config.show();
            $setting_config.addClass('flipInX');
        }
    })
    $('.setting_config').on('animationend',function(e){
        let $setting_config = $('.setting_config');
        if($setting_config.is('.flipOutX')){
            $setting_config.hide()
            $setting_config.removeClass('flipOutX');
        }else{
            $setting_config.removeClass('flipInX');
        }
    })
    //修改配置
    $('[name="source"]').on('change',function(e){
        let $target = $(e.target);
        let value = $target.val();
        localConfig.source = value;
        initConfig();
    })
    $('[name="appid"],[name="apiKey"]').on('input',function(e){
        let $target = $(e.target);
        let value = $target.val();
        let name = $target.attr('name');
        localConfig[name] = value;
    })
    $('.main-box__show-result').on('input change',function(e){
        let $target = $(e.target);
        let value = $target.val();
        if(value.trim()){
            $('.main-box__input-place-holder').hide();
        }else{
            $('.main-box__input-place-holder').show();
        }
    })
    //唤出文件选择框
    $('.main-box__left').on('click', function (e) {
        if(bapp){
            bapp.openFile(({fileName, buffer, ext,  error})=>{
                if(error){
                    alert(error);
                    return
                }
                genFileAndupload({fileName, buffer, ext})
            })
        }        
    })
}
//初始化配置
function initConfig(config){
    if(config){
        localConfig = config;
    }
    if(localConfig.source == 'remote'){
        $('[value="remote"]').attr('checked',true);
        $('.self-option').hide();
    }else if(localConfig.source == 'self'){
        $('[value="self"]').attr('checked',true);
        $('.self-option').show();
    }
    if(localConfig.appid){
        $('[name="appid"]').val(localConfig.appid);
    }
    if(localConfig.apiKey){
        $('[name="apiKey"]').val(localConfig.apiKey);
    }
}
window.app = {
    genFileAndupload,
    initConfig,
    alert
}
initConfig();
bindEvent();

