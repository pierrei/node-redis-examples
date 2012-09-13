var http = require('http');

var redis = require("redis"),

client = redis.createClient();
client.select(2, function() { /* ... */ });

client.on("error", function (err) {
  console.log("Error " + err);
});

http.createServer(
  function (req, res) {
    var ip = req.connection.remoteAddress;

    client.get(ip, function(err, reply) {
      var currentNrOfCalls = reply;
      var requestOk = false;

      console.log('Current number of calls: ' + currentNrOfCalls);
      if (currentNrOfCalls < 11) {
        console.log('Incrementing!');
        client.incr(ip, function(err, incrReply) {
          if (incrReply == '1') {
            console.log('Setting expire');
            client.expire(ip, 1);
          }
        });

        requestOk = true;
      }

      if (requestOk) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Request successful!\n');
      } else {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Too many requests!\n');
      }
    })
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
