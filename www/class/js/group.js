/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    //会員認証
    basicAuth(LOGIN_ID, TOKEN);

    //パラメータ取得
    var param = escapeHTML($(location).attr("pathname").replace(APP_PATH + "class/group/", ""));
    var paramArray = param.split("/");
    var url = paramArray[0];
    var class_id = paramArray[1];

    var app = new Vue({
        el: "#container",
        data: {
            url: url,
            class_id: class_id
        }
    });


    /**
     *  一覧取得
     */
    $.ajax({
        url: AJAX_URL + "class/group.php",
        type: "POST",
        data: {
            url: url,
            class_id: class_id,
            login_id: LOGIN_ID,
            type: "list"
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            fadeError("送信に失敗しました");
        },
        success: function (arr) {
            if (arr !== null) {
                $("#group tbody").empty();
                $("#group tbody").append(arr);
            } else {
                fadeError("取得に失敗しました");
            }
        }
    });

    /**
     *  グループ管理
     */
    $(document).on("click", "#show_manage", function () {
        $("#manage").show();
        $.ajax({
            url: AJAX_URL + "class/group.php",
            type: "POST",
            data: {
                url: url,
                class_id: class_id,
                login_id: LOGIN_ID,
                type: "manage"
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                fadeError("送信に失敗しました");
            },
            success: function (arr) {
                if (arr !== null) {
                    var data = $.parseJSON(arr);
                    var str = "";
                    if (data !== null) {
                        $.each(data, function (index, elem) {
                            str = str +
                                "<dl data-group='" + elem.group_id + "'>" +
                                "<dt class='color_" + elem.color + "'></dt>" +
                                "<dd><a href='javascript:void(0)'>" + elem.name + "</a></dd>" +
                                "</dl>";
                        });
                        $("#list").empty();
                        $("#list").append(str);
                    } else {
                        $("#list").empty();
                        $("#list").append("<p class='note'>登録されているグループはありません</p>");
                    }
                } else {
                    fadeError("取得に失敗しました");
                }
            }
        });
    });

    /**
     *  グループ登録画面表示
     */
    $(document).on("click", "#show_add", function () {
        $("#add").show();
    });

    /**
     *  グループ登録
     */
    $("#add form").validate({
        rules: {
            name: {
                required: true
            },
            color: {
                required: true
            }
        },
        messages: {
            name: {
                required: "グループ名を入力してください"
            },
            color: {
                required: "カラーを入力してください"
            }
        },
        submitHandler: function () {

            var $form = $("#add form");
            var data = $form.serialize();
            $.ajax({
                url: AJAX_URL + "class/group.php",
                type: "POST",
                data: {
                    data: data,
                    url: url,
                    class_id: class_id,
                    login_id: LOGIN_ID,
                    type: "insert"
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {
                    if (arr !== null) {
                        fadeNotice("登録しました", "");
                    } else {
                        fadeError("登録に失敗しました");
                    }
                }
            });
        }
    });

    /**
     *  グループ編集画面表示
     */
    $(document).on("click", "#list dl", function () {
        $("#edit").show();
        var group = $(this).attr("data-group");
        $.ajax({
            url: AJAX_URL + "class/group.php",
            type: "POST",
            data: {
                url: url,
                group: group,
                class_id: class_id,
                login_id: LOGIN_ID,
                type: "edit"
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                fadeError("送信に失敗しました");
            },
            success: function (arr) {
                if (arr !== null) {
                    var data = $.parseJSON(arr);
                    $("#edit #ed" + data[0].color).prop('checked', true);
                    $("#edit input[name='name']").val(data[0].name);
                    $("#edit input[name='group_id']").val(data[0].group_id);
                } else {
                    fadeError("取得に失敗しました");
                }
            }
        });
    });

    /**
     *  グループ編集
     */
    $("#edit form").validate({
        rules: {
            name: {
                required: true
            },
            color: {
                required: true
            }
        },
        messages: {
            name: {
                required: "グループ名を入力してください"
            },
            color: {
                required: "カラーを入力してください"
            }
        },
        submitHandler: function () {

            var $form = $("#edit form");
            var data = $form.serialize();
            var group = $("#edit input[name=group_id]").val();
            $.ajax({
                url: AJAX_URL + "class/group.php",
                type: "POST",
                data: {
                    data: data,
                    url: url,
                    class_id: class_id,
                    group: group,
                    login_id: LOGIN_ID,
                    type: "update"
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fadeError("送信に失敗しました");
                },
                success: function (arr) {
                    if (arr !== null) {
                        fadeNotice("保存しました", "");
                    } else {
                        fadeError("登録に失敗しました");
                    }
                }
            });
        }
    });

    /**
     *  削除確認画面表示
     */
    $(document).on("click", "#show_delete", function () {
        $("#delete").show();
    });

    /**
     *  削除処理
     */
    $(document).on("click", "#btn_delete", function () {
        var group_id = $("#edit input[name='group_id']").val();
        $.ajax({
            url: AJAX_URL + "class/group.php",
            type: "POST",
            data: {
                group: group_id,
                login_id: LOGIN_ID,
                type: "delete"
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                fadeError("送信に失敗しました");
            },
            success: function (arr) {
                if (arr !== null) {
                    fadeNotice("削除しました", "");
                } else {
                    fadeError("登録に失敗しました");
                }
            }
        });
    });


    /**
     *  保存
     */
    $(document).on("click", "#save", function () {
        var data = [];
        $("#group tbody tr").each(function (index, element) {
            var branch = $(element).attr("data-branch");
            var group = $(element).find("select option:selected").val();
            data.push({
                "branch": branch,
                "group": group
            });
        });
        $.ajax({
            url: AJAX_URL + "class/group.php",
            type: "POST",
            data: {
                data: data,
                url: url,
                class_id: class_id,
                login_id: LOGIN_ID,
                type: "save"
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                fadeError("送信に失敗しました");
            },
            success: function (arr) {
                if (arr !== null) {
                    fadeNotice("グループ設定を保存しました", "../../detail/" + url + "/" + class_id);
                } else {
                    fadeError("登録に失敗しました");
                }
            }
        });
    });

});
