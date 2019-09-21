/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    var random = Math.random();
    var lineurl = "https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=" + CLIENT_ID + "&redirect_uri=" + APP_DOMAIN + "/ajax/oauth/line.php&state=" + random + "@none_member&scope=profile";
    var app = new Vue({
        el: "#container",
        data: {
            lineurl: lineurl
        }
    });
    
    //メールアドレス入力フォームを表示
    $(document).on("click", "#mailadr", function () {
        $("form").show();
    });

    //会員登録フォーム
    $("form").validate({
        rules: {
            name: {
                required: true,
            },
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
            name: {
                required: "登録者のお名前を入力してください"
            },
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
                url: AJAX_URL + "member/add.php",
                type: "POST",
                data: data,
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {
                    var data = $.parseJSON(arr);
                    if (data == null) {
                        fadeError("登録済みのメールアドレスです");
                    } else {
                        var user = [];
                        user.push({
                            "login_id": data.login_id,
                            "token": data.token,
                            "kubun": data.kubun,
                            "name": data.name,
                            "regist": 1
                        });
                        localStorage.setItem("user", JSON.stringify(user));
                        //スクール設定
                        window.location.href = "../school/add.html";
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
