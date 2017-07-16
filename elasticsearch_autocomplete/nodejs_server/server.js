
//Variable Definitions
  var mysql      = require('mysql');
  var elasticsearch = require('elasticsearch');
  var express = require('express');
  var app = express();
  var bodyParser = require('body-parser');
  var path    = require("path");

  var indexname = "world"



  var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'learning'
  });
  var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
  });
  var payload ={
    "index": indexname,
    "body": {  "settings": {
        "analysis": {
          "analyzer": {
             "indexing_analyzer": {
               "tokenizer": "whitespace",
               "filter":  ["lowercase", "edge_ngram_filter"]
             },
             "search_analyze": {
               "tokenizer": "whitespace",
               "filter":  "lowercase"
             }
          },
          "filter": {
            "edge_ngram_filter": {
              "type": "edge_ngram",
              "min_gram": 1,
              "max_gram": 20
            }
          }
        }
      },
      "mappings":{
        "world":{
          "properties":{
            "city": {
              "type": "string",
              "analyzer":"indexing_analyzer",
              "search_analyzer": "search_analyze"
            },
            "state": {
              "type": "string",
              "analyzer":"indexing_analyzer",
              "search_analyzer": "search_analyze"
            },
            "country": {
              "type": "string",
              "analyzer":"indexing_analyzer",
              "search_analyzer": "search_analyze"
            }
          }
        }
      }}



  }


  app.use(express.static(path.join(__dirname, 'public')));

  app.get("/create",function(request, reponse){
    client.indices.create(payload, function(error, response){
      get_sql_data();
    });
  });

  app.get("/",function (req, res) {
    res.sendFile(path.join(__dirname+ '/public/auto_complete.html'));
  });

  app.get("/search", function(req, resp){
    console.log(req.query.search);
    client.search({
      index: indexname,
      body: {
        query: {
          multi_match: {
            query: req.query.search,
            fields: ["city", "state", "country"]
          }
        }
      }
    }, function (error, response) {
      resp.json({result: response});
    });
  });

  app.listen("8080");




//functions

  function get_sql_data() {
    connection.connect();
    connection.query('select cities.id as id, cities.name as city_name, \
      states.name as state_name, countries.name as country_name \
      from cities \
      inner join states \
      on states.id = cities.state_id \
      inner join countries \
      on countries.id = states.country_id;', function (error, results, fields) {
    if (error) throw error;
    var data_array = [];
    for(var i = 0; i < results.length; i++){
      data_array.push(
        { index:  { _index: indexname, _type: 'world', _id: results[i].id } },
        { city: results[i].city_name, state: results[i].state_name, country: results[i].country_name }
      )
    }
    client.bulk({
      body: data_array
    },function(error, response){
      console.log(error);
      console.log(response);
    });
    });

  connection.end();
}
