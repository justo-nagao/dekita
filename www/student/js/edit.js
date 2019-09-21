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
    var student_id = getParam("student", param);
    var app = new Vue({
        el: "#container",
        data: {
            url: url,
            student_id: student_id
        }
    });

    appendStudentForm(url);
    
    $.ajax({
        url: AJAX_URL + "student/edit.php",
        type: "POST",
        data: {
            url: url,
            login_id: LOGIN_ID,
            student_id: student_id,
            type: "init"
        },
        success: function (arr) {
            var data = $.parseJSON(arr);
            $(".lastname").val(data.lastname);
            $(".firstname").val(data.firstname);
            $(".gender").val([data.gender]);
            $(".parent").val(data.class[0].class_id);
            appendChildForm(data.class[0].class_id, 0);
            setTimeout(function () {
                $.each(data.class, function (key, val) {
                    $(".checkbox-input[value='" + val.branch_id + "']").prop("checked", true);
                });
            }, 500);

        }
    });

    /**
     *  フォーム送信
     */
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
                url: AJAX_URL + "student/edit.php",
                type: "POST",
                data: {
                    data: data,
                    url: url,
                    login_id: LOGIN_ID,
                    student_id: student_id,
                    type: "update"
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {
                    //生徒一覧
                    window.location.href = "../student/detail.html?id="+url+"&student="+student_id;
                }
            });

        } else {
            fadeError("入力内容に正しく入力してください");
        }
    });

    /**
     *  クラス選択時
     */
    $(document).on("change", ".parent", function () {
        var num = $(this).parent().parent().parent().parent().attr("data-num");
        var class_id = $(this).val();
        appendChildForm(class_id, num);
    });

    //削除確認画面
    $(document).on("click", "#show_delete", function () {
        $("#delete_win").show();
    });

    //削除処理
    $(document).on("click", "#btn_delete", function () {
        $.ajax({
            url: AJAX_URL + "student/edit.php",
            type: "POST",
            data: {
                student_id: student_id,
                login_id: LOGIN_ID,
                type: "delete"
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                fadeError("送信に失敗しました");
            },
            success: function (arr) {
                fadeError("生徒を削除しました", "../oauth/receiver.html?login_id="+LOGIN_ID+"&token=");
            }
        });
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
                    delte =
                        "<tr>" +
                            "<th></th>" +
                            "<td><a href='javascript:void(0)' class='delete'>削除</a></td>" +
                        "</tr>";
                }
                var student = "" +
                    "<table class='student_form' data-num='" + num + "'>" +
                        "<tr>" +
                            "<th>生徒氏名</th>" +
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
                            "<th>クラス</th>" +
                            "<td>" +
                                "<select class='parent full' name='student[" + num + "][class_id]'>" + option + "</select>" +
                            "</td>" +
                        "</tr>" +
                        "<tr>" +
                            "<th>曜日/時間</th>" +
                            "<td class='branch_id txt'>" +
                                "<ul></ul>" +
                            "</td>" +
                        "</tr>" +
                        delte +
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
