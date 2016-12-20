var dbConf = require('../config/database.json');
var nano = require('nano');

var client = nano({url: dbConf.url, parseUrl: false});

client.createDBAsync = function(dbName) {
  return new Promise((resolve, reject) => {
    client.db.create(dbName, (error, result) => {
      if (error) {
        console.log("Error create " + dbName);
        reject(error)
        return;
      }
      resolve(null)
    });
  });
}

client.createReplicationAsync = function(dbName, doc) {
  return new Promise((resolve, reject) => {
    client.db.replicate('tasks', dbName, {
        continuous: true,
        filter: 'app/forUser',
        query_params: {userName: doc.name}
    }, (error, result) => {
        if (error) {
            console.log("Error replicating to " + dbName);
            reject(error)
            return;
        }
        resolve(null)
    });
  });
}

client.createReverseReplicationAsync = function(dbName) {
  return new Promise((resolve, reject) => {
    client.db.replicate(dbName, 'tasks', {
        continuous: true,
    }, (error, result) => {
        if (error) {
            console.log("Error replicating to " + dbName);
            reject(error)
            return;
        }
        resolve(null)
    });
  })
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
