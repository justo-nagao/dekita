/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);

    //新規登録の場合
    if (AUTHORITY == "guest") {
        $("#new_explain").show();
    }
    
    //パラメータ取得
    var param = location.search;
    var url = getParam("id", param);
    var class_id = getParam("class", param);
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

    var startmonth = $("#startmonth").val();
    var endmonth = $("#endmonth").val();
    var start_at = "";
    var end_at = "";

    //開始と終了が空の場合
    if (startmonth == "" && endmonth == "") {

        var start = new Date();
        var start_y = start.getFullYear();
        var start_m = start.getMonth() + 1;
        var start_d = start.getDate();
        start_at = start_y + "-" + addZero(start_m);

        var end = new Date();
        end.setMonth(end.getMonth() + REPEAT_MONTH_NUM);
        var end_y = end.getFullYear();
        var end_m = end.getMonth() + 1;
        var end_d = end.getDate();
        var last_d = new Date(end_y, end_m, 0);
        last_d = last_d.getDate();
        end_at = end_y + "-" + addZero(end_m);
    }

    $("#startmonth").val(start_at);
    $("#endmonth").val(end_at);

    showCalendar(LOGIN_ID, url, class_id, start_at, end_at);

    /**
     *  カレンダー作成
     *  初期表示
     */

    function showCalendar(login_id, url, class_id, start_at, end_at) {
        $.ajax({
            url: AJAX_URL + "lesson/add.php",
            type: "POST",
            data: {
                login_id: login_id,
                url: url,
                class_id: class_id,
                start_at: start_at,
                end_at: end_at,
                type: "select"
            },
            success: function (arr) {
                $("#monthly").empty();
                $("#monthly").append(arr);
                //ブランチ作成
                $.ajax({
                    url: AJAX_URL + "lesson/add.php",
                    type: "POST",
                    data: {
                        login_id: login_id,
                        url: url,
                        class_id: class_id,
                        type: "branch"
                    },
                    success: function (arr) {
                        $("#edit_lesson select").empty();
                        $("#edit_lesson select").append(arr);
                        $("#add_lesson select").empty();
                        $("#add_lesson select").append(arr);
                    }
                });
            }
        });
    }

    /**
     *  カレンダー作成
     *  追加クリック
     */
    $(document).on("click", "#insert", function () {
        $("#loading").show();
        var obj = {};
        $(".plan").each(function (i) {
            var id = $(this).data("id");
            var date = $(this).data("date");
            var start = $(this).data("start");
            var end = $(this).data("end");
            obj[i] = {
                id: id,
                date: date,
                start: start,
                end: end
            };
        });
        $.ajax({
            url: AJAX_URL + "lesson/add.php",
            type: "POST",
            data: {
                login_id: LOGIN_ID,
                obj: obj,
                type: "insert"
            },
            success: function (arr) {
                $("#loading").hide();
                var data = $.parseJSON(arr);
                //ローカルデータ更新
                setLocalStorage(data);
                //新規登録の場合
                if (AUTHORITY == "guest") {
                    $("#new_regist").show();
                } else {
                    fadeNotice("レッスンを追加いたしました", "../lesson/mcalendar.html?id=" + url + "");
                }
            }
        });
    });

    /**
     *  期間変更
     *  カレンダーリロード
     */

    //ウィンドウ開く
    $(document).on("change", ".period input", function () {
        $("#change_period").show();
    });

    //キャンセル
    $(document).on("click", "#change_period #cancel", function () {
        $("#change_period").hide();
    });

    //期間変更処理
    $(document).on("click", "#change_period #ok", function () {
        var startmonth = $(".period #startmonth").val();
        var endmonth = $(".period #endmonth").val();
        showCalendar(LOGIN_ID, url, class_id, startmonth, endmonth);
        $("#change_period").hide();
    });


    /**
     *  予定変更処理
     *  追加＆変更
     */

    //予定追加画面
    $(document).on("click", "#monthly .add", function () {
        var targetday = $(this).parent().parent().data("day");
        var target = new Date(targetday);
        var target_y = target.getFullYear();
        var target_m = target.getMonth() + 1;
        var target_d = target.getDate();
        var target_w = target.getDay();
        $("#add_lesson").show();
        $("#add_lesson input[type='date']").val(target_y + "-" + addZero(target_m) + "-" + addZero(target_d));
        $("#add_lesson").attr("data-target", targetday);
        var selected = $("#add_lesson option:selected").text();
        var starttime = selected.slice(2, 7);
        var endtime = selected.slice(10, 15);
        $("#add_lesson input[name='start_time']").val(starttime);
        $("#add_lesson input[name='end_time']").val(endtime);
    });

    //予定追加
    $(document).on("click", "#add_lesson #add", function () {
        var target = $(this).parent().parent().parent().parent().parent().parent().attr("data-target");
        var str = $(this).parent().parent().parent().parent().find("select").val();
        var branch_id = $("#add_lesson option:selected").val();
        var starttime = $("#add_lesson input[name='start_time']").val();
        var endtime = $("#add_lesson input[name='end_time']").val();
        var lesson = "<div class='plan future' data-date='" + target + "' data-start='" + starttime + "' data-end='" + endtime + "' data-id='" + branch_id + "'>" + starttime + "〜</div>";
        $(".calendar td[data-day='" + target + "']").append(lesson);
        $("#add_lesson").hide();
    });

    //予定編集画面
    $(document).on("click", "#monthly .future", function () {
        var targetday = $(this).data("date");
        var branch_id = $(this).data("id");
        var starttime = $(this).data("start");
        var endtime = $(this).data("end");
        var target = new Date(targetday);
        var target_y = target.getFullYear();
        var target_m = target.getMonth() + 1;
        var target_d = target.getDate();
        var target_w = target.getDay();
        $("#edit_lesson").show();
        $("#edit_lesson").attr("data-target", targetday);
        $("#edit_lesson input[type='date']").val(target_y + "-" + addZero(target_m) + "-" + addZero(target_d));
        $("#edit_lesson select").val(branch_id);
        $("#edit_lesson input[name='start_time']").val(starttime);
        $("#edit_lesson input[name='end_time']").val(endtime);
    });

    //予定変更
    $(document).on("click", "#edit_lesson #edit", function () {
        //一旦削除
        var target = $(this).parent().parent().parent().parent().parent().parent().attr("data-target");
        var branch_id = $(this).parent().parent().parent().parent().find("select").val();
        $(".calendar tbody td[data-day='" + target + "'] .plan[data-id='" + branch_id + "']").remove();
        //追加
        var branch_id = $("#edit_lesson option:selected").val();
        var lesson_date = $("#edit_lesson input[name='lesson_date']").val();
        var starttime = $("#edit_lesson input[name='start_time']").val();
        var endtime = $("#edit_lesson input[name='end_time']").val();
        var lesson = "<div class='plan future' data-date='" + lesson_date + "' data-start='" + starttime + "' data-end='" + endtime + "' data-id='" + branch_id + "'>" + starttime + "〜</div>";
        $(".calendar td[data-day='" + lesson_date + "']").append(lesson);
        $("#edit_lesson").hide();
    });

    //予定削除
    $(document).on("click", "#edit_lesson #delete", function () {
        var target = $(this).parent().parent().parent().attr("data-target");
        var branch_id = $(this).parent().parent().parent().find("select").val();
        $(".calendar tbody td[data-day='" + target + "'] .plan[data-id='" + branch_id + "']").remove();
        $("#edit_lesson").hide();
    });

    //確認画面閉じる
    $(document).on("click", "#new_regist a, #new_explain a", function () {
        $(this).parent().parent().parent().hide();
    });

});
