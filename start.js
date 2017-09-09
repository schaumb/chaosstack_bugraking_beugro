var express = require("express");
var app = express();
var fs = require("fs");
var request = require("request");
var http = require("http");

let configObj = JSON.parse(fs.readFileSync("config/config.json", "utf8"));
let teamMembers = JSON.parse(fs.readFileSync("resources/team_members.json", "utf8"));

app.get("/team-members", function (req, res) {
  res.end(JSON.stringify(teamMembers));
});

app.get("/competitors", function (req, res) {
  var teamInfos = [{"name": teamMembers.teamName}];
  var chaosUrl = configObj.chaosBaseUrl + configObj.teamHash;
  var counter = 0;
  request({
    url: chaosUrl,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var urls = body;
      for (i in urls) {
        var url = urls[i].url;
        if(url.indexOf("http") <= -1){
          url = "http://" + url;
        }
        url += url.slice(-1) == "/" ? "team-members" : "/team-members";
        console.log(url);
        request({
          url: url,
          json: true
        }, function (error, response, body) {
          if (!error && response.statusCode === 200) {
            if(!!body.teamName){
              teamInfos.push({"name": body.teamName});
            }
          }
          counter++;
          if (counter == urls.length) {
            res.end(JSON.stringify({"teams": teamInfos}));
          }
        })
      }
    }
  })
});


app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function () {
  console.log("App is running on port", app.get('port'));
})