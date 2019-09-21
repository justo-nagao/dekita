/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {
    
    //会員認証
    basicAuth(LOGIN_ID, TOKEN);

    //3分間操作がない場合はリロード
    $(document).idleTimeout({
        idleTimeLimit: RELOAD_TIME,
        redirectUrl: location.href,
        enableDialog: false
    });

    $("#loading").show();
    
    //パラメータ取得
    var param = location.search;
    var url = getParam("id", param);
    var tdate = getParam("tdate", param);
    var tclass = getParam("class", param);
    var class_id = "";
    var schoollists = JSON.parse(localStorage.getItem("school"));
    var filtered = $.grep(schoollists, function (elem, index) {
        return (elem.url == url);
    });
    var school_name = filtered[0].name;
    var app = new Vue({
        el: "#container",
        data: {
            url: url,
            tclass: tclass,
            school_name: school_name
        }
    });

    /**
     *  カレンダー取得
     */
    $.ajax({
        url: AJAX_URL + "lesson/mcalendar.php",
        type: "POST",
        data: {
            url: url,
            login_id: LOGIN_ID,
            type: "init"
        },
        success: function (arr) {
            
            var data = $.parseJSON(arr);

            //クラス選択
            var classes = "<option value='0'>すべてのクラス</option>";
            $.each(data.class, function (index, elem) {
                classes = classes + "<option value='" + elem.class_id + "'>" + elem.name + "</option>";
            });
            $("select.class").append(classes);

            //クラスの指定
            if (tclass == undefined) {
                class_id = $(".period select option:eq(0)").val();
            } else {
                class_id = tclass;
                $("select").val(class_id);
            }

            //追加するクラスURL書替え
            attrAddUrl();
            displayLessonList(class_id, url);

            $("#loading").hide();

            //カレンダーフリック
            $("#monthly").bind("touchstart", onTouchStart);
            $("#monthly").bind("touchmove", onTouchMove);
            $("#monthly").bind("touchend", onTouchEnd);
        }
    });

    /**
     *  クラス選択時
     */
    $(document).on("change", "select", function () {
        var class_id = $(this).val();
        //追加するクラスURL書替え
        attrAddUrl();
        displayLessonList(class_id, url);
    });

    /**
     *  日選択
     *  詳細画面表示
     */
    $(document).on("click", "#monthly .calendar td", function () {

        var day = $(this).attr("data-day");
        var tdate = new Date(day);
        var tdate_y = tdate.getFullYear();
        var tdate_m = tdate.getMonth() + 1;
        var tdate_d = tdate.getDate();
        var tdate_w = tdate.getDay();
        var tdate_h = tdate.getHours();
        var tdate_s = tdate.getMinutes();
        var tdate_at = tdate_y + "/" + tdate_m + "/" + tdate_d;
        var lesson = "";
        var logs = "";
        var status = "";

        $.ajax({
            url: AJAX_URL + "lesson/mcalendar.php",
            type: "POST",
            data: {
                url: url,
                tdate_at: tdate_at,
                type: "detail"
            },
            success: function (arr) {
                $("#lesson_detail main").empty();
                $("#lesson_detail main").append(arr);
            }
        });

        $("#lesson_detail h1").text(tdate_y + "年" + tdate_m + "月" + tdate_d + "日(" + weekArray[tdate_w] + ")");
        openModal("lesson_detail");
    });

    /**
     *  レッスン日編集画面表示
     */
    $(document).on("click", "#lesson_detail .edit", function () {
        var lesson_id = $(this).parent().parent().parent().parent().attr("data-lesson");
        var lesson_date = $(this).parent().parent().parent().parent().attr("data-date");
        var lesson_start = $(this).parent().parent().parent().parent().attr("data-start");
        var lesson_end = $(this).parent().parent().parent().parent().attr("data-end");
        var class_name = $(this).parent().parent().parent().parent().attr("data-name");
        var vacancy = $(this).parent().parent().parent().parent().attr("data-vacancy");
        $("#lesson_edit").show();
        $("#lesson_edit #class_name").text(class_name);
        $("#lesson_edit input[name='lesson_date']").val(lesson_date);
        $("#lesson_edit input[name='start_time']").val(lesson_start);
        $("#lesson_edit input[name='end_time']").val(lesson_end);
        $("#lesson_edit input[name='vacancy']").val(vacancy);
        $("#lesson_edit input[name='lesson_id']").val(lesson_id);
    });

    /**
     *  レッスン日編集画面表示
     */
    $(document).on("click", "#btn_edit_lesson", function () {
        var lesson_id = $("#lesson_edit input[name='lesson_id']").val();
        var lesson_date = $("#lesson_edit input[name='lesson_date']").val();
        var start_time = $("#lesson_edit input[name='start_time']").val();
        var end_time = $("#lesson_edit input[name='end_time']").val();
        var vacancy = $("#lesson_edit input[name='vacancy']").val();
        $.ajax({
            url: AJAX_URL + "lesson/mcalendar.php",
            type: "POST",
            data: {
                lesson_id: lesson_id,
                lesson_date: lesson_date,
                start_time: start_time,
                end_time: end_time,
                lesson_date: lesson_date,
                vacancy: vacancy,
                login_id: LOGIN_ID,
                type: "edit_lesson"
            },
            success: function (arr) {
                $("#lesson_edit").hide();
                fadeNotice("レッスンを変更しました");
            }
        });
    });

    /**
     *  欠席or振替追加
     *  項目追加
     */
    $(document).on("click", ".lesson .content .reg", function () {

        var lesson_id = $(this).parent().parent().attr("data-lesson");
        var class_id = $(this).parent().parent().attr("data-class");
        var branch_id = $(this).parent().parent().attr("data-branch");
        var html = "<div class='set'>" +
            "<select name='type'>" +
            "<option value='absent'>欠席</option>" +
            "<option value='transfer'>振替</option>" +
            "</select>" +
            "<select name='student'>" +
            "</select>" +
            "<a href='javascript:void(0)' data-id='" + lesson_id + "' class='regist'>登録</a>" +
            "<input type='text' name='student_name' placeholder='名前を入力'>" +
            "</div>";

        $(this).parent().find(".apply").empty();
        $(this).parent().find(".apply").append(html);

        //履修者取得
        $.ajax({
            url: AJAX_URL + "lesson/mcalendar.php",
            type: "POST",
            data: {
                class_id: class_id,
                branch_id: branch_id,
                type: "student"
            },
            success: function (arr) {
                $(".lesson[data-lesson='" + lesson_id + "'] select[name='student']").empty();
                $(".lesson[data-lesson='" + lesson_id + "'] select[name='student']").append(arr);
                if ($(".lesson[data-lesson='" + lesson_id + "'] select[name='student']").val() == 0) {
                    $(".lesson[data-lesson='" + lesson_id + "'] input[name='student_name']").show();
                }
            }
        });
    });

    /**
     *  未登録者選択
     */
    $(document).on("change", "#lesson_detail .apply select[name='student']", function () {
        if ($(this).val() == 0) {
            $(this).parent().find("input").show();
        } else {
            $(this).parent().find("input").hide();
        }
    });

    /**
     * 欠席or振替キャンセル
     * キャンセル確認画面
     */
    $(document).on("click", ".lesson .log .delete", function () {
        $("#cancel").attr("data-request", $(this).attr("data-request"));
        $("#cancel").attr("data-lesson", $(this).attr("data-lesson"));
        $("#cancel").attr("data-student", $(this).attr("data-student"));
        $("#cancel").attr("data-name", $(this).attr("data-name"));
        $("#cancel").attr("data-expiration", $(this).attr("data-expiration"));
        $("#cancel").attr("data-date", $(this).attr("data-date"));
        $("#cancel").attr("data-start", $(this).attr("data-start"));
        $("#cancel").attr("data-type", $(this).attr("data-type"));
        openModal("cancel");
    });

    //キャンセル確認
    $(document).on("click", "#cancel #btn_cancel", function () {

        var request_id = $("#cancel").attr("data-request");
        var lesson_id = $("#cancel").attr("data-lesson");
        var student_id = $("#cancel").attr("data-student");
        var student_name = $("#cancel").attr("data-name");
        var expiration = $("#cancel").attr("data-expiration");
        var date = $("#cancel").attr("data-date");
        var start = $("#cancel").attr("data-start");
        var lesson_date = date + " " + start;
        var kubun = $("#cancel").attr("data-type");

        $.ajax({
            url: AJAX_URL + "lesson/mcalendar.php",
            type: "POST",
            data: {
                request_id: request_id,
                lesson_id: lesson_id,
                student_id: student_id,
                student_name: student_name,
                expiration: expiration,
                lesson_date: lesson_date,
                kubun: kubun,
                login_id: LOGIN_ID,
                type: "delete"
            },
            success: function (arr) {
                $("#lesson_detail").hide();
                $("#cancel").hide();
                fadeNotice("正常に取消しました", "");
            }
        });

    });

    /**
     * 欠席or振替登録
     * 登録確認画面
     */
    $(document).on("click", ".lesson .apply .regist", function () {

        var student_id = $(this).parent().find("select[name='student']").val();
        var student_name = $(this).parent().find("input[name='student_name']").val();
        var type = $(this).parent().find("select[name='type']").val();
        $("#regist").attr("data-id", $(this).parent().parent().parent().parent().attr("data-lesson"));
        $("#regist").attr("data-student", student_id);
        $("#regist").attr("data-name", student_name);
        $("#regist").attr("data-type", type);
        $("#regist").attr("data-date", $(this).parent().parent().parent().parent().attr("data-date"));
        $("#regist").attr("data-start", $(this).parent().parent().parent().parent().attr("data-start"));
        if (student_id == 0 && student_name == "") {
            fadeError("名前を入力してください");
        } else {
            openModal("regist");
        }
        if (type == "absent") {
            $("#regist p").text("欠席を登録しますか？");
        } else if (type == "transfer") {
            $("#regist p").text("振替を登録しますか？");
        }

    });

    //登録確認
    $(document).on("click", "#regist #btn_regist", function () {
        var lesson_id = $("#regist").attr("data-id");
        var student = $("#regist").attr("data-student");
        var kubun = $("#regist").attr("data-type");
        var student_name = $("#regist").attr("data-name");
        var date = $("#regist").attr("data-date");
        var start = $("#regist").attr("data-start");
        var lesson_date = date + " " + start;

        $.ajax({
            url: AJAX_URL + "lesson/mcalendar.php",
            type: "POST",
            data: {
                url: url,
                lesson_id: lesson_id,
                student_id: student,
                student_name: student_name,
                lesson_date: lesson_date,
                kubun: kubun,
                login_id: LOGIN_ID,
                type: "regist"
            },
            success: function (arr) {
                $("#lesson_detail").hide();
                $("#regist").hide();
                fadeNotice("正常に登録しました", "");
            }
        });

    });

    //追加するクラスURL書替え
    function attrAddUrl() {
        var addclass = 0;
        if (class_id == 0) {
            addclass = $(".period select option:eq(1)").val();
        } else {
            addclass = class_id;
        }
        $("header a.rightbtn").attr("href", "add.html?id=" + url + "&class=" + addclass + "");
    }

    /**
     * レッスン一覧取得
     * クラス選択後
     */
    function displayLessonList(class_id, url) {
        $.ajax({
            url: AJAX_URL + "lesson/mcalendar.php",
            type: "POST",
            data: {
                url: url,
                class_id: class_id,
                tdate: tdate,
                tclass: tclass,
                type: "lesson"
            },
            success: function (arr) {
                $("#monthly").empty();
                $("#monthly").append(arr);
            }
        });
    }

});

/**
 *  カレンダースワイプ時
 *  月移動
 */
function onTouchStart(event) {
    position = getPosition(event);
    direction = '';
}
//スワイプの方向（left／right）を取得
function onTouchMove(event) {
    if (position - getPosition(event) > 100) {
        direction = 'left';
    } else if (position - getPosition(event) < -100) {
        direction = 'right';
    }
}
//横方向の座標を取得
function getPosition(event) {
    return event.originalEvent.touches[0].pageX;
}
//月移動
function onTouchEnd(event) {
    if (direction == 'right') {
        var url = $("#monthly #prevmonth a").attr("href");
        window.location.href = url;
    } else if (direction == 'left') {
        var url = $("#monthly #nextmonth a").attr("href");
        window.location.href = url;
    }
}
//詳細閉じる
function onTouchClose(event) {
    if (direction == 'right') {
        $(this).hide();
    }
}
