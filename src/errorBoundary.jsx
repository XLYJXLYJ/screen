import React from 'react'
import fundebug from 'fundebug-javascript'
import * as tools from './tools'

const webVersiton = '1.0.0(003)'

// 配置apikey
fundebug.apikey = "eac9769bfabcfb2b8b1fdfb79905c57750f138a9f7c558af8e45ef9577072f5d"
// 应用版本
fundebug.appversion = webVersiton
// 配置环境，用以过滤区分
fundebug.releasestage = process.env.NODE_CUSTOM_ENV
// 是否关闭fundebug
fundebug.silent = false//process.env.NODE_CUSTOM_ENV !== 'production'
// 资源加载是否忽略
fundebug.silentResource = true
// 是否关闭记录控制台打印信息 （此操作控制开启，控制台打印为fundebug打印，将会找不到源代码的行数）
fundebug.silentConsole = process.env.NODE_CUSTOM_ENV === 'development'
// 是否关闭录屏功能 （付费）
fundebug.silentVideo = false
// 是否关闭记录用户行为 （付费）
fundebug.silentBehavior = false

// 配置自定义信息 （付费）
fundebug.metaData = {
  deviceCode: tools.getUrlParam('deviceCode') || '',
  version: tools.getUrlParam('version') || '',
  resData: window._resData
}

// 配置用户信息
fundebug.user = {
  email: tools.getUrlParam('deviceCode') || '',
  name: tools.getUrlParam('version') || ''
}


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true })
    // 将component中的报错发送到Fundebug

    fundebug.notifyError(error, {
      metaData: {
        info
      }
    })
  }

  render() {
    if (this.state.hasError) {
      return null
      // 也可以在出错的component处展示出错信息
      // return <h1>出错了!</h1>;
    }
    return this.props.children
  }
}

export default ErrorBoundary