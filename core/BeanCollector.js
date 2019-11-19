let { WidgetUtils } = require('../lib/WidgetUtils.js')
let { automator } = require('../lib/Automator.js')
let { commonFunctions } = require('../lib/CommonFunction.js')
let { config } = require('../config.js')


function BeanCollector () {
  const _package_name = 'com.jingdong.app.mall'

  /***********************
   * 综合操作
   ***********************/

  // 进入京东app
  const startApp = function () {
    logInfo('启动京东应用')
    launch(_package_name)
    sleep(1000)
    let skip = WidgetUtils.widgetGetOne('跳过')
    if (skip !== null) {
      automator.clickCenter(skip)
      sleep(1000)
    }
  }

  const waitingAndGet = function (val,t) {
    WidgetUtils.widgetWaiting(val,null,t)
    return WidgetUtils.widgetGetOne(val,t)
  }

  const tryEnter = function (preAction, targetContent) {
    let retry = 0
    let target = waitingAndGet(targetContent)
    while (target === null && preAction !== null && retry++ <= 5) {
      automator.clickCenter(preAction)
      sleep(500)
      target = waitingAndGet(targetContent)
    }
    if (target === null) {
      errorInfo(['进入「{}」失败', targetContent], true)
      if (preAction === null) {
        errorInfo('前置操作失败！！！')
      }
    } else {
      infoLog(['进入「{}」成功', targetContent], true)
      automator.clickCenter(target)
    }
    return target
  }

  const waitEnter = function (preAction, targetContent,x,y) {
    let retry = 0
    let target = waitingAndGet(targetContent,1500)
    
    if (target === null) {
      errorInfo(['进入「{}」失败', targetContent], true)
      if (preAction === null) {
        errorInfo('前置操作失败！！！', true)
      }
      sleep(2500)
      infoLog('点击去种豆', true)
      automator.click(x,y)
      return
    } else {
      infoLog(['进入「{}」成功', targetContent], true)
      automator.clickCenter(target)
    }
    return target
  }

  return {
    exec: function () {
      startApp()
      let mine = waitingAndGet('我的')
      if (mine === null) {
        commonFunctions.killCurrentApp()
        commonFunctions.setUpAutoStart(0.06)
        return
      }
      automator.clickCenter(mine)
      sleep(2000)
      let beens = tryEnter(mine, '京豆')
      let toCollect = tryEnter(beens, '去签到领京豆|已签到')
      let doCollect = tryEnter(toCollect, '签到领京豆|已连续签到')
      let seed = waitEnter(doCollect, '.*种豆.*',900,350)
      waitingAndGet('培养')
      infoLog('点击收集能量包', true)
        automator.click(210, 1200)
        sleep(2000)
      let countdown = waitingAndGet('剩\\d{2}:\\d{2}:\\d{2}')
      if (countdown !== null) {
        let countdownInfo = countdown.text()
        let regex = /剩(\d{2}):(\d{2}):(\d{2})/
        if (regex.test(countdownInfo)) {
          let result = regex.exec(countdownInfo)
          let h = result[1]
          let m = result[2]
          let remainTime = parseInt(h) * 60 + parseInt(m) + 1
          if (remainTime > 61) {
            remainTime = remainTime%60
            remainTime=remainTime===0?60:remainTime
            //commonFunctions.setUpAutoStart(remainTime)
          }
          commonFunctions.setUpAutoStart(remainTime)
        }
      } //else {
        
     // }
      let feed = waitingAndGet('培养')
      automator.clickCenter(feed)
      infoLog('完成！' + (countdown != null ? countdown.text() : ''), true)
      commonFunctions.killCurrentApp()
      home()
      device.setBrightnessMode(1)
    }
  }
}

module.exports = {
  beanCollector: new BeanCollector()
}