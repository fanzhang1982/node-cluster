module.exports = {
  "cmaf": {
    host: 'localhost',
    port: 8101,
    routers: "cmaf",
    initialize: function(app, dynamicRouter, globalConfig) {
      require('../server/cmaf')(app, dynamicRouter, globalConfig);
    }
  },
  /*"cube": {
    host: 'localhost',
    port: 8102,
    routers: ["cube", "cube-cmaf"],
    initialize: function(app, dynamicRouter, globalConfig) {
      require("./server/prism.js").initializeWeb();
      require("./server/cube-cmaf.js").initializeWeb();
    }
  },
  "cmafRoi": {
    host: 'localhost',
    port: 8103,
    routers: ["cmaf-roi"],
    initialize: function(app, dynamicRouter, globalConfig) {
      require("./server/cmaf-roi/cmaf-roi.js").initialize(false);
    }
  },
  "phone": {
    host: 'localhost',
    port: 8104,
    routers: "cmaf-phone",
    initialize: function(app, dynamicRouter, globalConfig) {
      require("./server/cmaf-phone/phone-call.js").initialize();
    }
  },
  "mail": {
    host: 'localhost',
    port: 8105,
    routers: "mail",
    initialize: function(app, dynamicRouter, globalConfig) {
      require("./server/mail-sender.js").initializeWeb();
    }
  },
  "hj": {
    port: 8106,
    host: 'localhost',
    routers: ["hj-realtime", "it-report", "aum-analysis", "wm", "hj-app", "roi-temp"],
    initialize: function(app, dynamicRouter, globalConfig) {
      require("./server/hj-realtime-summarizer.js").initialize();
      var hjRealtime = require("./server/hj-realtime.js");
      hjRealtime.initialTimer();
      hjRealtime.initializeWeb();
      require("./server/reports/aum-reports.js").initialize();
      require("./server/reports/aum-analysis.js").initialize();
      require("./server/reports/wealth-management.js").initialize();
      require("./server/hj-app-log.js").initialize();
      var roiTemp = require("./server/roi-temp/hongbao.js");
      roiTemp.initializeWeb();
      roiTemp.initializeTimer();
    }
  },*/
  "_main_": {
    port: 8107,
    host: 'localhost',
    default: true,
    initialize: function(app, dynamicRouter, globalConfig) {
      /*require("../server/system/status.js").initializeDailyReport();
      require("../server/security.js").initialize(app);*/
      //require("../server/dataSource.js").initFixConnection();
      require("../server/admin-console.js").initialize(app);
      //require("../utils.js").startHighchartExportServer();
    }
  }
};