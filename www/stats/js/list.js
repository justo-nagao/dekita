/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);

    $.ajax({
        url: AJAX_URL + "stats/list.php",
        type: "POST",
        success: function (arr) {
            var data = $.parseJSON(arr);
            var str = "";
            $.each(data, function (index, elem) {
                var classes = "";
                $.each(elem.class, function (i, val) {
                    var branch = "";
                    $.each(val.branch, function (i, b) {
                        branch = branch + "<li>" + weekArray[b.week] + "：" + b.start_time + " - " + b.end_time + "</li>";
                    });
                    classes = classes +
                        "<div class='class'>" +
                        "<dl>" +
                        "<dt>○" + val.name + "（" + genreArray[val.genre] + "）</dt>" +
                        "</dl>" +
                        "<ul style='margin-left:10px;'>" + branch + "</ul>" +
                        "</div>";
                });
                str = str +
                    "<div class='school' style='border-bottom:solid 1px #999;margin-bottom:15px;padding-bottom:15px;'>" +
                    "<div class='head'>" +
                    "<dl>" +
                    "<dt>●" + elem.name + "（" + dateJpFormat(elem.created_at) + "）</dt>" +
                    "<dd style='margin-left:10px;'>" + elem.pref + "" + elem.addr + "</dd>" +
                    "<dd style='margin-left:10px;'>生徒数：" + elem.students + "名</dd>" +
                    "</dl>" +
                    "</div>" +
                    classes +
                    "</div>"
            });
            $("#stats").empty();
            $("#stats").append(str);
        }
    });

});
