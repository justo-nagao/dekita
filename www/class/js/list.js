/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);
    
    //パラメータ取得
    var param = location.search;
    var url = getParam("id", param);
    var schoollists = JSON.parse(localStorage.getItem("school"));
    var filtered = $.grep(schoollists, function (elem, index) {
        return (elem.url == url);
    });
    var school_name = filtered[0].name;
    var app = new Vue({
        el: "#container",
        data: {
            url: url,
            school_name: school_name
        }
    });

    //URL書換え
    $("#btn_add").attr("href", "add.html?id=" + url);

    $.ajax({
        url: AJAX_URL + "class/list.php",
        type: "POST",
        data: {
            url: url
        },
        success: function (arr) {
            var data = $.parseJSON(arr);
            var str = "";
            $.each(data, function (index, elem) {
                str = str +
                    "<dl>" +
                    "<dt class='sample'></dt>" +
                    "<dd><a href='detail.html?id=" + url + "&class=" + elem.class_id + "'>" + elem.name + "</a></dd>" +
                    "</dl>";
            });
            $("#list").append(str);
        }
    });

});
