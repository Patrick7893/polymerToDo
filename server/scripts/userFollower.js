const conn = require('../app/db');
const users = conn.use('_users');
const follow = require('follow');

const existingUsers = {};

function processUser(doc, callback) {
    if (doc.type != 'user') return;
    const existing = existingUsers[doc._id];
    if (!existing) {
        existingUsers[doc._id] = doc;
        const dbName = 'tasks-' + doc.name;
        console.log("DB Create " + dbName);
        conn.createDBAsync(dbName).then(result => {
          console.log("replicating " + dbName);
          return conn.createReplicationAsync(dbName, doc);
        })
        .then(result => {
          console.log('reverse replication ' + dbName);
          return conn.createReverseReplicationAsync(dbName);
        })
        .then(result => {
          console.log("_security request " + dbName);
          return conn.securitySetupAsync(dbName, doc);
        })
        .then(result => {
          console.log("setup end" + dbName);
        })
    }
    else {
        callback(null);
    }
}

users.follow(function(error, change){
    if (error) {
        console.error(error);
        return;
    }

    if (change.deleted) {
        const user = existingUsers[change.id];
        if (user) {
            delete existingUsers[change.id];
            const dbName = 'tasks-' + user.name;
            console.log('deleting ' + dbName);
            conn.db.destroy(dbName, (error) => {
                if (error) {
                    console.log('Error while destroying', error);
                }
            });
        }
    }
    else {
        users.get(change.id, function(error, doc) {
            processUser(doc, () => {});
        });
    }
});

// console.log(feed);
// feed.on('change', function(error, change) {
//     if (error) {
//         console.error(error);
//         return;
//     }
//
//     console.log(change);
//
//
//     if (change.deleted) {
//         console.warn("User deleting not implemented");
//     }
//     else {
//         users.get(change.id, function(error, user) {
//             console.log('Got user', user);
//             if (user.type == 'user') {
//
//             }
//             // var userTasksDBName = 'tasks-' + user.name;
//             // var userTasksDB = client.db(userTasksDBName);
//             // userTasksDB.exists().then(function(exists) {
//             //     if (!exists) {
//             //         userTasksDB.create().then(function(){
//             //             feed.resume();
//             //         });
//             //     }
//             //     else {
//             //         feed.resume();
//             //     }
//             // })
//         });
//     }
// })
