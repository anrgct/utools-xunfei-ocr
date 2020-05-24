const fs = require('fs')
const path = require('path')
const filePath = path.resolve(__dirname, 'js/history.json');
let configDb;

//打开文件选择
function openFile() {
    let files = utools.showOpenDialog({
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'jpeg', 'bmp'] },
        ],
        properties: ['openFile']
    })
    if (files && files[0]) {// 如果有选中
        let filePath = files[0];
        let fileName = path.basename(filePath);
        let buffer = fs.readFileSync(filePath);
        let ext = path.extname(filePath).slice(1);
        window.app && window.app.genFileAndupload({ fileName, buffer, ext });
    }
}

function readHistory() {
    let str = fs.readFileSync(filePath);
    let json = JSON.parse(str);
    return json
}

function writeHistory(json) {
    let str = JSON.stringify(json);
    fs.writeFileSync(filePath, str);
}

function copyText(txt){
    return utools.copyText(txt)
}

function redirect(plug, txt){
    utools.redirect(plug, txt)
}

function screenCapture(callback){
    utools.hideMainWindow();
    utools.screenCapture(base64Str => {
        utools.showMainWindow();
        callback( base64Str );
    })
}

//初始化本地数据
utools.onPluginReady(() => {
    configDb = new utoolsStorage('configv2');
    window.app && window.app.initConfig(configDb.data.data);
    let history = readHistory();
    window.app && window.app.initHistory(history);
})

// 保存配置
function saveConfig(config) {
    configDb.save(config)
}

//自动获取图片
utools.onPluginEnter(({ code, type, payload }) => {
    // console.log('用户进入插件', code, type, payload)
    if (type == 'files') {
        let file = payload[0];
        if (file) {
            let { isFile, path: filePath } = file;
            if (!isFile) return
            let fileName = path.basename(filePath);
            let buffer = fs.readFileSync(filePath);
            let ext = path.extname(filePath).slice(1);
            window.app && window.app.genFileAndupload({ fileName, buffer, ext });
        }
    } else if (type == 'img') {
        window.app && window.app.genFileAndupload({ base64: payload });
    }
})
class utoolsStorage {
    constructor(id) {
        this.id = id;
        this.data = utools.db.get(id) || {data:undefined};
    }
    save(data) {
        let postData = {
            _id: this.id,
            data,
        }
        if (this.data && this.data._rev) {
            postData._rev = this.data._rev
        }
        let result = utools.db.put(postData);
        if (result.error) {
            console.error(result.message)
        } else {
            this.data = {
                _rev: result.rev,
                data: { ...data }
            }
        }
    }
}
window.bapp = {
    saveConfig,
    openFile,
    readHistory,
    writeHistory,
    copyText,
    redirect,
    screenCapture
}
