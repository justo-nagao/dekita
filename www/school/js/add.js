/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);

    //URL書換え
    $(document).on("input", "input[name='url']", function () {
        $("#url em").text($(this).val());
    });

    var app = new Vue({
        el: "#container",
        data: {
            pic: PICTURE
        }
    });

    //LINEからコールバック
    if ($(location).attr("search") !== "") {
        var login_id = getParam("login_id");
        var token = getParam("token");
        var kubun = getParam("kubun");
        var name = getParam("name");
        var user = [];
        user.push({
            "login_id": login_id,
            "token": token,
            "kubun": kubun,
            "name": name,
            "regist": 1
        });
        localStorage.setItem("user", JSON.stringify(user));
    }
    //メールアドレスの場合はローカルから取得
    else {
        var login_id = LOGIN_ID;
        var token = TOKEN;
    }

    $("form").validate({

        rules: {
            name: {
                required: true,
            },
            url: {
                required: true,
                uri: true
            },
            zip: {
                required: true
            },
            pref: {
                required: true,
            },
            addr: {
                required: true,
            }
        },
        messages: {
            name: {
                required: "スクール名を入力してください"
            },
            url: {
                required: "スクールアドレスを入力してください",
                uri: "スクールアドレスは半角英数字で入力してください",
            },
            zip: {
                required: "郵便番号を入力してください"
            },
            pref: {
                required: "都道府県を入力してください"
            },
            addr: {
                required: "住所を入力してください"
            }
        },
        submitHandler: function () {

            var $form = $("form");
            var data = $form.serialize();
            $.ajax({
                url: AJAX_URL + "school/add.php",
                type: "POST",
                data: {
                    data: data,
                    login_id: login_id,
                    token: token,
                    authority: AUTHORITY,
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {
                    var data = $.parseJSON(arr);
                    if (data == null) {
                        fadeError("登録済みのスクールアドレスです");
                    } else {
                        var school = [];
                        school.push({
                            "school_id": data.school_id,
                            "name": data.name,
                            "url": data.url,
                            "role": data.role
                        });
                        localStorage.setItem("school", JSON.stringify(school));

                        //クラス登録
                        window.location.href = "../class/add/" + data.url;
                    }
                }
            });
        }
    });

    //URIチェック
    $.validator.addMethod("uri", function (val, elem) {
        var reg = new RegExp(/^[a-zA-Z0-9-_]*$/);
        return this.optional(elem) || reg.test(val);
    });

});
