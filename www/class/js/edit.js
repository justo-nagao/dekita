/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);

    //パラメータ取得
    var param = escapeHTML($(location).attr("pathname").replace(APP_PATH + "class/edit/", ""));
    var paramArray = param.split("/");
    var url = paramArray[0];
    var class_id = paramArray[1];
    var app = new Vue({
        el: "#container",
        data: {
            url: url
        }
    });

    $.ajax({
        url: AJAX_URL + "class/edit.php",
        type: "POST",
        data: {
            url: url,
            class_id: class_id,
            type: "init"
        },
        success: function (arr) {

            var data = $.parseJSON(arr);
            $("input[name='name']").val(data.name);
            $("select[name='genre']").val(data.genre);
            $("input[name='often']").val(data.often);
            $("input[name='often_type']").val([data.often_type]);
            $("select[name='often_week']").val(data.often_week);
            $("input[name='often_start']").val(data.often_start);
            $("input[name='often_end']").val(data.often_end);

            //対象選択
            $.each(data.target, function (index, t) {
                $(".checkbox-input[value='" + t.target_id + "']").prop("checked", true);
            });

            //ブランチ表示
            $.each(data.branch, function (index, elem) {
                addLesson();
                $("#lesson" + index + "").attr("data-id", elem.branch_id);
                $("#lesson" + index + " .branch").val(elem.branch_id);
                $("#lesson" + index + " .week").val(elem.week);
                $("#lesson" + index + " .start_time").val(elem.start_time);
                $("#lesson" + index + " .end_time").val(elem.end_time);
                $("#lesson" + index + " .vacancy").val(elem.vacancy);
                $("#lesson" + index + " .transfer").val(elem.transfer);
                $("#lesson" + index + " .branch_id").val(elem.branch_id);
                if (elem.transfer == 0) {
                    //$("#lesson" + index + " .vacancy").prop("disabled", true);
                    //$("#lesson" + index + " .vacancy").val(0);
                }
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
                    required: ""
                }
            })
        });
        $(".often").each(function () {
            $(this).rules("add", {
                required: true,
                messages: {
                    required: ""
                }
            })
        });
        $(".week").each(function () {
            $(this).rules("add", {
                required: true,
                messages: {
                    required: ""
                }
            })
        });
        $(".start_time").each(function () {
            $(this).rules("add", {
                required: true,
                messages: {
                    required: ""
                }
            })
        });
        $(".end_time").each(function () {
            $(this).rules("add", {
                required: true,
                messages: {
                    required: ""
                }
            })
        });
        $(".vacancy").each(function () {
            $(this).rules("add", {
                required: true,
                messages: {
                    required: ""
                }
            })
        });

        event.preventDefault();

        //エラーなしの場合
        if ($("form").validate().form()) {

            var $form = $("form");
            var data = $form.serialize();

            $.ajax({
                url: AJAX_URL + "class/edit.php",
                type: "POST",
                data: {
                    data: data,
                    url: url,
                    class_id: class_id,
                    login_id: LOGIN_ID,
                    type: "update"
                },
                success: function (arr) {
                    var redirecturl = "../../../class/detail/" + url + "/" + class_id;
                    fadeNotice("保存しました", redirecturl);
                }
            });
        } else {
            fadeError("入力内容に正しく入力してください");
        }
    });

    //レッスン日追加
    function addLesson() {

        var num = $(".lesson").length;

        //削除ボタン
        var del = "";
        if (num !== 0) {
            del = "<a href='javascript:void(0)' class='delete'></div>";
        }

        var lesson = "<div class='lesson' id='lesson" + num + "'>" +
            "<input type='hidden' name='lesson[" + num + "][branch]' class='branch'>" +
            "<input type='hidden' name='lesson[" + num + "][delete]' class='delete' value='0'>" +
            "<ul>" +
            "<li><em>曜日</em>" +
            "<select name='lesson[" + num + "][week]' class='week'>" +
            "<option value='1'>月</option>" +
            "<option value='2'>火</option>" +
            "<option value='3'>水</option>" +
            "<option value='4'>木</option>" +
            "<option value='5'>金</option>" +
            "<option value='6'>土</option>" +
            "<option value='0'>日</option>" +
            "</select></li>" +
            "<li><em>開始</em><input type='time' name='lesson[" + num + "][start_time]' class='start_time' value='14:00'></li>" +
            "<li><em>終了</em><input type='time' name='lesson[" + num + "][end_time]' class='end_time' value='15:00'></li>" +
            "<li><em>振替</em><select name='lesson[" + num + "][transfer]' class='transfer'><option value='1'>可</option><option value='0'>不可</option></select></li>" +
            "<li><em>空き</em><input type='number' name='lesson[" + num + "][vacancy]' class='vacancy' placeholder='空き' value=1></li>" +
            "</ul>" +
            del +
            "</div>";
        $("#lessonday").append(lesson);
    }

    //レッスン設定ボタン
    $(document).on("click", "#adds", function () {
        addLesson();
    });

    //レッスン削除ボタン
    $(document).on("click", ".delete", function () {
        var num = $(".lesson").length;
        var branch = $(this).parent().attr("data-id");
        $(this).parent().css("display", "none");
        $(this).parent().find(".delete").val(1);
    });

    //削除確認画面
    $(document).on("click", "#show_delete", function () {
        $("#delete_win").show();
    });

    //削除処理
    $(document).on("click", "#btn_delete", function () {
        $.ajax({
            url: AJAX_URL + "ajax/class/edit.php",
            type: "POST",
            data: {
                class_id: class_id,
                login_id: LOGIN_ID,
                type: "delete"
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                fadeError("送信に失敗しました");
            },
            success: function (arr) {
                //クラス一覧
                window.location.href = "../../../class/list/" + url;
            }
        });
    });

    //回数開閉
    $(document).on("click", "input[name='often_type']", function () {
        if ($(this).val() == 0) {
            $("#often div").hide();
        } else {
            $("#often div").show();
        }
    });

});
