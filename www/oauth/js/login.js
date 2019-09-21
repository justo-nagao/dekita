/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    // 未会員エラー表示
    if (location.search == "?error=1") {
        fadeError("会員情報がみつかりません");
    }

    var random = Math.random();
    var lineurl = "https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=" + CLIENT_ID + "&redirect_uri=" + APP_DOMAIN + "/ajax/oauth/line.php&state=" + random + "@none_login&scope=profile";
    var app = new Vue({
        el: "#container",
        data: {
            lineurl: lineurl
        }
    });
    
    /**
     *  ローカルストレージからログイン
     */
    if (LOGIN_ID !== "" || TOKEN !== "") {
        $.ajax({
            url: AJAX_URL + "oauth/login.php",
            type: "POST",
            data: {
                login_id: LOGIN_ID,
                token: TOKEN,
                type: "local"
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                fadeError("送信に失敗しました");
            },
            success: function (arr) {
                var data = $.parseJSON(arr);
                var kubun = data.user.kubun;
                var url = data.school[1].url;
                if (data == null) {
                    fadeError("正しいメールアドレスとパスワードを入力してください");
                } else {
                    //ローカルデータ更新
                    setLocalStorage(data);
                    if (kubun == 1 || kubun == 2) {
                        window.location.href = "../lesson/mcalendar.html?id=" + url + "";
                    } else {
                        window.location.href = "../lesson/calendar.html?id=" + url + "";
                    }
                }
            }
        });
    }

    //メールアドレスでログイン
    $(document).on("click", "#mailadr", function () {
        $("form").show();
    });

    /**
     *  ログイン認証
     */
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
                url: AJAX_URL + "oauth/login.php",
                type: "POST",
                data: data + "&type=form",
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {

                    if (arr == "") {
                        fadeError("正しいメールアドレスとパスワードを入力してください");
                    } else {
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
                }
            });
        }
    });

    //パスワード確認
    $.validator.addMethod("pwcheck", function (value, element) {
        return /^[A-Za-z0-9\d=!\-@._*]+$/.test(value);
    });

});
