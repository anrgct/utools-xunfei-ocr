/**
 *	
 *运行前：请先填写Appid、APIKey以及图片的路径
 *
  印刷文字识别WebAPI接口调用示例接口文档(必看)：https://doc.xfyun.cn/rest_api/%E5%8D%B0%E5%88%B7%E6%96%87%E5%AD%97%E8%AF%86%E5%88%AB.html
  上传图片base64编码后进行urlencode要求base64编码和urlencode后大小不超过4M最短边至少15px，最长边最大4096px支持jpg/png/bmp格式
  (Very Important)创建完webapi应用添加合成服务之后一定要设置ip白名单，找到控制台--我的应用--设置ip白名单，如何设置参考：http://bbs.xfyun.cn/forum.php?mod=viewthread&tid=41891
  错误码链接：https://www.xfyun.cn/document/error-code (code返回错误码时必看)
  @author iflytek
*/
const CryptoJS = require('crypto-js')
var request = require('request')
var fs = require('fs')
var path = require('path')
const version = '0.0.1';

// 组装业务参数
function getXParamStr() {
  let xParam = {
    language: 'cn|en',
    // "location": "true"
  }
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(xParam)))
}

function readJSON(){
  if(fs.existsSync(path.resolve(__dirname,'config.json'))){
    return JSON.parse(fs.readFileSync(path.resolve(__dirname,'config.json')))
  }
}
function writeJSON(localConfig){
  fs.writeFileSync(path.resolve(__dirname,'config.json'),JSON.stringify(localConfig))
}

function localRequest(imgBase64, localConfig, success, fail) {
  if(!localConfig.appid || !localConfig.apiKey){
    return
  }
  writeJSON(localConfig)
  // 获取当前时间戳
  let ts = parseInt(new Date().getTime() / 1000)

  // 组装请求头
  function getReqHeader() { 
    let xParamStr = getXParamStr()
    let xCheckSum = CryptoJS.MD5(config.apiKey + ts + xParamStr).toString()
    return {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'X-Appid': config.appid,
      'X-CurTime': ts + "",
      'X-Param': xParamStr,
      'X-CheckSum': xCheckSum
    }
  }

  // 系统配置
  const config = {
    // 印刷文字识别 webapi 接口地址
    hostUrl: "https://webapi.xfyun.cn/v1/service/v1/ocr/general",
    host: "webapi.xfyun.cn",
    //在控制台-我的应用-印刷文字识别获取
    appid: localConfig.appid,
    // 接口密钥(webapi类型应用开通印刷文字识别服务后，控制台--我的应用---印刷文字识别---服务的apikey)
    apiKey: localConfig.apiKey,
    uri: "/v1/ise",
    // 上传本地图片
    // file: path.resolve(__dirname, './ocr.jpeg')
  }
  // console.log(config)


  let options = {
    url: config.hostUrl,
    headers: getReqHeader(),
    form: getPostBody()
  }

  // 组装postBody
  function getPostBody() {
    let image = imgBase64.split(',');
    image.shift();
    image = image.join('');
    return {
      image: image
    }
  }
  // 返回结果json串
  request.post(options, (err, resp, body) => {
    let res = JSON.parse(body)
    if (res.code != 0) {
      fail(err, res)
      return
    }
    success(res)
  })
}

let localConfig = readJSON();
// console.log('localConfig',localConfig)
if(!localConfig){
  localConfig = {
    source:'remote'
  }
}
window.bapp = {
  writeJSON,
  localRequest
}
window.localConfig = localConfig;