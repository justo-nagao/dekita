/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID,TOKEN);
    
    //パラメータ取得
    var param = location.search;
    var url = getParam("id", param);
    var class_id = getParam("class", param);

    $.ajax({
        url: AJAX_URL + "class/detail.php",
        type: "POST",
        data: {
            url: url,
            class_id: class_id
        },
        success: function (arr) {

            var data = $.parseJSON(arr);
            var str = "";
            var list = "";
            var often = "";
            var genre = genreArray[data.genre];
            var often_type = data.often_type;
            var often_week = data.often_week;
            var often_start = data.often_start;
            var often_end = data.often_end;

            //回数
            if (often_type == 2) {
                often = "自由参加";
            } else {
                if (often_week == "week") {
                    often = "週";
                } else if (often_week == "month") {
                    often = "月";
                }
                if (often_end == 0) {
                    often = often + "" + often_start + "回";
                } else {
                    often = often + "" + often_start + "～" + often_end + "回";
                }
            }

            var app = new Vue({
                el: "#container",
                data: {
                    url: url,
                    class_id: class_id,
                    name: data.name,
                    genre: genre,
                    often: often
                }
            });

            //対象者表示
            $.each(data.target, function (index, t) {
                var target = targetArray[t.target_id];
                list = list + "<li>" + target + "</li>";
            });
            $("#target ul").append(list);

            //ブランチ表示
            $.each(data.branch, function (index, elem) {
                var week = weekArray[elem.week];
                var group = "";
                var transfer = "";
                if (elem.transfer == 1) {
                    transfer = "可";
                } else {
                    transfer = "不可";
                }
                if (elem.name !== null) {
                    group = "<span class='palette color_" + elem.color + "'></span>" + elem.name + "";
                }
                str = str +
                    "<tr>" +
                    "<td class='cntr'>" + week + "</td>" +
                    "<td>" + elem.start_time + " ～ " + elem.end_time + "</td>" +
                    "<td class='cntr'>" + transfer + "</td>" +
                    "<td class='cntr'>" + elem.vacancy + "</td>" +
                    "<td class='cntr'>" + group + "</td>" +
                    "</tr>";
            });
            $("#lessonday tbody").append(str);
        }
    });

});
