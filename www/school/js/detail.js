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

    $.ajax({
        url: AJAX_URL + "school/detail.php",
        type: "POST",
        data: {
            url: url,
            login_id: LOGIN_ID,
            type: "init"
        },
        success: function (arr) {
            var data = $.parseJSON(arr);
            var entry = "" + APP_DOMAIN + "app/oauth/pass/" + url;
            var qrcode = "https://api.qrserver.com/v1/create-qr-code/?data=" + entry + "&size=130x130";
            var addr = data[0].pref + " " + data[0].addr;
            var passcode = data[0].passcode.split("");
            var absent_rule = "";
            //欠席ルール
            if (data[1].absent_type == "time") {
                if (data[1].absent_hour !== "0") {
                    if (data[1].absent_minutes == "0") {
                        absent_rule = "レッスン時間の" + data[1].absent_hour + "時間前まで";
                    } else {
                        absent_rule = "レッスン時間の" + data[1].absent_hour + "時間" + data[1].absent_minutes + "分前まで";
                    }
                } else {
                    if(data[1].absent_minutes == "0"){
                       absent_rule = "レッスン開始まで";
                    }
                    else{
                       absent_rule = "レッスン時間の" + data[1].absent_minutes + "分前まで";
                    }
                }
            } else {
                absent_rule = "レッスン日の" + data[1].absent_day + "日前まで";
            }
            //振替ルール
            if (data[1].transfer_type == "time") {
                if (data[1].transfer_hour !== "0") {
                    if (data[1].transfer_minutes == "0") {
                        transfer_rule = "レッスン時間の" + data[1].transfer_hour + "時間前まで";
                    } else {
                        transfer_rule = "レッスン時間の" + data[1].transfer_hour + "時間" + data[1].transfer_minutes + "分前まで";
                    }
                } else {
                    if(data[1].transfer_minutes == "0"){
                       transfer_rule = "レッスン開始まで";
                    }
                    else{
                       transfer_rule = "レッスン時間の" + data[1].transfer_minutes + "分前まで";
                    }
                }
            } else {
                transfer_rule = "レッスン日の" + data[1].transfer_day + "日前まで";
            }

            //手続き期限
            if (data[1].expiration_type == "none") {
                expiration_rule = "なし";
            } else if (data[1].expiration_type == "date") {
                expiration_rule = data[1].expiration_day + "まで";
            } else if (data[1].expiration_type == "period") {
                expiration_rule = "欠席日から" + data[1].expiration_date + "日間";
            }

            //有効期限
            if (data[1].range_type == "none") {
                range_rule = "なし";
            } else if (data[1].range_type == "date") {
                range_rule = data[1].range_day + "まで";
            } else if (data[1].range_type == "period") {
                range_rule = "欠席日から" + data[1].range_date + "日間";
            }

            var app = new Vue({
                el: "#container",
                data: {
                    url: url,
                    name: data[0].name,
                    zip: data[0].zip,
                    addr: addr,
                    qrcode: qrcode,
                    entry: entry,
                    absent_rule: absent_rule,
                    transfer_rule: transfer_rule,
                    expiration: data[1].expiration,
                    transfer_often: data[1].transfer_often,
                    expiration_rule: expiration_rule,
                    range_rule: range_rule,
                    domain: APP_DOMAIN
                }
            });
            $(".line-it-button").attr("data-url", entry);
            $("#passcode li").eq(0).text(passcode[0]);
            $("#passcode li").eq(1).text(passcode[1]);
            $("#passcode li").eq(2).text(passcode[2]);
            $("#passcode li").eq(3).text(passcode[3]);
            $("#tabs").tabs({
                active: 1
            });
        }
    });

    //招待開く
    $(document).on("click", "#invitation", function () {
        $("#linkshare").show();
    });

    //招待閉じる
    $(document).on("click", ".modal .closebtn, #linkshare .closebtn", function () {
        $(this).parent().fadeOut();
    });

});
