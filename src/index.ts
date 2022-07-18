/* eslint-disable no-case-declarations */
// import { Game2048, ConsoleRenderer } from "./2048";
import $ from "jquery";
import loadder from "./Amap/index.js";
import { BaseUrl, testBaseUrl } from "./config";
import "./assets/css/index.css";
import { createHmac } from "crypto";
import LimPlayer from "./LimPlayer";

type ImgSrc = null | string
type OperationType = "txt" | "img" | "imgs"
type ImageNodeId = "#imgNode1" | "#imgNode2"

interface amapData {
    city: string,
    province: string;
    isp: string;
    country: string;
    district: string;
    ip: string;
    location: string;
    status: string;
}

interface czData {
    city: string,
    province: string;
    isp: string
}

interface landmark {
    [key: string]: { x: number, y: number }
}

interface faceAttributes {
    age: { value: number };
    beauty: {
        female_score: number
        male_score: number
    };
    emotion: { [key: string]: number };
    glass: { value: any };
    gender: { value: any };

}

let nowTimeStamp = 0;
let lastSecondTime = {
    "Hour": -1,
    "Time": ""
};
let imgSrc1: ImgSrc = null;
let imgSrc2: ImgSrc = null;
const imgLabel = $("[id^='imgLabel']");
// 锁
let imgLoadingFlag = false;
let txtLoadingFlag = false;
let ipForbidden = false;
let ipForbiddenTimer: null | NodeJS.Timeout = null;
// 登录状态
let atuhorized: boolean = localStorage.getItem("static_user_token") !== null;
let token = localStorage.getItem("static_user_token");

let amapData: any = {};

const layer = layui.layer;
// declare global {  //设置全局属性
//     interface Window {  //window对象属性
//         _AMapSecurityConfig: { securityJsCode: string };   //加入对象
//     }
// }

(() => {
    // 请求信息
    $.ajax({
        type: 'get',
        url: BaseUrl + 'info/sysTime'
    }).then((response) => {
        nowTimeStamp = response.data as number;
        $(".animate").hide();
        timeRender();
        setInterval(() => {
            timeRender();
        }, 1000);
    }).catch((err: JQuery.jqXHR) => {
        layer.msg(err.status + " " + (err.responseJSON ? err.responseJSON.msg as string : err.responseText), { icon: 2 });
        console.error(err);
    });
    $.ajax({
        type: 'get',
        url: testBaseUrl + 'ipconfig'
    }).then(response => {
        mapRender(response.data);
    }).catch((err: JQuery.jqXHR) => {
        layer.msg(err.status + " " + (err.responseJSON ? err.responseJSON.msg as string : err.responseText), { icon: 2 });
        console.error(err);
    });

    if (atuhorized) {
        $("#staticSwitch").show();
        manageInit();
        $("#devContainer").hide();
        $("#manageContainer").show();
    } else {
        $("#staticAuth").show();
    }
    // 2048开始
    // if (!console) return;
    // const consoleRender = new ConsoleRenderer();
    // const gm2048 = new Game2048(consoleRender);

})();

$(".like button").on("click", ()=>{
    if($(".like .liked").hasClass("animate")){
        $(".like .liked").hide();
        $(".like .liked").removeClass("animate");
        $(".like .unliked").show();
        $(".like .unliked").addClass("animate1");
    } else {
        $(".like .unliked").hide();
        $(".like .unliked").removeClass("animate1");
        $(".like .liked").show();
        $(".like svg").addClass("animate");
    }
})

$(".limplayer-main-controller .shuffle").on("click", ()=>{
    $(".shuffle svg").addClass("animate");
    if($(".shuffle svg").hasClass("checked")){
        $(".shuffle svg").removeClass("checked");
        $(".shuffle span").hide();
    } else {
        $(".shuffle svg").addClass("checked");
        $(".shuffle span").show();
    }
    setTimeout(()=>{
        $(".shuffle svg").removeClass("animate");
    },300);
});

// 时间渲染
function timeRender() {
    const time = new Date(nowTimeStamp);
    const nowTime = {
        "Hour": time.getHours(),
        "Time": time.toTimeString()
    };
    // 时间每秒更新
    $('#time').text(nowTime.Time.split(" ")[0]);
    // 小时数改变才重新渲染greeting
    if (nowTime.Hour !== lastSecondTime.Hour) {
        switch (nowTime.Hour) {
            case 5: case 6: case 7: case 8: case 9:
                $('#greeting').text("早上好!");
                break;
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
                $('#greeting').text("凌晨好!");
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
    const AmapData = response.AmapData as amapData;
    const czData = response.czData as czData;
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
    $('#ip').text(response.IP as string + " - " + isp);
    if (AmapData.country !== "中国")
        return;
    amapData = AmapData;
    $("#mapSwitch").show();
}
// 图片渲染，传入img标签id和图片地址，算出适应高度并渲染
function imgRender(id: ImageNodeId, src: string) {
    return new Promise((resolve, reject) => {
        const img = new Image();
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
    const loadingHtml = content + "<img class='animate'></img>";
    if (type === "txt")
        $("#txtArea").html(loadingHtml);
    else if (type === "img") {
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
        url: testBaseUrl + 'test/write',
        data: { data }
    }).then((response) => {
        if (response.success === 20001)
            $("#txtArea").text("提交成功✔");
        txtLoadingFlag = false;
    }).catch((err: JQuery.jqXHR) => {
        txtLoadingFlag = false;
        layer.msg(err.status + " " + (err.responseJSON ? err.responseJSON.msg as string : err.responseText), { icon: 2 });
        console.error(err);
    });
}
// 人脸识别请求函数
function detectAjax(imgBase64: string, imgWidth: number, index: number) {
    startLoading("img", "正在检测人脸...", index);
    $.ajax({
        type: 'post',
        url: BaseUrl + 'info/faceDetect',
        data: { img_base64: imgBase64, return_landmark: 2, return_attributes: "gender,age,eyestatus,mouthstatus,emotion,beauty" }
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
        Object.keys(parmas.landmark as landmark).forEach(landmark => {
            html += "<span style='left: " + parmas.landmark[landmark].x * width / imgWidth + "px; top: " + parmas.landmark[landmark].y * width / imgWidth + "px'></span>";
        });
        const rec_data = parmas.face_rectangle;
        $("#pointer" + index).css("top", (rec_data.top - 2) * width / imgWidth).css("left", (rec_data.left - 2) * width / imgWidth).css("width", (rec_data.width) * width / imgWidth).css("height", (rec_data.height) * width / imgWidth).after(html).show();
        // 人脸描述
        const attributes = parmas.attributes as faceAttributes;
        const glass = attributes.glass.value === "None" ? "未佩戴" : (attributes.glass.value === "Normal" ? "普通眼镜" : "墨镜");
        const gender = attributes.gender.value === "Male" ? "男" : "女";
        const emotions = attributes.emotion;
        let emotion = "";
        const translation: { [key: string]: string } = {
            "anger": "愤怒",
            "disgust": "厌恶",
            "fear": "恐惧",
            "happiness": "高兴",
            "neutral": "平静",
            "sadness": "伤心",
            "surprise": "惊讶"
        };
        Object.keys(emotions).forEach(key => {
            if (emotions[key] >= 40)
                emotion = translation[key];
        });
        $("#imgLabel" + index).html("<div class='info'>性别: " + gender + "<br>年龄: " + attributes.age.value + "<br>情绪: " + emotion + "<br>眼镜: " + glass + "<br>颜值打分(男性): " + Math.trunc(attributes.beauty.male_score) + " 分<br>颜值打分(女性): " + Math.trunc(attributes.beauty.female_score) + " 分</div>");
        imgLoadingFlag = false;
    }).catch((err: JQuery.jqXHR) => {
        if (err.status === 413 || err.responseText.includes("IMAGE_FILE_TOO_LARGE")) {
            $("#imgLabel" + index).text("图片体积太大啦,换张照片试试吧😜");
        }
        else {
            layer.msg(err.status + " " + (err.responseJSON ? err.responseJSON.msg as string : err.responseText), { icon: 2 });
        }
        console.error(err);
        imgLoadingFlag = false;
    });
}
// 下载文件
function downloadFile(url: string, filename: string) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "blank";
    link.download = filename;
    document.body.appendChild(link);
    link.dispatchEvent(
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
    );
    document.body.removeChild(link);
}
// 表格数据初始化
function tableDataInit() {
    $.ajax(BaseUrl + "static/allFilesInfo", {
        headers: { "Authorization": token }
    }).then((response) => {
        const data = response.data as any[];
        data.forEach((item) => {
            item.size = item.size / 1000;
        });
        layui.table.render({
            elem: '#fileTable',
            height: 312,
            page: true,
            data,
            cols: [[ //表头
                { field: 'fileName', title: '文件名', sort: true, templet: '#fileName' },
                { field: 'size', title: '大小(kb)', width: 150, sort: true },
                { field: 'fileType', title: '文件类型', sort: true, width: 200 },
                { field: 'fileOriginName', title: '文件原名' },
                { field: 'uploadTime', title: '上传时间', sort: true, width: 250 },
                { title: '操作', templet: '#toolEventDemo', width: 150 }
            ]]
        });
    }).catch((err: JQuery.jqXHR) => {
        layer.msg(err.status + " " + (err.responseJSON ? err.responseJSON.msg as string : err.responseText), { icon: 2 });
        console.error(err);
    });
}
// 表格事件初始化
function tableEventInit() {
    layui.table.on('tool(fileTable)', function (e) {
        const event = e.event;
        const data = e.data;
        const fileName = data.fileName as string;
        switch (event) {
            case "edit":
                const tempName = fileName.split(".");
                const ext = tempName.pop();
                const name = tempName.join(".");
                layer.prompt({ title: '更改文件名', formType: 3, value: name, }, (value, index) => {
                    layer.close(index);
                    if (value === name) return;
                    layer.load();
                    $.ajax(BaseUrl + "static/file/" + data._id, {
                        method: "put",
                        headers: { "Authorization": token },
                        data: {
                            fileName: value + "." + ext
                        }
                    }).then(() => {
                        layer.closeAll('loading');
                        layer.msg("修改成功~", {
                            icon: 1
                        });
                        tableDataInit();
                    }).catch((err: JQuery.jqXHR) => {
                        layer.closeAll('loading');
                        layer.msg(err.responseJSON ? err.responseJSON.msg as string : err.responseText, {
                            icon: 2
                        });
                    });
                });
                break;
            case "download":
                const url = BaseUrl + "static/file/" + fileName;
                downloadFile(url, fileName);
                break;
            case "delete":
                layer.confirm('确定要删除吗？', { icon: 3, title: "提示" }, (index) => {
                    layer.close(index);
                    layer.load();
                    $.ajax(BaseUrl + "static/file/" + data._id, {
                        method: "delete",
                        headers: { "Authorization": token }
                    }).then(() => {
                        layer.closeAll('loading');
                        layer.msg("删除成功~", {
                            icon: 1
                        });
                        tableDataInit();
                    }).catch((err: JQuery.jqXHR) => {
                        layer.closeAll('loading');
                        layer.msg(err.responseJSON ? err.responseJSON.msg as string : err.responseText, {
                            icon: 2
                        });
                    });
                });
        }
    });
}
// 上传按钮初始化
function uploadBtnInit(selfFlag = false) {
    if (!selfFlag) {
        $("#uploadBtn").remove();
        $("#uploadContainer").append('<button type="button" class="layui-btn" id="uploadBtn"><i class="layui-icon">&#xe67c;</i>上传文件</button>');
    }
    layui.upload.render({
        elem: '#uploadBtn',
        auto: false,
        multiple: true,
        accept: "file",
        choose: (e) => {
            layer.load();
            const files = e.pushFile();
            const formdata = new FormData();
            for (const key in files) {
                formdata.append(key, files[key]);
                Reflect.deleteProperty(files, key);
            }
            $.ajax({
                type: 'post',
                url: BaseUrl + 'static/file',
                processData: false,
                contentType: false,
                data: formdata
            }).then((response) => {
                tableDataInit();
                layer.closeAll('loading');

                const urls = response.data.urls as any[];
                urls.forEach((url) => {
                    console.log(url.filename, url.url);
                });

                layer.alert('上传成功~', { icon: 1, title: "提示" }, (index: number) => {
                    if (urls.length === 1) {
                        layer.confirm(urls[0].url, { title: "文件链接", btn: ["复制","确定"] }, (index2: number) => {
                            navigator.clipboard.writeText(urls[0].url as string).then(() => {
                                layer.msg("复制成功~", {
                                    icon: 1
                                });
                            }, () => {
                                layer.msg("复制失败咯~", {
                                    icon: 2
                                });
                            });
                            layer.close(index2);
                        });
                    } else {
                        layer.close(index);
                    }
                });
            }).catch((err: JQuery.jqXHR) => {
                layer.closeAll('loading');
                layer.msg(err.status + " " + (err.responseJSON ? err.responseJSON.msg as string : err.responseText), { icon: 2 });
                console.error(err);
            });
            $("#uploadBtn").remove();
            $("#uploadContainer").append('<button type="button" class="layui-btn" id="uploadBtn"><i class="layui-icon">&#xe67c;</i>上传文件</button>');
            uploadBtnInit(true);
        }
    });
}
// 管理页面初始化
function manageInit() {
    const player = new LimPlayer("player", {autoplay: true, audio: [{name: "666", artist: "555", src: "66666"}]});
    console.log(player.options);
    
    tableDataInit();
    tableEventInit();
    uploadBtnInit();
    $("#devContainer").hide();
    $("#manageContainer").show();
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
        layer.confirm("输入内容为空,是否继续提交?", {
            icon: 3,
            title: "提示"
        }, (index) => {
            $("#text").val("");
            layer.close(index);
            return uplaodTxt("");
        });
        return txtLoadingFlag = false;
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
        url: testBaseUrl + 'test/read'
    }).then(response => {
        const data = response.data as string;
        // XSS脚本注入点
        $("#txtArea").html(data === "" ? "暂无内容📭" : data);
        txtLoadingFlag = false;
    }).catch((err: JQuery.jqXHR) => {
        txtLoadingFlag = false;
        layer.msg(err.status + " " + (err.responseJSON ? err.responseJSON.msg as string : err.responseText), { icon: 2 });
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
        url: testBaseUrl + 'test/readImage'
    }).then(async response => {
        const data = response.data;
        if (data.src1 !== "") {
            await imgRender("#imgNode1", data.src1 as string);
            imgSrc1 = data.src1;
            $("#imgLabel1").text("加载成功✔");
        }
        else {
            imgSrc1 = null;
            $("#imgLabel1").text("暂无图片1信息📭");
        }
        if (data.src2 !== "") {
            await imgRender("#imgNode2", data.src2 as string);
            imgSrc2 = data.src2;
            $("#imgLabel2").text("加载成功✔");
        }
        else {
            imgSrc2 = null;
            $("#imgLabel2").text("暂无图片2信息📭");
        }
        imgLoadingFlag = false;
    }).catch((err: JQuery.jqXHR) => {
        imgLoadingFlag = false;
        layer.msg(err.status + " " + (err.responseJSON ? err.responseJSON.msg as string : err.responseText), { icon: 2 });
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
        url: testBaseUrl + 'test/deleteImage'
    }).then(response => {
        if (response.success === 20001) {
            imgLabel.text("删除成功✔");
            resetImgArea();
        }
        imgLoadingFlag = false;
    }).catch((err: JQuery.jqXHR) => {
        imgLoadingFlag = false;
        layer.msg(err.status + " " + (err.responseJSON ? err.responseJSON.msg as string : err.responseText), { icon: 2 });
        console.error(err);
    });
});
// 用div触发input
$("[id^='inputDiv']").on("click", (e) => {
    const index = (e.target.innerText === "上传图片1" ? 1 : 2);
    $("#fileInput" + index).trigger("click");
});
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
    const files = fileElement.files as FileList;
    const file = files[0];
    fileElement.value = "";
    let base64Url = "";
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = (err) => {
        console.error(err);
        layer.msg("Read image failed", { icon: 2 });
        imgLoadingFlag = false;
    };
    reader.onload = () => {
        base64Url = reader.result as string;
        startLoading("img", "提交中...", index);
        $.ajax({
            type: 'post',
            url: testBaseUrl + 'test/uploadImage',
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
        }).catch((err: JQuery.jqXHR) => {
            if (index === 1) { imgSrc1 = null; } else { imgSrc2 = null; }
            if (err.status === 413) {
                $("#imgLabel" + index).text("图片体积太大啦,换张照片试试吧😜");
            }
            else {
                layer.msg(err.status + " " + (err.responseJSON ? err.responseJSON.msg as string : err.responseText), { icon: 2 });
            }
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
        $("#imgLabel1").text("暂无图片1信息📭");
        return false;
    }
    else if (index === 2 && imgSrc2 === null) {
        $("#imgLabel2").text("暂无图片2信息📭");
        return false;
    }
    imgLoadingFlag = true;
    const image_base64 = (index === 1 ? imgSrc1 : imgSrc2);
    const img = new Image();
    img.src = image_base64 as string;
    img.onload = () => {
        detectAjax(image_base64 as string, img.width, index);
    };
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
    startLoading("imgs", "上传比对中...");
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
            $("[id^='imgLabel']").text("相似比为: " + response.confidence + "%");
        else {
            $("#imgLabel1").text(response.faces1.length === 0 ? "未检测到人脸,换张照片试试吧😜" : "比对失败✘");
            $("#imgLabel2").text(response.faces2.length === 0 ? "未检测到人脸,换张照片试试吧😜" : "比对失败✘");
        }
        imgLoadingFlag = false;
    }).catch((err: JQuery.jqXHR) => {
        imgLoadingFlag = false;
        if (err.responseJSON) {
            const msg = err.responseJSON.error_message as string;
            if (msg.includes("IMAGE_FILE_TOO_LARGE")) {
                if (msg.includes("image_base64_1"))
                    $("[id^='imgLabel']").text("图片1体积太大啦,换张照片试试吧😜");
                else
                    $("[id^='imgLabel']").text("图片2体积太大啦,换张照片试试吧😜");
            }
            return layer.msg(err.status + " " + msg, { icon: 2 });
        }
        layer.msg(err.status + " " + err.responseText, { icon: 2 });
    });
});
// 地图手动控制展开
$("#mapSwitch").on("click", () => {
    if (!amapData.country || amapData.country !== "中国") {
        return;
    }
    const status = $("#mapContainer")[0].style.opacity;
    if (status === "1") {
        $("#mapContainer").css("height", "1px").css("z-index", -999).css("opacity", 0).css("margin-bottom", 0);
        $("#mapSwitch img").removeClass("rotate180");
        $("#mapSwitch span span").text("展开地图");
    }
    else if (status === "0") {
        $("#mapContainer").css("height", "calc(100vw - 16px)").css("z-index", "").css("opacity", 1).css("margin-bottom", "10px");
        $("#mapSwitch img").addClass("rotate180");
        $("#mapSwitch span span").text("收起地图");
    }
    else {
        $("#mapContainer").show();
        $("#mapContainer").css("opacity", 1);
        loadder(amapData).catch((err) => {
            console.error(err);
        });
        $("#mapSwitch span span").text("收起地图");
        $("#mapSwitch img").addClass("rotate180");
    }
});
// 静态文件管理身份验证
$("#staticAuth").on("click", () => {
    if (atuhorized) return;
    if (ipForbidden && ipForbiddenTimer) {
        $("#inputArea").val("");
        clearTimeout(ipForbiddenTimer);
        return layer.msg("乖乖等5分钟吧~", {
            icon: 5
        });
    }
    const value = $("#inputArea").val() as string | undefined;
    const reg = /^[0-9]{6}$/;
    if (!value || !reg.test(value)) {
        layer.msg("别闹我滴宝~", {
            icon: 5
        });
        return;
    }
    const sha1 = createHmac("SHA1", "limkim");
    sha1.update(value);
    $.ajax({
        type: 'post',
        url: BaseUrl + 'static/verify',
        data: { authorization: sha1.digest("base64") }
    }).then(({ data }) => {
        if (data.token) {
            localStorage.setItem("static_user_token", data.token as string);
            token = data.token;
            atuhorized = true;
            layer.msg("登录成功~", {
                icon: 1
            });
            $("#staticAuth").hide();
            $("#staticSwitch").show();
            manageInit();
        }
    }).catch((err: JQuery.jqXHR) => {
        $("#inputArea").val("");
        if (err.status === 403) {
            ipForbidden = true;
            layer.msg("让你别闹,这下好了吧,IP已被封禁5分钟,每一次请求都会刷新封禁时间哦~", {
                icon: 4,
                time: 5000
            });
            return ipForbiddenTimer = setTimeout(() => {
                ipForbidden = false;
            }, 300000);
        }
        layer.msg("身份码不对哦~", {
            icon: 2
        });
    });
});
// 返回
$("#backDev").on("click", () => {
    $("#devContainer").show();
    $("#manageContainer").hide();
});
// 登出
$("#logout").on("click", () => {
    layer.confirm("确定要登出吗?", {icon: 3, title: "提示"}, (index)=>{
        layer.close(index);
        localStorage.removeItem("static_user_token");
        window.location.reload();
    });
});
// 静态资源管理页面切换
$("#staticSwitch").on("click", () => {
    if (!atuhorized) return;
    manageInit();
});
