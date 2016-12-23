var dbConf = require('../config/database.json');
var nano = require('nano');

var client = nano({url: dbConf.url, parseUrl: false});

client.createDBAsync = function(dbName) {
  return new Promise((resolve, reject) => {
    client.db.create(dbName, (error, result) => {
      if (error) {
        console.log("Error create " + dbName);
        resolve(null)
        return;
      }
      resolve(null)
    });
  });
}

client.createReplicationFromTasksAsync = function(dbName, doc) {
  return new Promise((resolve, reject) => {
    var replicator = client.use('_replicator')
    replicator.insert({
      "source":  dbConf.url + '/tasks',
      "target":  dbConf.url + '/' + dbName,
      "continuous": true,
      "filter": 'app/forUser',
      "query_params" : {userName: doc.name}
    }, (error, result) => {
      if (error) {
        console.log("Error replicating to " + dbName);
        reject(error)
        return;
      }
      resolve(null)

    })
  });

}

client.createReplicationsAsync = function(dbName, doc) {

  var replicateToTasksPromise = new Promise((resolve, reject) => {
    var replicator = client.use('_replicator')
    replicator.insert({
      "source":  dbConf.url + '/' + dbName,
      "target":  dbConf.url + '/tasks',
      "continuous": true,
      "filter": 'type/forTypeTask',
    }, (error, result) => {
      if (error) {
        console.log("Error replicating to " + dbName);
        reject(error)
        return;
      }
      resolve(null)

    })
  });

  //   var replicateFromUsersPromise = new Promise((resolve, reject) => {
  //   var replicator = client.use('_replicator')
  //   replicator.insert({
  //     "source":  dbConf.url + '/_users',
  //     "target":  dbConf.url + '/' + dbName,
  //     "continuous": true,
  //   }, (error, result) => {
  //     if (error) {
  //       console.log("Error replicating to " + dbName);
  //       reject(error)
  //       return;
  //     }
  //     resolve(null)
  //
  //   })
  // });
  //
  // var replicateToUsersPromise = new Promise((resolve, reject) => {
  //   var replicator = client.use('_replicator')
  //   replicator.insert({
  //     "source":  dbConf.url + '/' + dbName,
  //     "target":  dbConf.url + '/_users',
  //     "continuous": true,
  //     "filter": 'type/forTypeUser',
  //   }, (error, result) => {
  //     if (error) {
  //       console.log("Error replicating to " + dbName);
  //       reject(error)
  //       return;
  //     }
  //     resolve(null)
  //
  //   })
  // });

  return Promise.all([replicateToTasksPromise])
}

client.securitySetupAsync = function(dbName, doc) {
  return new Promise((resolve, reject) => {
    client.request({
      db: dbName,
      method: 'PUT',
      doc: "_security",
      body: {
        "admins": {
          "names":[],
          "roles":[]
        },
        "members": {
          "names":[doc.name],
          "roles":[]
        }
      },
    }, (error, result) => {
        if (error) {
            console.log("Error " + error);
            reject(error)
            return;
        }
        resolve(null);
    });
  });
}



module.exports = client;
