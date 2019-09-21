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
    var app = new Vue({
        el: "#container",
        data: {
            url: url
        }
    });

    //スクール情報取得
    $.ajax({
        url: AJAX_URL + "school/edit.php",
        type: "POST",
        data: {
            url: url,
            login_id: LOGIN_ID,
            type: "init"
        },
        success: function (arr) {

            var data = $.parseJSON(arr);
            var name = data[0].name;
            var url = data[0].url;
            var zip = data[0].zip;
            var pref = data[0].pref;
            var addr = data[0].addr;

            $("input[name='name']").val(name);
            $("input[name='url']").val(url);
            $("input[name='zip']").val(zip);
            $("input[name='pref']").val(pref);
            $("input[name='addr']").val(addr);

            //欠席・振替
            var absent_type = data[1].absent_type;
            var absent_day = data[1].absent_day;
            var absent_hour = data[1].absent_hour;
            var absent_minutes = data[1].absent_minutes;
            var transfer_type = data[1].transfer_type;
            var transfer_day = data[1].transfer_day;
            var transfer_hour = data[1].transfer_hour;
            var transfer_minutes = data[1].transfer_minutes;
            var transfer_often = data[1].transfer_often;
            var expiration_type = data[1].expiration_type;
            var expiration_day = data[1].expiration_day.split("/");
            var expiration_date = data[1].expiration_date;
            var range_type = data[1].range_type;
            var range_day = data[1].range_day.split("/");
            var range_date = data[1].range_date;

            $("select[name='absent_type']").val(absent_type);
            $("input[name='absent_day']").val(absent_day);
            $("input[name='absent_hour']").val(absent_hour);
            $("input[name='absent_minutes']").val(absent_minutes);
            $("select[name='transfer_type']").val(transfer_type);
            $("input[name='transfer_day']").val(transfer_day);
            $("input[name='transfer_hour']").val(transfer_hour);
            $("input[name='transfer_minutes']").val(transfer_minutes);
            $("input[name='transfer_often']").val(transfer_often);
            $("select[name='expiration_type']").val(expiration_type);
            $("select[name='expiration_day_month']").val(expiration_day[0]);
            $("select[name='expiration_day_day']").val(expiration_day[1]);
            $("input[name='expiration_date']").val(expiration_date);
            $("select[name='range_type']").val(range_type);
            $("select[name='range_day_month']").val(range_day[0]);
            $("select[name='range_day_day']").val(range_day[1]);
            $("input[name='range_date']").val(range_date);

            if (absent_type == "day") {
                $("select[name='absent_type']").parent().find(".day").css("display", "inline-block");
                $("select[name='absent_type']").parent().find(".time").css("display", "none");
            } else {
                $("select[name='absent_type']").parent().find(".day").css("display", "none");
                $("select[name='absent_type']").parent().find(".time").css("display", "inline-block");
            }
            if (transfer_type == "day") {
                $("select[name='transfer_type']").parent().find(".day").css("display", "inline-block");
                $("select[name='transfer_type']").parent().find(".time").css("display", "none");
            } else {
                $("select[name='transfer_type']").parent().find(".day").css("display", "none");
                $("select[name='transfer_type']").parent().find(".time").css("display", "inline-block");
            }

            expirationChange(expiration_type);
            rangeChange(range_type);

        }
    });

    $("form").validate({
        rules: {
            name: {
                required: true,
            },
            zip: {
                required: true,
            },
            pref: {
                required: true,
            },
            addr: {
                required: true,
            },
            absent_hour: {
                required: true,
            },
            absent_minutes: {
                required: true,
            },
            absent_day: {
                required: true,
            },
            transfer_hour: {
                required: true,
            },
            transfer_minutes: {
                required: true,
            },
            transfer_day: {
                required: true,
            },
            transfer_often: {
                required: true,
            },
            expiration: {
                required: true,
            }

        },
        messages: {
            name: {
                required: "スクール名を入力してください"
            },
            zip: {
                required: "郵便番号を入力してください"
            },
            pref: {
                required: "都道府県を入力してください"
            },
            addr: {
                required: "住所を入力してください"
            },
            absent_hour: {
                required: "",
            },
            absent_minutes: {
                required: "",
            },
            absent_day: {
                required: "",
            },
            transfer_hour: {
                required: "",
            },
            transfer_minutes: {
                required: "",
            },
            transfer_day: {
                required: "",
            },
            transfer_often: {
                required: "",
            },
            expiration: {
                required: "",
            }
        },
        submitHandler: function () {

            var $form = $("form");
            var data = $form.serialize();
            $.ajax({
                url: AJAX_URL + "school/edit.php",
                type: "POST",
                data: {
                    data: data,
                    url: url,
                    login_id: LOGIN_ID,
                    type: "update"
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {
                    fadeNotice("正常に保存しました", "../school/detail.html?id=" + url + "");
                }
            });
        }
    });

    //欠席/振替受付
    $(document).on("click", "select[name='absent_type'],select[name='transfer_type']", function () {
        if ($(this).val() == "day") {
            $(this).parent().find(".day").css("display", "inline-block");
            $(this).parent().find(".time").css("display", "none");
        } else {
            $(this).parent().find(".day").css("display", "none");
            $(this).parent().find(".time").css("display", "inline-block");
        }
    });

    //手続き期限
    $(document).on("change", "select[name='expiration_type']", function () {
        expirationChange($(this).val());
    });

    function expirationChange(val) {
        if (val == "none") {
            $("#expiration .date").hide();
            $("#expiration .period").hide();
        } else if (val == "date") {
            $("#expiration .date").show();
            $("#expiration .period").hide();
        } else if (val == "period") {
            $("#expiration .date").hide();
            $("#expiration .period").show();
        }
    }

    // 有効期限
    $(document).on("change", "select[name='range_type']", function () {
        rangeChange($(this).val());
    });

    function rangeChange(val) {
        if (val == "none") {
            $("#range .date").hide();
            $("#range .period").hide();
        } else if (val == "date") {
            $("#range .date").show();
            $("#range .period").hide();
        } else if (val == "period") {
            $("#range .date").hide();
            $("#range .period").show();
        }
    }

    //削除確認画面
    $(document).on("click", "#show_delete", function () {
        $("#delete_win").show();
    });

    //削除処理
    $(document).on("click", "#btn_delete", function () {
        $.ajax({
            url: AJAX_URL + "school/edit.php",
            type: "POST",
            data: {
                url: url,
                login_id: LOGIN_ID,
                type: "delete"
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                fadeError("送信に失敗しました");
            },
            success: function (arr) {
                //クラス一覧
                window.location.href = "../school/list.html";
            }
        });
    });

});
