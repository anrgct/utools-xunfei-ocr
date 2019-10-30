import $ from '../assets/jquery-3.4.1.min';

import Noty from 'noty';
import 'noty/lib/themes/mint.css';
import 'noty/lib/noty.css';
import '../css/spinkit.min.css';
import '../css/formbase.min.css';
import '../css/animate.css';
import '../css/base.less';

const alert = (msg) => {
    new Noty({
        text: msg,
        type: 'error',
        layout: 'topRight',
        timeout: 3000
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
                bapp.writeJSON(localConfig);
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
                }
            });
        }else{
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
                blockItem.line.forEach(blockLineItem => {
                    blockLineItem.word.forEach(blockLineWordItem => {
                        result += blockLineWordItem.content;
                        result += '\n'
                    })
                })
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
const bindEvent = function () {
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
                console.log(pasteFile)
                uploadImage(pasteFile); // 上传文件
                // pasteFile就是获取到的文件
            }
        }
    })
    $(document).on('click',function(e){
        let $target = $(e.target);
        let $setting_config = $('.setting_config');
        if($target.is('.setting_config') || $target.parents('.setting_config').length || !$setting_config.is(':visible')){
            return
        }
        $setting_config.addClass('flipOutX')
    })
    $('[name="source"]').on('change',function(e){
        let $target = $(e.target);
        let value = $target.val();
        localConfig.source = value;
        initConfig();
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
    $('[name="appid"],[name="apiKey"]').on('input',function(e){
        let $target = $(e.target);
        let value = $target.val();
        let name = $target.attr('name');
        localConfig[name] = value;
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
    
    $('.main-box__left').on('click', function (e) {
        $('#select-file').trigger('click');
        // new Noty({
        //     text: 'NOTY - a dependency-free notification library!',
        //     type:'info',
        //     layout: 'center',
        //     // animation: {
        //     //     open: 'animated bounceInRight', // Animate.css class names
        //     //     close: 'animated bounceOutRight' // Animate.css class names
        //     // }
        // }).show();

        // new Noty({
        //     text: 'Do you want to continue? <input id="example" type="text">',
        //     theme:'mint',
        //     layout: 'center',
        //     type:'alert',
        //     modal:true,
        //     buttons: [
        //       Noty.button('YES', 'btn btn-success', function () {
        //           console.log('button 1 clicked');
        //       }, {id: 'button1', 'data-status': 'ok'}),

        //       Noty.button('NO', 'btn btn-error', function () {
        //           console.log('button 2 clicked');
        //           n.close();
        //       })
        //     ]
        //   }).show()
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
            alert('仅支持上传一个word文件');
            return;
        }
        if (!checkDocument(file)) {
            // 上传失败直接退出
            e.target.value = '';
            return;
        }
        uploadImage(file); // 上传文件
    })

    $('.select-file').on('change', function () {
        let file = $('#select-file')[0].files[0];
        console.log(file)
        if (!checkDocument(file)) {
            return
        }
        uploadImage(file)
    })
}
function initConfig(){
    if(localConfig){
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
    }else{
        window.localConfig = {
            source:'remote'
          }
    }
}
initConfig();
bindEvent();