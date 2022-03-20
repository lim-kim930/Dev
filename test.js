const app = require("express").Router();
const axios = require('axios');
const { getUserInfo, resMsg } = require('./function/globalFunc.js');
// qq登录
app.post('/getInfo', (req, res) => {
    axios({
        method: "get",
        url: "https://graph.qq.com/oauth2.0/token",
        params: {
            "grant_type": "authorization_code",
            "client_id": "101976851",
            "client_secret": "2d40cd66eff02d8fa70997892eb7e9ab",
            "code": req.body.code,
            "redirect_uri": "https://limkim.xyz/redirect?method=qq",
            "fmt": "json"
        }
    }).then((response) => {
        return axios({
            method: "get",
            url: "https://graph.qq.com/oauth2.0/me",
            params: {
                "access_token": response.data.access_token,
                "redirect_uri": "https://limkim.xyz/redirect?method=qq",
                "fmt": "json"
            }
        })
        // {
        // 				if (status === "success") {
        // 					req.session.username = data.nickname;
        // 					res.send(data);
        // 				}
        // 				else if (status === "failed")
        // 					res.status(500).send(resMsg(1, 50001, "get qq_userInfo error"));
        // 			});
    }).then((response2) => {
        return getUserInfo("qq", response.data.access_token, response2.data.openid)
    }).then(result => {
        res.send(resMsg(0, 20001, result.data));
    }).catch((error) => {
        res.status(500).send(resMsg(1, 50001, error.message));
    });
});

module.exports = app;