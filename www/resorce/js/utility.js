//半角アルファベットもしくは数字のみ
$.validator.addMethod(
    "alphanum",
    function (value, element) {
        return this.optional(element) || /^([a-zA-Z0-9]+)$/.test(value);
    },
    "半角英数字を入力してください"
);

/**
 *  XSS対策
 *  エスケープ
 */
function escapeHTML(str) {
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&#39;');
    return str;
}

/**
 * Get the URL parameter value
 * @param  name {string} パラメータのキー文字列
 * @return  url {url} 対象のURL文字列（任意）
 */
function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 *  文字列を日付に変換
 *  日付文字列（yyyyMMdd）
 */
function toDate(str) {
    var arr = (str.substr(0, 4) + '/' + str.substr(4, 2) + '/' + str.substr(6, 2)).split('/');
    return new Date(arr[0], arr[1] - 1, arr[2]);
};

/**
 *  文字列を日付に変換
 *  日付文字列（yyyy-MM-dd, yyyy/MM/dd）
 */
function toDateEx(str, delim) {
    var arr = str.split(delim)
    return new Date(arr[0], arr[1] - 1, arr[2]);
};


/**
 *  日付変換
 *  日付文字列（2018年12月11日(水) 10:00）
 */
function datetimeJpFormat(date) {

    var date = date.replace(/-/g, '/');
    var tday = new Date(date);
    var tday_y = tday.getFullYear();
    var tday_m = tday.getMonth() + 1;
    var tday_d = tday.getDate();
    var tday_w = tday.getDay();
    var tday_h = tday.getHours();
    var tday_s = tday.getMinutes();
    var tdate = tday_y + "年" + tday_m + "年" + tday_d + "日(" + weekArray[tday_w] + ") " + tday_h + ":" + addZero(tday_s);
    return tdate;
};

/**
 *  日付変換
 *  日付文字列（2018年12月11日(水)）
 */
function dateJpFormat(date, zero) {

    var date = date.replace(/-/g, '/');
    var tday = new Date(date);
    var tday_y = tday.getFullYear();
    var tday_m = tday.getMonth() + 1;
    var tday_d = tday.getDate();
    var tday_w = tday.getDay();
    var tday_h = tday.getHours();
    var tday_s = tday.getMinutes();
    if (zero == "zero") {
        var tdate = tday_y + "年" + addZero(tday_m) + "年" + addZero(tday_d) + "日(" + weekArray[tday_w] + ") ";
    } else {
        var tdate = tday_y + "年" + tday_m + "年" + tday_d + "日(" + weekArray[tday_w] + ") ";
    }
    return tdate;
};

/**
 *  何日後＆何日前を計算
 */
function calDate(now, num) {
    var nowms = now.getTime();
    var num = num * 24 * 60 * 60 * 1000;
    ans = new Date(nowms + num);
    y = ans.getFullYear();
    m = ans.getMonth() + 1;
    d = ans.getDate();
    w = ans.getDay();
    return y + "-" + m + "-" + d;
}

/**
 *  1桁の数字を0埋めで2桁にする
 */
var addZero = function (num) {
    num += "";
    if (num.length === 1) {
        num = "0" + num;
    }
    return num;
};

/**
 *  フェードエラー表示
 */
function fadeNotice(txt, url) {
    if (!($(".hint").length)) {
        var str = "<div class='hint notice'><p>" + txt + "</p></div>";
        $("body").append(str);
        $(".hint").delay(800).fadeOut(600).queue(function () {
            if (url == undefined) {
                $(".hint").remove();
            } else {
                window.location.href = url;
            }
        });
    }
}

/**
 *  フェード確認表示
 */
function fadeError(txt, url) {
    if (!($(".hint").length)) {
        var str = "<div class='hint error'><p>" + txt + "</p></div>";
        $("body").append(str);
        $(".hint").delay(800).fadeOut(600).queue(function () {
            if (url == undefined) {
                $(".hint").remove();
            } else {
                window.location.href = url;
            }
        });
    }
}

/**
 *  モーダル開く
 */
function openModal(name) {
    $("#" + name).show();
    $("html").css({
        "overflow": "hidden"
    });
    $(".modal").css({
        "overflow-y": "auto"
    });
}

/**
 *  モーダル閉じる
 */
$(document).on("click", ".modal .closebtn", function () {
    $(this).parent().parent().fadeOut();
    $("html").css({
        "overflow": "auto"
    });
    $(".modal").css({
        "overflow-y": "hidden"
    });
});

/**
 *  確認画面閉じる
 */
$(document).on("click", ".comfirm .cancelbtn", function () {
    $(this).parent().parent().parent().fadeOut();
});

/**
 *  ローカルストーレージ
 */
function setLocalStorage(data) {

    localStorage.clear();
    var user = [];
    var school = [];
    var student = [];
    var kubun = data.user.kubun;
    var url = data.school[1].url;
    //ログイン情報
    user.push({
        "token": data.user.token,
        "login_id": data.user.login_id,
        "kubun": kubun,
        "name": data.user.name,
        "picture": data.user.picture,
        "regist": "0"
    });
    //スクール情報
    $.each(data.school, function (index, sch) {
        school.push({
            "school_id": sch.school_id,
            "name": sch.name,
            "url": sch.url,
            "role": sch.role
        });
    });
    //生徒情報
    $.each(data.student, function (index, stu) {
        student.push({
            "student_id": stu.student_id,
            "lastname": stu.lastname,
            "firstname": stu.firstname
        });
    });
    //ローカルストレージ格納
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("school", JSON.stringify(school));
    localStorage.setItem("student", JSON.stringify(student));
}

function clipboadCopy() {
    var copytext = document.getElementById("copyurl");
    var range = document.createRange();
    range.selectNode(copytext);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
}


/**
 *  会員認証（ログインページへリダイレクト）
 */
function basicAuth(login_id, token) {
    if (login_id == "" || token == "") {
        window.location.href = APP_DOMAIN + "/app/oauth/login";
    }
}
