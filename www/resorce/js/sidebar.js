/**
 *  画面ロード時処理
 *  初期表示
 */
$(function () {

    /**
     *  生徒追加
     */
    $(document).on("click", ".mainmenu", function () {
        $("#sidebar").fadeIn("fast");
    });

    $(document).on("click", "#sidebar", function (e) {
        if (e.offsetX > 280) {
            $("#sidebar").fadeOut("fast");
        }
    });
    
    var loginuser = USER_DATA[0];
    var sidebar = new Vue({
        el: "#sidebar",
        data: {
            login_id: LOGIN_ID,
            login_name: loginuser.name,
            kubun: KUBUN,
            school: SCHOOL_DATA,
            url: SCHOOL_DATA[0].url,
            pic: PICTURE,
            student: STUDENT_DATA
        }
    });
    
});
