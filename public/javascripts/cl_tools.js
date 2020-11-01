//JS 自定義常用 lib;
var cl_tools = (function () {
  //變量
  var cv = {
    "ver":"20190711", //版本控管,用於之後向下相容需求;
  };
  //@desc: 判斷輸入字串是否為空;
  cl_null = function (p_str) {
    //@input p1: 預判斷的參數
    //@trturn r1: if (輸入空字串,null,undefine) then true ,else false;
    if (!p_str) {
      //null,"",undefined 
      return true;
    }
    var l_match = "^[ ]+$"; //JS正則表達式:是否空字串
    var l_regexp = new RegExp(l_match);
    return l_regexp.test(p_str);
  };
  //@desc 將參數p_arg寫入到字串p_msg %? 中 //@190628 add by 07558;
  cl_msg_replace = function (p_msg, p_arg) {
    //@input parameter==
    //p1 : string,要替換的字串;
    //p2 : string of array,要替換的字串陣列;
    //@retuen
    //r1 : string;
    var ls_msg, l_regexp;
    //@memo 此function要注意 (%+數字) (ex: %1) 視為保留字;
    ls_msg = p_msg;
    if (cl_null(p_arg) || p_arg.length <= 0) {
      return ls_msg;
    }
    //字串替換;
    for (i = p_arg.length; i > 0; i--) {
      l_regexp = new RegExp('%' + i, 'g');
      ls_msg = ls_msg.replace(l_regexp, p_arg[i - 1]);
    }
    return ls_msg;
  };
  //@desc 顯示視窗詢問
  cl_confirm = function (p_type, p_msg) {
    //@input param 
    // p_type : 顯示視窗型態,0=預設使用 browser 原生的; 
    // p_msg: 要顯示的字串;
    //@return
    // p_ret:執行結果,-1=執行有誤,0=no,1=yes;
    var p_ret, _answser;
    // 回傳值
    p_ret = -1; // init
    if (cl_null(p_type)) { p_type = 0; }
    switch (p_type) {
      case 0:
        _answser = confirm(p_msg); // show confirm
        if (_answser == false) {
          p_ret = 0;
        } else {
          p_ret = 1;
        }
        break;
      default:
        if (cv.debuglog >= 5) {
          console.log("[ERROR]", "cl_confirm(p1,p2) func 輸入參數p1未正確;");
        }
        p_ret = -1;
        break;
    }
    return p_ret;
  };
  //@desc 顯示警告視窗
  cl_alert = function (p_type, p_msg) {
    //@input param 
    // p_type : 顯示視窗型態,0=預設使用 browser 原生的; 
    // p_msg: 要顯示的字串;
    //@return 
    // p_ret : true=成功;false=執行有誤;
    var p_ret, _answser;
    if (cl_null(p_type)) { p_type = 0; }
    switch (p_type) {
      case 0:
        _answser = alert(p_msg); // show confirm
        p_ret = true;
        break;
      default:
        if (cv.debuglog >= 5) {
          console.log("[ERROR]", "cl_confirm(p1,p2) func 輸入參數p1未正確;");
        }
        p_ret = false;
        break;
    }
    return p_ret;
  };
  //@desc 取得CSS class style by class name;
  cl_getCssClass = function (p_name) {
    //@input param 
    // p1 : css class 的名稱;
    //@return param
    // r1: if (找到名稱相符的物件 ) then 'class style 物件';
    //     else if (browser阻擋css檔讀取行為) then '-1'; 
    //     else then '1' ; 
    for (i in document.styleSheets) {
      try {
        // console.log(document.styleSheets[i]);
        if (document.styleSheets[i].cssRules) { // for FF,chrome;
          rules = document.styleSheets[i].cssRules;
        } else { //for IE
          rules = document.styleSheets[i].rules;
        }
        if (cl_null(rules)) continue;
        if (cv.debuglog >= 10)
          console.log(new Date().getTime(), "document.styleSheets[" + i + "].rules", rules);//for debug
        for (j in rules) {
          if (cl_null(rules[j].selectorText)) { continue; }
          if (cv.debuglog >= 10)
            console.log(new Date().getTime(), "rules[" + j + "].selectorText", rules[j].selectorText); //for debug;

          if (rules[j].selectorText == p_name) {
            return rules[j].style;
          }
        }
      } catch (error) {
        if (cv.debuglog >= 9) {
          console.log(new Date().getTime(), "cl_getCssClass error like below:\n", error); //for debug;
          _err_msg = error + " ;"
          if (_err_msg.indexOf("Cannot access rules") > 0) return -1;
          //@memo: chrome browser 看起來會阻擋 local 端讀取css的行為,導致測試失敗,此部分需要在釐清;
        }
        continue;
      }
    }
    //讀取不到該css name 
    return 1;
  };
  return {
    isnull: cl_null, //判斷輸入字串是否為空;
    msg_replace: cl_msg_replace, //將參數p_arg寫入到字串p_msg %? 中;
    confirm: cl_confirm, //詢問視窗;
    alert: cl_alert,//警告視窗;
    getCssClass: cl_getCssClass, //取得CSS class style by class name;
    cv: cv,
  }
})();
// @memo 修改紀錄 -s-
// ver.20190711 :檔案建立 by 07558;
// @memo 修改紀錄 -e-