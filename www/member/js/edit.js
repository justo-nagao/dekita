/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);

    var app = new Vue({
        el: "#container",
        data: {
            login_id: LOGIN_ID
        }
    });

    //ユーザー情報取得
    $.ajax({
        url: AJAX_URL + "member/edit.php",
        type: "POST",
        data: {
            login_id: LOGIN_ID,
            type: "init"
        },
        success: function (arr) {
            var data = $.parseJSON(arr);

            var email = data[0].email;
            var name = data[0].name;

            $("input[name='name']").val(name);
            $("input[name='email']").val(email);
        }
    });

    //会員登録フォーム
    $("form").validate({
        rules: {
            name: {
                required: true
            },
            email: {
                required: true,
                email: true
            }
        },
        messages: {
            name: {
                required: ""
            },
            email: {
                required: "メールアドレスを入力してください",
                email: "正しいメールアドレスを入力してください"
            }
        },
        submitHandler: function () {

            var $form = $("form");
            var data = $form.serialize();

            $.ajax({
                url: AJAX_URL + "member/edit.php",
                type: "POST",
                data: data,
                type: "update",
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {
                    var data = $.parseJSON(arr);
                }
            });
        }
    });

    //パスワード確認
    $.validator.addMethod("pwcheck", function (value, element) {
        return /^[A-Za-z0-9\d=!\-@._*]+$/.test(value);
    });

});
