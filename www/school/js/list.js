/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);

    $.ajax({
        url: AJAX_URL + "school/list.php",
        type: "POST",
        data: {
            login_id: LOGIN_ID,
            token: TOKEN,
            kubun: KUBUN
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            fadeError("送信に失敗しました");
        },
        success: function (arr) {
            var data = $.parseJSON(arr);
            var str = "";
            var redirect = "";

            $.each(data, function (index, elem) {
                //管理者の場合
                if (KUBUN == 1) {
                    redirect = "../school/detail/" + elem.url;
                }
                //受講者の場合
                else if (KUBUN == 3) {
                    redirect = "../lesson/calendar/" + elem.url + "/";
                }
                str = str +
                    "<dl>" +
                    "<dt class='sample'></dt>" +
                    "<dd><a href='" + redirect + "'>" + elem.name + "</a></dt>" +
                    "</dl>";
            });
            $("#list").append(str);
        }
    });
});
