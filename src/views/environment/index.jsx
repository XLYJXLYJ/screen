import React, { Component } from "react"
import { DataSet, DataView } from "@antv/data-set"
import G2 from "@antv/g2"

import CountUp from "react-countup"
import solarLunar from "../../assets/js/solarlunar"
import * as config from "../../config/index"
import * as tools from "../../tools/index"

import mapbg from "../../assets/images/mapbg.png"
import warnMarker from "../../assets/images/warnMarker.png"
import biPng1 from "../../assets/images/bi1.png"

import "./index.scss"

// 跑马灯组件
class MarqueeWrap extends Component {
    constructor(props) {
        super(props)

        this.state = {
        visible: false
        }

        this.titleContainerDom = React.createRef()
        this.marqueeWrapDom = React.createRef()
    }
    componentDidMount() {
        this.initLayoutHandle()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.title !== this.props.title) {
        this.initLayoutHandle()
        }
    }

    initLayoutHandle() {
        let titleContainerDom = this.titleContainerDom.current
        let marqueeWrapDom = this.marqueeWrapDom.current

        let titleContainerVal = 0 // 目标值
        let marqueeWrapDomVal = 0 // 目标容器值

        if (
        this.props.marqueeDirection === "left" ||
        this.props.marqueeDirection === "right"
        ) {
        titleContainerVal = titleContainerDom.offsetWidth
        marqueeWrapDomVal = marqueeWrapDom.offsetWidth
        }
        if (
        this.props.marqueeDirection === "up" ||
        this.props.marqueeDirection === "down"
        ) {
        titleContainerVal = titleContainerDom.offsetHeight
        marqueeWrapDomVal = marqueeWrapDom.offsetHeight
        }
        if (titleContainerVal > marqueeWrapDomVal) {
        // 目标值 大于 容器值  则动画开起
        this.setState({
            visible: true
        })
        } else {
        this.setState({
            visible: false
        })
        }
    }
    render() {
        let spanCss = Object.assign({}, this.props.styleCss, {
        opacity: this.state.visible ? 0 : 1
        })
        let showGradient = this.props.showGradient && this.state.visible // 是否显示渐变
        return (
        <div
            className={["marquee-wrap", showGradient ? "linear-gradient" : ""].join(
            " "
            )}
            ref={this.marqueeWrapDom}
        >
            <span
            ref={this.titleContainerDom}
            style={spanCss}
            className="marquee-wrap-container"
            >
            {this.props.title}
            </span>
            {this.state.visible ? (
            <marquee
                style={this.props.styleCss}
                className="marquee-wrap-marquee"
                behavior=""
                truespeed = "true"
                scrolldelay="400"
                direction={this.props.marqueeDirection}
                scrollamount={this.props.scrollamount}
            >
                {this.props.title}
            </marquee>
            ) : null}
        </div>
        )
    }
}
MarqueeWrap.defaultProps = {
  title: "",
  scrollamount: 2,
  marqueeDirection: "left", // 文本滚动的方向
  styleCss: {} // 文字样式
}

// 底部信息提示
class FooterInfoWrap extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
        <div className={"footer-infowrap"}>
            {this.props.footerInfoStatus === "updateVer" ? (
            <div className={"footer-main-info footer-main-updataver"}>
                <div className="info-img" />
                <span className="info-text">
                发现新版本，点击遥控器“确认”键升级。
                </span>
            </div>
            ) : null}
            {this.props.footerInfoStatus === "noNetwork" ? (
            <div className={"footer-main-info footer-main-nonetwork"}>
                <div className="info-img" />
                <span className="info-text">当前网络异常，请检查网络设置。</span>
            </div>
            ) : null}
            {this.props.footerInfoStatus === "networkAbnormal" ? (
            <div className={"footer-main-info footer-main-networkabnormal"}>
                <div className="info-img" />
                <span className="info-text">
                当前网络信号弱，请检查网络设置。
                </span>
            </div>
            ) : null}
            {this.props.footerInfoStatus === "serverPast" ? (
            <div className={"footer-main-info footer-main-serverpast"}>
                <div className="info-img" />
                <span className="info-text">
                服务已过期，请联系项目管理员续费。
                </span>
            </div>
            ) : null}
            {this.props.footerInfoStatus === "notBind" ? (
            <div className={"footer-main-info footer-main-serverpast"}>
                <div className="info-img" />
                <span className="info-text">
                未绑定设备，请联系项目管理员处理。
                </span>
            </div>
            ) : null}
            {this.props.footerInfoStatus === "urlSourceChange" ? (
            <div className={"footer-main-info footer-main-serverpast"}>
                <div className="info-img" />
                <span className="info-text">云屏源已切换。</span>
            </div>
            ) : null}
        </div>
        )
    }
}
FooterInfoWrap.defaultProps = {
    footerInfoStatus: ""
}

// 自定义 shape, 柱形图的圆角
G2.Shape.registerShape("interval", "borderRadius", {
    draw: function draw(cfg, container) {
        let points = cfg.points
        let path = []
        path.push(["M", points[0].x, points[0].y])
        path.push(["L", points[1].x, points[1].y])
        path.push(["L", points[2].x, points[2].y])
        path.push(["L", points[3].x, points[3].y])
        path.push("Z")
        path = this.parsePath(path) // 将 0 - 1 转化为画布坐标
        return container.addShape("rect", {
        attrs: {
            x: path[1][1], // 矩形起始点为左上角
            y: path[1][2],
            width: path[2][1] - path[1][1],
            height: path[0][2] - path[1][2],
            fill: cfg.color,
            radius: [(path[2][1] - path[1][1]) / 5, (path[2][1] - path[1][1]) / 5, 0, 0]
        }
        })
    }
})

// 主组件
class App extends Component {
  constructor(props) {
    super(props)
    this.brokenlinContainerDom = React.createRef() // 近 12 小时数据统计 折线图对象
    this.columnarTorqueDom = React.createRef() //PM10 7天柱状图对象
    this.columnarHeavyDom = React.createRef() //PM2.5 7天柱状图对象
    this.columnarAmplitudeDom = React.createRef() //PMTSP 7天柱状图对象
    this.proportionDom = React.createRef() //24小时报警次数饼图对象
    this.map = null // 地图对象
    this.mapMarkerDrawCircle = []//选中地图圆圈对象
    this.mapMarkerDraw = []//选中地图光标对象

    this.equipmentListTime = null // 设备列表定时器对象
    this.brokenLineChart = null // 折线图对象
    this.columnarHeavy = null //PM10 7天柱状图对象
    this.columnarTorque = null //PM25 7天柱状图对象
    this.columnarAmplitude = null //PMTSP 7天柱状图对象
    this.proportion24th = null //24小时报警次数饼图对象

    this.markerList = [] // 地图标准列表
    this.removeMarkerList = [] // 需要移除的地图列表
    this.markerListCircle = [] // 地图光圈
    this.removeMarkerListCircle = [] // 移除选中地图光圈
    this.markerListText = '' // 地图文字列表

    this.state = {
      showTaji: 0, //初始化是否显示塔机

      projectName: "", // 项目名称
      logo: "", // logo图片
      // projectNameStatus: true, // 项目名称样式
      slogan: "", // 头部公告
      localTime: "", // 本地时间
      oterInfoStatus: "", // 底部提示信息  noNetwork 无网 updateVer 版本更新networkAbnormal 网络异常serverPast 服务过期
      yunPingName: "", // 云屏服务名称
      yunPingCode: "", // 云屏设备码
      aMapList: [],
      // 地图多边形路径
      mapPolygonPath: [],
      //指标数据
      indicators: "",
      startIndicators: "", // 开始指标数据
      startIndicators_90:"", // 解决旋转问题
      endIndicators: "",
      endIndicators_null:'',
      //设备列表
      equipmentList: [],
      // 选中当前设备
      actionEquipmentListIndex: 0,
      // 12小时折线图数据
      brokenLineList: null,
      // 7天平均数值数据
      sevenDays: null,
      // 报警统计
      warnStatistic: {},
    }
    // 18414220100155144  18414220100155130 huanjingjiance
    let deviceCode = tools.getUrlParam("deviceCode") || "taji"
    this.deviceCode = deviceCode // 设备码
    this.version = tools.getUrlParam("version") || "1.0" // 版本

    window.web_setNetWork = this.web_setNetWork
  }
  //组件将要渲染
  componentWillMount() {
    this.map = null
    console.log(222)
    console.log(this.map)
    this.getBaseInfo()
    this.getDevice()
    this.updateLocalTime()
  }
  componentDidMount() {
    // 添加地图
    const gaodeMapsDom = document.createElement("script")
    const headerDom = document.querySelector("head")

    gaodeMapsDom.type = "text/javascript"
    gaodeMapsDom.src = `https://webapi.amap.com/maps?v=1.4.15&key=34dda2918eee145d1520d8a7c59c3408&plugin=AMap.Geocoder,AMap.Object3DLayer,AMap.Scale&callback=init`

    window.init = () => {
      // this.initMap()
    }
    headerDom.appendChild(gaodeMapsDom)
  }
  // 初始化折线图
  initBrokenLine() {
    if (this.brokenLineChart) {
      this.brokenLineChart.changeData(
        this.state.brokenLineList.indicatorDateList
      )
      return null
    }
    // 创建主题
    G2.Global.registerTheme("themeOne", {
      axis: {
        bottom: {
          label: null,
          tickLine: null, //坐标轴刻度线
          line: {
            lineWidth: .5,
            lineDash: [1, 1],
            stroke: "#ccc",
          },
          grid: {
            hideFirstLine: true,
            lineStyle: {
              lineDash: [1, 1],
              lineWidth: .1,
              stroke: "#454551"
            },
            // align: 'left',
            zIndex: 1
          }
        },
        right: {
          line: {
            opacity: 0
          },
          label: null,
          grid: null
        },
        left: {
          line: {
            lineWidth: .5,
            lineDash: [1, 1],
            stroke: "#454551"
          },
          tickLine: {
            length: 2,
          },
          label: null,
          tickCount: 3,
          grid: {
            hideFirstLine: true,
            lineStyle: {
              lineDash: [1, 1],
              lineWidth: .5,
              stroke: "#454551"
            },
            zIndex: -1
          }
        }
      }
    })
    let height = this.brokenlinContainerDom.current.offsetHeight
    this.brokenLineChart = new G2.Chart({
      container: "brokenlin-container",
      forceFit: true,
      height: height,
      padding: [0, 0, 0, 0],
      theme: "themeOne"
    })
    let maxValue = Math.max(this.state.brokenLineList.heavy.maxValue,
      this.state.brokenLineList.torque.maxValue,
      this.state.brokenLineList.amplitude.maxValue)
    let min = maxValue == 0 ? 0 : -50
    let max = maxValue == 0 ? 1 : maxValue + 50
    let tickCount = maxValue == 0 ? 6 : 4

    this.brokenLineChart.source(this.state.brokenLineList.indicatorDateList)
    this.brokenLineChart.scale("amplitude", {
      min,
      max,
      tickCount
    })
    this.brokenLineChart.scale("heavy", {
      min,
      max,
      tickCount
    })
    this.brokenLineChart.scale("torque", {
      min,
      max,
      tickCount
    })

    //控制起始点
    this.brokenLineChart.scale("dateHour", {
      range: [0, 1],
    })

    //设置底部标线
    this.brokenLineChart.legend(false)
    //设置顶部白色虚线
    this.brokenLineChart.guide().line({
      top: true,
      start: [this.state.brokenLineList.indicatorDateList[0].dateHour, maxValue == 0 ? 3 : max+50],
      end: [
        this.state.brokenLineList.indicatorDateList[
          this.state.brokenLineList.indicatorDateList.length - 1
        ].dateHour,
        maxValue == 0 ? 3 : max+50
      ],
      lineStyle: {
        stroke: "#ccc",
        lineWidth: .5,
        lineDash: [1, 1]
      }
    })
    this.brokenLineChart
      .line()
      .position("dateHour*heavy")
      .color("#9013fe").style({
        lineWidth: 1
      })
    this.brokenLineChart
      .line()
      .position("dateHour*torque")
      .color("#8b572a").style({
        lineWidth: 1
      })
    this.brokenLineChart
      .line()
      .position("dateHour*torque")
      .color("#62a3f1").style({
        lineWidth: 1
      })

    this.brokenLineChart.render()
  }
  // 初始化柱状图
  initColumnar (target, changeValue, targetDom) {
        if (target) {
            target.changeData(changeValue.dayValue)
            return null
        }
        G2.Global.registerTheme("themeOne", {
            axis: {
            bottom: {
                label: null,
                tickLine: null, //坐标轴刻度线
                line: null,
                grid: null
            },
            left: {
                line: null,
                label: null,
                grid: null
            }
            }
        })
        let height = targetDom.current.offsetHeight
        target = new G2.Chart({
            container: "columnar-torque",
            pixelRatio: devicePixelRatio,
            forceFit: true,
            height: height,
            padding: [0, 'auto', 0, 'auto'],
            theme: "themeOne"
        })
        target.source(changeValue.dayValue, {
            value: {
            type: "linear",
            values: ["min"],
            tickInterval: changeValue.maxValue //设置最大高度
            },
        })
    
        target
            .interval()
            .position("day*value")
            .size(7)
            .shape("borderRadius")
            .color("#fcb813")

        target.render()
  }
  //初始化7天 力矩 柱状图
  initColumnarTorque() {
    if (this.columnarTorque) {
      this.columnarTorque.changeData(this.state.sevenDays.torque.dayValue)
      return null
    }
    G2.Global.registerTheme("themeOne", {
      axis: {
        bottom: {
          label: null,
          tickLine: null, //坐标轴刻度线
          line: null,
          grid: null
        },
        left: {
          line: null,
          label: null,
          grid: null
        }
      }
    })
    let height = this.columnarTorqueDom.current.offsetHeight
    this.columnarTorque = new G2.Chart({
      container: "columnar-torque",
      pixelRatio: devicePixelRatio,
      forceFit: true,
      height: height,
      padding: [0, 'auto', 0, 'auto'],
      theme: "themeOne"
    })
    this.columnarTorque.source(this.state.sevenDays.torque.dayValue, {
      value: {
        type: "linear",
        values: ["min"],
        tickInterval: this.state.sevenDays.torque.maxValue //设置最大高度
      },
    })

    this.columnarTorque
      .interval()
      .position("day*value")
      .size(7)
      .shape("borderRadius")
      .color("#fcb813")
    this.columnarTorque.render()
  }
  //初始化7天 载重 柱状图
  initColumnarAmplitude() {
    if (this.columnarHeavy) {
      this.columnarHeavy.changeData(this.state.sevenDays.heavy.dayValue)
      return null
    }
    G2.Global.registerTheme("themeOne", {
      axis: {
        bottom: {
          label: null,
          tickLine: null, //坐标轴刻度线
          line: null,
          grid: null
        },
        left: {
          line: null,
          label: null,
          grid: null
        }
      }
    })
    let height = this.columnarHeavyDom.current.offsetHeight

    this.columnarHeavy = new G2.Chart({
      container: "columnar-heavy",
      pixelRatio: devicePixelRatio,
      forceFit: true,
      height: height,
      padding: [0, 'auto', 0, 'auto'],
      theme: "themeOne"
    })
    this.columnarHeavy.source(this.state.sevenDays.heavy.dayValue, {
      value: {
        type: "linear",
        values: ["min"],
        tickInterval: this.state.sevenDays.heavy.maxValue //设置最大高度
      }
    })
    this.columnarHeavy
      .interval()
      .position("day*value")
      .size(7)
      .shape("borderRadius")
      .color("#fcb813")
    this.columnarHeavy.render()
  }
  //初始化7天 幅度 柱状图
  initColumnarHeavy() {
    if (this.columnarAmplitude) {
      this.columnarAmplitude.changeData(this.state.sevenDays.amplitude.dayValue)
      return null
    }
    G2.Global.registerTheme("themeOne", {
      axis: {
        bottom: {
          label: null,
          tickLine: null, //坐标轴刻度线
          line: null,
          grid: null
        },
        left: {
          line: null,
          label: null,
          grid: null
        }
      }
    })
    let height = this.columnarAmplitudeDom.current.offsetHeight
    this.columnarAmplitude = new G2.Chart({
      container: "columnar-amplitude",
      pixelRatio: devicePixelRatio,
      forceFit: true,
      height: height,
      padding: [0, 'auto', 0, 'auto'],
      theme: "themeOne"
    })
    this.columnarAmplitude.source(this.state.sevenDays.amplitude.dayValue, {
      value: {
        type: "linear",
        values: ["min"],
        tickInterval: this.state.sevenDays.amplitude.maxValue //设置最大高度
      }
    })
    this.columnarAmplitude
      .interval()
      .position("day*value")
      .size(7)
      .shape("borderRadius")
      .color("#fcb813")
    this.columnarAmplitude.render()
  }
  //初始化24th 设备告警次数
  initProportion24th() {
    this.proportion24th && this.proportion24th.destroy()

    
    let _r = 255
    let _lineR = 255
    function pxRem(num) {
      return num / 38.4 + "rem"
    }
    let startAngle = -Math.PI/2 - Math.PI //开始角度
    let height = this.proportionDom.current.offsetHeight+20
    let indexVal = this.state.equipmentList[this.state.actionEquipmentListIndex].orderProductList //选中值
    let total = Object.assign([], this.state.equipmentList).reduce((a, b) => {
      return a + b.alarmTimes
    }, 0)

    let copyData = JSON.parse(JSON.stringify(this.state.equipmentList))
    let equipmentList = [];
    copyData.map(item =>{
      if(item.alarmTimes==0 || item.bindStatus==4){ //报警次数为0 或 未绑定
        return false
      }else{
        equipmentList.push(item);
      }
    })

    if(equipmentList.length<=0){
      return;
    }

    //所有设置报警次数都是等于0  :平分甜甜圈🍩
    let isAllZeo = equipmentList.every(e => e.alarmTimes == 0)
    isAllZeo && equipmentList.forEach(e => e.alarmTimes = 10)

    if (this.state.actionEquipmentListIndex != 0) {
      equipmentList.splice(0, 0, equipmentList.splice(this.state.actionEquipmentListIndex, 1)[0]) //选中设备放到数组第一位
    }

    let ds = new DataSet()
    let dv = ds.createView().source(equipmentList)
    dv.transform({
      type: "percent",
      field: "alarmTimes",
      dimension: "deviceName",
      as: "percent"
    })
    this.proportion24th = new G2.Chart({
      container: "proportion-24th",
      forceFit: true,
      height: height,
      padding: [10, 100, 30, 0]
    })

    this.proportion24th.source(equipmentList)
    this.proportion24th.legend(false)
    this.proportion24th.coord("theta", {
      radius: 0.81,
      innerRadius: 0.64,
      startAngle,
      endAngle: startAngle + Math.PI * 2
    })
    //中间统计数字
    this.proportion24th.guide().html({
      position: ["50%", "50%"],
      html: `<div style="color:#fff;font-size: ${pxRem(28)};margin-top:2px;text-align: center;width: 10em;font-weight:normal">${total}</div>`,
      alignX: "middle",
      alignY: "middle"
    })

    this.proportion24th
      .intervalStack()
      .position("alarmTimes")
      .color("orderProductList", a => {
        if (a == indexVal) {
          return "rgba(0,0,0,0)"
        } else {
          let rgb = `rgb(${_r}, ${_r}, ${_r})`
          if(_r>50){
            _r = _r - 50
          }else{
            _r = 250
          }
          return rgb
        }
      })
      .label("alarmTimes*orderProductList", (a, b) => {
        return b == indexVal
          ? {
            formatter: value => {
                return isAllZeo ? "0" : value
            },
            offset: -2,
            autoRotate: false,
            textStyle: {
              fill: "#000",
              textBaseline: 'middle',
              textAlign: 'center',
              fontSize: 8
            }
          }
          : null
      })
      .select(false)
      .style({
        lineWidth: 0
      })
    let outterView = this.proportion24th.view()
    let dv1 = new DataView()
    dv1.source(equipmentList).transform({
      type: "percent",
      field: "alarmTimes",
      dimension: "deviceName",
      as: "percent"
    })
    outterView.source(dv1)
    outterView.coord("theta", {
      radius: 1,
      innerRadius: 0.52,
      startAngle,
      endAngle: startAngle + Math.PI * 2
    })
    outterView
      .intervalStack()
      .position("percent")
      .color("orderProductList", a => {
        return a == indexVal ? "#fcb813" : "rgba(0,0,0,0)"
      }).opacity(1)
      .select(false)
      .style({
        lineWidth: 0
      })

    this.proportion24th.render()

    let OFFSET = 0 //控制第一次折线长度
    let APPEND_OFFSET = 95 //控制第二次折线的长度  越小越长
    let LINEHEIGHT = 20 //行高 - 让数据平均分布
    let yellowAngle = .6 //黄色环第一次折线角度
    let coord = this.proportion24th.get("coord") // 获取坐标系对象
    let center = coord.center // 极坐标圆心坐标
    let r = coord.radius // 极坐标半径
    let canvas = this.proportion24th.get("canvas")
    let canvasWidth = this.proportion24th.get("width")
    let canvasHeight = this.proportion24th.get("height")
    let labelGroup = canvas.addGroup()
    let labels = []
    addPieLabel(this.proportion24th)
    canvas.draw()
    //main
    function addPieLabel() {
      let halves = [[], []]
      let data = dv.rows
      let angle = startAngle
      let fill = "#fcb813"
      for (let i = 0; i < data.length; i++) {
        let isYellow = data[i].orderProductList == indexVal //黄色部分
        OFFSET = isYellow ? OFFSET : 5 //控制第一次折线长度
        let percent = data[i].percent
        let targetAngle = angle + Math.PI * 2 * percent
        let middleAngle =
          angle + (isYellow ? 0 : (targetAngle - angle) / 3) //调节高度间隔
        angle = targetAngle
        let edgePoint = getEndPoint(center, middleAngle, r + (isYellow ? 5 : 0))//折线离环的距离
        let routerPoint = getEndPoint(center, middleAngle - (isYellow ? yellowAngle : 0), r + OFFSET)
        if (isYellow) {
          fill = "#fcb813"
        } else {
          fill = `rgb(${_lineR}, ${_lineR}, ${_lineR})`
          _lineR = _lineR - 50
        }

        //label
        let label = {
          _anchor: edgePoint,
          _router: routerPoint,
          _data: data[i],
          x: routerPoint.x,
          y: routerPoint.y,
          r: r + OFFSET,
          fill
        }
        // 判断文本的方向
        label._side = "left"
        halves[0].push(label)
      } // end of for

      let maxCountForOneSide = parseInt(canvasHeight / LINEHEIGHT, 10)
      halves.forEach(function (half, index) {
        // step 2: reduce labels
        if (half.length > maxCountForOneSide) {
          half.sort(function (a, b) {
            return b._percent - a._percent
          })
          half.splice(maxCountForOneSide, half.length - maxCountForOneSide)
        }

        // step 3: distribute position (x and y)
        half.sort(function (a, b) {
          return a.y - b.y
        })
        antiCollision(half, index)
      })
    }

    function getEndPoint(center, angle, r) {
      return {
        x: center.x + r * Math.cos(angle),
        y: center.y + r * Math.sin(angle)
      }
    }

    function drawLabel(label) {
      let _anchor = label._anchor,
        _router = label._router,
        fill = label.fill,
        y = label.y
      let labelAttrs = {
        y: y,
        fontSize: 8.5, // 字体大小
        fill: "#ccc",
        text: label._data.deviceName,
        textBaseline: "middle"
      }
      let lastPoint = {
        y: y
      }
      lastPoint.x = canvasWidth - APPEND_OFFSET
      labelAttrs.x = canvasWidth - 90 // 右侧文本右对齐并贴着画布最右侧边缘
      labelAttrs.textAlign = "left"
      // 绘制文本
      let text = labelGroup.addShape("Text", {
        attrs: labelAttrs
      })
      labels.push(text)
      // 绘制连接线
      let points = void 0
      if (_router.y !== y) {
        // 文本位置做过调整
        points = [
          [_anchor.x, _anchor.y],
          [_router.x, y],
          [lastPoint.x, lastPoint.y]
        ]
      } else {
        points = [
          [_anchor.x, _anchor.y],
          [_router.x, _router.y],
          [lastPoint.x, lastPoint.y]
        ]
      }

      labelGroup.addShape("polyline", {
        attrs: {
          points: points,
          lineWidth: 1,
          stroke: fill
        }
      })
    }
    // 防重叠
    function antiCollision(half, isRight) {
      let startY = center.y - r - OFFSET - LINEHEIGHT
      let overlapping = true
      let totalH = canvasHeight
      let i = void 0

      let maxY = 0
      let minY = Number.MIN_VALUE
      let boxes = half.map(function (label) {
        let labelY = label.y
        if (labelY > maxY) {
          maxY = labelY
        }
        if (labelY < minY) {
          minY = labelY
        }
        return {
          size: LINEHEIGHT,
          targets: [labelY - startY]
        }
      })
      if (maxY - startY > totalH) {
        totalH = maxY - startY
      }

      while (overlapping) {
        boxes.forEach(function (box) {
          let target =
            (Math.min.apply(minY, box.targets) +
              Math.max.apply(minY, box.targets)) /
            2
          box.pos = Math.min(
            Math.max(minY, target - box.size / 2),
            totalH - box.size
          )
        })

        // 检测重叠和连接框
        overlapping = false
        i = boxes.length
        while (i--) {
          if (i > 0) {
            let previousBox = boxes[i - 1]
            let box = boxes[i]
            if (previousBox.pos + previousBox.size > box.pos) {
              // 重叠
              previousBox.size += box.size
              previousBox.targets = previousBox.targets.concat(box.targets)

              // 溢出,转变
              if (previousBox.pos + previousBox.size > totalH) {
                previousBox.pos = totalH - previousBox.size
              }
              boxes.splice(i, 1) // 删除盒子
              overlapping = true
            }
          }
        }
      }

      // step 4: 将y标准化并调整x
      i = 0
      boxes.forEach(function (b) {
        let posInCompositeBox = startY // 标签居中
        b.targets.forEach(function () {
          half[i].y = b.pos + posInCompositeBox + LINEHEIGHT / 2
          posInCompositeBox += LINEHEIGHT
          i++
        })
      })

      // (x - cx)^2 + (y - cy)^2 = totalR^2
      half.forEach(function (label) {
        let rPow2 = label.r * label.r
        let dyPow2 = Math.pow(Math.abs(label.y - center.y), 2)
        if (rPow2 < dyPow2) {
          label.x = center.x
        } else {
          let dx = Math.sqrt(rPow2 - dyPow2)
          if (!isRight) {
            // left
            label.x = center.x - dx
          } else {
            // right
            label.x = center.x + dx
          }
        }
        drawLabel(label)
      })
    }
  }
  // 初始化地图
  initMap() {
    if (this.map) {
      this.mapMarkerDraw && this.map.remove(this.mapMarkerDraw)
      this.mapMarkerDrawCircle && this.map.remove(this.mapMarkerDrawCircle)
      this.resetMapMarker()
      this.resetMapMarkerIris()

      this.selMapMarker()
      this.selMapMarkerCircle()
      
      this.selMapText()

 
    } else {
      console.log(333)
      this.map = new AMap.Map("mapcontainer", {
        resizeEnable: true, // 是否监控地图容器尺寸变化，默认值为false
        expandZoomRange:true,
        zoom:20,
        zooms:[3,20],
        animateEnable: true,
        jogEnable: true,
        mapStyle: "amap://styles/e82b537e91ee2e22c215325293b01d70" //设置地图的显示样式
      });
      // 将图层添加至地图实例

      this.resetMapMarker();
      this.resetMapMarkerIris()

      this.selMapMarker();
      this.selMapMarkerCircle()

      this.selMapText()
      //画定位2d图形
      this.map2D();
      // 画方格
      setTimeout(() => {
        this.mapCheck();
        this.map3D();

      this.setState({
        showTaji: 1,
      })

      }, 1000)
    }
  }

  fillRoundRect(cxt, x, y, width, height, radius, fillColor) {
      //圆的直径必然要小于矩形的宽高          
      if (2 * radius > width || 2 * radius > height) { return false; }
      cxt.save();
      cxt.translate(x, y);
      //绘制圆角矩形的各个边  
      this.drawRoundRectPath(cxt, width, height, radius);
      cxt.shadowOffsetX = 0; // 阴影Y轴偏移
      cxt.shadowOffsetY = 5; // 阴影X轴偏移
      cxt.shadowBlur = 10; // 模糊尺寸
      cxt.shadowColor = '#333'; // 颜色

      cxt.fillStyle = fillColor || "#000"; //若是给定了值就用给定的值否则给予默认值  
      cxt.fill();
      cxt.restore();
  }
  fillRoundRectLong(cxt, x, y, width, height, radius, fillColor) {
    //圆的直径必然要小于矩形的宽高          
    if (2 * radius > width || 2 * radius > height) { return false; }
    cxt.save();
    cxt.translate(x, y);
    //绘制圆角矩形的各个边  
    var img = new Image()
    img.src = biPng1
    //图片加载完后，将其显示在canvas中
    img.onload = function(){
        cxt.rotate(-Math.PI / 2);
        cxt.drawImage(this, x, y,9,120)
    }
    cxt.fill();
    cxt.restore();
}

  drawRoundRectPath(cxt, width, height, radius) {
    cxt.beginPath(0);
    //从右下角顺时针绘制，弧度从0到1/2PI  
    cxt.strokeStyle = "rgba(255,255,255,0)";
    cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2);
    //矩形下边线  
    cxt.lineTo(radius, height);
    //左下角圆弧，弧度从1/2PI到PI  
    cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);
    //矩形左边线  
    cxt.lineTo(0, radius);
    //左上角圆弧，弧度从PI到3/2PI  
    cxt.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);
    //上边线  
    cxt.lineTo(width - radius, 0);
    //右上角圆弧  
    cxt.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);
    //右边线  
    cxt.lineTo(width, height - radius);
    cxt.stroke();
    cxt.closePath();
  }

  // 画没有选中的塔机臂
  resetMapMarker() {
    // this.map.remove(this.markerList)
    // this.removeMarkerList = []
    // this.markerList = []

    if(this.markerList.length !== 0){
      this.map.remove(this.removeMarkerList)
      this.removeMarkerList = [];
      this.removeMarkerList = copyArr(this.markerList)
      function copyArr(arr) {
          let res = []
          for (let i = 0; i < arr.length; i++) {
            res.push(arr[i])
          }
          return res
      }
      this.markerList.forEach((e, i) => {
        if(this.state.actionEquipmentListIndex == i){
          this.removeMarkerList.splice(i,1)
          this.markerList.splice(i,1)
        }
      })
      this.map.add(this.removeMarkerList)
      
      
      // return null
    }

    this.state.equipmentList.forEach((item, index) => {
      if(this.removeMarkerList.length == 0){
          let canvasC = document.createElement('canvas')
          let size = this.map.getSize() //resize
          let width = size.width
          let height = size.height
          canvasC.style.width = width + "px"
          canvasC.style.height = height + "px"
          canvasC.width = width*devicePixelRatio
          canvasC.height = height*devicePixelRatio
          let context = canvasC.getContext('2d')
          context.fillStyle = 'rgba(252, 184, 19,1)'
          context.strokeStyle = 'rgba(252, 184, 19,1)'
      
          let radius = 0

          let draw = () => {
            context.clearRect(0, 0, canvasC.width, canvasC.height)
            context.lineWidth = 1;
            //边框颜色
            context.beginPath();
            context.strokeStyle="rgb(252,184,19)";
            context.translate(100, 95);
            context.rotate((item.rotary - 180) * Math.PI / 180);
            this.fillRoundRectLong(context, -5,-25, 125,10, 2, 'rgba(252,184,19,0.8)');
            context.closePath();
            //方块的颜色
            context.beginPath();
            // context.fillStyle = "rgb(252,184,19)";
            this.fillRoundRect(context, -15, -15, 30, 30, 2, 'rgba(252,184,19)');
            context.closePath();
            //小球
            context.beginPath();
            context.arc(12+item.amplitude*1.5, 0.5, 2, 0, 360, false);
            context.fillStyle = "rgb(252,184,19)";
            context.fill();
            context.stroke();
            context.closePath();
            // AMap.Util.requestAnimFrame(draw)
            context.restore();
          }
          draw()
          this.markerList.push(
            new AMap.Marker({
              content: canvasC,
              position: new AMap.LngLat(item.longitude, item.latitude),
              offset: new AMap.Pixel(-19, -27),
              size: new AMap.Size(50, 59),
              zIndex: 99 - index,
            })
          )
      }else{
        if(index == this.state.actionEquipmentListIndex){
          let canvasC = document.createElement('canvas')
          let size = this.map.getSize() //resize
          let width = size.width
          let height = size.height
          canvasC.style.width = width + "px"
          canvasC.style.height = height + "px"
          canvasC.width = width*devicePixelRatio
          canvasC.height = height*devicePixelRatio
          let context = canvasC.getContext('2d')
          context.fillStyle = 'rgba(252, 184, 19,1)'
          context.strokeStyle = 'rgba(252, 184, 19,1)'
      
          let radius = 0

          let draw = () => {
            context.clearRect(0, 0, canvasC.width, canvasC.height)
            context.lineWidth = 1;
            //边框颜色
            context.beginPath();
            context.strokeStyle="rgb(252,184,19)";
            context.translate(100, 95);
            context.rotate((item.rotary - 180) * Math.PI / 180);
            this.fillRoundRectLong(context, -5,-25, 125,10, 2, 'rgba(252,184,19,0.8)');
            context.closePath();
            //方块的颜色
            context.beginPath();
            // context.fillStyle = "rgb(252,184,19)";
            this.fillRoundRect(context, -15, -15, 30, 30, 2, 'rgba(252,184,19)');
            context.closePath();
            //小球
            context.beginPath();
            context.arc(12+item.amplitude*1.5, 0.5, 2, 0, 360, false);
            context.fillStyle = "rgb(252,184,19)";
            context.fill();
            context.stroke();
            context.closePath();
            // AMap.Util.requestAnimFrame(draw)
            context.restore();
          }
          draw()

          this.markerList.splice(this.state.actionEquipmentListIndex,0,
            new AMap.Marker({
              content: canvasC,
              position: new AMap.LngLat(item.longitude, item.latitude),
              offset: new AMap.Pixel(-19, -27),
              size: new AMap.Size(50, 59),
              zIndex: 99 - index,
            })
          )
        }
      }

    })

    if(this.removeMarkerList.length == 0){
      this.removeMarkerList = []
      this.state.equipmentList.forEach((item, index) => {
        if(index !== 0){
          let canvasC = document.createElement('canvas')
          let size = this.map.getSize() //resize
          let width = size.width
          let height = size.height
          canvasC.style.width = width + "px"
          canvasC.style.height = height + "px"
          canvasC.width = width*devicePixelRatio
          canvasC.height = height*devicePixelRatio
          let context = canvasC.getContext('2d')
          context.fillStyle = 'rgba(252, 184, 19,1)'
          context.strokeStyle = 'rgba(252, 184, 19,1)'
      
          let radius = 0
          let draw = () => {
            context.clearRect(0, 0, canvasC.width, canvasC.height)
            context.lineWidth = 1;
            //边框颜色
            context.beginPath();
            context.strokeStyle="rgb(252,184,19)";
            context.translate(100, 95);
            context.rotate((item.rotary - 180) * Math.PI / 180);
            this.fillRoundRectLong(context, -5,-25, 125,10, 2, 'rgba(252,184,19,0.8)');
            context.closePath();
            //方块的颜色
            context.beginPath();
            // context.fillStyle = "rgb(252,184,19)";
            this.fillRoundRect(context, -15, -15, 30, 30, 2, 'rgba(252,184,19)');
            context.closePath();
            //小球
            context.beginPath();
            if(item.amplitude > 52){
              item.amplitude = 52
            }
            context.arc(12+item.amplitude*1.5, 0.5, 2, 0, 360, false);
            context.fillStyle = "rgb(252,184,19)";
            context.fill();
            context.stroke();
            context.closePath();
            // AMap.Util.requestAnimFrame(draw)
            context.restore();
          }
          draw()

          this.removeMarkerList.push(
            new AMap.Marker({
              content: canvasC,
              position: new AMap.LngLat(item.longitude, item.latitude),
              offset: new AMap.Pixel(-19, -27),
              size: new AMap.Size(50, 59),
              zIndex: 99 - index,
            })
          )
        }
    })
      
      this.map.add(this.removeMarkerList)
    }

  }

  //地图标注选中圆圈效果
  selMapMarkerCircle() {
    let that = this
    if(this.mapMarkerDrawCircle.length !== 0){
      this.map.remove(this.removeMapMarkerDrawCircle)
      this.removeMapMarkerDrawCircle = [];
      this.removeMapMarkerDrawCircle = copyArr(this.mapMarkerDrawCircle)
      function copyArr(arr) {
          let res = []
          for (let i = 0; i < arr.length; i++) {
            res.push(arr[i])
          }
          return res
      }
      this.mapMarkerDrawCircle.forEach((e, i) => {
        if(this.state.actionEquipmentListIndex == i){
          this.removeMapMarkerDrawCircle = this.removeMapMarkerDrawCircle.slice(i,i+1)
        }
      })
      this.map.add(this.removeMapMarkerDrawCircle)
      
      return null
    }

    this.state.equipmentList.map((item, index) => {
      let canvasCircle = `<div class="select-pulse"></div>
      <div class="select-pulse1"></div>`
        let item1 = this.state.equipmentList[this.state.actionEquipmentListIndex]
        let pageX = 0.05, pageY = 0.05
        let bounds = new AMap.Bounds([+item1.longitude - 0.06, +item1.latitude - pageY], [+item1.longitude + pageX, +item1.latitude + pageY])
        this.mapMarkerDrawCircle.push(
          new AMap.Marker({
          content: canvasCircle,
          position: new AMap.LngLat(item.longitude, item.latitude),
          offset: new AMap.Pixel(-32, -28),
          size: new AMap.Size(50, 60),
          zIndex: 999 - index,
          })
        )

        this.removeMapMarkerDrawCircle = copyArr(this.mapMarkerDrawCircle)
        function copyArr(arr) {
            let res = []
            for (let i = 0; i < arr.length; i++) {
              res.push(arr[i])
            }
            return res
        }
        this.mapMarkerDrawCircle.forEach((e, i) => {
          if(this.state.actionEquipmentListIndex == i){
            this.removeMapMarkerDrawCircle = this.removeMapMarkerDrawCircle.slice(i,i+1)
          }
        })
        this.map.add(this.removeMapMarkerDrawCircle)
    })
  }
    
  // 画没有选中塔机的发光光圈
  resetMapMarkerIris() {
    // 没有数据情况下
    if(this.state.actionEquipmentListIndex>3){
      let arr = Object.keys(this.refs)
      if(arr.length!=0){
        let height = -8.7 * parseInt(this.state.actionEquipmentListIndex/4) + 'rem'
        this.refs.content.style.top = height
      }else{
        // console.log(this.refs)
      }
    }else{
      this.refs.content.style.top = 0
    }
    if (!this.state.equipmentList || this.state.equipmentList.length == 0) {
      return null
    }
    if(this.markerListCircle.length !== 0){
      this.map.remove(this.removeMarkerListCircle)
      this.removeMarkerListCircle = [];
      this.removeMarkerListCircle = copyArr(this.markerListCircle)
      function copyArr(arr) {
          let res = []
          for (let i = 0; i < arr.length; i++) {
            res.push(arr[i])
          }
          return res
      }
      this.markerListCircle.forEach((e, i) => {
        if(this.state.actionEquipmentListIndex == i){
          this.removeMarkerListCircle.splice(i,1)
        }
      })
      this.map.add(this.removeMarkerListCircle)
      
      return null
    }

    this.markerListCircle = []
    this.state.equipmentList.forEach((item, index) => {
        //光圈开始
        let canvasC = `<div class="pulse"></div>`
        this.markerListCircle.push(
          new AMap.Marker({
            content: canvasC,
            position: new AMap.LngLat(item.longitude, item.latitude),
            offset: new AMap.Pixel(24, 14),
            size: new AMap.Size(50, 60),
            zIndex: 0 - index,
          })
        )
    })

    this.removeMarkerListCircle = copyArr(this.markerListCircle)
    function copyArr(arr) {
        let res = []
        for (let i = 0; i < arr.length; i++) {
          res.push(arr[i])
        }
        return res
    }
    this.markerListCircle.forEach((e, i) => {
      if(this.state.actionEquipmentListIndex == i){
        this.removeMarkerListCircle.splice(i,1)
      }
    })
    this.map.add(this.removeMarkerListCircle)
  }
  //地图文字
  selMapText(){
        // 没有数据情况下
        if (!this.state.equipmentList || this.state.equipmentList.length == 0) {
          return null
        }
        if (this.markerListText) {
          //重置标记index 层级
          this.markerListText.forEach((e, i) => {
            e.setzIndex(this.state.actionEquipmentListIndex == i ? 100 : 10)
          })
          return null
        }
        this.markerListText = []
        this.state.equipmentList.map((item, index) => {
          let content = `<div class="marker-marker-bus-from" style="animation: fadeShow 3s ease-in-out;">
            <div class="marker-marker-name ${item.status != 1 && 'marker-padding'}">${item.deviceName}
            ${item.status != 1 ? `<div class="marker-marker-warn" style="background-image:url(${warnMarker}";></div>` : ''}
            </div>
          </div>`
          this.markerListText.push(
            new AMap.Marker({
              content: content,
              position: new AMap.LngLat(item.longitude, item.latitude),
              offset: new AMap.Pixel(-42, 40),
              size: new AMap.Size(40, 50),
              zIndex: 99 - index,
            })
          )
        })
        this.map.add(this.markerListText)
  }

  //地图标注选中臂长效果
  selMapMarker() {
    this.map.remove(this.mapMarkerDraw)
    this.mapMarkerDraw= []
    this.state.equipmentList.forEach((item, index) => {
        if(index == this.state.actionEquipmentListIndex){
          let canvasC = this.refs.square;
          this.mapMarkerDraw.push(
            new AMap.Marker({
              content: canvasC,
              position: new AMap.LngLat(item.longitude, item.latitude),
              offset: new AMap.Pixel(-30, -40),
              size: new AMap.Size(50, 60),
              zIndex: 999,
            })
          )
        }
    })
    this.map.add(this.mapMarkerDraw)
  }

  //画定位2d图形
  map2D() {
    let polygon = new AMap.Polygon({
      fillOpacity: 0,
      strokeWeight: 0,
      path: Object.assign([], this.state.mapPolygonPath),
      strokeColor: 'rgba(252, 184, 19,0)',
      fillColor: 'rgba(252, 184, 19,0)',
      map: this.map
    })
    // this.map.add(polygon)
    this.map.setFitView()
  }
  // 画方格
  mapCheck() {
    // 创建图片图层
    let imageLayer = new AMap.ImageLayer({
      bounds: this.map.getBounds(),
      url: mapbg,
      zIndex: 2,
      expandZoomRange:true,
      zoom:20,
      zooms:[3,20],
    })
    this.map.add(imageLayer)
  }
  //画3d图形
  map3D() {
    if (!this.state.equipmentList || !this.state.equipmentList.length) return null
    let pageX = 0.0002,
      pageY = 0.0004
    let borderData = []
    let itemTT = JSON.parse(JSON.stringify(this.state.mapPolygonPath)).map(e =>
      this.map.lngLatToContainer(new AMap.LngLat(e[0], e[1]))
    )
    let itemBB = JSON.parse(JSON.stringify(this.state.mapPolygonPath)).map((e, i) => {
      return this.map.lngLatToContainer(
        new AMap.LngLat(e[0] - (i == 0 || i == 4 ? pageX - 0.00007 : pageX), e[1] - (i == 0 || i == 4 ? pageY - 0.00008 : pageY)))
    })
    itemTT.forEach((e, i) => {
      let arr = []
      if (i == itemBB.length - 1) {
        arr.push(e, itemTT[0], itemBB[0], itemBB[i])
      } else {
        arr.push(e, itemTT[i + 1], itemBB[i + 1], itemBB[i])
      }
      borderData.push(arr)
    })
 
    //canvas  建立阴影
    new AMap.plugin("AMap.CustomLayer", () => {
      let canvas = document.createElement("canvas")
      let canvas2 = document.createElement("canvas")
      //   第一层
      let customLayer = new AMap.CustomLayer(canvas, {
        expandZoomRange:true,
        zoom:20,
        zooms:[3,20],
        alwaysRender: true, //缩放过程中是否重绘，复杂绘制建议设为false
        zIndex: 0
      })
      customLayer.render = () => {
        let size = this.map.getSize() //resize
        let width = size.width
        let height = size.height
        let ctx = canvas.getContext("2d")

        canvas.style.width = width + "px"
        canvas.style.height = height - 60 + "px"
        canvas.width = width*devicePixelRatio
        canvas.height = height*devicePixelRatio // 适配设备像素比
        // alert(width*devicePixelRatio,height*devicePixelRatio)
        ctx.beginPath()
        let my_strokeStyle = ctx.createLinearGradient(0, 0, 350, 550);
        my_strokeStyle.addColorStop(0, "rgba(108, 85, 38, 1)");
        my_strokeStyle.addColorStop(0.8, "rgba(108, 85, 38, 1)");
        my_strokeStyle.addColorStop(1, "rgba(108, 85, 38, 1)");
        ctx.strokeStyle = my_strokeStyle 

        ctx.lineWidth = 8;

        // 填充渐变
        let my_gradient = ctx.createLinearGradient(0, 0, 500*devicePixelRatio, 500*devicePixelRatio);
        my_gradient.addColorStop(0, "rgba(108, 85, 38, 1)");
        my_gradient.addColorStop(1, "rgba(62, 52, 34, .8)");
        ctx.fillStyle = my_gradient;

        itemBB.forEach((pos, i) => {
            i == 0 && ctx.moveTo(itemBB[itemBB.length - 1].x * devicePixelRatio, itemBB[itemBB.length - 1].y * devicePixelRatio);
            if (i == itemBB.length - 1) {
                ctx.arcTo(pos.x * devicePixelRatio, pos.y * devicePixelRatio, itemBB[0].x * devicePixelRatio, itemBB[0].y *
                devicePixelRatio, 6)
            } else {
                ctx.arcTo(pos.x * devicePixelRatio, pos.y * devicePixelRatio, itemBB[i + 1].x * devicePixelRatio, itemBB[i + 1].y * devicePixelRatio, 6)
            }
        })

        //画外阴影
        // ctx.lineJoin = "round" //设置线段的连接方式
        ctx.shadowBlur = 70
        ctx.shadowColor = 'rgba(252, 184, 19,.2)'
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 40

        ctx.closePath()
        ctx.stroke()
        ctx.fill()

        // 处理侧边
        // borderData.forEach((data, j) => {
        //     ctx.beginPath()
        //     ctx.strokeStyle = "rgba(252, 184, 19,0)"
        //     ctx.fillStyle = "rgba(252, 184, 19,.5)"
        //     data.forEach((pos, i) => {
        //         i == 0 && ctx.moveTo(pos.x*devicePixelRatio, pos.y*devicePixelRatio)
        //         ctx.lineTo(pos.x*devicePixelRatio, pos.y*devicePixelRatio)
        //     })
        //     ctx.closePath()
        //     ctx.stroke()
        //     ctx.fill()
        // })

      }
      //   第二层 - 下方阴影
      let customLayer2 = new AMap.CustomLayer(canvas2, {
        expandZoomRange:true,
        zoom:20,
        zooms:[3,20],
        alwaysRender: true, //缩放过程中是否重绘，复杂绘制建议设为false
        zIndex: 0
      })
      customLayer2.render = () => {
        let size = this.map.getSize() //resize
        
        let width = size.width
        let height = size.height
        let ctx2 = canvas2.getContext("2d")

        canvas2.style.width = width + "px"
        canvas2.style.height = height - 60 + "px"
        canvas2.width = width*devicePixelRatio
        canvas2.height = height*devicePixelRatio // 适配设备像素比
        // alert(width*devicePixelRatio,height*devicePixelRatio)
        ctx2.beginPath()

        // 填充渐变
        let my_gradient = ctx2.createLinearGradient(0, 0, 500*devicePixelRatio, 500*devicePixelRatio);
        my_gradient.addColorStop(0, "rgba(108, 85, 38, 1)");
        my_gradient.addColorStop(1, "rgba(62, 52, 34, 1)");
        ctx2.fillStyle = my_gradient;
        ctx2.strokeStyle = 'rgba(108, 85, 38, 0)'

        itemBB.forEach((pos, i) => {
            i == 0 && ctx2.moveTo(itemBB[itemBB.length - 1].x * devicePixelRatio, itemBB[itemBB.length - 1].y * devicePixelRatio);
            if (i == itemBB.length - 1) {
                ctx2.arcTo(pos.x * devicePixelRatio, pos.y * devicePixelRatio, itemBB[0].x * devicePixelRatio, itemBB[0].y *
                devicePixelRatio, 6)
            } else {
                ctx2.arcTo(pos.x * devicePixelRatio, pos.y * devicePixelRatio, itemBB[i + 1].x * devicePixelRatio, itemBB[i + 1].y * devicePixelRatio, 6)
            }
        })

        //画外阴影
        // ctx2.lineJoin = "round" //设置线段的连接方式
        ctx2.shadowBlur = 2
        ctx2.shadowColor = 'rgba(252, 184, 19,.4)'
        ctx2.shadowOffsetX = 0
        ctx2.shadowOffsetY = 15

        ctx2.closePath()
        ctx2.stroke()
        ctx2.fill()

      }
        customLayer.setMap(this.map)
        customLayer2.setMap(this.map)
    })
  }
  // 初始化设备列表
  initEquipmentList() {
    // 没有数据情况下
    console.log(789)
    if (!this.state.equipmentList.length) {
      console.log(456)
      this.setState({
        actionEquipmentListIndex: 0,
        equipmentList: []
      })
      window.clearInterval(this.equipmentListTime)

      this.equipmentListTime = null
      this.map && this.initMap()
      return null
    }
    if (this.equipmentListTime) {
      console.log(123)
      return null
    }
    let updateTime = this.state.equipmentList.length == 1 ? 60 : 30
    //切换时间
    // let updateTime = 200
    this.updateDate('init')
    this.updateIndicators(updateTime)//更新指数
    this.equipmentListTime = setInterval(() => {
      if (
        this.state.actionEquipmentListIndex <
        this.state.equipmentList.length - 1
      ) {
        this.setState(
          {
            actionEquipmentListIndex: (this.state.actionEquipmentListIndex += 1)
          },
          this.updateDate
        )
      } else {
        this.setState(
          {
            actionEquipmentListIndex: 0
          },
          this.updateDate
        )
      }
      this.updateIndicators(updateTime)
    }, 1000 * updateTime)

  }
  // 中途更新指标数据
  updateIndicators(time)  {
    if(this.state.indicators.newInd && this.state.indicators.oldInd) {
        setTimeout(() => {
          this.setState({
            startIndicators: this.state.indicators.newInd,
            // endIndicators_90:parseInt(this.state.indicators.oldInd[4].indicatorValue) + 90,
            endIndicators: this.state.indicators.oldInd
          })
        }, (1000 * time) / 2)
    }
  }
  //更新接口数据
  updateDate(type) {
    console.log('00000')
    !type && this.getBaseInfo()
    !type && this.getDevice()
    this.map && this.initMap()
    this.getIndicators()
    this.get12Hours()
    this.getSevenDays()
    this.getWarnStatistic()
  }
  //获取基础信息
  getBaseInfo() {
    //  网络异常
    if (!navigator.onLine) {
        this.setState({
            footerInfoStatus: 'noNetwork',
        })
    }
    this.$http
      .post("/rest/tower/getTvBasicInfo", {
        deviceCode: this.deviceCode,
        version: this.version
      })
      .then(re => {
        let res = re.data
        if (res.status == 200) {
          let data = res.response
          let footerInfoStatus = ''
          // 设备已解绑状态

          if (window.Number(data.yunPingStatus) === 2) {
            config.android && config.android.setBinding();
          }
          //云屏源已切换(需调用android接口,发起重新绑定长连接)
          else if (window.Number(data.yunPingStatus) === 3) {
            footerInfoStatus = 'urlSourceChange';
            config.android && config.android.destroyWeb();
          }
          // 无数据源
          else if (window.Number(data.yunPingStatus) === 4) {
            this.setState({
              footerProjectInfo: data.yunPingName + " | " + data.yunPingCode,
              footerInfoStatus: "noData",
              serverData: null
            });
          }
          // 服务已过期
          else if (window.Number(data.yunPingStatus) === 5) {
            footerInfoStatus = 'serverPast'
          }
          this.setState({
            projectName: data.projectName,
            slogan: data.slogan,
            yunPingName: data.yunPingName,
            yunPingCode: data.yunPingCode,
            footerInfoStatus,
            logo: data.logo
          })
        }
      }).catch(error => {
        if (this.state.footerInfoStatus !== 'noNetwork') {
            this.setState({
                footerInfoStatus: 'networkAbnormal',
            })
        }
    })
  }
  // 获取地图设备分布信息
  getDevice() {
    
    this.$http
      .post("/rest/tower/getDevice", { deviceCode: this.deviceCode})
      .then(re => {
        let res = re.data
        if (res.status == 200) {
          let data = res.response
          //格式化地图范围坐标
          let mapPolygonPath = data.mapList ? data.mapList.map(item => {
            return [item.longitude, item.latitude]
          }) : null
          let deviceList = data.deviceList?data.deviceList:[];
          for (let i = 0; i < deviceList.length; i++) {
            let item = deviceList[i];
            for (let j = 0; j < deviceList.length; j++) {
              let temp = deviceList[j]
              if (i !== j) {
                if (Math.abs(item.latitude - temp.latitude) < 0.002 && Math.abs(item.longitude - temp.longitude) < 0.014) {
                  item.latitude = +item.latitude + 0.0022
                }
              }
            }
          }
          // localStorage.setItem('equipmentList',deviceList)
          this.setState(
            {
              equipmentList: deviceList,
              aMapList: data.mapList,
              mapPolygonPath,
            },
            () => {
                // 如果设备未绑定
                if (!this.state.equipmentList[this.state.actionEquipmentListIndex].deviceCode) {
                    this.setState({
                        footerInfoStatus: 'notBind'
                    })
                } else {
                    if (this.state.footerInfoStatus  == 'notBind') {
                        this.setState({
                            footerInfoStatus: ''
                        })
                    }
                }
                if (data.mapList) {
                    console.log(1111)
                    console.log(this.map)
                    !this.map && this.initEquipmentList();
                    this.initMap()
                    //初始化24小时设置告警 环形图
                    // console.log("初始化24小时设置告警 环形图", this.state.equipmentList, this.state.actionEquipmentListIndex, this.state.equipmentList[this.state.actionEquipmentListIndex].alarmTimes)
                    this.state.equipmentList.length > 0 && this.state.equipmentList[this.state.actionEquipmentListIndex].alarmTimes > 0 &&
                    this.initProportion24th()
                }
            }
          )
        }
      }).catch(error => {
        if (this.state.footerInfoStatus !== 'noNetwork') {
            this.setState({
                footerInfoStatus: 'networkAbnormal',
            })
        }
    })
  }
  // 获取指标数据
  getIndicators() {
    this.$http
      .post("/rest/tower/getIndicators", {
        orderProductList: this.state.equipmentList[
          this.state.actionEquipmentListIndex
        ].orderProductList,
        deviceCode: this.deviceCode
      })
      .then(re => {
        let res = re.data
        if (res.status == 200) {
          let data = res.response
          let backData = JSON.parse(JSON.stringify(data))
            this.setState({
              indicators: data,
              startIndicators: data.newInd ? data.newInd : backData.oldInd,
              startIndicators_90: data.newInd ?parseInt(data.newInd[4].indicatorValue) + 90 : parseInt(backData.oldInd[4].indicatorValue) + 90,
              // this.state.startIndicators.indicatorValue
              //   ? this.state.endIndicators
              //   : backData.newInd.map(e => {
              //     e.indicatorValue = '-'
              //     return e
              //   }),
              endIndicators: data.oldInd ? data.oldInd : backData.newInd,
              endIndicators_null: data.oldInd
            },()=>{
              // if(this.state.endIndicators[2].indicatorValue == '-'){
              //   this.state.endIndicators[2].indicatorValue = 0
              // }
              // this.selMapMarker()
            });
        }
      }).catch(error => {
        if (this.state.footerInfoStatus !== 'noNetwork') {
            this.setState({
                footerInfoStatus: 'networkAbnormal',
            })
        }
    })
  }
  //获取12小时内统计数据
  get12Hours() {
    this.$http
      .post("/rest/tower/getStatisticDataIn12Hours", {
        orderProductList: this.state.equipmentList[
          this.state.actionEquipmentListIndex
        ].orderProductList,
        deviceCode: this.deviceCode
      })
      .then(re => {
        let res = re.data
        if (res.status == 200) {
          let data = res.response
          this.setState(
            {
              brokenLineList: data
            },
            () => {
              if (data.indicatorDateList &&
                data.indicatorDateList.length > 0) {
                this.initBrokenLine()
              } else {
                this.brokenLineChart = null;
              }
            }
          )
        }
      }).catch(error => {
        if (this.state.footerInfoStatus !== 'noNetwork') {
            this.setState({
                footerInfoStatus: 'networkAbnormal',
            })
        }
    })
  }
  // // 获取7天平均数据
  getSevenDays() {
    this.$http
      .post("/rest/tower/getAverageDataIn7Days", {
        orderProductList: this.state.equipmentList[
          this.state.actionEquipmentListIndex
        ].orderProductList,
        deviceCode: this.deviceCode
      })
      .then(re => {
        let res = re.data
        if (res.status == 200) {
          let data = res.response

          this.setState(
            {
              sevenDays: data
            },
            () => {
              if (data.heavy && data.amplitude && data.torque) {
                this.initColumnarTorque()
                this.initColumnarAmplitude()
                this.initColumnarHeavy()
              } else {
                this.columnarTorque = null;
                this.columnarHeavy = null;
                this.columnarAmplitude = null;
              }
            }
          )
        }
      }).catch(error => {
        if (this.state.footerInfoStatus !== 'noNetwork') {
            this.setState({
                footerInfoStatus: 'networkAbnormal',
            })
        }
    })
  }
  //报警统计
  getWarnStatistic() {
    this.$http
      .post("/rest/tower/getWarnStatistic", {
        orderProductList: this.state.equipmentList[
          this.state.actionEquipmentListIndex
        ].orderProductList,
        deviceCode: this.deviceCode
      })
      .then(re => {
        let res = re.data
        if (res.status == 200) {
          let data = res.response
          this.setState({
            warnStatistic: data
          })
        }
      }).catch(error => {
        if (this.state.footerInfoStatus !== 'noNetwork') {
            this.setState({
                footerInfoStatus: 'networkAbnormal',
            })
        }
    })
  }
  // 更新本地显示时间
  updateLocalTime() {
   
    setInterval(() => {
      let dataObj = new Date()
      let nongLi = solarLunar.solar2lunar(
        dataObj.getFullYear(),
        dataObj.getMonth() + 1,
        dataObj.getDate()
      )

      let time =
        tools.momentFormat(dataObj.getTime(), "LL") +
        ` 农历${nongLi.monthCn}${nongLi.dayCn}` +
        " " +
        tools.momentFormat(dataObj.getTime(), "dddd") +
        " " +
        tools.momentFormat(dataObj, "HH:mm:ss")
      this.setState({
        localTime: time
      })
    }, 1000)
  }
  render() {
    const ulStyle = {
      top: -260
    };
    return (
      <div className="app-wrap">
        <div className="app-header">
          <div className="app-container">
            <div className="app-header-info">
              <div className="header-info-tag">
                {this.state.projectName ? (
                  <MarqueeWrap title={this.state.projectName} />
                ) : null}
              </div>
              <div
                className="header-info-time"
                dangerouslySetInnerHTML={{ __html: this.state.localTime }}
              />
            </div>
          </div>
        </div>
        <div className="app-content">
          <div className="app-content-left">
            {this.state.equipmentList && this.state.equipmentList.length > 0 ? (
              <div>
                <div className="left-title">
                  {
                    <MarqueeWrap
                      scrollamount={5}
                      title={
                        this.state.equipmentList[
                          this.state.actionEquipmentListIndex
                        ].deviceName
                      }
                    />
                  }
                </div>
                {
                    this.state.footerInfoStatus != 'notBind' && 
                    <div className="left-setup-code" >
                        设备码
                        {this.state.equipmentList && this.state.equipmentList[this.state.actionEquipmentListIndex]
                            .deviceCode
                            ? " " +
                            this.state.equipmentList[
                            this.state.actionEquipmentListIndex
                            ].deviceCode
                            : "-"}
                    </div>
                }
                {
                    this.state.footerInfoStatus == 'notBind' && 
                    <div className="left-setup-code" >
                        设备码  <span style={{color: `#fff`,fontSize: `px-rem(100)`,fontWeight: `bold`}}>-</span> 
                    </div>
                }

                
              </div>
            ) : (
                <div className="empty">-</div>
              )}

            <div className="left-supervise-value">
              {this.state.startIndicators
                ? this.state.startIndicators.map((item, index) => {
                  return (
                    item.indicatorName !== "防撞" ? (
                      <div 
                      className={
                        item.status != 0
                          ? "left-supervise-list active"
                          : "left-supervise-list"
                      }
                      key={index}
                    >
                      <div className={item.status == 1 ? "list-head upIcon" : item.status == -1 ? "list-head lowIcon" : 'list-head'}>
                        {item.indicatorName}
                      </div>
                      <div
                        className={
                          item.indicatorValue &&
                            !isNaN(Number(item.indicatorValue))
                            ? "list-value "
                            : "list-value empty"
                        }
                      >
                        {item.indicatorValue ? (
                          isNaN(Number(item.indicatorValue)) ? (
                            item.indicatorValue
                          ) : (
                              <span>
                                <CountUp
                                  start={
                                    this.state.endIndicators[index]
                                      .indicatorValue
                                  }
                                  end={item.indicatorValue}
                                  decimals={0}
                                  duration={2.5}
                                  useEasing={true}
                                  useGrouping={true}
                                />
                                <span className={
                                  item.unit=="°"
                                    ? "list-unit-point"
                                    : "list-unit"
                                }>
                                  {item.unit}
                                </span>
                                {/* <span className="list-unit">{item.unit}</span> */}
                              </span>
                            )
                        ) : (
                            "-"
                          )}
                      </div>
                      <div className="list-case">{item.statusName}</div>
                    </div>
                    ) : ''
                  )
                })
                : ""}
            </div>

            <div className="left-middle">
            {this.state.startIndicators
                ?
               
                  this.state.startIndicators[8].status == 1 
                  ? 

                  (<div><img src={require("../../assets/images/yes.png")} alt=""/><span>防撞已启用</span></div>)  
                      
                  : this.state.startIndicators[8].status == 0 
                    ?(<div><img src={require("../../assets/images/no.png")} alt=""/><span>防撞未启用</span></div>)
                    :''
             
                :''
              }
            </div>

            <div className="left-brokenlin-title">近 12 小时数据统计</div>
            <div className={this.state.brokenLineList && this.state.brokenLineList.indicatorDateList ? 'left-chart-brokenline' : 'left-chart-brokenline empty'}>
              {this.state.brokenLineList && this.state.brokenLineList.indicatorDateList ?
                <div style={{ height: '100%' }}>
                  <div
                    ref={this.brokenlinContainerDom}
                    id="brokenlin-container"
                  />
                  <div className="brokenlin-mark">
                    <div className="brokenlin-mark-li">
                      <i className="brokenlin-mark-icon icon2"></i>

                      <MarqueeWrap title={"力矩（" + this.state.brokenLineList.torque.minValue + "~" +
                          this.state.brokenLineList.torque.maxValue + "）"} />
                    </div>
                    <div className="brokenlin-mark-li">
                      <i className="brokenlin-mark-icon icon1"></i>
                      {"载重（" + this.state.brokenLineList.heavy.minValue}~{
                        this.state.brokenLineList.heavy.maxValue
                      }）
                    </div>
                    <div className="brokenlin-mark-li">
                      <i className="brokenlin-mark-icon icon3"></i>
                      {"幅度（" + this.state.brokenLineList.amplitude.minValue}~{
                        this.state.brokenLineList.amplitude.maxValue
                      }）
                    </div>
                  </div>
                </div>
                :
                "-"
              }
            </div>
            <div className="left-columnar-title">近 7 天平均数据</div>
            <div className={this.state.sevenDays &&
              this.state.sevenDays.heavy &&
              this.state.sevenDays.torque &&
              this.state.sevenDays.amplitude ? 'left-chart-columnar' : 'left-chart-columnar empty'}>
              {this.state.sevenDays &&
                this.state.sevenDays.heavy &&
                this.state.sevenDays.torque &&
                this.state.sevenDays.amplitude ? (
                  <div className="columnar-group">
                    <div className="columnarTorque">
                      <div ref={this.columnarTorqueDom} id="columnar-torque" />
                      <div className="columnarTorque-name">
                        {/* {`PM2.5(${this.state.sevenDays.pm25.minValue}~${
                          this.state.sevenDays.pm25.maxValue
                          })`} */}
                        <MarqueeWrap title={"力矩（" + this.state.sevenDays.torque.minValue + "~" +
                          this.state.sevenDays.torque.maxValue + "）"} />
                      </div>
                    </div>
                    <div className="columnarHeavy">
                      <div ref={this.columnarHeavyDom} id="columnar-heavy" />
                      <div className="columnarHeavy-name">
                        {/* {`PM10(${this.state.sevenDays.heavy.minValue}~${
                          this.state.sevenDays.heavy.maxValue
                          })`} */}
                        <MarqueeWrap title={"载重（" + this.state.sevenDays.heavy.minValue + "~" +
                          this.state.sevenDays.heavy.maxValue + "）"} />
                      </div>
                    </div>
                    <div className="columnarAmplitude">
                      <div ref={this.columnarAmplitudeDom} id="columnar-amplitude" />
                      <div className="columnarAmplitude-name">
                        {/* {`TSP(${this.state.sevenDays.amplitude.minValue}~${
                          this.state.sevenDays.amplitude.maxValue
                          })`} */}
                        <MarqueeWrap title={"幅度（" + this.state.sevenDays.amplitude.minValue + "~" +
                          this.state.sevenDays.amplitude.maxValue + "）"} />
                      </div>
                    </div>
                  </div>
                ) : (
                  "-"
                )}
            </div>
          </div>
          <div className="app-content-center">
            {/* 地图 start */}

            <div>
                {this.state.endIndicators || this.state.startIndicators
                    ? (
                        <div ref='square' id='squre-contain' style={{transform:`rotate(${this.state.startIndicators_90}deg)`}}>
                          <div id="square" style={{opacity:(this.state.showTaji ==0)?'0':'1'}}>
                          </div>
                          <div id='square-taji-contain' style={{opacity:(this.state.showTaji ==0)?'0':'1'}}>
                            <img id='square-taji' src={require("../../assets/images/bi.png")} alt=""/>
         
                            <div id="circle" style={{top:`${this.state.endIndicators_null != null?this.state.startIndicators[2].indicatorValue * 0.5 : -20}px` }}></div>
                          </div>
                        </div>
                    ):(
                      <div ref='square' id='squre-contain'>
                      <div id="square">
                      </div>
                      <div id='square-taji-contain'>
                        <img id='square-taji' src={require("../../assets/images/bi.png")} alt=""/>
                        <div id="circle"></div>
                      </div>
                    </div>
                    )
                  }
              </div>


            <div className="content-right-map">
              <div id="mapcontainer">
              </div>
              <div className="app-content-bottom">
              <p className='title'>各塔机吊钩载重 / 高度</p>
              <div className="app-content-bottom-content">
                <ul className="app-content-bottom-content-1" ref='content'>
                {
                  this.state.equipmentList.map(
                    (item,index)=>{
                      return(
                        <li className='content' key={index}>
                            {
                            item.heavy == null || this.state.footerInfoStatus === "serverPast" ? '' :
                            item.height>23 ? (
                              <div className='number' style={{top:(+item.height-4)*0.8>32?32:(+item.height-4)*0.8,left:(-item.amplitude+56)*0.8}}>
                                <span>{parseInt(item.heavy)}t</span><br/>
                                <span>{parseInt(item.height)}m</span><br/>
                              </div>
                            ) : (
                              <div className='number' style={{top:(+item.height+10)*0.8>32?32:(+item.height+10)*0.8,left:(-item.amplitude+56)*0.8}}>
                                <span>{parseInt(item.heavy)}t</span><br/>
                                <span>{parseInt(item.height)}m</span><br/>
                              </div>
                            )
                          }
                          <img className='taji' src={require("../../assets/images/taji.png")} alt=""/>
                          <img className='line'  style={{height:parseInt(+item.height)*0.8+3>40?40:parseInt(+item.height)*0.8+3,left:parseInt(parseInt(-item.amplitude+106)*0.7)-9 >100?100:parseInt(parseInt(-item.amplitude+106)*0.7)-9}} src={require("../../assets/images/line.png")} alt=""/>
                          <img className='thing' style={{top:parseInt(+item.height)*0.8+9>46?46:parseInt(+item.height)*0.8+9.5,left:parseInt(parseInt(-item.amplitude+100)*0.7)-7>98?98:parseInt(parseInt(-item.amplitude+100)*0.7)-7}} src={require("../../assets/images/thing.png")} alt=""/>
                          <div id="breathe-line-gif" style={{display: (this.state.actionEquipmentListIndex==index) ? "block" : "none"}}></div>
                          <div className='breathe-line' style={{display: (this.state.actionEquipmentListIndex==index) ? "block" : "none"}}></div>
                          <p style={{color: (this.state.actionEquipmentListIndex==index) ? "white" : "#cccccc"}}>{item.deviceName}</p>
                        </li>
                      )
                    }
                  ) 
                }
                </ul>
              </div>
            </div>
            </div>
            {/* 地图 end */}
          </div>
          <div className="app-content-right">
            <div className="warn-info-title">报警信息统计</div>
            <div className="warn-info-value">
              <div className="warn-day">
                <div className="warn-day-num">
                {(this.state.footerInfoStatus != 'notBind' && this.state.footerInfoStatus != 'serverPast') ? 
                    (!this.state.warnStatistic.monitorDays ? (
                        '-'
                    ) : (
                        <CountUp
                            start={0}
                            end={this.state.warnStatistic.monitorDays}
                            decimals={0}
                            duration={2.5}
                            useEasing={true}
                            useGrouping={true}
                        />
                        )):'-'
                    }
                </div>
                <div className="warn-day-name">监测天数</div>
              </div>
              <div className="warn-time">
                <div className="warn-time-num">
                {(this.state.footerInfoStatus != 'notBind' && this.state.footerInfoStatus != 'serverPast')? 
                    (!this.state.warnStatistic.alarmTimes ? (
                      '-'
                    ) : (
                        <CountUp
                            start={0}
                            end={this.state.warnStatistic.alarmTimes}
                            decimals={0}
                            duration={2.5}
                            useEasing={true}
                            useGrouping={true}
                        />
                        )):'-'
                }
                </div>
                <div className="warn-time-name">24 小时报警次数</div>
              </div>
            </div>
            <div className="warn-24th-title">24 小时报警次数占比图</div>
            <div className="warn-24th-chart">
              
              {this.state.equipmentList && this.state.equipmentList.length > 0 && this.state.equipmentList[this.state.actionEquipmentListIndex].alarmTimes > 0 ?
                <div ref={this.proportionDom} id="proportion-24th" /> : "-"
              }
            </div>
            <div className="warn-24th-numtitle">各指标 24 小时报警次数</div>
            <div className="warn-24th-list">
              {this.state.warnStatistic.indicatorWarnList
                ? this.state.warnStatistic.indicatorWarnList.map(
                  (item, index) => {
                    return (
                      <div className="warn-24th-li" key={index}>
                        <div className="warn-num">
                          <span className="warn-name">
                            {item.indicatorName}
                          </span>
                          <span className="warn-total-num">
                           
                            <CountUp
                            start={0}
                                end={item.alarmTimes}
                                decimals={0}
                                duration={2.5}
                                useEasing={true}
                                useGrouping={true}
                            />
                          </span>
                        </div>
                        <div className="warn-total">
                          {
                            <div
                              className="warn-proportion"
                              style={{
                                width: `${item.alarmTimes / item.totalTimes * 100}%`
                              }}
                            />
                          }
                        </div>
                      </div>
                    )
                  }
                )
                : "-"}
            </div>
          </div>
        </div>

        <div className="app-footer">
          <div className="app-footer-main">
            <FooterInfoWrap footerInfoStatus={this.state.footerInfoStatus} />
          </div>
          <div className="app-footer-version">
            {this.state.yunPingName}{" "}
            {this.state.yunPingCode ? (
              <span>
                <span className="split">| </span>
                <span>设备码</span>
              </span>
            ) : null}{" "}
            {this.state.yunPingCode}
          </div>
          <div className="app-footer-logo">
            {
              this.state.logo && <img src={this.state.logo} alt="Logo" className="footerLogo" />
            }
          </div>
        </div>
      </div >
    )
  }
}
export default App
