/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);
    
    //パラメータ取得
    var param = escapeHTML($(location).attr("pathname").replace(APP_PATH + "student/detail/", ""));
    var paramArray = param.split("/");
    var url = paramArray[0];
    var student_id = paramArray[1];
    var app = new Vue({
        el: "#container",
        data: {
            url: url,
            pic: PICTURE,
            student_id: student_id
        }
    });

    var logs = "";
    var classes = "";
    var branch = "";

    $.ajax({
        url: AJAX_URL + "student/detail.php",
        type: "POST",
        data: {
            url: url,
            login_id: LOGIN_ID,
            student_id: student_id,
            type: "init"
        },
        success: function (arr) {

            var data = $.parseJSON(arr);

            $("h1").text(data.lastname + " " + data.firstname);
            $("#name").text(data.lastname + " " + data.firstname);
            $("#gender").text(genderArray[data.gender]);
            $("#code").text(data.code);
            $("#create").text(data.created_at);

            //クラス表示
            $.each(data.class, function (index, elem) {
                classes = elem.name;
                branch = branch + "<li>" + weekArray[elem.week] + " " + elem.start_time + "〜" + elem.end_time + "</li>";
            });
            $("#classes").append(classes);
            $("#branch ul").append(branch);
            
            //履歴表示
            if(data.logs !== undefined){
                logs = "<table class='list'>"+
                    "<thead>"+
                        "<tr>"+
                            "<th class='cntr'>種類</th>"+
                            "<th>レッスン日時</th>"+
                            "<th>状態</th>"+
                        "</tr>"+
                    "</thead>"+
                "<tbody>";
                $.each(data.logs, function (index, elem) {
                    var status = "";
                    var optclass ="";
                    var kubun ="";
                    var tdate = dateJpFormat(elem.start_at,"zero");
                    if (elem.kubun == 1) {
                        status = "欠";
                        kubun = "absent";
                    } else {
                        status = "振";
                        kubun = "transfer";
                    }
                    if (elem.valid == 1) {
                        valid = "申請";
                        optclass ="";
                    } else {
                        valid = "キャンセル";
                        optclass ="class='cancel'";
                    }
                    logs = logs +
                        "<tr "+optclass+">" +
                            "<td class='cntr "+kubun+"'><span>" + status + "</span></td>" +
                            "<td>" + tdate + "</td>" +
                            "<td>" + valid + "</td>" +
                        "</tr>";
                });
                logs = logs +"</tbody></table>";
                $("#item2").append(logs);
            }
            else{
                $("#item2").append("<p>履歴はありません</p>");
            }
            $("#tabs").tabs();
        }
    });

});
