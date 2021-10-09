var imgSrc1 = null
var imgSrc2 = null
var sysTime = ''
window.onload = function () {
    $.ajax({
        type: 'get',
        url: 'https://api.limkim.xyz/ipconfig',
        success: function (response) {
            if (response.Region[2] !== undefined)
                $('#address').text(response.Region[1] + "-" + response.Region[2])
            else
                $('#address').text(response.Region[1])
            $('#ip').text(response.IP)
            $.ajax({
                type: 'get',
                url: 'https://api.limkim.xyz/getSysTime',
                success: function (response) {
                    sysTime = response.Systime2
                    $('#time').html(response.Systime3.Year + "年 - " + response.Systime3.Month + "月 - " + response.Systime3.Date + "日 - 周" + (response.Systime3.Day == 0 ? '日' : response.Systime3.Day) + " - " + "<span id='nowTime'>" + response.Systime3.time + "<span>")
                }
            })
        }
    })
}
setInterval(function () {
    sysTime += 1000
    var newSysTime = new Date(sysTime).toTimeString().split(' ')[0]
    if (newSysTime === '20:18:20')
        $.ajax({
            type: 'get',
            url: 'https://api.limkim.xyz/getSysTime',
            success: function (response) {
                sysTime = response.Systime2
                $('#time').html(response.Systime3.Year + "年 - " + response.Systime3.Month + "月 - " + response.Systime3.Date + "日 - 周" + (response.Systime3.Day == 0 ? '日' : response.Systime3.Day) + " - " + "<span id='nowTime'>" + response.Systime3.time + "<span>")
            }
        })
    else
        $('#nowTime').text(newSysTime)
}, 1000)
function clearTxt(index) {
    if (index === 2) {
        $("#text").val("")
    }
    else if (index === 1) {
        $("#p").text("暂无内容📭")
    }
}
function clearPic() {
    $("[id^='lable']").html("清除中...<span class ='animate'></span>")
    imgSrc1 = null
    imgSrc2 = null
    $("#container1").html("<div id='pointer1'></div><img src='' alt='' id='img1'>")
    $("#container2").html("<div id='pointer2'></div><img src='' alt='' id='img2'>")
    $("input").val("")
    $("[id^='lable']").text("暂无图片信息📭")
}
function deletePic() {
    $("[id^='lable']").html("删除中...<span class ='animate'></span>")
    imgSrc1 = null
    imgSrc2 = null
    $.ajax({
        type: 'get',
        url: 'https://api.limkim.xyz/deletePic',
        success: function (response) {
            if (response === "ok") {
                $("#container1").html("<div id='pointer1'></div><img src='' alt='' id='img1'>")
                $("#container2").html("<div id='pointer2'></div><img src='' alt='' id='img2'>")
                $("input").val("")
                $("[id^='lable']").text("删除成功✔")
            }
        }
    })
}
function getFile(index) {
    document.getElementById("path" + index).click()
}
function readTxt() {
    $("#p").html("加载中...<span class ='animate'></span>")
    $.ajax({
        type: 'get',
        url: 'https://api.limkim.xyz/read',
        success: function (response) {
            if (response !== '')
                $("#p").text(response)
            else
                $("#p").text("暂无内容📭")
        }
    })
}
function readPic() {
    $("#container1").html("<div id='pointer1'></div><img src='' alt='' id='img1'>")
    $("#container2").html("<div id='pointer2'></div><img src='' alt='' id='img2'>")
    $("[id^='lable']").html("加载中...<span class ='animate'></span>")
    $.ajax({
        type: 'get',
        url: 'https://api.limkim.xyz/readPic',
        success: function (response) {
            if (response.src1 !== "") {
                var img1 = new Image();
                img1.src = response.src1;
                img1.onload = function () {
                    if (img1.width >= 300)
                        $("#img1").css('width', 300).css('height', img1.height * 300 / img1.width).attr('src', response.src1)
                    else if (img1.width < 300)
                        $("#img1").css('width', img1.width).css('height', img1.height).attr('src', response.src1)
                    imgSrc1 = response.src1;
                };
                $("#lable1").text("加载成功✔")
            }
            else {
                imgSrc1 = null;
                $("#lable1").text("暂无图片1信息📭")
            }
            if (response.src2 !== "") {
                var img2 = new Image();
                img2.src = response.src2;
                img2.onload = function () {
                    if (img2.width >= 300)
                        $("#img2").css('width', 300).css('height', img2.height * 300 / img2.width).attr('src', response.src2)
                    else if (img2.width < 300)
                        $("#img2").css('width', img2.width).css('height', img2.height).attr('src', response.src2)
                    imgSrc2 = response.src2;
                };
                $("#lable2").text("加载成功✔")
            }
            else {
                imgSrc2 = null;
                $("#lable2").text("暂无图片2信息📭")
            }
        }
    })
}
function writes(parmas) {
    if (parmas === 'w') {
        if ($.trim($("#text").val()) === "") {
            if (confirm("输入信息为空,继续提交将清空文本,是否继续提交")) {
                $("#text").val("")
                $("#p").html("上传服务器中...<span class ='animate'></span>")
                $.ajax({
                    type: 'post',
                    url: 'https://api.limkim.xyz/write',
                    data: {
                        info: ""
                    },
                    success: function (response) {
                        if (response === "ok")
                            $("#p").text("提交成功✔")
                    }
                })
            }
        }
        else {
            $("#p").html("上传服务器中...<span class ='animate'></span>")
            $.ajax({
                type: 'post',
                url: 'https://api.limkim.xyz/write',
                data: {
                    info: $("#text").val()
                },
                success: function (response) {
                    if (response === "ok")
                        $("#p").text("提交成功✔")
                }
            })
        }
    }
    else if (parmas === 'd') {
        $("#p").html("删除中...<span class ='animate'></span>")
        $.ajax({
            type: 'post',
            url: 'https://api.limkim.xyz/write',
            data: {
                info: ""
            },
            success: function (response) {
                if (response === "ok")
                    $("#p").text("删除成功✔")
            }
        })
    }
}
function getBase64(index) {
    $("#container" + index).html("<div id='pointer" + index + "'></div><img src='' alt='' id='img" + index + "'>")
    var file = document.querySelector('#path' + index).files[0]
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        $("#lable" + index).html("上传服务器中...<span class ='animate'></span>")
        $.ajax({
            type: 'post',
            url: 'https://api.limkim.xyz/upload',
            data: {
                index,
                src: reader.result
            },
            success: function (response) {
                var img = new Image();
                img.src = response.src;
                img.onload = function () {
                    if (img.width >= 300)
                        $("#img" + response.index).css('width', 300).css('height', img.height * 300 / img.width).attr('src', response.src)
                    else if (img.width < 300)
                        $("#img" + response.index).css('width', img.width).css('height', img.height).attr('src', response.src)
                    if (index === 1)
                        imgSrc1 = response.src;
                    else
                        imgSrc2 = response.src;
                };
                detectAjax(reader.result, img, index)
            }
        })
    };
}
function detect(index) {
    if (index === 1) {
        if (imgSrc1 !== null) {
            image_base64 = imgSrc1
        }
        else if (imgSrc1 === null) {
            $("#lable1").text("暂无图片1信息📭")
            return false;
        }
    }
    else if (index === 2) {
        if (imgSrc2 !== null) {
            image_base64 = imgSrc2
        }
        else if (imgSrc2 === null) {
            $("#lable" + index).text("暂无图片2信息📭")
            return false;
        }
    }
    var img = new Image();
    img.src = image_base64;
    detectAjax(image_base64, img, index)
}
//人脸识别请求函数
function detectAjax(image_base64, img, index) {
    $("#lable" + index).html("正在检测人脸...<span class ='animate'></span>")
    $.ajax({
        type: 'post',
        url: 'https://api-cn.faceplusplus.com/facepp/v3/detect',
        data: {
            api_key: "PRNA1wgDSB9iCn0oVW6RMDiRNpU42SzF",
            api_secret: "yNRiYEIr0ZS_TsTSqEUI29wq3orEiQKb",
            image_base64,
            return_landmark: 2,
            return_attributes: "gender,age,eyestatus,mouthstatus,emotion,beauty"
        },
        success: function (response) {
            if (response.faces.length === 0) {
                $("#lable" + index).text("未检测到人脸,换张照片试试吧😜")
                return false;
            }

            const width = Number($("#img" + index).css('width').split('px')[0]);
            const parmas = response.faces[0];
            var landmarks = Object.keys(parmas.landmark);
            var html = ""
            for (var i = 0; i < landmarks.length; i++) {
                html += "<span style='left: " + parmas.landmark[landmarks[i]].x * width / img.width + "px; top: " + parmas.landmark[landmarks[i]].y * width / img.width + "px'></span>"
            }
            $("#pointer" + index).css("top", (parmas.face_rectangle.top - 2) * width / img.width)
                .css("left", (parmas.face_rectangle.left - 2) * width / img.width)
                .css("width", (parmas.face_rectangle.width) * width / img.width)
                .css("height", (parmas.face_rectangle.height) * width / img.width)
                .after(html)
                .show();
            switch (parmas.attributes.glass.value) {
                case "None":
                    parmas.attributes.glass.value = "未佩戴"
                    break
                case "Normal":
                    parmas.attributes.glass.value = "普通眼镜"
                    break
                case "Dark":
                    parmas.attributes.glass.value = "墨镜"
                    break
            }
            const emotion = parmas.attributes.emotion
            const e_target = ["anger", "disgust", "fear", "happiness", "neutral", "sadness", "surprise"]
            const c_target = ["愤怒", "厌恶", "恐惧", "高兴", "平静", "伤心", "惊讶"]
            for (var i = 0; i < 7; i++)
                if (emotion[e_target[i]] >= 40)
                    var emo = c_target[i]
            $("#lable" + index).html(
                "<div class='info'>性别: " + (parmas.attributes.gender.value === "Male" ? '男' : '女') +
                "<br>年龄: " + parmas.attributes.age.value +
                "<br>是否佩戴眼镜: " + parmas.attributes.glass.value +
                "<br>嘴部遮挡程度: " + parmas.attributes.mouthstatus.surgical_mask_or_respirator + "%" +
                "<br>情绪: " + emo +
                "<br>颜值(男性打分): " + parseInt(parmas.attributes.beauty.male_score) +
                " 分<br>颜值(女性打分): " + parseInt(parmas.attributes.beauty.female_score) +
                " 分</div>"
            )
        },
        error: function () {
            $("#lable" + index).text("图片体积太大啦,换张照片试试吧😜")
        }
    })
}
// 对比功能函数
function compare() {
    if ($("#lable1").text() === "暂无图片信息📭" || $("#lable1").text() === "暂无图片1信息📭")
        return false
    if ($("#lable2").text() === "暂无图片信息📭" || $("#lable2").text() === "暂无图片2信息📭")
        return false
    $("[id^='lable']").html("加载图片信息...<span class ='animate'></span>")
    if (imgSrc1 === null) {
        var file1 = document.querySelector('#path1').files[0]
        let reader1 = new FileReader();
        reader1.readAsDataURL(file1);
        reader1.onload = function () {
            var file2 = document.querySelector('#path2').files[0]
            let reader2 = new FileReader();
            reader2.readAsDataURL(file2);
            reader2.onload = function () {
                $("[id^='lable']").html("上传比对中...<span class ='animate'></span>")
                $.ajax({
                    type: 'post',
                    url: 'https://api-cn.faceplusplus.com/facepp/v3/compare',
                    data: {
                        api_key: "PRNA1wgDSB9iCn0oVW6RMDiRNpU42SzF",
                        api_secret: "yNRiYEIr0ZS_TsTSqEUI29wq3orEiQKb",
                        image_base64_1: reader1.result,
                        image_base64_2: reader2.result
                    },
                    success: function (response) {
                        if (response.confidence !== undefined)
                            $("[id^='lable']").text("相似比为: " + response.confidence + "%")
                        else if (response.faces1.length === 0 && response.faces2.length !== 0) {
                            $("#lable1").text("未检测到人脸,换张照片试试吧😜")
                            $("#lable2").text("比对失败✘")
                        }
                        else if (response.faces2.length === 0 && response.faces1.length !== 0) {
                            $("#lable1").text("比对失败✘")
                            $("#lable2").text("未检测到人脸,换张照片试试吧😜")
                        }
                        else if (response.faces1.length === 0 && response.faces2.length === 0) {
                            $("#lable1").text("未检测到人脸,换张照片试试吧😜")
                            $("#lable2").text("未检测到人脸,换张照片试试吧😜")
                        }
                    },
                    error: function () {
                        $("[id^='lable']").text("图片1或图片2体积太大啦,换张照片试试吧😜")
                    }
                })
            }
        }
    }
    else {
        $("[id^='lable']").html("上传比对中...<span class ='animate'></span>")
        $.ajax({
            type: 'post',
            url: 'https://api-cn.faceplusplus.com/facepp/v3/compare',
            data: {
                api_key: "PRNA1wgDSB9iCn0oVW6RMDiRNpU42SzF",
                api_secret: "yNRiYEIr0ZS_TsTSqEUI29wq3orEiQKb",
                image_base64_1: imgSrc1,
                image_base64_2: imgSrc2
            },
            success: function (response) {
                if (response.confidence !== undefined)
                    $("[id^='lable']").text("相似比为: " + response.confidence + "%")
                else if (response.faces1.length === 0 && response.faces2.length !== 0) {
                    $("#lable1").text("未检测到人脸,换张照片试试吧😜")
                    $("#lable2").text("比对失败✘")
                }
                else if (response.faces2.length === 0 && response.faces1.length !== 0) {
                    $("#lable1").text("比对失败✘")
                    $("#lable2").text("未检测到人脸,换张照片试试吧😜")
                }
                else if (response.faces1.length === 0 && response.faces2.length === 0) {
                    $("#lable1").text("未检测到人脸,换张照片试试吧😜")
                    $("#lable2").text("未检测到人脸,换张照片试试吧😜")
                }
            },
            error: function () {
                $("[id^='lable']").text("图片1或图片2体积太大啦,换张照片试试吧😜")
            }
        })
    }
}