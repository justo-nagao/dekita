if (location.host == "apps.dekita.online") {
    var domain = "https://apps.dekita.online";
    var path = "/app/";
} else {
    var domain = "http://127.0.0.1/dekita/apps.dekita.online";
    var path = "/dekita/apps.dekita.online/app/";
}


const AJAX_URL = "https://apps.dekita.online/ajax/";
//const AJAX_URL = "http://127.0.0.1/dekita/apps.dekita.online/ajax/";

const APP_DOMAIN = domain;
const APP_VERSION = "v1.0.0";
const CLIENT_ID = 1633796583;
const APP_PATH = path;
const USER_DATA = JSON.parse(localStorage.getItem("user"));
const SCHOOL_DATA = JSON.parse(localStorage.getItem("school"));
const STUDENT_DATA = JSON.parse(localStorage.getItem("student"));

const REPEAT_MONTH_NUM = 1;
const weekArray = ["日", "月", "火", "水", "木", "金", "土"];
const genderArray = ["", "男", "女"];
const genreArray = ["", "スイミング", "英語", "バレエ", "ダンス", "学習塾", "そろばん"];
const targetArray = ["指定なし", "ベビー", "幼児", "小学生", "中学生", "高校生", "大学生", "一般"];
const userArray = ["", "管理者", "先生", "アシスタント", "生徒"];

const RELOAD_TIME = 180;

var temp = "";
var regist = "";
var temp_login_id = "";
var temp_token = "";
var temp_kubun = "";
var temp_regist = "";
var temp_picture = "";

//ゲストユーザー
if (USER_DATA == null) {
    temp = "guest";
}
//ログインユーザー
else {
    temp_login_id = USER_DATA[0].login_id;
    temp_token = USER_DATA[0].token;
    temp_kubun = USER_DATA[0].kubun;
    temp_regist = USER_DATA[0].regist;
    temp_picture = USER_DATA[0].picture;

    //新規登録者
    if (temp_regist == "1") {
        temp = "guest";
    }
    //会員登録済
    else {
        //ユーザー区分
        if (temp_kubun == "1") {
            temp = "manager";
        } else if (temp_kubun == "3") {
            temp = "member";
        }
    }
}

const LOGIN_ID = temp_login_id;
const TOKEN = temp_token;
const KUBUN = temp_kubun;
const PICTURE = temp_picture;
const AUTHORITY = temp;

/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {
    $("body").addClass(AUTHORITY);
});
