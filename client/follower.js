var follow = require('follow');
follow("http://patrick:password@127.0.0.1:5984/_users", function(error, change) {
  if(!error) {
    console.log(JSON.stringify(change));
  }
})
