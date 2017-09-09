var express = require("express");
var app = express();
var fs = require("fs");
var request = require("request");


let configObj = JSON.parse(fs.readFileSync("config/config.json", "utf8"));
let teamMembers = JSON.parse(fs.readFileSync("resources/team_members.json","utf8"));

app.get("/team-members", function(req,res){
    res.end(JSON.stringify(teamMembers));
});

app.get("/competitors", function(req,res){
  var teamInfos = [];
  request({
      url: configObj.chaosBaseUrl + configObj.teamHash,
      json: true
    }, function(error,response,body){
        if(!error && response.statusCode === 200){
          var teamSize = body.length;
          var counter = 0;
            for(var i=0;i<teamSize;i++){
              var currentUrl = body[i].url;
              if(currentUrl.slice(-1) !== "/"){
                currentUrl += "/";
              }
              if(currentUrl.substring(0,4) !== "http"){
                currentUrl = "http://" + currentUrl;
              }
              currentUrl += "team-members";
              request({
                url: currentUrl
              },function(error,response,body){
                  if(!error && response.statusCode === 200){
                    teamInfos.push(body);
                    if(counter === teamSize-1){
                      res.end(JSON.stringify(teamInfos));
                    }
                  }
                  counter++;
              })
            }
        }
    });
});


app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function () {
  console.log("App is running on port", app.get('port'));
})