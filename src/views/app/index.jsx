import React, { Component } from 'react'
import { CSSTransition, TransitionGroup, Transition } from 'react-transition-group'
import G2 from '@antv/g2';
import Slider from "react-slick"
import CountUp from 'react-countup';

import solarLunar from './../../assets/js/solarlunar'
import * as request from './../../request/index'
import * as config from './../../config/index'
import * as tools from './../../tools/index'

// import './index.scss'

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

    if (this.props.marqueeDirection === 'left' || this.props.marqueeDirection === 'right') {
      titleContainerVal = titleContainerDom.offsetWidth
      marqueeWrapDomVal = marqueeWrapDom.offsetWidth
    }
    if (this.props.marqueeDirection === 'up' || this.props.marqueeDirection === 'down') {
      titleContainerVal = titleContainerDom.offsetHeight
      marqueeWrapDomVal = marqueeWrapDom.offsetHeight
    }
    if (titleContainerVal > marqueeWrapDomVal) { // 目标值 大于 容器值  则动画开起
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
    let spanCss = Object.assign({}, this.props.styleCss, { opacity: (this.state.visible ? 0 : 1) })
    let showGradient = this.props.showGradient && this.state.visible // 是否显示渐变
    return <div className={['marquee-wrap', showGradient ? 'linear-gradient' : ''].join(' ')} ref={this.marqueeWrapDom}>
      <span ref={this.titleContainerDom} style={spanCss} className="marquee-wrap-container">{this.props.title}</span>
      {
        this.state.visible ?
          <marquee style={this.props.styleCss} className="marquee-wrap-marquee" behavior="" scrolldelay="0" direction={this.props.marqueeDirection} scrollamount={this.props.scrollamount}>
            {this.props.title}
          </marquee>
          : null
      }
    </div>
  }
}
MarqueeWrap.defaultProps = {
  title: '',
  scrollamount: 2,
  marqueeDirection: 'left', // 文本滚动的方向
  styleCss: {} // 文字样式
}

// 底部信息提示
class FooterInfoWrap extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return <div className={'footer-infowrap'}>
      {(this.props.footerInfoStatus === 'updateVer') ? <div className={'footer-main-info footer-main-updataver'}>
        <div className="info-img"></div>
        <span className="info-text">发现新版本，点击遥控器“确认”键升级。</span>
      </div> : null}
      {(this.props.footerInfoStatus === 'noNetwork') ? <div className={'footer-main-info footer-main-nonetwork'}>
        <div className="info-img"></div>
        <span className="info-text">当前网络异常，请检查网络设置。</span>
      </div> : null}
      {(this.props.footerInfoStatus === 'networkAbnormal') ? <div className={'footer-main-info footer-main-networkabnormal'}>
        <div className="info-img"></div>
        <span className="info-text">智能云屏暂时无法连接至服务器，重新连接中…</span>
      </div> : null}
      {(this.props.footerInfoStatus === 'serverPast') ? <div className={'footer-main-info footer-main-serverpast'}>
        <div className="info-img"></div>
        <span className="info-text">服务已过期，请联系项目管理员续费。</span>
      </div> : null}
      {(this.props.footerInfoStatus === 'urlSourceChange') ? <div className={'footer-main-info footer-main-serverpast'}>
        <div className="info-img"></div>
        <span className="info-text">云屏源已切换。</span>
      </div> : null}
    </div>
  }
}
FooterInfoWrap.defaultProps = {
  footerInfoStatus: ''
}
// const settings = {
//     dots : false, 
//     lazyLoad : false, 
//     infinite : false, 
//     arrows : false, 
//     fade : true, 
//     speed : 500, 
//     slidesToShow : 1, 
//     slidesToScroll: 1, 
//     swipeToSlide : false, 
//     accessibility: true,
// }
const settings = {
  dots: true,
  lazyLoad: false,
  fade: true,
  infinite: true,
  autoplay: true,
  cssEase: "linear"
};
// 主组件
class App extends Component {
  constructor(props) {
    super(props)
    this.sliderDom = React.createRef(); // 轮播图对象
    this.brokenlinContainerDom = React.createRef(); // 折线图对象
    this.itemValueAnnularDom = React.createRef(); // 饼图对象
    this.map = null; // 地图对象
    this.equipmentListTime = null; // 设备列表定时器对象
    this.brokenLineChart = null; // 折线图对象
    this.figureOfBreadChart = null; // 图饼图对象-成员数量
    this.markerList = []; // 地图标准列表
    this.aMapPolygon = null; // 地图矩形对象
    this.brokenLineLableIndex = []; // 标注的索引
    this.oldMapPolygonPath = ''; // 上一次黄色区域经纬度
    this.bannerTime = null; // banner轮播
    this.state = {
      equipmentListAnimation: true, // 设备动画
      projectName: '', // 项目名称
      logo: '', // logo图片
      projectNameStatus: true, // 项目名称样式
      slogan: '', // 头部公告
      localTime: '', // 本地时间
      oterInfoStatus: '', // 底部提示信息  noNetwork 无网; updateVer 版本更新;networkAbnormal 网络异常;serverPast 服务过期
      bannerList: [],
      actionBannerListIndex: 0, // 当前选中的banner
      yunPingName: '', // 云屏服务名称
      yunPingCode: '', // 云屏设备码
      generalDto: {}, // 项目概况
      aMapList: [],
      // 地图多边形路径
      mapPolygonPath: [],
      //设备列表
      equipmentList: [],
      equipmentListDomOpacity: 1,
      currentEquipmentList: [],
      currentEquipmentListIndex: 0,
      // 当前有多少行
      currentEquipmentListRow: 8,
      // 选中当前设备
      actionEquipmentListIndex: 0,
      // 折线图数据
      brokenLineList: [],
      // 成员数据
      staffData: {
        // 总人数
        totalStaff: {
          val: 0,
          oldNumber: 0,
        },
        // 建筑工人
        buildingWorker: {
          val: 0,
          oldNumber: 0,
        },
        // 管理人员
        manager: {
          val: 0,
          oldNumber: 0,
        },
        // 实名制比例
        realNameRatio: {
          val: 0,
          oldNumber: 0,
        },
      },
      detailDto: {},
      // 进度条信息left值
      rightProgressbarDocDomLeft: 0,
      // 进度条信息箭头left值
      triangleBorderUpDomLeft: 0, // 百分比
      // 进度条进度值
      rightProgressbarTagretWidth: 0, // 百分比
    }
    // 18414220100155144  18414220100155130 yunpingzonglan
    let deviceCode = tools.getUrlParam('deviceCode') || 'yunpingzonglan'
    this.deviceCode = deviceCode + '_JZG_100'; // 设备码
    this.version = tools.getUrlParam('version') || '186'; // 版本

    window.web_setNetWork = this.web_setNetWork;
  }
  web_setNetWork = (status) => {
    if (window.String(status) === 'false') {
      this.setState({
        footerInfoStatus: 'noNetwork'
      })
    } else {
      this.setState({
        footerInfoStatus: ''
      })
    }
  }
  // 组件将要渲染
  componentWillMount() {
    this.initMethod()
    this.updateLocalTime()
  }
  componentDidMount() {
    // 添加地图
    const gaodeMapsDom = document.createElement('script')
    const headerDom = document.querySelector('head')

    gaodeMapsDom.type = 'text/javascript'
    gaodeMapsDom.src = `https://webapi.amap.com/maps?v=1.4.2&key=34dda2918eee145d1520d8a7c59c3408&plugin=AMap.Geocoder,AMap.Scale&callback=init`

    window.init = () => {
      this.initMap()
    }
    headerDom.appendChild(gaodeMapsDom)
  }
  // 初始化
  initMethod() {
    this.sendWsApiTvRequest();
  }
  // 初始化设备列表
  initEquipmentList() {
    // 没有数据情况下
    if (!this.state.equipmentList.length) {
      this.setState({
        currentEquipmentListIndex: 0,
        actionEquipmentListIndex: 0,
        currentEquipmentList: [],
      });
      window.clearInterval(this.equipmentListTime);
      this.equipmentListTime = null;
      this.map && (this.initMap());
      return null;
    }
    if (this.equipmentListTime) {
      return null;
    }
    const {
      equipmentList,
      currentEquipmentListIndex,
      currentEquipmentListRow,
    } = this.state;

    this.setState({
      currentEquipmentList: equipmentList.slice(currentEquipmentListIndex * currentEquipmentListRow, currentEquipmentListRow),
    }, () => this.map && (this.initMap()));
    this.equipmentListTime = setInterval(() => {
      if (this.state.actionEquipmentListIndex < this.state.equipmentList.length - 1) {
        this.setState({
          actionEquipmentListIndex: this.state.actionEquipmentListIndex += 1,
        });
      } else {
        this.setState({
          actionEquipmentListIndex: 0,
        });
      }
      const {
        equipmentList,
        currentEquipmentListIndex,
        currentEquipmentListRow,
        actionEquipmentListIndex,
      } = this.state;

      if (actionEquipmentListIndex !== 1
        && (actionEquipmentListIndex % currentEquipmentListRow === 0
          || actionEquipmentListIndex === 0)
      ) {
        if (1 !== equipmentList.length / currentEquipmentListRow) {
          this.setState({
            equipmentListAnimation: false,
          })
          setTimeout(() => {
            this.setState({
              equipmentListAnimation: true,
            })
          }, 700)
        }
        if (currentEquipmentListIndex < Math.floor((this.state.equipmentList.length - 1) / currentEquipmentListRow)) {
          this.setState({
            currentEquipmentListIndex: this.state.currentEquipmentListIndex += 1,
          })
        } else {
          this.setState({
            currentEquipmentListIndex: 0,
          })
        }
      }
      this.setState({
        currentEquipmentList: equipmentList.slice(this.state.currentEquipmentListIndex * currentEquipmentListRow,
          this.state.currentEquipmentListIndex * currentEquipmentListRow + currentEquipmentListRow),
      }, () => {
        this.map && (this.initMap());
      })
    }, 1000 * 5);

  }
  // 设置标注索引
  setBrokenLineLableIndex() {
    let maxList = [];
    let minList = [];
    let maxNum = 0;
    let minNum = 0;
    let brokenLineList = JSON.parse(JSON.stringify(this.state.brokenLineList));
    let currentTime = tools.momentFormat(new Date().getTime(), 'YYYY-MM-DD')
    this.brokenLineLableIndex = [];
    brokenLineList = brokenLineList.map(item => {
      return item.clockNum;
    })
    maxNum = Math.max(...brokenLineList);
    minNum = Math.min(...brokenLineList);
    this.state.brokenLineList.forEach((item, index) => {
      if (maxNum == item.clockNum) {
        maxList.push(index)
      }
      if (minNum == item.clockNum) {
        minList.push(index)
      }
      if (currentTime === item.clockDate) {
        this.brokenLineLableIndex.push(index);
      }
    })
    this.brokenLineLableIndex.push(maxList[maxList.length - 1]);
    this.brokenLineLableIndex.push(minList[0]);
  }
  // 初始化地图
  initMap() {
    if (this.map) {
      // 更新自定义图层
      if (this.aMapPolygon) {
        this.aMapPolygon.setPath(this.state.mapPolygonPath);
      }
      let newMapPolygonPath = '';

      this.state.mapPolygonPath.forEach(item => {
        newMapPolygonPath += `${item[0]}${item[0]}`
      })
      // 比对最新和上一次是否一致
      if (newMapPolygonPath !== this.oldMapPolygonPath) {
        this.map.setFitView();
        // 更新上一次黄色区域数据
        this.oldMapPolygonPath = newMapPolygonPath;
      }
      this.resetMapMarker();
      // 如果没有设置黄色区域则默认以设备为点
      if (!this.state.mapPolygonPath.length) {
        this.map.setFitView();
      }

      return null;
    }
    this.map = new AMap.Map("mapcontainer", {
      resizeEnable: true, // 是否监控地图容器尺寸变化，默认值为false
      zoom: 13,
      pitch: 50,
      animateEnable: true,
      jogEnable: true,
      mapStyle: 'amap://styles/1981a2587a60057c7a9c5d2ca850e306', //设置地图的显示样式
    });
    // 画区域地图
    this.aMapPolygon = new AMap.Polygon({
      bubble: true,
      fillOpacity: 0.1,
      strokeWeight: 0.1,
      path: this.state.mapPolygonPath,
      strokeColor: 'rgb(252, 184, 19)',
      fillColor: 'rgb(252, 184, 19)',
      map: this.map
    });
    this.map.setFitView();
    this.resetMapMarker();
  }
  // 初始化折线图
  initBrokenLine() {
    this.setBrokenLineLableIndex();
    if (this.brokenLineChart) {
      this.brokenLineChart.changeData(this.state.brokenLineList);
      return null;
    }
    // 创建主题
    G2.Global.registerTheme('themeOne', {
      shape: {
        line:
          { stroke: "#FCB813", lineWidth: 1, fill: null },
        point:
          { stroke: "#FCB813", lineWidth: 1, fill: null },
      },
      axis: {
        bottom: {
          label: null,
          tickLine: null,
          line: {
            lineWidth: 1,
            stroke: "#ffffff",
            opacity: 0.6,
          },
          grid: {
            hideFirstLine: true,
            lineStyle: {
              lineDash: [3, 3],
              lineWidth: 1,
              stroke: "#303240",
            },
            //   align: 'center',
            zIndex: -1,
          },
        },
        left: {
          line: {
            lineWidth: 1,
            stroke: "#ffffff",
            opacity: 0.6,
          },
          label: null,
          grid: {
            hideFirstLine: true,
            lineStyle: {
              lineDash: [3, 3],
              lineWidth: 1,
              stroke: "#303240",
            },
            zIndex: -1,
          },
        },
      },
    });
    let height = this.brokenlinContainerDom.current.offsetHeight;
    this.brokenLineChart = new G2.Chart({
      container: 'brokenlin-container',
      forceFit: true,
      height: height,
      padding: [0, 0, 1, 1],
      theme: 'themeOne',
    });
    this.brokenLineChart.source(this.state.brokenLineList, {
      index: {
        type: 'linear', // 声明该数据的类型
        tickCount: 14
      },
      clockNum: {
        type: 'linear', // 声明该数据的类型
        tickCount: 2 + 1
      }
    });
    function pxRem(num) {
      return num / 38.4 + 'rem';
    }
    const styleCss = `
            padding: ${pxRem(0)} ${pxRem(20)} ${pxRem(0)};
            background-color: #FCB813;
            color: #000;
            display: flex;
            align-items: center;
            font-size: ${pxRem(12)};
            line-height: 1;
            border-radius: ${pxRem(10)};
            transform: translateY(200%);
        `;
    this.brokenLineChart.line().position('index*clockNum');
    this.brokenLineChart.point().position('index*clockNum').size(0).label('clockDate*clockNum', function (date, buyin) {
      return buyin;
    }, {
        textStyle: {
          fill: '#fff',
          fontSize: 10,
          stroke: 'white',
          lineWidth: 2,
          fontWeight: 300
        },
        htmlTemplate: (text, item, index) => {
          if (this.brokenLineLableIndex.indexOf(index) >= 0) {
            return `<div style="${styleCss}"><span style="padding-top:${pxRem(4)};">${text}</span></div>`;
          }
        }
      }).style({
        lineWidth: 2
      });

    this.brokenLineChart.render();
  }
  // 初始化成员数量-图饼图
  initStaff() {
    let pieData = [];
    pieData.push({
      type: '实名',
      value: window.Number(this.state.staffData.realNameRatio.val),
    })
    if (this.figureOfBreadChart) {
      this.figureOfBreadChart.changeData(pieData);
      return null;
    }
    let height = this.itemValueAnnularDom.current.offsetHeight;
    this.figureOfBreadChart = new G2.Chart({
      container: 'item-value-annular',
      forceFit: true,
      height: height,
      padding: [0, 0, 0, 0]
    });
    this.figureOfBreadChart.source(pieData);
    this.figureOfBreadChart.legend(false);
    this.figureOfBreadChart.facet('rect', {
      fields: ['type'],
      padding: 0,
      showTitle: false,
      eachView: function eachView(view, facet) {
        let data = facet.data;
        let color = '#fcb813';
        data.push({
          type: '其他',
          value: 100 - data[0].value
        });
        view.source(data);
        view.coord('theta', {
          radius: 0.8,
          innerRadius: 0.5
        });
        view.intervalStack().position('value').color('type', [color, '#fff']).opacity(1);

      }
    });
    this.figureOfBreadChart.render();
  }
  // 重置地图标注
  resetMapMarker() {
    // 清除地图上的标注
    this.map.remove(this.markerList);
    // 没有数据情况下
    if (!this.state.currentEquipmentList.length) {
      return null;
    }
    // 获取当前设备信息
    let actionEquipmentList = this.state.currentEquipmentList[
      this.state.actionEquipmentListIndex - (this.state.currentEquipmentListIndex * this.state.currentEquipmentListRow)
    ];
    this.markerList = [];
    actionEquipmentList.aMapList.map(item => {
      let content = `<div class="marker-marker-bus-from" style="background-image:url(${actionEquipmentList.maxImgSrc});"></div>`;
      this.markerList.push(new AMap.Marker({
        content: content,
        position: new AMap.LngLat(item.lng, item.lat),
        offset: new AMap.Pixel(-10, -10),
        size: new AMap.Size(40, 50),
      }))
    });
    // 将创建的点标记添加到已有的地图实例：
    this.map.add(this.markerList);
  }
  // websocket 请求
  sendWsApiTvRequest() {
    //'ws://localhost:88'
    //request.map_route_ws_api['Api_Tv'] + this.deviceCode + '/' + this.version
    request.wsSendRequest({
      debug: true,
      url: request.map_route_ws_api['Api_Tv'] + this.deviceCode + '/' + this.version,
      onopen_function: (code, reason) => {
        this.setState({
          footerInfoStatus: '',
        })
      },
      close_function: (code, reason) => {
        if (this.state.footerInfoStatus !== 'noNetwork') {
          this.setState({
            footerInfoStatus: 'networkAbnormal',
          })
        }
      },
      message_function: (result) => {
        let data = {}

        try {
          data = JSON.parse(result)
        } catch (e) {
          // 使用notify，可以将自定义的错误信息发送到Fundebug
          fundebug && fundebug.notify("res Data error", result)
          return null
        }
        let jsondata = {
          "generalDto": {
            "duration": 1000,
            "principal": "哈哈",
            "picDto": [{
              "description": "ngmgwgwgxhxgwgwgk",
              "time": "2019-01-01",
              "title": "关于进一步加强企业管理",
              "url": "https://photo.test.jianzaogong.com/ws/photo?path=project/1995/1.556359696146091E12.jpg"
            }, {
              "description": "青菜2块5",
              "time": "2019-04-25",
              "title": "好消息",
              "url": "https://photo.test.jianzaogong.com/ws/photo?path=project/1995/1.5563597734722808E12.jpg"
            }, {
              "description": "今晚吃鸡大吉大利",
              "time": "2019-04-25",
              "title": "吃鸡",
              "url": "http://pic37.nipic.com/20140110/17563091_221827492154_2.jpg"
            }],
            "controlUnit": "",
            "address": "广东省深圳市福田区下梅林二街6号靠近颂德国际(下梅林二街)",
            "investMoney": 100000,
            "description": "",
            "constructionUnit": "",
            "openDate": "2019-03-06",
            "buildUnit": "建造工",
            "designUnit": ""
          },
          "sloganStyle": "黄底黑字 (标准模式)",
          "yunPingStatus": 1,
          "detailDto": {
            "managerNum": 11,
            "mapList": [{
              "latitude": "22.56802739666943",
              "longitude": "114.03008027504376"
            }, {
              "latitude": "22.564906571258195",
              "longitude": "114.03946130091286"
            }, {
              "latitude": "22.555375232282927",
              "longitude": "114.03972147518287"
            }, {
              "latitude": "22.550423530903075",
              "longitude": "114.03568072737104"
            }, {
              "latitude": "22.55675865485561",
              "longitude": "114.0267972512657"
            }, {
              "latitude": "22.563358516570304",
              "longitude": "114.02622728185979"
            }],
            "openStatus": 1,
            "openDays": 58,
            "latitude": "22.567933998852517",
            "increments": [
              {
                "deviceNum": 3,
                "bigIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/yzj_big.png",
                "locations": [{
                  "latitude": "122.561986321817187",
                  "deviceName": "云闸机平板 (安卓 WiFi 版)",
                  "longitude": "114.03441801919256"
                }, {
                  "latitude": "22.562013325642923",
                  "deviceName": "云闸机平板 (iOS WIFI 版)",
                  "longitude": "114.03447401945436"
                }, {
                  "latitude": "22.562013325642923",
                  "deviceName": "云闸机平板 (安卓 WiFi 版)",
                  "longitude": "114.03447401945436"
                }],
                "smallIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/yzj_small.png",
                "type": 2,
                "deviceName": "云闸机"
              },
              {
                "deviceNum": 7,
                "bigIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/ysp_big.png",
                "locations": [{
                  "latitude": "622.560912369703736",
                  "deviceName": "5 号视频云监控系统",
                  "longitude": "114.0355680315203"
                }, {
                  "latitude": "22.56164043377155",
                  "deviceName": "2号视频监控系统",
                  "longitude": "114.03651703561913"
                }, {
                  "latitude": "22.562891484172052",
                  "deviceName": "4 号视频云监控系统",
                  "longitude": "114.03709403468737"
                }, {
                  "latitude": "22.562013325642923",
                  "deviceName": "7 号云视频系统",
                  "longitude": "114.03447401945436"
                }, {
                  "latitude": "22.56222644192081",
                  "deviceName": "1号视频监控系统",
                  "longitude": "114.0364810328673"
                }, {
                  "latitude": "22.562620445141462",
                  "deviceName": "3 号视频云监控系统",
                  "longitude": "114.03641403063726"
                }, {
                  "latitude": "22.562013325642923",
                  "deviceName": "6 号云视频系统",
                  "longitude": "114.03447401945436"
                }],
                "smallIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/ysp_small.png",
                "type": 21,
                "deviceName": "云视频"
              },
              {
                "deviceNum": 1,
                "bigIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/cdz_big.png",
                "locations": [{
                  "latitude": "22.562013325642923",
                  "deviceName": "1 号车道闸系统",
                  "longitude": "114.03447401945436"
                }],
                "smallIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/cdz_small.png",
                "type": 27,
                "deviceName": "车道闸"
              },
              {
                "deviceNum": 1,
                "bigIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/yd_big.png",
                "locations": [{
                  "latitude": "22.562013325642923",
                  "deviceName": "1 号用电监测系统",
                  "longitude": "114.03447401945436"
                }],
                "smallIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/yd_small.png",
                "type": 28,
                "deviceName": "用电监测"
              },
              {
                "deviceNum": 7,
                "bigIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/yp_big.png",
                "locations": [{
                  "latitude": "822.562013325642923",
                  "deviceName": "Xiaomi MiTV4-ANSM0",
                  "longitude": "114.03447401945436"
                }, {
                  "latitude": "22.56198432267963",
                  "deviceName": "HUAWEI BAH2-W09",
                  "longitude": "114.03443301930103"
                }, {
                  "latitude": "22.562013325642923",
                  "deviceName": "Xiaomi MiTV4-ANSM0",
                  "longitude": "114.03447401945436"
                }, {
                  "latitude": "22.55779817373847",
                  "deviceName": "Xiaomi MiTV4-ANSM0",
                  "longitude": "114.03324202737797"
                }, {
                  "latitude": "22.56016839189595",
                  "deviceName": "Xiaomi MiTV4-ANSM0",
                  "longitude": "114.03620703904163"
                }, {
                  "latitude": "22.562013325642923",
                  "deviceName": "Xiaomi MiTV4-ANSM0",
                  "longitude": "114.03447401945436"
                }, {
                  "latitude": "22.56016839189595",
                  "deviceName": "Xiaomi MiTV4-ANSM0",
                  "longitude": "114.03620703904163"
                }

                ],
                "smallIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/yp_small.png",
                "type": 4,
                "deviceName": "云屏"
              },
              {
                "deviceNum": 3,
                "bigIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/yzj_big.png",
                "locations": [{
                  "latitude": "22.561986321817187",
                  "deviceName": "云闸机平板 (安卓 WiFi 版)",
                  "longitude": "114.03441801919256"
                }, {
                  "latitude": "22.562013325642923",
                  "deviceName": "云闸机平板 (iOS WIFI 版)",
                  "longitude": "114.03447401945436"
                }, {
                  "latitude": "22.562013325642923",
                  "deviceName": "云闸机平板 (安卓 WiFi 版)",
                  "longitude": "114.03447401945436"
                }],
                "smallIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/yzj_small.png",
                "type": 2,
                "deviceName": "云闸机"
              },
              {
                "deviceNum": 7,
                "bigIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/ysp_big.png",
                "locations": [{
                  "latitude": "22.560912369703736",
                  "deviceName": "5 号视频云监控系统",
                  "longitude": "114.0355680315203"
                }, {
                  "latitude": "22.56164043377155",
                  "deviceName": "2号视频监控系统",
                  "longitude": "114.03651703561913"
                }, {
                  "latitude": "22.562891484172052",
                  "deviceName": "4 号视频云监控系统",
                  "longitude": "114.03709403468737"
                }, {
                  "latitude": "22.562013325642923",
                  "deviceName": "7 号云视频系统",
                  "longitude": "114.03447401945436"
                }, {
                  "latitude": "22.56222644192081",
                  "deviceName": "1号视频监控系统",
                  "longitude": "114.0364810328673"
                }, {
                  "latitude": "22.562620445141462",
                  "deviceName": "3 号视频云监控系统",
                  "longitude": "114.03641403063726"
                }, {
                  "latitude": "22.562013325642923",
                  "deviceName": "6 号云视频系统",
                  "longitude": "114.03447401945436"
                }],
                "smallIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/ysp_small.png",
                "type": 21,
                "deviceName": "云视频"
              },
              {
                "deviceNum": 1,
                "bigIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/cdz_big.png",
                "locations": [{
                  "latitude": "22.562013325642923",
                  "deviceName": "1 号车道闸系统",
                  "longitude": "114.03447401945436"
                }],
                "smallIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/cdz_small.png",
                "type": 27,
                "deviceName": "车道闸"
              },
              {
                "deviceNum": 1,
                "bigIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/yd_big.png",
                "locations": [{
                  "latitude": "22.562013325642923",
                  "deviceName": "1 号用电监测系统",
                  "longitude": "114.03447401945436"
                }],
                "smallIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/yd_small.png",
                "type": 28,
                "deviceName": "用电监测"
              },
              {
                "deviceNum": 7,
                "bigIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/yp_big.png",
                "locations": [{
                  "latitude": "22.562013325642923",
                  "deviceName": "Xiaomi MiTV4-ANSM0",
                  "longitude": "114.03447401945436"
                }, {
                  "latitude": "22.56198432267963",
                  "deviceName": "HUAWEI BAH2-W09",
                  "longitude": "114.03443301930103"
                }, {
                  "latitude": "22.562013325642923",
                  "deviceName": "Xiaomi MiTV4-ANSM0",
                  "longitude": "114.03447401945436"
                }, {
                  "latitude": "22.55779817373847",
                  "deviceName": "Xiaomi MiTV4-ANSM0",
                  "longitude": "114.03324202737797"
                }, {
                  "latitude": "22.56016839189595",
                  "deviceName": "Xiaomi MiTV4-ANSM0",
                  "longitude": "114.03620703904163"
                }, {
                  "latitude": "22.562013325642923",
                  "deviceName": "Xiaomi MiTV4-ANSM0",
                  "longitude": "114.03447401945436"
                }, {
                  "latitude": "22.56016839189595",
                  "deviceName": "Xiaomi MiTV4-ANSM0",
                  "longitude": "114.03620703904163"
                }

                ],
                "smallIcon": "https://photo.test.jianzaogong.com/ws/photo?path=/yunping/yp_small.png",
                "type": 4,
                "deviceName": "云屏"
              },

            ],
            "duration": 1000,
            "authRate": "80.0%",
            "totalNum": 11,
            "clockStatistic": [{
              "clockDate": "2019-04-20",
              "clockNum": 1
            }, {
              "clockDate": "2019-04-21",
              "clockNum": 2
            }, {
              "clockDate": "2019-04-22",
              "clockNum": 3
            }, {
              "clockDate": "2019-04-23",
              "clockNum": 4
            }, {
              "clockDate": "2019-04-24",
              "clockNum": 30
            }, {
              "clockDate": "2019-04-25",
              "clockNum": 5
            }, {
              "clockDate": "2019-04-26",
              "clockNum": 40
            }, {
              "clockDate": "2019-04-27",
              "clockNum": 8
            }, {
              "clockDate": "2019-04-28",
              "clockNum": 50
            }, {
              "clockDate": "2019-04-29",
              "clockNum": 8
            }, {
              "clockDate": "2019-04-30",
              "clockNum": 12
            }, {
              "clockDate": "2019-05-01",
              "clockNum": 11
            }, {
              "clockDate": "2019-05-02",
              "clockNum": 14
            }, {
              "clockDate": "2019-05-03",
              "clockNum": 15
            }],
            "progress": "99%",
            "workerNum": 1,
            "longitude": "114.0409917754466"
          },
          "projectName": "深圳市赤坳水库除险加固工程深圳市赤坳水库除险加固工程深圳市赤坳水库除险加固工程深圳市赤坳水库除险加固工程深圳市赤坳水库除险加固工程深圳市赤坳水库除险加固工程深圳市赤坳水库除险加固工程",
          "yunPingCode": "18414220100155130",
          "slogan": "科学管理，精心施工！",
          "yunPingName": "1 号建造工智能云屏"
        };

        // 设置标语样式
        this.setProjectCssHandle(data.sloganStyle)
        let detailDto = data.detailDto || {};
        let generalDto = data.generalDto || {};
        let authRate = detailDto.authRate;
        let increments = detailDto.increments || [];
        let mapList = detailDto.mapList || [];
        let progress = (detailDto.progress || '').replace('%', '') || 0;

        this.state.staffData.totalStaff.val = detailDto.totalNum;
        this.state.staffData.buildingWorker.val = detailDto.workerNum;;
        this.state.staffData.manager.val = detailDto.managerNum;
        if (authRate) {
          this.state.staffData.realNameRatio.val = window.Number(authRate.replace('%', '')).toFixed(2);
        } else {
          this.state.staffData.realNameRatio.val = 0;
        }
        this.state.equipmentList = increments.map(item => {
          let json = {
            imgSrc: item.smallIcon,
            maxImgSrc: item.bigIcon,
            title: item.deviceName,
            num: item.deviceNum,
          }
          // let json = {
          //     imgSrc: 'http://tvv1.test.jianzaogong.com/overview/b.png',
          //     title: item.deviceName,
          //     num: item.deviceNum,
          // }
          json.aMapList = [];
          item.locations.forEach(locationsItem => {
            json.aMapList.push({
              lng: locationsItem.longitude,
              lat: locationsItem.latitude,
            })
          })
          return json;
        });

        this.state.mapPolygonPath = mapList.map(item => {
          return [
            item.longitude,
            item.latitude,
          ]
        })
        let clockStatistic = detailDto.clockStatistic || [];
        let clockStatisticList = [];
        clockStatistic.map((item, index) => {
          clockStatisticList.push({
            index: (index + 1).toString(),
            clockDate: item.clockDate,
            clockNum: item.clockNum,
          });
        })
        this.setState({
          projectName: data.projectName,
          slogan: data.slogan,
          generalDto: generalDto,
          bannerList: generalDto.picDto || [],
          rightProgressbarTagretWidth: window.Number(progress),
          detailDto: detailDto,
          staffData: this.state.staffData,
          equipmentList: this.state.equipmentList,
          mapPolygonPath: this.state.mapPolygonPath,
          brokenLineList: clockStatisticList,
          yunPingName: data.yunPingName,
          yunPingCode: data.yunPingCode,
          logo: data.logo,
        }, () => {
          // 进度调初始化  
          this.progressbarComposeType();
          // 初始化成员数量-图饼图
          this.initStaff();
          // 初始化设备列表
          this.initEquipmentList();
          // 初始化折线图
          this.initBrokenLine();
          // banner 轮播
          this.initBanner();
        })
        window._resData = data;

        // 设备已解绑状态
        if (window.Number(data.yunPingStatus) === 2) {
          config.android && config.android.setBinding();
          return null;
        }

        // 服务已过期
        if (window.Number(data.yunPingStatus) === 5) {
          this.setState({
            footerInfoStatus: 'serverPast',
          });
          return null;
        }
        // 云屏源已切换(需调用android接口,发起重新绑定长连接)
        if (window.Number(data.yunPingStatus) === 3) {
          this.setState({
            footerInfoStatus: 'urlSourceChange',
          });
          console.log('云屏源已切换destroyWeb')
          config.android && config.android.destroyWeb();
          return null;
        }
        this.setState({
          footerInfoStatus: '',
        });

        // 版本需要更新
        // if (window.Number(data.updateFlag) === 1) {
        //     window.localStorage.setItem('updateFlag', data.updateFlag)
        //     window.localStorage.setItem('updateUrl', data.updateUrl)
        //     this.setState({
        //         footerInfoStatus: 'updateVer',
        //     })
        // } else {
        //     window.localStorage.removeItem('updateFlag')
        //     window.localStorage.removeItem('updateUrl')
        // }

      },
      onerror_function: (code, reason) => {
        if (this.state.footerInfoStatus !== 'noNetwork') {
          this.setState({
            footerInfoStatus: 'networkAbnormal'
          })
        }
      }
    })
  }
  // 初始化banner
  initBanner() {
    if (!this.bannerTime) {
      this.bannerTime = setInterval(() => {
        let actionBannerListIndex = this.state.actionBannerListIndex;
        if (this.state.actionBannerListIndex === this.state.bannerList.length - 1) {
          actionBannerListIndex = 0
        } else {
          ++actionBannerListIndex;
        }
        this.setState({
          actionBannerListIndex: actionBannerListIndex,
        })
      }, 1000 * 15);
    }
  }
  // 更新本地显示时间
  updateLocalTime() {
    setInterval(() => {
      let dataObj = new Date()
      let nongLi = solarLunar.solar2lunar(dataObj.getFullYear(), dataObj.getMonth() + 1, dataObj.getDate())

      let time = tools.momentFormat(dataObj.getTime(), 'LL dddd  ')
        + tools.momentFormat(dataObj, 'HH:mm:ss')
        + '<br/>'
        + `农历${nongLi.monthCn}${nongLi.dayCn}`
      this.setState({
        localTime: time
      })
    }, 1000)
  }
  // 设置标语样式
  setProjectCssHandle(status) {
    if (status === '红底黄字 (贵宾模式)') {
      this.setState({
        projectNameStatus: false
      })
    } else {
      this.setState({
        projectNameStatus: true
      })
    }
  }
  // 进度条排版
  progressbarComposeType() {
    // 进度条整体容器
    let contentRightProgressbarDom = document.querySelector('.content-right-progressbar');
    // 进度条-进度
    let rightProgressbarTagretDom = document.querySelector('.right-progressbar-tagret');
    // 进度条-进度信息
    let rightProgressbarDocDom = document.querySelector('.right-progressbar-doc');
    // 进度条-进度信息-箭头
    let triangleBorderUpDom = document.querySelector('.triangle_border_up');
    if (!contentRightProgressbarDom) return null;

    let contentRightProgressbarDomWidth = contentRightProgressbarDom.offsetWidth;
    let rightProgressbarTagretDomWidth = rightProgressbarTagretDom.offsetWidth;
    let rightProgressbarDocDomWidth = rightProgressbarDocDom.offsetWidth;
    let rightProgressbarDocDomWidthHalf = rightProgressbarDocDomWidth / 2;
    let triangleBorderUpDomWidth = triangleBorderUpDom.offsetWidth;
    let triangleBorderUpDomWidthHalf = triangleBorderUpDom.offsetWidth / 2;
    // rightProgressbarTagretDomWidth 去掉箭头宽度
    let takeOutMarkWide = rightProgressbarTagretDomWidth - triangleBorderUpDomWidthHalf;
    // 用于进度条大于进度条信息对比
    let progressBarWidth = contentRightProgressbarDomWidth - rightProgressbarTagretDomWidth;
    // 用于进度条大于进度条信息 去掉箭头宽度
    let progressBarTakeOutMarkWide = progressBarWidth - triangleBorderUpDomWidthHalf;

    // left处理
    if (rightProgressbarDocDomWidthHalf > rightProgressbarTagretDomWidth) {

      let triangleBorderUpDomLeft = triangleBorderUpDomWidthHalf > takeOutMarkWide ? triangleBorderUpDomWidthHalf : takeOutMarkWide;
      console.log(6666666, triangleBorderUpDomLeft, triangleBorderUpDomWidthHalf)
      this.setState({
        rightProgressbarDocDomLeft: 0,
        triangleBorderUpDomLeft: this.state.rightProgressbarTagretWidth === 0 ? 5 : (triangleBorderUpDomLeft + triangleBorderUpDomWidthHalf) / rightProgressbarDocDomWidth * 100,
      });
      return null;
    }
    console.log('bdddddddd', rightProgressbarDocDomWidth - triangleBorderUpDomWidth)
    // right处理
    if (rightProgressbarDocDomWidthHalf > progressBarWidth) {
      let triangleBorderUpDomLeft = triangleBorderUpDomWidthHalf > progressBarTakeOutMarkWide ? triangleBorderUpDomWidthHalf : progressBarTakeOutMarkWide;
      this.setState({
        rightProgressbarDocDomLeft: contentRightProgressbarDomWidth - rightProgressbarDocDomWidth,
        triangleBorderUpDomLeft: this.state.rightProgressbarTagretWidth === 100 ? (rightProgressbarDocDomWidth - triangleBorderUpDomWidth + 2) / rightProgressbarDocDomWidth * 100 : (rightProgressbarDocDomWidth - triangleBorderUpDomLeft - triangleBorderUpDomWidthHalf) / rightProgressbarDocDomWidth * 100,
      });
      return null;
    }
    let rightProgressbarDocDomLeft = rightProgressbarTagretDomWidth - rightProgressbarDocDomWidthHalf;
    this.setState({
      rightProgressbarDocDomLeft: rightProgressbarDocDomLeft,
      triangleBorderUpDomLeft: (rightProgressbarTagretDomWidth - rightProgressbarDocDomLeft) / rightProgressbarDocDomWidth * 100,
    });


  }
  // CountUp 组件动画结束之后调用函数
  onCompleteCounUp(key) {
    let staffData = this.state.staffData;
    staffData[key].oldVal = staffData[key].val
    this.setState({
      staffData: staffData
    })
  }
  render() {
    return (
      <div className="app-wrap">
        <div className={['app-header', this.state.projectNameStatus ? 'head-bg-gold-gradient' : 'head-bg-red-gradient'].join(' ')}>
          <div className="app-container">
            <div className="app-header-info">
              <div className="header-info-tag">{this.state.projectName}</div>
              <div className="header-info-time" dangerouslySetInnerHTML={{ __html: this.state.localTime }}></div>
            </div>
            <div className="app-header-title">
              {this.state.slogan ? <MarqueeWrap title={this.state.slogan} /> : null}
            </div>
          </div>
        </div>
        <div className="app-content">
          <div className="app-content-left">
            <div className="common-container">
              <div className="app-content-statistics">
                <div className="common-container-title">项目概况</div>
                <div className="statistics-info">
                  <div className="statistics-info-item">
                    <div className="info-item-label">项目地址:</div>
                    <div className="info-item-content">
                      {this.state.generalDto.address ? this.state.generalDto.address : '-'}
                    </div>
                  </div>
                  <div className="statistics-info-item">
                    <div className="info-item-label">开工日期:</div>
                    <div className="info-item-content">
                      {this.state.generalDto.openDate ? this.state.generalDto.openDate : '-'}
                    </div>
                  </div>
                  {/* <div className="statistics-info-item">
                                        <div className="info-item-label">合同工期:</div>
                                        <div className="info-item-content">
                                            {this.state.generalDto.duration ? `${this.state.generalDto.duration}天` : '-'} 
                                        </div>
                                    </div> */}
                  <div className="statistics-info-item">
                    <div className="info-item-label">合同工期:</div>
                    {this.state.generalDto.duration ? <div className="info-item-content"
                      dangerouslySetInnerHTML={{ __html: `${this.state.generalDto.duration}&nbsp;天` }}>
                    </div> : <div className="info-item-content">-</div>}
                  </div>
                  <div className="statistics-info-item">
                    <div className="info-item-label">项目投资:</div>
                    {this.state.generalDto.investMoney ? <div className="info-item-content"
                      dangerouslySetInnerHTML={{ __html: `${this.state.generalDto.investMoney}&nbsp;万` }}>
                    </div> : <div className="info-item-content">-</div>}
                  </div>
                </div>
                <div className="statistics-info">
                  <div className="statistics-info-item">
                    <div className="info-item-label">建设单位:</div>
                    <div className="info-item-content">
                      {this.state.generalDto.constructionUnit ? this.state.generalDto.constructionUnit : '-'}
                    </div>
                  </div>
                  <div className="statistics-info-item">
                    <div className="info-item-label">设计单位:</div>
                    <div className="info-item-content">
                      {this.state.generalDto.designUnit ? this.state.generalDto.designUnit : '-'}
                    </div>
                  </div>
                  <div className="statistics-info-item">
                    <div className="info-item-label">监理单位:</div>
                    <div className="info-item-content">
                      {this.state.generalDto.controlUnit ? this.state.generalDto.controlUnit : '-'}
                    </div>
                  </div>
                  <div className="statistics-info-item">
                    <div className="info-item-label">施工单位:</div>
                    <div className="info-item-content">
                      {this.state.generalDto.buildUnit ? this.state.generalDto.buildUnit : '-'}
                    </div>
                  </div>
                  <div className="statistics-info-item">
                    <div className="info-item-label">负责人:</div>
                    <div className="info-item-content">
                      {this.state.generalDto.principal ? this.state.generalDto.principal : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* banner 轮播 start*/}
            <div className="common-container">
              {this.state.bannerList.map((item, index) => {
                return <div
                  className={`bannercontainer ${
                    this.state.actionBannerListIndex === index ? ' bannercontaineraction'
                      : ''
                    }`}
                  key={index}>
                  <div className="banner" style={{ backgroundImage: `url(${item.url})` }}>
                    <div className="banner-info">
                      <div className="banner-info-title">
                        <div className="info-title-text">{item.title}</div>
                        <div className="info-title-time">{item.time}</div>
                      </div>
                      <div className="banner-info-doc">{item.description}</div>
                    </div>
                  </div>

                </div>
              })}
            </div>
            {/* banner 轮播 end*/}
          </div>
          <div className="app-content-right">
            {/* 进度条 start */}
            {this.state.detailDto.duration ? <div className="content-right-progressbar">
              <div style={{
                width: `${this.state.rightProgressbarTagretWidth}%`,
              }}
                className='right-progressbar-tagret'>
              </div>
              <div style={{
                left: `${this.state.rightProgressbarDocDomLeft}px`,
              }} className="right-progressbar-doc">
                <div style={{
                  left: `${this.state.triangleBorderUpDomLeft}%`,
                }}
                  className="triangle_border_up">
                  <span></span>
                </div>
                <div className='progressbar-doc-container'>
                  <div className="progressbar-doc-item">
                    <div className="doc-item-label">工程进度</div>
                    <div className="doc-item-value">{this.state.rightProgressbarTagretWidth}%</div>
                  </div>
                  <div className="progressbar-doc-item">
                    <div className="doc-item-label">
                      {this.state.detailDto.openStatus === 1 ? '已开工' : ''}
                      {this.state.detailDto.openStatus === 2 ? '未开工' : ''}
                    </div>
                    <div className="doc-item-value">{this.state.detailDto.openDays} / {
                      this.state.detailDto.duration
                    } 天</div>
                  </div>
                </div>

              </div>
            </div> : null}
            {/* 进度条 end */}
            {/* 地图 start */}
            <div className="content-right-map">
              <div id="mapcontainer">
              </div>
            </div>
            {/* 地图 end */}
            {/* 设备列表 start */}
            <div className="content-right-equipment">
              <TransitionGroup>
                {this.state.equipmentListAnimation ? this.state.currentEquipmentList.map((item, index) => {
                  let num = this.state.currentEquipmentListRow * this.state.currentEquipmentListIndex
                  return (
                    <CSSTransition key={item.clockId} timeout={700} classNames="fade" key={index}>
                      <div className={`right-equipment-item${
                        (num + index) === this.state.actionEquipmentListIndex ? ' right-equipment-itemaction' : ''
                        }`}
                        key={index}>
                        <div style={{ backgroundImage: `url(${item.imgSrc})` }}
                          className="right-equipment-item-icon">
                        </div>
                        <div className="right-equipment-item-title">{item.title}&nbsp;</div>
                        <div className="right-equipment-item-num">{item.num}</div>
                      </div>
                    </CSSTransition>
                  )
                }) : null}
              </TransitionGroup>
            </div>
            {/* 设备列表 end */}
            {/* 折线图 start*/}
            <div className="content-right-chart">
              <div className="right-chart-brokenline">
                <div ref={this.brokenlinContainerDom} id="brokenlin-container">
                </div>
              </div>
              <div className="right-chart-title">
                近14天出勤人员
                            </div>
            </div>
            {/* 折线图 end*/}
            {/* 项目人数信息 start */}
            <div className="content-right-staff">
              <div className="content-right-staff-item">
                <div className="staff-item-value">
                  {this.state.staffData.totalStaff.val ?
                    <span className="staff-item-value-span">
                      <CountUp
                        start={this.state.staffData.totalStaff.oldVal}
                        end={this.state.staffData.totalStaff.val}
                        decimals={0}
                        duration={2.5}
                        useEasing={true}
                        useGrouping={true}
                        onComplete={() => { this.onCompleteCounUp('totalStaff') }}
                      /></span> : '-'}
                </div>
                <div className="staff-item-label">
                  总人数
                                </div>
              </div>
              <div className="content-right-staff-item">
                <div className="staff-item-value">
                  {this.state.staffData.buildingWorker.val ?
                    <span className="staff-item-value-span">
                      <CountUp
                        start={this.state.staffData.buildingWorker.oldVal}
                        end={this.state.staffData.buildingWorker.val}
                        decimals={0}
                        duration={2.5}
                        useEasing={true}
                        useGrouping={true}
                        onComplete={() => { this.onCompleteCounUp('buildingWorker') }}
                      /></span> : '-'}
                </div>
                <div className="staff-item-label">
                  建筑工人
                                </div>
              </div>
              <div className="content-right-staff-item">
                <div className="staff-item-value">
                  {this.state.staffData.manager.val ?
                    <span className="staff-item-value-span">
                      <CountUp
                        start={this.state.staffData.manager.oldVal}
                        end={this.state.staffData.manager.val}
                        decimals={0}
                        duration={2.5}
                        useEasing={true}
                        useGrouping={true}
                        onComplete={() => { this.onCompleteCounUp('manager') }}
                      />
                    </span> : '-'}
                </div>
                <div className="staff-item-label">
                  管理人员
                                </div>
              </div>
              <div className="content-right-staff-item">
                <div className="staff-item-value">
                  <div ref={this.itemValueAnnularDom} id="item-value-annular" className="item-value-annular"></div>
                  {this.state.staffData.realNameRatio.val ?
                    <span className="staff-item-value-span">
                      <CountUp
                        start={this.state.staffData.realNameRatio.oldVal}
                        end={this.state.staffData.realNameRatio.val}
                        decimals={0}
                        duration={2.5}
                        useEasing={true}
                        useGrouping={true}
                        onComplete={() => this.onCompleteCounUp('realNameRatio')} />
                    </span> : null}
                  {this.state.staffData.realNameRatio.val ?
                    <span className="staff-item-value-span">%</span>
                    : '-'}
                </div>
                <div className="staff-item-label">
                  实名制比例
                                </div>
              </div>
            </div>
            {/* 项目人数信息 end */}
            {/* 遮罩层(地图) start*/}
            <div className="content-right-shademap">
            </div>
            {/* 遮罩层(地图) end*/}
          </div>
        </div>
        <div className="app-footer">
          <div className="app-footer-main">
            <FooterInfoWrap footerInfoStatus={this.state.footerInfoStatus} />
          </div>
          <div className="app-footer-version">
            {this.state.yunPingName} {this.state.yunPingCode ? <span><span className="split">|</span><span>序列号</span></span> : null} {this.state.yunPingCode}
          </div>
          <div className="app-footer-logo" style={{
            backgroundImage: `url(${
              this.state.logo
              })`
          }}>
          </div>
        </div>
      </div>
    )
  }
}

export default App
