// ==UserScript==
// @name         test
// @namespace    https://dev.limkim.xyz/
// @version      0.1
// @description  脚本测试
// @author       limkim
// @match        https://*.instagram.com/*
// @icon         data:image/png;base64,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
// @supportURL   1625753207lim@gmail.com
// @require      https://dev.limkim.xyz/js/jquery-3.6.0.min.js
// @run-at       document-end
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_openInTab
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';
    console.log("start")
    let liList = [];
    let imgList = [];
    const downloadBtn = $("<span>66</span>");
    $("main section .CZW53 .eGOV_ div div").bind('DOMNodeInserted', (e) => {
        document.querySelectorAll("article .Ckrof").forEach(li => {
            //liList.push({
            //    html: li,
            //    added: false
            //})
            //$(li).append(downloadBtn)
        });
        //document.querySelectorAll("article ._5e4p").forEach(span=>{
        //    span.after($("<span class='_5e4p'><button class='wpO6b  ' type='button'><div class='QBdPU B58H7'><svg aria-label='分享帖子' class='_8-yf5 ' color='#8e8e8e' fill='#8e8e8e' height='24'role='img' viewBox='0 0 24 24' width='24'><line fill='none' stroke='currentColor' stroke-linejoin='round' stroke-width='2' x1='22' x2='9.218' y1='3' y2='10.083'></line><polygon fill='none' points='11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334'stroke='currentColor' stroke-linejoin='round' stroke-width='2'></polygon></svg></div><div class='QBdPU rrUvL'><svg aria-label='分享帖子' class='_8-yf5 ' color='#262626' fill='#262626' height='24'role='img' viewBox='0 0 24 24' width='24'><line fill='none' stroke='currentColor' stroke-linejoin='round' stroke-width='2' x1='22' x2='9.218'y1='3' y2='10.083'></line><polygon fill='none' points='11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334'stroke='currentColor' stroke-linejoin='round' stroke-width='2'></polygon></svg></div></button></span>"))
        //});
    });
    //document.addEventListener('mousemove',function(e){
    //    console.log(6666)
    //});
})();