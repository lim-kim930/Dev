import "../src/assets/css/redirect.css";

(() => {
    const token = localStorage.getItem("static_token");
    if (token) {
        setTimeout(() => {
            window.location.href = "./manage.html";
        }, 1000);
    } else {
        window.location.href = "./";
    }
})();