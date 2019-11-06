const isEqual = require('lodash/isEqual');
const fs = require('fs')
const path = require('path')
const _import = require;
const {remote} =  _import("electron");

let localConfig = {};
let localConfigId = 'localConfig';

//打开文件选择
function openFile(callback) {
  remote.dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      {name: 'Images', extensions: ['jpg', 'png', 'jpeg','bmp']},
    ],
  }, function (files) {
    // console.log(files)
    try{
      if (files && files[0]) {// 如果有选中
        let filePath = files[0];
        let fileName = path.basename(filePath);
        let buffer = fs.readFileSync(filePath);
        let ext = path.extname(filePath).slice(1);
        callback({fileName, buffer, ext});
      }
    }catch(err){
      callback({error: err.message})
    }
  })

}

//初始化本地数据
utools.onPluginReady(() => {
  localConfig = utools.db.get(localConfigId) || {};
  // console.log('initConfig', localConfig)
  if(window.app && localConfig && localConfig.data){
    app.initConfig({...localConfig.data})
  }
})

// 保存配置
function saveConfig(config){
  if(isEqual(config, localConfig.data)) return
  let data = {
    _id:localConfigId,
    data:config,
  }
  if(localConfig._rev){
    data._rev = localConfig._rev
  }
  let result = utools.db.put(data);
  if(result.error){
    if(window.app){
      app.alert(result.message)
    }else{
      console.log(result.message)
    }
  }else{
    localConfig.data = {...config};
    localConfig._rev = result.rev;
  }
}

//自动获取图片
utools.onPluginEnter(({code, type, payload}) => {
  // console.log('用户进入插件', code, type, payload)
  if(type == 'files'){
    let file = payload[0];
    if(file){
      let {isFile, path:filePath} = file;
      if(!isFile) return
      let fileName = path.basename(filePath);
      let buffer = fs.readFileSync(filePath);
      let ext = path.extname(filePath).slice(1);
      if(window.app){
        window.app.genFileAndupload({fileName, buffer, ext});
      }
    }
  }else if(type == 'img'){
    if(window.app){
      window.app.genFileAndupload({base64:payload});
    }
  }
})

window.bapp = {
  saveConfig,
  openFile
}
