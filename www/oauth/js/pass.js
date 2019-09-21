/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    
    //パラメータ取得
    var url = escapeHTML($(location).attr("pathname").replace(APP_PATH + "oauth/pass/", ""));

    //スクール情報取得
    $.ajax({
        url: AJAX_URL + "oauth/pass.php",
        type: "POST",
        data: {
            url: url,
            type: "init"
        },
        success: function (arr) {
            if (arr !== "null") {
                var data = $.parseJSON(arr);
                $("#oauth_pass h1").html("<span>" + data.name + "</span>会員登録");
                $("#oauth_pass input[name='school_id']").val(data.school_id);
            } else {
                fadeError("存在しないURLです", "../../error/404.html");
            }
        }
    });

    //パスコード送信
    $("form").validate({
        rules: {
            passcode: {
                required: true,
                number: true,
                minlength: 4,
                maxlength: 4
            }
        },
        messages: {
            passcode: {
                required: "パスコードを入力してください",
                number: "パスコードは数字で入力してください",
                minlength: "パスコードは4桁で入力してください",
                maxlength: "パスコードは4桁で入力してください"
            }
        },
        submitHandler: function () {
            
            var $form = $("form");
            var data = $form.serialize();
            
            $.ajax({
                url: AJAX_URL + "oauth/pass.php",
                type: "POST",
                data: data + "&type=passcode&url="+url,
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {
                    
                    var data = $.parseJSON(arr);
                    //存在しない
                    if (data == null) {
                        fadeError("正しいパスコードを入力してください");
                    }
                    //成功の場合
                    else {
                        //登録済
                        if(data.type=="linkage"){
                           window.location.href = "../oauth/linkage.html?id=" + url +"&login=" + data.login_id;
                        }
                        //未登録
                        else if(data.type=="apply"){
                            window.location.href = "../oauth/apply.html?id=" + url;
                        }
                    }
                }
            });
        }
    });
    
});
