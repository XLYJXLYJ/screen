import ReconnectingWebSocket from 'reconnecting-websocket' // websoket重连库
import htmlWebSocket from 'html5-websocket'

import * as config from './../config/index.js'

let WSURL = config.node_ws_api_host + ':' +config.node_ws_api_port + config.node_ws_api_router

// websoket 接口
export let map_route_ws_api = {
    'Api_Tv': WSURL + '/websocket/tv/'
}

// websoket方法
export let wsSendRequest = function({
                             url = '',
                             params = {},
                             WebSocket, // WebSocket对象
                             maxReconnectionDelay, // 重新连接之间的最大毫秒延迟
                             minReconnectionDelay, // 在重新连接之间的毫秒延迟
                             reconnectionDelayGrowFactor, // 重新连接延迟增长的速度有多快
                             minUptime, // 最小时间在ms中，确实认为连接是稳定的
                             connectionTimeout, // 如果在此之后没有连接，请在ms中重试连接
                             maxRetries, // 最大数量的重试
                             debug, // 使调试输出
                             message_function,
                             reconnect_function, // 重连事件
                             send_function,
                             onerror_function ,
                             onopen_function,
                             close_function,
                             }) {
    const rws = new ReconnectingWebSocket(url, [], {
        WebSocket: WebSocket || htmlWebSocket,
        maxReconnectionDelay: maxReconnectionDelay,
        minReconnectionDelay: minReconnectionDelay,
        reconnectionDelayGrowFactor: reconnectionDelayGrowFactor,
        minUptime: minUptime,
        connectionTimeout: connectionTimeout,
        maxRetries: maxRetries,
        debug: debug
    })

    // 开启和关闭发送心跳的定时器
    rws._timer = null

    // 记录接收心跳的定时器
    rws._heartbeatTimer = null

    rws.sendStop = function () {
        clearInterval(this._timer)
    }
    rws.sendStart = function () {
        this.sendStop()
        this.send('ping_server')
        this._timer = setInterval(() => {
            this.send('ping_server')
        }, 1000 * 60)
    }

    message_function && rws.addEventListener('message', function (res) {
        clearTimeout(this._heartbeatTimer)
        this._heartbeatTimer = setTimeout(() => {
            console.log('超过三分钟未收到服务端消息')
            fundebug && fundebug.notifyError('超过三分钟未收到服务端消息', {
                prevData: res
            })
            this.close();
            window.location.reload();
        }, 1000 * 60 * 3)

        let data = res.data || ''
        if (!data || data == 'beat_test') return
        message_function(data)
    }.bind(rws))

    close_function && rws.addEventListener('close', function(code, reason) {
        clearTimeout(this._heartbeatTimer)
        this.sendStop()
        close_function(code, reason)
        // this._shouldReconnect && this._connect()
        this._connect()
    }.bind(rws))

    rws.addEventListener('reconnect', function (code, reason) {
        console.log('重连')
        // console.log('重连---------------')
        // onopen_function(code,reason)
    }.bind(rws))

    rws.addEventListener('open', function (code, reason) {
        // this.send(JSON.stringify(params))
        onopen_function(code, reason)
        this.sendStart()
    }.bind(rws))

    rws.addEventListener('error', function (code, reason) {
        console.log('发生错误了')
        onerror_function(code, reason)
    }.bind(rws))

    return rws
}

