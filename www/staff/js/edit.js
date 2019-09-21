/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);

    //パラメータ取得
    var param = location.search;
    var url = getParam("id", param);
    var staff_id = getParam("staff", param);
    var app = new Vue({
        el: "#container",
        data: {
            url: url,
            staff_id: staff_id
        }
    });

    //スクール情報取得
    var school_list = "";
    
    $.ajax({
        url: AJAX_URL + "staff/edit.php",
        type: "POST",
        data: {
            staff_id: staff_id,
            login_id: LOGIN_ID,
            token: TOKEN,
            type: "init"
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            fadeError("送信に失敗しました");
        },
        success: function (arr) {

            var data = $.parseJSON(arr);
            $("input[name='name']").val(data.name);
            $("input[name='email']").val(data.email);
            var school_list = "";
            var role_list = [];
            $.each(data.manager, function (key, elem) {
                var role = elem.role;
                role_list.push(role);
                school_list = school_list +
                    "<li><label><input type='checkbox' name='school[" + key + "][id]' class='belong checkbox-input' value='" + elem.school_id + "' checked><span class='checkbox-parts'>" + elem.name + "</span></label>" +
                    "<ul>" +
                    "<li><input type='radio' name='school[" + key + "][role]' class='radiobox' id='role1" + elem.school_id + "' value='1'><label for='role1" + elem.school_id + "'>管理者</label></li>" +
                    "<li><input type='radio' name='school[" + key + "][role]' class='radiobox' id='role2" + elem.school_id + "' value='2'><label for='role2" + elem.school_id + "'>先生</label></li>" +
                    "<li><input type='radio' name='school[" + key + "][role]' class='radiobox' id='role3" + elem.school_id + "' value='3'><label for='role3" + elem.school_id + "'>アシスタント</label></li>" +
                    "</ul>" +
                    "</li>";
            });
            $("#belong").empty();
            $("#belong").html(school_list);
            $.each(role_list, function (i, val) {
                var t = val - 1;
                $("#belong li ul:eq(" + i + ") li:eq(" + t + ") input").prop('checked', true);
            });
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
                url: AJAX_URL + "staff/edit.php",
                type: "POST",
                data: {
                    data: data,
                    staff_id: staff_id,
                    login_id: LOGIN_ID,
                    token: TOKEN,
                    type: "update"
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {
                    fadeNotice("正常に保存しました", "../staff/list.html?id=" + url);
                }
            });
        } else {
            fadeError("入力内容に正しく入力してください");
        }
    });





});
