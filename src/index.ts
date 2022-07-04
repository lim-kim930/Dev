import { Game2048, ConsoleRenderer } from "./2048"
import $ from "jquery"
// import loader from "./Amap"
import "./assets/css/index.css"

type ImgSrc = null | string
type OperationType = "txt" | "img" | "imgs"
type ImageNodeId = "#imgNode1" | "#imgNode2"

let nowTimeStamp: number = 0;
let lastSecondTime = {
    "Hour": -1,
    "Time": ""
};
let imgSrc1: ImgSrc = null;
let imgSrc2: ImgSrc = null;
const imgLabel = $("[id^='imgLabel']");
// 锁
let imgLoadingFlag: boolean = false;
let txtLoadingFlag: boolean = false;

// declare global {  //设置全局属性
//     interface Window {  //window对象属性
//         _AMapSecurityConfig: { securityJsCode: string };   //加入对象
//     }
// }

(() => {
    // 请求信息
    $.ajax({
        type: 'get',
        url: 'https://api.limkim.xyz/getSysTime'
    }).then((response) => {
        nowTimeStamp = response.Systime2 as number;
        $(".animate").hide();
        timeRender();
        setInterval(() => {
            timeRender();
        }, 1000);
    }).catch(err => {
        console.error(err);
    });
    $.ajax({
        type: 'get',
        url: 'https://api.limkim.xyz/ipconfig'
    }).then(response => {
        mapRender(response.data);
    }).catch(err => {
        console.error(err);
    });
    
    // 2048开始
    // if (!console) return;
    // const consoleRender = new ConsoleRenderer();
    // const gm2048 = new Game2048(consoleRender);

})();

// 时间渲染
function timeRender() {
    const time = new Date(<number>nowTimeStamp);
    let nowTime = {
        "Hour": time.getHours(),
        "Time": time.toTimeString()
    };
    // 时间每秒更新
    $('#time').text(nowTime.Time.split(" ")[0]);
    // 小时数改变才重新渲染greeting
    if (nowTime.Hour !== lastSecondTime.Hour) {
        switch (nowTime.Hour) {
            case 10: case 11:
                $('#greeting').text("上午好!");
                break;
            case 12:
                $('#greeting').text("中午好!");
                break;
            case 13: case 14: case 15: case 16: case 17: case 18:
                $('#greeting').text("下午好!");
                break;
            case 19: case 20: case 21: case 22: case 23:
                $('#greeting').text("晚上好!");
                break;
            default:
                $('#greeting').text("早上好!");
                break;
        }
        // 小时改变为0时日期改变
        if (lastSecondTime.Hour === -1 || nowTime.Hour === 0) {
            $("#date").text(time.toDateString() + " - ");
        }
    }
    lastSecondTime = nowTime;
    nowTimeStamp += 1000;
}
// 地图和IP渲染
function mapRender(response: any) {
    const AmapData = response.AmapData;
    const czData = response.czData;
    let city = "";
    // 首先判断是不是省份, 过滤掉直辖市和国外
    if (czData.city && czData.city.indexOf("省") !== -1)
        // 这里拿到省后面的信息也就是市, 若没有则置为空, 此后czData.city只可能为**市, 直辖市, 香港, 澳门, 国外, 空
        czData.city = czData.city.split("省")[1] || "";
    // else {
    //     // 直辖市不用管, 直接和AmapData比较就行
    //     const list = ["重庆市", "北京市", "天津市", "上海市", "香港", "澳门"];
    //     // 基本就可以确定为国外
    //     if (list.indexOf(czData.city) === -1) {
    //         city = AmapData.city + (czData.city ? ("/" + czData.city) : "");
    //     }
    // }
    // 和AmapData比较, 不一致就都显示
    // if (AmapData.city && AmapData.city !== czData.city)
    //     city = czData.city + "(" + AmapData.city + ")";
    // else
    //     city = czData.city;

    // AmapData有city数据
    if (AmapData.city) {
        // 非中国的情况, 要注意"加利福尼亚州"这种province字段
        if (AmapData.country !== "中国" && AmapData.country !== "台湾") {
            // czData可能和AmapData不一致
            if (czData.city && AmapData.city !== czData.city) {
                city = czData.city + "(" + AmapData.city + ")";
            }
            else
                city = AmapData.city;
        }
        // 在中国不需要考虑province
        else {
            if (czData.city && AmapData.city !== czData.city) {
                city = czData.city + "(" + AmapData.city + ")";
            }
            else
                city = AmapData.city;
        }
    }
    else {
        // AmapData没数据直接使用czData
        city = czData.city ? czData.city : "NO WHERE";
    }
    // 区目前只有AmapData会有
    const district = AmapData.district ? AmapData.district : "";

    let isp = "";
    // czData有isp数据
    if (czData.isp) {
        // 如果czData的isp数据为未知, 一般代理国外ip会出现这种情况, 就去判断AmapData有没有isp, 也没有就直接标识代理
        if (czData.isp === "本机或本网络")
            isp = AmapData.isp ? AmapData.isp : "未知属地/代理IP";
        // 如果czData的isp正常
        else {
            // 有很多情况会和AmapData显示并不一致, 为了提高信息的详细程度, 此时展示两个数据
            // 此外考虑有一种情况需要排除{ czData: 移动(全省通用), AmapData: 移动 }
            if (AmapData.isp && AmapData.isp !== czData.isp && czData.isp.indexOf(AmapData.isp) === -1)
                isp = czData.isp + "(" + AmapData.isp + ")";
            else
                isp = czData.isp;
        }
    }
    // czData没有isp数据
    else
        isp = AmapData.isp ? AmapData.isp : "未知属地/代理IP";

    $('#address').text(city + " " + district);
    $('#ip').text(response.IP + " - " + isp);
    if (AmapData.country !== "中国")
        return;
    // $("#container").attr("hidden", "false");
}
// 图片渲染，传入img标签id和图片地址，算出适应高度并渲染
function imgRender(id: ImageNodeId, src: string) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.src = src;
        img.onload = () => {
            if (img.width >= 300)
                $(id).css('width', 300).css('height', img.height * 300 / img.width).attr("src", src);
            else if (img.width < 300)
                $(id).css('width', img.width).css('height', img.height).attr("src", src);
            resolve(img.width);
        };
        img.onerror = (err) => {
            reject(err);
        };
    });
}
// 渲染加载动画和提示
function startLoading(type: OperationType, content: string, index?: number) {
    const loadingHtml = content + "<img src='./loading.svg' class='animate'></img>";
    if (type === "txt")
        $("#txtArea").html(loadingHtml);
    else if (type === "img"){
        $("#imgLabel" + index).html(loadingHtml);
    }
    else {
        imgLabel.html(loadingHtml);
    }
}
// 图片显示区和imgSrc重置
function resetImgArea() {
    imgSrc1 = null;
    imgSrc2 = null;
    $("#container1").html("<div id='pointer1'></div><img src='' id='imgNode1'>");
    $("#container2").html("<div id='pointer2'></div><img src='' id='imgNode2'>");
}
// 写入文本方法
function uplaodTxt(data: string) {
    startLoading("txt", "提交中...");
    $.ajax({
        type: 'post',
        url: 'https://api.limkim.xyz/test/write',
        data: { data }
    }).then((response) => {
        if (response.success === 20001)
            $("#txtArea").text("提交成功✔");
        txtLoadingFlag = false;
    }).catch(err => {
        txtLoadingFlag = false;
        console.error(err);
    });
}
// 人脸识别请求函数
function detectAjax(imgBase64: string, imgWidth: number, index: number) {
    startLoading("img", "正在检测人脸...", index);
    $.ajax({
        type: 'post',
        url: 'https://api.limkim.xyz/faceDetect',
        data: { imgBase64 }
    }).then((response) => {
        response = response.data;
        if (response.faces.length === 0) {
            $("#imgLabel" + index).text("未检测到人脸,换张照片试试吧😜");
            return imgLoadingFlag = false;
        }
        const width = Number($("#imgNode" + index).css('width').split('px')[0]);
        const parmas = response.faces[0];
        // 渲染人脸关键点
        let html = "";
        Object.keys(parmas.landmark).forEach(landmark => {
            html += "<span style='left: " + parmas.landmark[landmark].x * width / imgWidth + "px; top: " + parmas.landmark[landmark].y * width / imgWidth + "px'></span>";
        })
        const rec_data = parmas.face_rectangle;
        $("#pointer" + index).css("top", (rec_data.top - 2) * width / imgWidth).css("left", (rec_data.left - 2) * width / imgWidth).css("width", (rec_data.width) * width / imgWidth).css("height", (rec_data.height) * width / imgWidth).after(html).show();
        // 人脸描述
        const attributes = parmas.attributes;
        const glass = attributes.glass.value === "None" ? "未佩戴" : (attributes.glass.value === "Normal" ? "普通眼镜" : "墨镜");
        const gender = attributes.gender.value === "Male" ? "男" : "女";
        const emotions = attributes.emotion;
        let emotion = "";
        const translation: {[key: string]: string} = {
            "anger": "愤怒",
            "disgust": "厌恶",
            "fear": "恐惧",
            "happiness": "高兴",
            "neutral": "平静",
            "sadness": "伤心",
            "surprise": "惊讶"
        }
        Object.keys(emotions).forEach(key => {
            if (emotions[key] >= 40)
                emotion = translation[key];
        })
        $("#imgLabel" + index).html("<div class='info'>性别: " + gender + "<br>年龄: " + attributes.age.value + "<br>情绪: " + emotion + "<br>眼镜: " + glass + "<br>颜值打分(男性): " + parseInt(attributes.beauty.male_score) + " 分<br>颜值打分(女性): " + parseInt(attributes.beauty.female_score) + " 分</div>");
        imgLoadingFlag = false;
    }).catch((err) => {
        console.error(err);
        $("#imgLabel" + index).text("图片体积太大啦,换张照片试试吧😜");
        imgLoadingFlag = false;
    });
}
// 清空文本框
$("#clearInputArea").on("click", () => {
    $("#inputArea").val("");
});
// 上传输入区文本内容
$("#uploadTxt").on("click", () => {
    if (txtLoadingFlag)
        return false;
    txtLoadingFlag = true;
    const data = $("#inputArea").val() as string;
    if (data === "" || (data !== "" && $.trim(data) === "")) {
        if (confirm("输入内容为空,是否继续提交？")) {
            $("#text").val("");
            return uplaodTxt("");
        }
        return txtLoadingFlag = false;;
    }
    uplaodTxt(data);
});
// 读文本
$("#readTxt").on("click", () => {
    if (txtLoadingFlag)
        return false;
    txtLoadingFlag = true;
    startLoading("txt", "加载中...");
    $.ajax({
        type: 'get',
        url: 'https://api.limkim.xyz/test/read'
    }).then(response => {
        // XSS脚本注入点
        $("#txtArea").html(response.data === "" ? "暂无内容📭" : response.data);
        txtLoadingFlag = false;
    }).catch(err => {
        txtLoadingFlag = false;
        console.error(err);
    });
});
// 清空图片显示区
$("#clearImgArea").on("click", () => {
    imgLabel.text("暂无内容📭");
    resetImgArea();
});
// 读取图片src
$("#readImage").on("click", () => {
    if (imgLoadingFlag)
        return false;
    imgLoadingFlag = true;
    resetImgArea();
    startLoading("imgs", "加载中...");
    $.ajax({
        type: 'get',
        url: 'https://api.limkim.xyz/test/readImage'
    }).then(response => {
        const data = response.data;
        if (data.src1 !== "") {
            imgRender("#imgNode1", data.src1);
            imgSrc1 = data.src1;
            $("#imgLabel1").text("加载成功✔");
        }
        else {
            imgSrc1 = null;
            $("#imgLabel1").text("暂无图片1信息📭");
        }
        if (data.src2 !== "") {
            imgRender("#imgNode2", data.src2);
            imgSrc2 = data.src2;
            $("#imgLabel2").text("加载成功✔");
        }
        else {
            imgSrc2 = null;
            $("#imgLabel2").text("暂无图片2信息📭");
        }
        imgLoadingFlag = false;
    }).catch(err => {
        imgLoadingFlag = false;
        console.error(err);
    });
});
// 删除云端图片
$("#deleteImage").on("click", () => {
    if (imgLoadingFlag)
        return false;
    imgLoadingFlag = true;
    startLoading("img", "删除中...");
    $("[id^='imgNode']").attr("src", null);
    $.ajax({
        type: 'get',
        url: 'https://api.limkim.xyz/test/deleteImage'
    }).then(response => {
        if (response.success === 20001) {
            imgLabel.text("删除成功✔");
            resetImgArea();
        }
        imgLoadingFlag = false;
    }).catch((err) => {
        imgLoadingFlag = false;
        console.error(err);
    });
});
// 用div触发input
$("[id^='inputDiv']").on("click", (e) => {
    const index = (e.target.innerText === "上传图片1" ? 1 : 2);
    $("#fileInput" + index).trigger("click");
})
// 用户上传图片文件后，获取base64编码并上传
$("[id^='fileInput']").on("change", (e) => {
    if (imgLoadingFlag)
        return false;
    imgLoadingFlag = true;
    const index = (e.target.id === "fileInput1" ? 1 : 2);
    $("#container" + index).html("<div id='pointer" + index + "'></div><img src='' id='imgNode" + index + "'>");
    $("#imgNode" + index).attr("src", null);
    startLoading("img", "读取中...", index);
    const fileElement = document.getElementById('fileInput' + index) as HTMLInputElement;
    const files = fileElement.files as FileList
    const file = files[0]
    fileElement.value = ""
    let base64Url = "";
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = (err) => {
        console.error(err);
        imgLoadingFlag = false;
    };
    reader.onload = () => {
        base64Url = reader.result as string;
        startLoading("img", "提交中...", index);
        $.ajax({
            type: 'post',
            url: 'https://api.limkim.xyz/test/uploadImage',
            data: {
                index,
                src: base64Url
            }
        }).then(async () => {
            let imgWidth = 1;
            if (index === 1) {
                imgSrc1 = base64Url;
                imgWidth = await imgRender("#imgNode1", base64Url) as number;
            }
            else {
                imgSrc2 = base64Url;
                imgWidth = await imgRender("#imgNode2", base64Url) as number;
            }
            detectAjax(base64Url, imgWidth, index);
        }).catch((err: JQueryXHR) => {
            if (err.status === 413)
                $("#imgLabel" + index).text("图片体积太大啦,换张照片试试吧😜");
            imgLoadingFlag = false;
        });
    };
});
// 手动检测人脸
$("[id^='recognizeImg']").on("click", (e) => {
    if (imgLoadingFlag)
        return false;
    const index = (e.target.id === "recognizeImg1" ? 1 : 2);
    if (index === 1 && imgSrc1 === null) {
        $("#imgLabel1").text("暂无图片1信息📭")
        return false;
    }
    else if (index === 2 && imgSrc2 === null) {
        $("#imgLabel2").text("暂无图片2信息📭")
        return false;
    }
    imgLoadingFlag = true;
    const image_base64 = (index === 1 ? imgSrc1 : imgSrc2);
    let img = new Image();
    img.src = image_base64 as string;
    img.onload = () => {
        detectAjax(image_base64 as string, img.width, index);
    }
});
// 对比照片人脸匹配度
$("#compareImg").on("click", () => {
    if (imgLoadingFlag)
        return false;
    if ($("#imgLabel1").text() === "暂无内容📭" || !imgSrc1)
        $("#imgLabel1").text("暂无图片1信息📭");
    if ($("#imgLabel2").text() === "暂无内容📭" || !imgSrc2)
        $("#imgLabel2").text("暂无图片2信息📭");
    if ($("#imgLabel1").text() === "暂无图片1信息📭" || $("#imgLabel2").text() === "暂无图片2信息📭")
        return;
    imgLoadingFlag = true;
    startLoading("imgs","上传比对中...");
    $.ajax({
        type: 'post',
        url: 'https://api-cn.faceplusplus.com/facepp/v3/compare',
        data: {
            api_key: "PRNA1wgDSB9iCn0oVW6RMDiRNpU42SzF",
            api_secret: "yNRiYEIr0ZS_TsTSqEUI29wq3orEiQKb",
            image_base64_1: imgSrc1,
            image_base64_2: imgSrc2
        }
    }).then(response => {
        if (response.confidence !== undefined)
            $("[id^='imgLabel']").text("相似比为: " + response.confidence + "%")
        else if (response.faces1.length === 0 && response.faces2.length !== 0) {
            $("#imgLabel1").text("未检测到人脸,换张照片试试吧😜");
            $("#imgLabel2").text("比对失败✘");
        }
        else if (response.faces2.length === 0 && response.faces1.length !== 0) {
            $("#imgLabel1").text("比对失败✘");
            $("#imgLabel2").text("未检测到人脸,换张照片试试吧😜");
        }
        else if (response.faces1.length === 0 && response.faces2.length === 0) {
            $("#imgLabel1").text("未检测到人脸,换张照片试试吧😜");
            $("#imgLabel2").text("未检测到人脸,换张照片试试吧😜");
        }
        imgLoadingFlag = false;
    }).catch(() => {
        imgLoadingFlag = false;
        $("[id^='imgLabel']").text("图片1或图片2体积太大啦,换张照片试试吧😜");
    });
});