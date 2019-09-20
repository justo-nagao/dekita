/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);

    //パラメータ取得
    var param = escapeHTML($(location).attr("pathname").replace(APP_PATH + "staff/add/", ""));
    var paramArray = param.split("/");
    var url = paramArray[0];
    var app = new Vue({
        el: "#container",
        data: {
            url: url,
            pic: PICTURE
        }
    });

    //スクール情報取得
    var school_list = "";
    $.each(SCHOOL_DATA, function (index, school) {
        school_list = school_list +
            "<li><label><input type='checkbox' name='school[" + index + "][id]' class='belong checkbox-input' value='" + school.school_id + "'><span class='checkbox-parts'>" + school.name + "</span></label>" +
            "<ul>" +
            "<li><input type='radio' name='school[" + index + "][role]' class='radiobox' id='role1" + school.school_id + "' value='1' checked><label for='role1" + school.school_id + "'>管理者</label></li>" +
            "<li><input type='radio' name='school[" + index + "][role]' class='radiobox' id='role2" + school.school_id + "' value='2'><label for='role2" + school.school_id + "'>先生</label></li>" +
            "<li><input type='radio' name='school[" + index + "][role]' class='radiobox' id='role3" + school.school_id + "' value='3'><label for='role3" + school.school_id + "'>アシスタント</label></li>" +
            "</ul>" +
            "</li>";
    });
    $("#belong").empty();
    $("#belong").html(school_list);

    //所属開閉
    $(document).on("click", "#belong input", function () {
        if ($(this).prop("checked")) {
            $(this).parent().parent().find("ul").css("display", "flex");
        } else {
            $(this).parent().parent().find("ul").css("display", "none");
        }
    });

    /**
     *  フォーム送信
     */
    $("form").validate();
    $("form").on("submit", function (event) {

        $(".name").each(function () {
            $(this).rules("add", {
                required: true,
                messages: {
                    required: "氏名は必須入力です"
                }
            })
        });
        $(".belong").each(function () {
            $(this).rules("add", {
                required: true,
                messages: {
                    required: "所属は必須入力です"
                }
            })
        });

        event.preventDefault();

        //エラーなしの場合
        if ($("form").validate().form()) {

            var $form = $("form");
            var data = $form.serialize();

            $.ajax({
                url: AJAX_URL + "staff/add.php",
                type: "POST",
                data: {
                    data: data,
                    login_id: LOGIN_ID,
                    token: TOKEN
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {
                    fadeNotice("スタッフを登録しました", "../../staff/list/" + url);
                }
            });
        } else {
            fadeError("入力内容に正しく入力してください");
        }
    });
});
