let nowTimeStamp = "";
let lastSecondTime = {
    "Hour": "",
    "Time": ""
};
let imgSrc1 = null;
let imgSrc2 = null;
const imgLabel = $("[id^='imgLabel']");
// 防抖
let imgLoadingFlag = false;
let txtLoadingFlag = false;
// 请求信息
(() => {
    $.ajax({
        type: 'get',
        url: 'https://api.limkim.xyz/getSysTime'
    }).then(response => {
        nowTimeStamp = response.Systime2;
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
})();
// 时间渲染
function timeRender() {
    const time = new Date(nowTimeStamp);
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
        if (!lastSecondTime.Hour || nowTime.Hour === 0) {
            $("#date").text(time.toDateString() + " - ");
        }
    }
    lastSecondTime = nowTime;
    nowTimeStamp += 1000;
}
// 地图和IP渲染
function mapRender(response) {
    const AmapData = response.AmapData;
    const czData = response.czData;
    let city = "";
    if (czData.city) {
        czData.city = czData.city.split("省")[1] || czData.city;
        if (AmapData.city.length >= czData.city)
            city = AmapData.city;
        else
            city = czData.city;
    }
    else {
        city = AmapData.city ? AmapData.city : "不知道哪里";
    }
    let isp = "";
    if (czData.isp === "本机或本网络") {
        if (!AmapData.isp)
            isp = " - 代理";
    }
    else {
        if (czData.isp)
            isp = (czData.isp.length >= AmapData.isp.length ? (" - " + czData.isp) : (AmapData.isp ? (" - " + AmapData.isp) : ""));
        else
            isp = (AmapData.isp ? (" - " + AmapData.isp) : "");
    }
    $('#address').text(city + (AmapData.district ? AmapData.district : ""));
    $('#ip').text(response.IP + isp);
    if (AmapData.country !== "中国")
        return false;
    $("#container").attr("hidden", false);
    AMapLoader.load({
        "key": "3257a21ceceb0bcd498b8288f0f10cfa",
        "version": "2.0",
        "plugins": [
            'AMap.ToolBar',
            'AMap.Scale',
            'AMap.ControlBar'
        ], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    }).then((AMap) => {
        let map = new AMap.Map('container', {
            zoom: 8,//级别
            center: [AmapData.location.split(",")[0], AmapData.location.split(",")[1]],//中心点坐标
            viewMode: '3D',//使用3D视图
            terrain: true
        });
        let infoWindow = new AMap.InfoWindow({
            anchor: 'top-left',
            content: '猜你在这附近!',
        });
        infoWindow.open(map, [AmapData.location.split(",")[0], AmapData.location.split(",")[1]]);
        let marker = new AMap.Marker({
            position: [AmapData.location.split(",")[0], AmapData.location.split(",")[1]]//位置
        });
        map.add(marker);//添加到地图
        map.addControl(new AMap.ToolBar());
        map.addControl(new AMap.Scale());
        map.addControl(new AMap.ControlBar());
    }).catch((e) => {
        console.error(e);  //加载错误提示
    });
}
// 渲染加载动画和提示
function startLoading(id, content) {
    if (id === "txt")
        $("#txtArea").html(content + "<span class ='animate'></span>");
    else {
        imgLabel.html("加载中...<span class ='animate'></span>");
        $("[id^='imgNode']").attr("src", null);
    }
}
// 图片渲染，传入img标签id和图片地址，算出适应高度并渲染
function imgRender(id, src) {
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
// 图片显示区和imgSrc重置
function resetImgArea() {
    imgSrc1 = null;
    imgSrc2 = null;
    $("#container1").html("<div id='pointer1'></div><img src='' id='imgNode1'>");
    $("#container2").html("<div id='pointer2'></div><img src='' id='imgNode2'>");
}
// 写入文本方法
function uplaodTxt(data) {
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
function detectAjax(imgBase64, imgWidth, index) {
    $("#imgLabel" + index).html("正在检测人脸...<span class ='animate'></span>");
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
        const emotion = attributes.emotion;
        let emo = "";
        const translation = {
            "anger": "愤怒",
            "disgust": "厌恶",
            "fear": "恐惧",
            "happiness": "高兴",
            "neutral": "平静",
            "sadness": "伤心",
            "surprise": "惊讶"
        }
        Object.keys(emotion).forEach(key => {
            if (emotion[key] >= 40)
                emo = translation[key];
        })
        $("#imgLabel" + index).html("<div class='info'>性别: " + gender + "<br>年龄: " + attributes.age.value + "<br>情绪: " + emo + "<br>眼镜: " + glass + "<br>颜值打分(男性): " + parseInt(attributes.beauty.male_score) + " 分<br>颜值打分(女性): " + parseInt(attributes.beauty.female_score) + " 分</div>");
        imgLoadingFlag = false;
    }).catch((err) => {
        $("#imgLabel" + index).text("图片体积太大啦,换张照片试试吧😜");
        imgLoadingFlag = false;
    });
}
// 清空文本框
$("#clearInputArea").click(() => {
    $("#inputArea").val("");
});
// 上传输入区文本内容
$("#uploadTxt").click(() => {
    if (txtLoadingFlag)
        return false;
    txtLoadingFlag = true;
    const data = $("#inputArea").val();
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
$("#readTxt").click(() => {
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
$("#clearImgArea").click(() => {
    imgLabel.text("暂无内容📭");
    resetImgArea();
});
// 读取图片src
$("#readImage").click(() => {
    if (imgLoadingFlag)
        return false;
    imgLoadingFlag = true;
    resetImgArea();
    startLoading("img");
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
$("#deleteImage").click(() => {
    if (imgLoadingFlag)
        return false;
    imgLoadingFlag = true;
    startLoading("img", "删除中...");
    $.ajax({
        type: 'get',
        url: 'https://api.limkim.xyz/test/deleteImage'
    }).then(response => {
        if (response.success === 20001) {
            imgLabel.text("删除成功✔");
            resetImgArea();
        }
        imgLoadingFlag = false;
    }).catch(() => {
        imgLoadingFlag = false;
        console.error(err);
    });
});
// 用div触发input
$("[id^='inputDiv']").click((e) => {
    const index = (e.target.innerText === "上传图片1" ? 1 : 2);
    $("#fileInput" + index).trigger("click");
})
// 用户上传图片文件后，获取base64编码并上传
$("[id^='fileInput']").change((e) => {
    if (imgLoadingFlag)
        return false;
    imgLoadingFlag = true;
    const index = (e.target.id === "fileInput1" ? 1 : 2);
    $("#container" + index).html("<div id='pointer" + index + "'></div><img src='' id='imgNode" + index + "'>");
    $("#imgNode" + index).attr("src", null);
    $("imgLabrl" + index).text("读取中...<span class ='animate'></span>");
    const file = document.querySelector('#fileInput' + index).files[0];
    document.querySelector('#fileInput' + index).value = "";
    let base64Url = "";
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = (err) => {
        console.error(err);
        imgLoadingFlag = false;
    };
    reader.onload = () => {
        base64Url = reader.result;
        $("#imgLabel" + index).html("提交中...<span class ='animate'></span>");
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
                imgWidth = await imgRender("#imgNode1", base64Url);
            }
            else {
                imgSrc2 = base64Url;
                imgWidth = await imgRender("#imgNode2", base64Url);
            }
            detectAjax(base64Url, imgWidth, index);
        }).catch((err) => {
            if (err.status === 413)
                $("#imgLabel" + index).text("图片体积太大啦,换张照片试试吧😜");
            imgLoadingFlag = false;
        });
    };
});
// 手动检测人脸
$("[id^='recognizeImg']").click((e) => {
    if (imgLoadingFlag)
        return false;
    imgLoadingFlag = true;
    const index = (e.target.id === "recognizeImg1" ? 1 : 2);
    if (index === 1 && imgSrc1 === null) {
        $("#imgLabel1").text("暂无图片1信息📭")
        return false;
    }
    else if (index === 2 && imgSrc2 === null) {
        $("#imgLabel2").text("暂无图片2信息📭")
        return false;
    }
    image_base64 = (index === 1 ? imgSrc1 : imgSrc2);
    let img = new Image();
    img.src = image_base64;
    img.onload = () => {
        detectAjax(image_base64, img.width, index);
    }
});
// 对比照片人脸匹配度
$("#compareImg").click(() => {
    if (imgLoadingFlag)
        return false;
    imgLoadingFlag = true;
    if ($("#imgLabel1").text() === "暂无内容📭" || $("#imgLabel1").text() === "暂无图片1信息📭")
        $("#imgLabel1").text("暂无图片1信息📭");
    if ($("#imgLabel2").text() === "暂无内容📭" || $("#imgLabel2").text() === "暂无图片2信息📭")
        return $("#imgLabel2").text("暂无图片2信息📭");
    $("[id^='imgLabel']").html("上传比对中...<span class ='animate'></span>")
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