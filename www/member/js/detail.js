/**
 *  画面ロード時処理
 *  初期表示
 */
$(function(){
    
    //会員認証
    basicAuth(LOGIN_ID, TOKEN);
    
    //バージョン表示
    $("#version").text(APP_VERSION);
    
    var app = new Vue({
        el: "#container",
        data: {
            login_id : LOGIN_ID
        }
    });
    
    //退会確認ウィンドウ
    $(document).on("click", "#show_withdraw", function(){
        $("#withdraw").show();
    });
    
    //退会処理
    $(document).on("click", "#withdraw #btn_withdraw", function(){
        $.ajax({
            url: AJAX_URL + "member/detail.php",
            type: "POST",
            data: {
                login_id: LOGIN_ID,
                type: "withdraw"
            },
            success: function (arr) {
                
            }
        });
    });
});