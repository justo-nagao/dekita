/**
 *  画面ロード時処理
 *  初期表示
 */
$(function(){
    
    //会員認証
    basicAuth(LOGIN_ID, TOKEN);
    
    //パラメータ取得
    var param = location.search;
    var url = getParam("id", param);
    var schoollists = JSON.parse(localStorage.getItem("school"));
    var filtered = $.grep(schoollists,function(elem, index) { return (elem.url == url);});
    var school_name = filtered[0].name;
    var app = new Vue({
        el: "#container",
        data: {
            url : url,
            school_name: school_name
        }
    });
    
    $.ajax({
        url: AJAX_URL + "student/list.php",
        type: "POST",
        data: { url : url },
        success: function(arr) {
            var data = $.parseJSON(arr);
            var str = "";
            var redirect = "";
            $.each(data,function(index, elem) {
                str = str + 
                    "<dl>"+
                        "<dt class='sample'></dt>"+
                        "<dd><a href='detail.html?id="+url+"&student="+elem.student_id+"'>"+elem.lastname+" "+elem.firstname+"</a></dd>"+
                    "</dl>";
            });
            $("#list").append(str);
        }
    });
    
});