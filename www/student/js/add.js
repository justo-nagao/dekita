/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    //basicAuth(LOGIN_ID, TOKEN);

    //リファラ取得
    var referrer = document.referrer;
    var mode = "";

    //パラメータ取得
    var url = escapeHTML($(location).attr("pathname").replace(APP_PATH + "student/add/", ""));
    var prev_url = APP_DOMAIN + APP_PATH + "student/list/" + url;
    var app = new Vue({
        el: "#container",
        data: {
            url: url
        }
    });

    //LINEからコールバック
    if ($(location).attr("search") !== "") {
        var login_id = getParam("login_id");
        var token = getParam("token");
        var kubun = getParam("kubun");
        var name = getParam("name");
        var user = [];
        user.push({
            "login_id": login_id,
            "token": token,
            "kubun": kubun,
            "name": name,
            "regist": 1
        });
        localStorage.setItem("user", JSON.stringify(user));
    } else {
        var login_id = LOGIN_ID;
        var token = TOKEN;
    }

    //生徒一覧から
    if (referrer == prev_url) {
        //単発
        mode = "self";
    } else {
        //連続
        mode = "flow";
    }

    //bodyにモードクラス追加
    $("body").addClass(mode);

    //スクール情報取得
    $.ajax({
        url: AJAX_URL + "oauth/apply.php",
        type: "POST",
        data: {
            url: url,
            type: "init"
        },
        success: function (arr) {
            var data = $.parseJSON(arr);
            $("#student_add header h1").html("<span>" + data.name + "</span>生徒登録");
            $("#student_add input[name='school_id']").val(data.school_id);
        }
    });

    //初期表示（生徒入力フォーム追加）
    appendStudentForm(url);

    //生徒追加
    $(document).on("click", "#copy", function () {
        appendStudentForm(url);
    });

    //生徒削除
    $(document).on("click", ".delete", function () {
        $(this).parent().parent().parent().parent().remove();
    });

    //クラス選択時(ブランチ切替)
    $(document).on("change", ".parent", function () {
        var num = $(this).parent().parent().parent().parent().attr("data-num");
        var class_id = $(this).val();
        appendChildForm(class_id, num);
    });

    //フォーム送信
    $("form").validate();
    $("form").on("submit", function (event) {

        $(".lastname").each(function () {
            $(this).rules("add", {
                required: true,
                messages: {
                    required: ""
                }
            })
        });
        $(".firstname").each(function () {
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
                url: AJAX_URL + "student/add.php",
                type: "POST",
                data: {
                    data: data,
                    url: url,
                    login_id: login_id,
                    token: token,
                    authority: AUTHORITY,
                    type: "insert"
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {
                    var data = $.parseJSON(arr);
                    if (data == null) {
                        fadeError("登録に失敗しました");
                    } else {
                        //ローカルデータ更新
                        setLocalStorage(data);
                        $("#success").show();
                        $(".btns a").attr("href", "../../lesson/calendar/" + url + "/");
                    }
                }
            });
        } else {
            fadeError("入力内容を正しく入力してください");
        }
    });

    /**
     *  クラスフォーム作成
     *  クラス取得
     */
    function appendStudentForm(url) {

        $.ajax({
            url: AJAX_URL + "student/add.php",
            type: "POST",
            data: {
                url: url,
                type: "class"
            },
            success: function (arr) {
                var data = $.parseJSON(arr);
                var delte = "";
                var option = "";
                var num = $(".student_form").length;
                $.each(data, function (key, elem) {
                    option = option + "<option value='" + elem.class_id + "'>" + elem.name + "</option>";
                });
                if (num !== 0) {
                    delte = "<span><a href='javascript:void(0)' class='delete'>削除</a></span>";
                }
                var student = "" +
                    "<table class='student_form' data-num='" + num + "'>" +
                    "<tr>" +
                    "<th>生徒氏名" + delte + "</th>" +
                    "<td>" +
                    "<input type='text' class='lastname half1' name='student[" + num + "][lastname]' placeholder='姓'>" +
                    "<input type='text' class='firstname half2' name='student[" + num + "][firstname]' placeholder='名'>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<th>性別</th>" +
                    "<td>" +
                    "<input type='radio' name='student[" + num + "][gender]' class='gender radiobox' id='gender-" + num + "1' value='1' checked>" +
                    "<label for='gender-" + num + "1'>男</label>" +
                    "<input type='radio' name='student[" + num + "][gender]' class='gender radiobox' id='gender-" + num + "2' value='2'>" +
                    "<label for='gender-" + num + "2'>女</label>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<th>受講クラス</th>" +
                    "<td>" +
                    "<select class='parent full' name='student[" + num + "][class_id]'>" + option + "</select>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<th>曜日・時間</th>" +
                    "<td class='branch_id txt'>" +
                    "<ul></ul>" +
                    "</td>" +
                    "</tr>" +
                    "</table>";
                $("#append").append(student);
                var class_id = $("table[data-num='" + num + "'] .parent option:eq(0)").val();
                appendChildForm(class_id, num);
            }
        });
    }

    /**
     *  ブランチ取得
     */
    function appendChildForm(class_id, num) {
        var childform = "";
        $.ajax({
            url: AJAX_URL + "student/add.php",
            type: "POST",
            data: {
                class_id: class_id,
                type: "branch"
            },
            success: function (result) {
                var results = $.parseJSON(result);
                $.each(results, function (key, elem) {
                    childform = childform + "<li><label><input type='checkbox' name='student[" + num + "][branch][]' class='checkbox-input' value='" + elem.branch_id + "'><span class='checkbox-parts'>" + weekArray[elem.week] + " " + elem.start_time + "〜" + elem.end_time + "</span></label></li>";
                });
                $(".student_form[data-num='" + num + "'] .branch_id ul").empty();
                $(".student_form[data-num='" + num + "'] .branch_id ul").append(childform);
            }
        });
    }

});
