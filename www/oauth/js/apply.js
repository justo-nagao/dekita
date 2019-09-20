/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //パラメータ取得
    var url = escapeHTML($(location).attr("pathname").replace(APP_PATH + "oauth/apply/", ""));
    var random = Math.random();
    var lineurl = "https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id="+CLIENT_ID+"&redirect_uri="+APP_DOMAIN+"/ajax/oauth/line.php&state="+random+"@"+url+"_apply&scope=profile";
    var app = new Vue({
        el: "#container",
        data: {
            lineurl: lineurl
        }
    });
    
    //スクール情報取得
    $.ajax({
        url: AJAX_URL + "oauth/apply.php",
        type: "POST",
        data: {
            url: url,
            type: "init"
        },
        success: function (arr) {
            var data = $.parseJSON(arr);
            $("#oauth_apply h1").html("<span>" + data.name + "</span>会員登録");
            $("#oauth_apply input[name='school_id']").val(data.school_id);
        }
    });
    
    //メールアドレスで登録
    $(document).on("click", "#mailadr", function () {
        $("form").show();
    });

    //メールアドレスで登録
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
                minlength: 6,
                maxlength: 20
            }
        },
        messages: {
            name: {
                required: "お名前を入力してください"
            },
            email: {
                required: "メールアドレスを入力してください",
                email: "正しいメールアドレスを入力してください"
            },
            password: {
                required: "パスワードを入力してください",
                pwcheck: "パスワードは半角英数字で入力してください",
                minlength: "パスワードは6文字以上で入力してください",
                maxlength: "パスワードは20文字以内で入力してください"
            }
        },
        submitHandler: function () {

            var $form = $("form");
            var data = $form.serialize();

            $.ajax({
                url: AJAX_URL + "oauth/apply.php",
                type: "POST",
                data: data + "&type=add",
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
                            "login_id":data.login_id,
                            "token":data.token,
                            "kubun":data.kubun,
                            "name":data.name,
                            "regist": 1
                        });
                        localStorage.setItem("user", JSON.stringify(user));
                        //生徒登録
                        window.location.href = "../../student/add/" + url;
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
