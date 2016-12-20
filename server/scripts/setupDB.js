// set up couch databese
var bootstrap = require('couchdb-bootstrap');
var dbConf = require('../config/database.json');

console.log(dbConf.url);
bootstrap(dbConf.url, 'db/setup', function(error, response){
    if (error) {
        console.error("Bootstrap error");
        console.error(error);
        return;
    }

    console.log("Bootstrap success");
    console.log(JSON.stringify(response));
});
