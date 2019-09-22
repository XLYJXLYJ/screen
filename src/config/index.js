let node_custom_env; // 打包环境
let node_ajax_api_url; // 后端ajax接口域名
let node_ws_api_host; // websoket后端域名
let node_ws_api_port; // websoket后端端口
let node_ws_api_router; // websoket后端标识

if (
  process.env.NODE_CUSTOM_ENV !== "production" &&
  process.env.NODE_CUSTOM_ENV !== "staging"
) {
  node_custom_env = "development";
} else {
  node_custom_env = process.env.NODE_CUSTOM_ENV;
}

// h5地址
// 正式: http://ypv1.jianzaogong.com
// 测试: http://tvv1.test.jianzaogong.com
// 后端配置
if (node_custom_env === "production") {
//   node_ajax_api_url = "//tvv1.test.api.jianzaogong.com";
  node_ajax_api_url = '//ypv1.api.jianzaogong.com/'
  // node_ws_api_host = 'ws://ypv1.api.jianzaogong.com'
  node_ws_api_port = 80;
  node_ws_api_router = "";
} else if (node_custom_env === "staging") {
  node_ajax_api_url = "//tvv1.test.api.jianzaogong.com";
  // node_ws_api_host = 'ws://tvv1.test.api.jianzaogong.com'
  node_ws_api_port = 80;
  node_ws_api_router = "";
} else {
  //192.168.4.216
//   node_ws_api_host = 'ws://ypv1.api.jianzaogong.com'
  node_ajax_api_url = "//tvv1.test.api.jianzaogong.com";
  // node_ws_api_host = 'ws://tvv1.test.api.jianzaogong.com'
  node_ws_api_port = 80;
  node_ws_api_router = "";
}
exports.node_ajax_api_url = node_ajax_api_url;
exports.node_ws_api_host = node_ws_api_host;
exports.node_ws_api_port = node_ws_api_port;
exports.node_ws_api_router = node_ws_api_router;

// window.android = {
//     setBinding: () => {},
// }
exports.android = window.android; // 安卓对象
