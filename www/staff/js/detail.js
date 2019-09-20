/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);

    //パラメータ取得
    var param = escapeHTML($(location).attr("pathname").replace(APP_PATH + "staff/detail/", ""));
    var paramArray = param.split("/");
    var url = paramArray[0];
    var staff_id = paramArray[1];

    //スタッフ情報取得
    $.ajax({
        url: AJAX_URL + "staff/detail.php",
        type: "POST",
        data: {
            url: url,
            login_id: LOGIN_ID,
            staff_id: staff_id,
            type: "init"
        },
        success: function (arr) {
            var data = $.parseJSON(arr);
            var passcode = data.passcode.split("");
            var entry = "" + APP_DOMAIN + "/app/oauth/pass/" + url;
            $("header h1").text(data.name);
            $("#name").text(data.name);
            $("#email").text(data.email);
            $("#belong").text(userArray[data.role]);
            $("#create").text(data.joined_at);
            $("#passcode li").eq(0).text(passcode[0]);
            $("#passcode li").eq(1).text(passcode[1]);
            $("#passcode li").eq(2).text(passcode[2]);
            $("#passcode li").eq(3).text(passcode[3]);

            var app = new Vue({
                el: "#container",
                data: {
                    url: url,
                    staff_id: staff_id,
                    entry: entry,
                    domain: APP_DOMAIN
                }
            });
        }
    });

    //招待開く
    $(document).on("click", "#invitation", function () {
        $("#linkshare").show();
    });

    //招待閉じる
    $(document).on("click", ".modal .closebtn, #linkshare .closebtn", function () {
        $(this).parent().fadeOut();
    });

});
