//================================
// Simple EventHub test - takes in a JSON settings file
// containing settings for connecting to the Hub:
// - protocol: should never be set, defaults to amqps
// - SASKeyName: name of your SAS key which should allow send/receive
// - SASKey: actual SAS key value
// - serviceBusHost: name of the host without suffix (e.g. https://foobar-ns.servicebus.windows.net/foobar-hub => foobar-ns)
// - eventHubName: name of the hub (e.g. https://foobar-ns.servicebus.windows.net/foobar-hub => foobar-hub)
// - partitions: number of partitions (see node-sbus-amqp10 for a wrapper client that will figure this out for you and connect appropriately)
//
// By default, will set up a receiver on each partition, then send a message and exit when that message is received.
// Passing in a final argument of (send|receive) causes it to only execute one branch of that flow.
//================================

//======================
// Sinergija 2015 - car racing
//======================


'use strict';
//var AMQPClient = require('amqp10').Client;
var AMQPClient  = require('../lib').Client,
    Policy = require('../lib').Policy,
    translator = require('../lib').translator;
var b = require('bonescript');
b.pinMode('P9_14', b.OUTPUT);
b.pinMode('P9_13', b.OUTPUT);

var vreme_on = 0;
var vreme_off = 0;

var vreme_on_crni = 0;
var vreme_off_crni = 0;

var vreme_on_beli = 0;
var vreme_off_beli = 0;

// Set the offset for the EventHub - this is where it should start receiving from, and is typically different for each partition
// Here, I'm setting a global offset, just to show you how it's done. See node-sbus-amqp10 for a wrapper library that will
// take care of this for you.
var filterOffset = 63000;// ; example filter offset value might be: 43350;
var filterTime = Date.now();
var filterOption; // todo:: need a x-opt-offset per partition.
if (filterOffset) {
	console.log('Postavljam filter');
  filterOption = {
    attach: { source: { filter: {
      'apache.org:selector-filter:string': translator(

        //['described', ['symbol', 'apache.org:selector-filter:string'], ['string', "amqp.annotation.x-opt-offset > '" + filterOffset + "'"]])
	['described', ['symbol', 'apache.org:selector-filter:string'], ['string', "amqp.annotation.x-opt-enqueued-time >"+filterTime]])

    } } }
  };
}

var settingsFile = process.argv[2];
var settings = {};
if (settingsFile) {
  settings = require('./' + settingsFile);
} else {
  settings = {
      //serviceBusHost: 'makersns-ns',
      serviceBusHost: 'sinergija-demo',
    eventHubName: 'noise-hub',
    partitions: 3,
    SASKeyName:'RootManageSharedAccessKey',
    //SASKey: '4FsVESl4KF7Pymjjyvq0M/Y366+NCouyhyWqIVsQC5I='
    SASKey:  '4xjjCEseN9H6NMv7ypyAHF14Gqvm/b7ZDQPM4e6VbvY='
  };
}

if (!settings.serviceBusHost || !settings.eventHubName || !settings.SASKeyName || !settings.SASKey || !settings.partitions) {
  console.warn('Must provide either settings json file or appropriate environment variables.');
  process.exit(1);
}

var protocol = settings.protocol || 'amqps';
var serviceBusHost = settings.serviceBusHost + '.servicebus.windows.net';
if (settings.serviceBusHost.indexOf(".") !== -1) {
  serviceBusHost = settings.serviceBusHost;
}
var sasName = settings.SASKeyName;
var sasKey = settings.SASKey;
var eventHubName = settings.eventHubName;
var numPartitions = settings.partitions;

var uri = protocol + '://' + encodeURIComponent(sasName) + ':' + encodeURIComponent(sasKey) + '@' + serviceBusHost;
var sendAddr = eventHubName;//+'/Partitions/0';
var recvAddr = eventHubName + '/ConsumerGroups/$default/Partitions/';

var msgVal = Math.floor(Math.random() * 1000000);

var client = new AMQPClient(Policy.EventHub);

var errorHandler = function(myIdx, rx_err) {
  console.warn('==> RX ERROR: ', rx_err);
};

var messageHandler = function (myIdx, msg) {
  //console.log('Recv(' + myIdx + '): ');
  //console.log(msg.body);
  //if (msg.annotations) {
    //console.log('Annotations:');
    //console.log(msg.annotations);
  //}
  //console.log('');

var vremeUTC = Date.now();
var vremeSRB = Date.now() + 2*60*60*1000;
var vremeMSG = Date.parse(msg.body.time);
//console.log('msg.time : ' + msg.body.time);


if (msg.body.deviceId == 'AN-crni'){

  if (msg.body.noiseLevel > 46) {
    
      console.log("Crni+ !!!!");
	console.log('Razlika :' + (vremeSRB-vremeMSG) );
      if (Date.now() > vreme_off_crni + 1000) {
          b.digitalWrite('P9_14', b.HIGH);
          vreme_on_crni = Date.now();
      }
  }
  if (msg.body.noiseLevel < 40) {

      console.log("Crni- !!!!");
	console.log('Razlika :' + (vremeSRB-vremeMSG) );
      if (Date.now() > vreme_on_crni + 1000) {
          b.digitalWrite('P9_14', b.LOW);
          vreme_off_crni = Date.now();
      }
  }
}
if (msg.body.deviceId == 'AN-beli'){

  if (msg.body.noiseLevel > 48) {
    
      console.log("Beli+ !!!!");
	console.log('Razlika :' + (vremeSRB-vremeMSG) );
      if (Date.now() > vreme_off_beli + 1000) {
          b.digitalWrite('P9_13', b.HIGH);
          vreme_on_beli = Date.now();
      }
  }
  if (msg.body.noiseLevel < 40) {

      console.log("Beli- !!!!");
	console.log('Razlika :' + (vremeSRB-vremeMSG) );
      if (Date.now() > vreme_on_beli + 1000) {
          b.digitalWrite('P9_13', b.LOW);
          vreme_off_beli = Date.now();
      }
  }
}
if (msg.body.deviceId == 'rpinoise001'){
  if (msg.body.noiseLevel > -15) {
    
      console.log("Toma+ !!!!");
	console.log('Razlika :' + (vremeUTC-vremeMSG) );
      if (Date.now() > vreme_off + 1000) {
          b.digitalWrite('P9_14', b.HIGH);
          vreme_on = Date.now();
      }
  }
  if (msg.body.noiseLevel < -17) {

      console.log("Toma- !!!!");
	console.log('Razlika :' + (vremeUTC-vremeMSG) );
      if (Date.now() > vreme_on + 1000) {
          b.digitalWrite('P9_14', b.LOW);
          vreme_off = Date.now();
      }
  }
}

};

var setupReceiver = function(curIdx, curRcvAddr, filterOption) {
  client.createReceiver(curRcvAddr, filterOption)
    .then(function (receiver) {
      receiver.on('message', messageHandler.bind(null, curIdx));
      receiver.on('errorReceived', errorHandler.bind(null, curIdx));
    });
};

client.connect(uri).then(function () {
	if (numPartitions > 3){
  		for (var idx = 0; idx < numPartitions; ++idx) {
    			setupReceiver(idx, recvAddr + idx, filterOption); // TODO:: filterOption-> checkpoints are per partition.
  		}
	}
	if (numPartitions < 4){
    		//setupReceiver(11, recvAddr + 11, filterOption); // TODO:: filterOption-> checkpoints are per partition.
    		setupReceiver(12, recvAddr + 12, filterOption); // TODO:: filterOption-> checkpoints are per partition.
    		setupReceiver(16, recvAddr + 16, filterOption); // TODO:: filterOption-> checkpoints are per partition.
	}
  // {'x-opt-partition-key': 'pk' + msgVal}

}).catch(function (e) {
  console.warn('Failed to send due to ', e);
});
