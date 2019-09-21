/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);

    //レッスン日追加
    addLesson();

    //パラメータ取得
    var param = location.search;
    var url = getParam("id", param);
    var schoollists = JSON.parse(localStorage.getItem("school"));
    var filtered = $.grep(schoollists, function (elem, index) {
        return (elem.url == url);
    });
    var school_name = filtered[0].name;
    var app = new Vue({
        el: "#container",
        data: {
            url: url,
            school_name: school_name
        }
    });

    /**
     *  フォーム送信
     */
    $("form").validate({
        rules: {
            name: {
                required: true,
            }
        },
        messages: {
            name: {
                required: "クラス名を入力してください"
            }
        },
    });

    $("form").on("submit", function (event) {

        $(".often_start").each(function () {
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
                url: AJAX_URL + "class/add.php",
                type: "POST",
                data: {
                    data: data,
                    url: url,
                    login_id: LOGIN_ID,
                    token: TOKEN
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {
                    if (arr !== null) {
                        var data = $.parseJSON(arr);
                        var class_id = data;
                        window.location.href = "../lesson/add.html?id=" + url + "&class=" + class_id;
                    } else {
                        fadeError("登録に失敗しました");
                    }
                }
            });
        } else {
            fadeError("入力内容に正しく入力してください");
        }
    });

    //レッスン日追加
    function addLesson() {
        var deletebtn = "";
        var num = $(".lesson").length;
        if (num !== 0) {
            deletebtn = "<a href='javascript:void(0)' class='delete'></div>";
        }
        var lesson = "<div class='lesson'>" +
            "<ul>" +
            "<li><em>曜日</em><select name='lesson[" + num + "][week]' class='week'>" +
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
            deletebtn +
            "</div>";

        $("#lessonday").append(lesson);

        //前入力内容コピー
        var num = $("#lessonday .lesson").length;
        if (num > 1) {
            var prev = num - 2;
            var next = num - 1;
            var week = $("#lessonday .lesson:eq(" + prev + ") .week option:selected").val();
            var start_time = $("#lessonday .lesson:eq(" + prev + ") .start_time").val();
            var end_time = $("#lessonday .lesson:eq(" + prev + ") .end_time").val();
            var vacancy = $("#lessonday .lesson:eq(" + prev + ") .vacancy").val();
            var transfer = $("#lessonday .lesson:eq(" + prev + ") .transfer").val();
            $("#lessonday .lesson:eq(" + next + ") .week").val(week);
            $("#lessonday .lesson:eq(" + next + ") .start_time").val(start_time);
            $("#lessonday .lesson:eq(" + next + ") .end_time").val(end_time);
            $("#lessonday .lesson:eq(" + next + ") .transfer").val(transfer);
            $("#lessonday .lesson:eq(" + next + ") .vacancy").val(vacancy);
        }
    }

    //レッスン設定ボタン
    $(document).on("click", "#adds", function () {
        addLesson();
    });

    //レッスン削除ボタン
    $(document).on("click", ".delete", function () {
        $(this).parent().remove();
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
