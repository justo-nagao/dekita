/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {


    var login_id = getParam("login_id");
    var token = getParam("token");
    var callback = getParam("callback");
    
    $.ajax({
        url: AJAX_URL + "oauth/receiver.php",
        type: "POST",
        data: {
            login_id: login_id,
            token: token,
            callback: callback
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            fadeError("送信に失敗しました");
        },
        success: function (arr) {
            
            var data = $.parseJSON(arr);
            var kubun = data.user.kubun;
            var url = data.school[1].url;

            //ローカルデータ更新
            setLocalStorage(data);

            if (kubun == 1) {
                window.location.href = "../lesson/mcalendar.html?id=" + url + "";
            } else {
                window.location.href = "../lesson/calendar.html?id=" + url + "";
            }
        }
    });


});
