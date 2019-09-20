/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);

    //一定期間操作がない場合はリロード
    $(document).idleTimeout({
        idleTimeLimit: RELOAD_TIME,
        redirectUrl: location.href,
        enableDialog: false
    });

    //パラメータ取得
    var param = escapeHTML($(location).attr("pathname").replace(APP_PATH + "lesson/calendar/", ""));
    var paramArray = param.split("/");
    var url = paramArray[0];
    var spec = paramArray[1];
    var specArray = spec.split("s");
    var tdate = specArray[0];
    var student = specArray[1];
    var student_id = "";
    var schoollists = JSON.parse(localStorage.getItem("school"));
    var filtered = $.grep(schoollists, function (elem, index) {
        return (elem.url == url);
    });
    var school_name = filtered[0].name;
    var app = new Vue({
        el: "#container",
        data: {
            url: url,
            pic: PICTURE,
            school_name: school_name
        }
    });

    $.ajax({
        url: AJAX_URL + "lesson/calendar.php",
        type: "POST",
        data: {
            url: url,
            login_id: LOGIN_ID,
            type: "init"
        },
        success: function (arr) {

            $("#loading").show();

            var data = $.parseJSON(arr);
            $("input[name='absent_type']").val(data[0].absent_type);
            $("input[name='absent_day']").val(data[0].absent_day);
            $("input[name='absent_hour']").val(data[0].absent_hour);
            $("input[name='absent_minutes']").val(data[0].absent_minutes);
            $("input[name='transfer_type']").val(data[0].transfer_type);
            $("input[name='transfer_day']").val(data[0].transfer_day);
            $("input[name='transfer_hour']").val(data[0].transfer_hour);
            $("input[name='transfer_minutes']").val(data[0].transfer_minutes);
            $("input[name='expiration_type']").val(data[0].expiration_type);
            $("input[name='expiration_day']").val(data[0].expiration_day);
            $("input[name='expiration_date']").val(data[0].expiration_date);
            $("input[name='range_type']").val(data[0].range_type);
            $("input[name='range_day']").val(data[0].range_day);
            $("input[name='range_date']").val(data[0].range_date);

            //生徒選択
            var students = "";
            $.each(data.student, function (index, val) {
                students = students + "<option value='" + val.student_id + "'>" + val.lastname + " " + val.firstname + "</option>";
            });
            $("select.student").append(students);

            //クラスの指定
            if (student == undefined) {
                student_id = $("select option:eq(0)").val();
            } else {
                student_id = student;
                $("select").val(student_id);
            }

            displayLessonList(student_id, url);

            //生徒名セット
            var student_name = $("select option:selected").text();
            $("#absence .student_name").text(student_name);
            $("#transfer .student_name").text(student_name);

            //カレンダーフリック
            $("#monthly").bind("touchstart", onTouchStart);
            $("#monthly").bind("touchmove", onTouchMove);
            $("#monthly").bind("touchend", onTouchEnd);
        }
    });

    /**
     *  生徒選択時
     */
    $(document).on("change", "select", function () {
        var student_id = $(this).val();
        displayLessonList(student_id, url);
    });

    /**
     *  履修クラス選択時
     */
    $(document).on("click", ".calendar .target, .calendar .absent", function () {

        var id = $(this).attr("data-id");
        var class_name = $(this).attr("data-classname");
        var date = $(this).attr("data-date");
        var datatime = $(this).attr("data-time");
        var tdate = dateJpFormat(date);
        var branch = $(this).attr("data-branch");
        var class_id = $(this).attr("data-class");
        var scrub = $(this).attr("data-scrub");
        var transfer = $(this).attr("data-transfer");

        var absent_type = $("input[name='absent_type']").val();
        var absent_hour = $("input[name='absent_hour']").val();
        var absent_minutes = $("input[name='absent_minutes']").val();
        var absent_day = $("input[name='absent_day']").val();
        var transfer_type = $("input[name='transfer_type']").val();
        var transfer_hour = $("input[name='transfer_hour']").val();
        var transfer_minutes = $("input[name='transfer_minutes']").val();
        var transfer_day = $("input[name='transfer_day']").val();

        if (absent_type == "time") {
            absent_deadline = (parseInt(absent_hour) * 60) + parseInt(absent_minutes);
        } else if (absent_type == "day") {
            absent_deadline = ((parseInt(absent_day) * 24) * 60) + parseInt(absent_minutes);
        }

        var deadline = 0;
        var starttime = $(this).text().replace("〜", "");
        var now = new Date();
        var target_datetime = new Date(date + " " + starttime);
        var deadline_datetime = new Date(target_datetime - (1000 * 60 * absent_deadline));

        if (absent_type == "time") {
            if (absent_hour !== "0") {
                if (absent_minutes == "0") {
                    absent_rule = "レッスン時間の" + absent_hour + "時間前まで";
                } else {
                    absent_rule = "レッスン時間の" + absent_hour + "時間" + absent_minutes + "分前まで";
                }
            } else {
                if(absent_minutes == "0"){
                   absent_rule = "レッスン開始まで";
                }
                else{
                   absent_rule = "レッスン時間の" + absent_minutes + "分前まで";
                }
            }
        } else {
            absent_rule = "レッスン日の" + absent_day + "日前まで";
        }

        if ($(this).hasClass("target")) {
            $("#absence .btns").show();
            $("#absence .btns li:eq(0)").show();
            $("#absence .btns li:eq(1)").hide();
            $("#absence .btns li:eq(2)").hide();
            $("#absence .btns li:eq(3)").hide();
            $("#absence .explain li").text("欠席申請は" + absent_rule + "にお願いします");
        } else if ($(this).hasClass("absent") && transfer == 0) {
            $("#absence .btns").show();
            $("#absence .btns li:eq(0)").hide();
            $("#absence .btns li:eq(1)").show();
            $("#absence .btns li:eq(2)").hide();
            $("#absence .btns li:eq(3)").hide();
            $("#absence .explain li").text("欠席キャンセルは" + absent_rule + "にお願いします");
        } else if (transfer !== "0") {
            $("#absence .btns").show();
            $("#absence .btns li:eq(0)").hide();
            $("#absence .btns li:eq(1)").hide();
            $("#absence .btns li:eq(2)").hide();
            $("#absence .btns li:eq(3)").show();
            $("#absence .explain li").text("振替済の欠席はキャンセルできません");
        }

        //期限切れ
        if (now > deadline_datetime) {
            deadline = 1;
            $("#absence .btns li:eq(0)").hide();
            $("#absence .btns li:eq(1)").hide();
            $("#absence .btns li:eq(2)").show();
            $("#absence .btns li:eq(3)").hide();
        }

        $("#absence").show();
        $("#absence h1").html("<span>" + tdate + "</span>" + class_name + "");
        $("#absence .tdate").text(tdate + " " + datatime);
        $("#absence input[name='lesson_id']").val(id);
        $("#absence input[name='lesson_date']").val(date);
        $("#absence input[name='transfer']").val(transfer);
        $("#absence input[name='scrub']").val(scrub);

        //詳細閉じる
        $("#absence").bind("touchstart", onTouchStart);
        $("#absence").bind("touchmove", onTouchMove);
        $("#absence").bind("touchend", onTouchClose);

    });

    /**
     *  欠席処理
     */
    $(document).on("click", "#btn_absent", function () {

        var lesson_id = $("#absence input[name='lesson_id']").val();
        var lesson_date = $("#absence input[name='lesson_date']").val();

        $.ajax({
            url: AJAX_URL + "lesson/calendar.php",
            type: "POST",
            data: {
                url: url,
                login_id: LOGIN_ID,
                student_id: student_id,
                lesson_id: lesson_id,
                lesson_date: lesson_date,
                type: "absent"
            },
            success: function (arr) {
                if (arr == "success") {
                    $("#absence").hide();
                    $(".plan[data-id='" + lesson_id + "']").removeClass("target");
                    $(".plan[data-id='" + lesson_id + "']").addClass("absent");
                    var uri = "../../../lesson/calendar/" + url + "/" + tdate + "s" + student_id + "";
                    fadeNotice("欠席申請が完了しました", uri);
                } else {
                    var uri = "../../../lesson/calendar/" + url + "/" + tdate + "s" + student_id + "";
                    fadeError("欠席申請に失敗しました", uri);
                }
            }
        });

    });

    /**
     *  欠席キャンセル
     */
    $(document).on("click", "#btn_absent_cancel", function () {

        var lesson_id = $("#absence input[name='lesson_id']").val();
        var lesson_date = $("#absence input[name='lesson_date']").val();
        var transfer = $("#absence input[name='transfer']").val();
        var scrub = $("#absence input[name='scrub']").val();

        $.ajax({
            url: AJAX_URL + "lesson/calendar.php",
            type: "POST",
            data: {
                url: url,
                login_id: LOGIN_ID,
                student_id: student_id,
                lesson_id: lesson_id,
                lesson_date: lesson_date,
                scrub: scrub,
                transfer: transfer,
                type: "absent_cancel"
            },
            success: function (arr) {
                if (arr == "success") {
                    $("#absence").hide();
                    $(".plan[data-id='" + lesson_id + "']").removeClass("absent");
                    $(".plan[data-id='" + lesson_id + "']").addClass("target");
                    var uri = "../../../lesson/calendar/" + url + "/" + tdate + "s" + student_id + "";
                    fadeNotice("欠席をキャンセルしました", uri);
                } else {
                    var uri = "../../../lesson/calendar/" + url + "/" + tdate + "s" + student_id + "";
                    fadeError("キャンセルに失敗しました", uri);
                }
            }
        });
    });

    /**
     *  振替ウィンドウ
     *  空きクラス選択時
     *  満席クラス選択時
     */
    $(document).on("click", ".calendar .vacancy, .calendar .full, .calendar .transfer", function () {

        var id = $(this).attr("data-id");
        var class_name = $(this).attr("data-classname");
        var date = $(this).attr("data-date");
        var datatime = $(this).attr("data-time");
        var tdate = dateJpFormat(date);
        var branch = $(this).attr("data-branch");
        var class_id = $(this).attr("data-class");

        var transfer_type = $("input[name='transfer_type']").val();
        var transfer_hour = $("input[name='transfer_hour']").val();
        var transfer_minutes = $("input[name='transfer_minutes']").val();
        var transfer_day = $("input[name='transfer_day']").val();

        if (transfer_type == "time") {
            transfer_deadline = (parseInt(transfer_hour) * 60) + parseInt(transfer_minutes);
        } else if (transfer_type == "day") {
            transfer_deadline = ((parseInt(transfer_day) * 24) * 60) + parseInt(transfer_minutes);
        }

        var available = $("#monthly .calhead").attr("data-available");
        var deadline = 0;
        var starttime = $(this).text().replace("〜", "");
        var now = new Date();
        var target_datetime = new Date(date + " " + starttime);
        var deadline_datetime = new Date(target_datetime - (1000 * 60 * transfer_deadline));

        if (transfer_type == "time") {
            if (transfer_hour !== "0") {
                if (transfer_minutes == "0") {
                    transfer_rule = "レッスン時間の" + transfer_hour + "時間前まで";
                } else {
                    transfer_rule = "レッスン時間の" + transfer_hour + "時間" + transfer_minutes + "分前まで";
                }
            } else {
                if(transfer_minutes == 0){
                   transfer_rule = "レッスン開始まで";
                }
                else{
                   transfer_rule = "レッスン時間の" + transfer_minutes + "分前まで";
                }
            }
        } else {
            transfer_rule = "レッスン日の" + transfer_day + "日前まで";
        }

        if ($(this).hasClass("full")) {
            $("#transfer .btns li:eq(0)").hide();
            $("#transfer .btns li:eq(1)").hide();
            $("#transfer .btns li:eq(2)").show();
            $("#transfer .explain li").text("振替可能な空きがありません");
        } else if ($(this).hasClass("vacancy")) {
            $("#transfer .btns li:eq(0)").show();
            $("#transfer .btns li:eq(1)").hide();
            $("#transfer .btns li:eq(2)").hide();
            $("#transfer .explain li").text("振替申請は" + transfer_rule + "にお願いします");
        } else if ($(this).hasClass("transfer")) {
            $("#transfer .btns li:eq(0)").hide();
            $("#transfer .btns li:eq(1)").show();
            $("#transfer .btns li:eq(2)").hide();
            $("#transfer .explain li").text("振替キャンセルは" + transfer_rule + "にお願いします");
        }

        //期限切れ
        if (now > deadline_datetime) {
            deadline = 1;
            $("#transfer .btns li:eq(0)").hide();
            $("#transfer .btns li:eq(1)").hide();
            $("#transfer .btns li:eq(2)").show();
        }
        //振替可能なし
        if (available == 0 && !$(this).hasClass("transfer")) {
            $("#transfer .btns li:eq(0)").hide();
            $("#transfer .btns li:eq(1)").hide();
            $("#transfer .btns li:eq(2)").show();
        }

        $("#transfer").show();
        $("#transfer h1").html("<span>" + tdate + "</span>" + class_name + "");
        $("#transfer .tdate").text(tdate + " " + datatime);
        $("#transfer input[name='lesson_id']").val(id);
        $("#transfer input[name='lesson_date']").val(date);

        //詳細閉じる
        $("#transfer").bind("touchstart", onTouchStart);
        $("#transfer").bind("touchmove", onTouchMove);
        $("#transfer").bind("touchend", onTouchClose);

    });

    /**
     *  振替処理
     */
    $(document).on("click", "#btn_transfer", function () {

        var lesson_id = $("#transfer input[name='lesson_id']").val();
        var lesson_date = $("#transfer input[name='lesson_date']").val();

        $.ajax({
            url: AJAX_URL + "lesson/calendar.php",
            type: "POST",
            data: {
                url: url,
                login_id: LOGIN_ID,
                student_id: student_id,
                lesson_id: lesson_id,
                lesson_date: lesson_date,
                type: "transfer"
            },
            success: function (arr) {
                if (arr == "success") {
                    $("#transfer").hide();
                    $(".plan[data-id='" + lesson_id + "']").removeClass("vacancy");
                    $(".plan[data-id='" + lesson_id + "']").addClass("transfer");
                    var uri = "../../../lesson/calendar/" + url + "/" + tdate + "s" + student_id + "";
                    fadeNotice("振替処理が完了しました", uri);
                } else {
                    var uri = "../../../lesson/calendar/" + url + "/" + tdate + "s" + student_id + "";
                    fadeNotice("振替処理に失敗しました", uri);
                }
            }
        });
    });

    /**
     *  振替キャンセル
     */
    $(document).on("click", "#btn_transfer_cancel", function () {

        var lesson_id = $("#transfer input[name='lesson_id']").val();
        var lesson_date = $("#transfer input[name='lesson_date']").val();

        $.ajax({
            url: AJAX_URL + "lesson/calendar.php",
            type: "POST",
            data: {
                url: url,
                login_id: LOGIN_ID,
                student_id: student_id,
                lesson_id: lesson_id,
                lesson_date: lesson_date,
                type: "transfer_cancel"
            },
            success: function (arr) {

                if (arr == "success") {
                    $("#transfer").hide();
                    $(".plan[data-id='" + lesson_id + "']").removeClass("transfer");
                    $(".plan[data-id='" + lesson_id + "']").addClass("vacancy");
                    var uri = "../../../lesson/calendar/" + url + "/" + tdate + "s" + student_id + "";
                    fadeNotice("振替をキャンセルしました", uri);
                } else {
                    var uri = "../../../lesson/calendar/" + url + "/" + tdate + "s" + student_id + "";
                    fadeNotice("振替キャンセルに失敗しました", uri);
                }

            }
        });
    });

    /**
     * レッスン一覧取得
     * クラス選択後
     */
    function displayLessonList(student_id, url) {
        $.ajax({
            url: AJAX_URL + "lesson/calendar.php",
            type: "POST",
            data: {
                url: url,
                student_id: student_id,
                tdate: tdate,
                type: "lesson"
            },
            success: function (arr) {
                $("#monthly").empty();
                $("#monthly").append(arr);
                $("#loading").hide();
                var available = $("#monthly .calhead").attr("data-available");
                $(".period dd").text(available);
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
