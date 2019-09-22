import moment from "moment";
import "moment/locale/zh-cn";
import App from "../views/app";

// 时间格式化
export const momentFormat = function(time, format) {
  return moment(time || new Date().getTime()).format(format);
};

// 获取url参数
export const getUrlParam = function(key, url) {
  let local_url = url || document.location.href;
  let params_str =
    local_url.split("?").length > 1 ? local_url.split("?").pop() : "";
  let hash = window.location.hash;
  params_str = params_str.replace(hash, "");
  let params_arr = params_str.split("&");
  let params_obj = {};
  for (let param_index = 0; param_index < params_arr.length; param_index++) {
    let param_kv_arr = params_arr[param_index].split("=");
    if (param_kv_arr.length > 1) {
      params_obj[decodeURIComponent(param_kv_arr[0])] = decodeURIComponent(
        param_kv_arr[1]
      );
    }
  }
  return params_obj[key] === undefined ? "" : params_obj[key];
};

// 提供给android
window.web_setUpdate = function() {
  // updateFlag  1为更新  2为不更新
  let updateFlag = window.localStorage.getItem("updateFlag");
  let updateUrl = window.localStorage.getItem("updateUrl");

  if (window.Number(updateFlag) === 1) {
    return updateUrl;
  } else {
    return null;
  }
};
