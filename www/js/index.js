/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {
    if (USER_DATA == null) {
        window.location.href = APP_DOMAIN + "app/oauth/login.html";
    } else {
        var url = SCHOOL_DATA[0]["url"];
        if (temp == "manager") {
            window.location.href = "lesson/mcalendar.html?id=" + url + "";
        } else {
            window.location.href = "lesson/calendar.html?id=" + url + "";
        }
    }
});