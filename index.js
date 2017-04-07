/**
 * Created by zhangfan on 16/5/16.
 */
process.env.UV_THREADPOOL_SIZE = 64;
// CAS 用的是自签名的证书
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var cluster = require('cluster');

var globalConfig = require("../server/config.js");

var master = require('./master');
var worker = require('./worker');
var workersConfig = require('./workers.config')

cluster.isMaster ?
  master(cluster, globalConfig, workersConfig) :
  worker(cluster, globalConfig, workersConfig);