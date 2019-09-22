import axios from "axios";
import qs from "qs";
import React from "react";
import * as config from "./../config/index.js";

const instance = axios.create({
  baseURL: config.node_ajax_api_url,
  // timeout: 10000,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  responseType: "json",
  withCredentials: true,
  secure: true,
  transformRequest: [
    function(data) {
      //提交前的数据处理
      return qs.stringify(data);
    }
  ],
  transformResponse: [
    function(data) {
      //请求返回后的数据处理
      return data;
    }
  ]
});

React.Component.prototype.$http = instance;
instance.interceptors.request.use(
  config => {
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);
instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    return Promise.reject(error.response && error.response.data);
  }
);
export default instance;
