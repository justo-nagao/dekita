/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //パラメータ取得
    var param = escapeHTML($(location).attr("pathname").replace(APP_PATH + "oauth/linkage/", ""));
    var paramArray = param.split("/");
    var url = paramArray[0];
    var login_id = paramArray[1];
    var random = Math.random();
    var lineurl = "https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=" + CLIENT_ID + "&redirect_uri=" + APP_DOMAIN + "/ajax/oauth/line.php&state=" + random + "@" + login_id + "_linkage&scope=profile";
    var app = new Vue({
        el: "#container",
        data: {
            lineurl: lineurl
        }
    });

    //スクール情報取得
    $.ajax({
        url: AJAX_URL + "oauth/linkage.php",
        type: "POST",
        data: {
            url: url,
            type: "init"
        },
        success: function (arr) {
            var data = $.parseJSON(arr);
            $("#oauth_linkage h1").html("<span>" + data.name + "</span>会員登録");
            $("#oauth_linkage input[name='school_id']").val(data.school_id);
        }
    });

    //メールアドレスで登録
    $(document).on("click", "#mailadr", function () {
        $("form").show();
    });

    //メールアドレスで登録
    $("form").validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                pwcheck: true,
                minlength: 6
            }
        },
        messages: {
            email: {
                required: "メールアドレスを入力してください",
                email: "正しいメールアドレスを入力してください"
            },
            password: {
                required: "パスワードを入力してください",
                pwcheck: "パスワードは半角英数字で入力してください",
                minlength: "パスワードは6文字以上入力してください"
            }
        },
        submitHandler: function () {

            var $form = $("form");
            var data = $form.serialize();

            $.ajax({
                url: AJAX_URL + "oauth/linkage.php",
                type: "POST",
                data: {
                    data: data,
                    url: url,
                    login_id: login_id,
                    authority: AUTHORITY,
                    type: "add"
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {
                    var data = $.parseJSON(arr);
                    fadeNotice("登録が完了いたしました", "../../../oauth/receiver?login_id=" + login_id + "&token=");
                }
            });
        }
    });

    //パスワード確認
    $.validator.addMethod("pwcheck", function (value, element) {
        return /^[A-Za-z0-9\d=!\-@._*]+$/.test(value);
    });

});
