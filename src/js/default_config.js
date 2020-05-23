export let defaultConfig = {
    source:'remote', // remote, local
    type:'print', //print handwrite multilang,
    keys:{},
    api:{
        print:'https://webapi.xfyun.cn/v1/service/v1/ocr/general',
        handwrite:'http://webapi.xfyun.cn/v1/service/v1/ocr/handwriting',
        multilang:'https://webapi.xfyun.cn/v1/service/v1/ocr/recognize_document'
    },
    history:true,
    histroyLength:10,
    translate:"沙拉查词",
    defautTranslateOption:["沙拉查词", "翻译"],
    translateOption:["沙拉查词", "翻译"],
}