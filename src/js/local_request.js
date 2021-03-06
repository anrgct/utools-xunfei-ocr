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

// 组装业务参数
function getXParamStr(type) {
    let xParam;
    if(type == 'multilang'){
        xParam = {
            // location: false,
            engine_type: 'recognize_document'
        }
    }else{
        xParam = {
            language: 'cn|en',
            // "location": "true"
        }
    }
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(xParam)))
}
//组装发送本地请求
export default function localRequest({ api, type, imgBase64, localConfig, resolveCallback, rejectCallback, appId, appKey}) {
    if (!appId || !appKey) {
      return
    }
    
    // 获取当前时间戳
    let ts = parseInt(new Date().getTime() / 1000)
    
    // 组装请求头
    function getReqHeader() {
        let xParamStr = getXParamStr(type)
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
        hostUrl: api,
        host: "webapi.xfyun.cn",
        //在控制台-我的应用-印刷文字识别获取
        appid: appId,
        // 接口密钥(webapi类型应用开通印刷文字识别服务后，控制台--我的应用---印刷文字识别---服务的apikey)
        apiKey: appKey,
        uri: "/v1/ise",
        // 上传本地图片
        // file: path.resolve(__dirname, './ocr.jpeg')
    }

    function qs(parmas){
        return Object.keys(parmas).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(parmas[key]);
        }).join('&')
    }

    // 组装postBody
    function getPostBody() {
        let image = imgBase64.split(',');
        image.shift();
        image = image.join('');
        let params = { image };
        return qs(params)
    }

    let queryParams = {
        method: "POST",
        headers: getReqHeader(),
        body: getPostBody()
    }
    fetch(config.hostUrl, queryParams).then(res => res.json())
        .then(resolveCallback)
        .catch(rejectCallback)

    

}

