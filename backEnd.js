//initialization
var express=require('express');
var bodyParser=require('body-parser');
var mongodb=require('mongodb');
MongoClient=mongodb.MongoClient;
var assert=require('assert');
var util=require('util');

var app=express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var db;

MongoClient.connect("mongodb://localhost:27017/database", function(err, database)
{
	db=database;
	db.collection("database", {}, function(err, coll)
	{
		if(err!=null)
		{
			db.createCollection("database", function(err, result)
			{
				assert.equal(null, err);
			});
		}
		db.ensureIndex("database", {document:"text"}, function(err, indexName){
			assert.equal(null, err);
		});
		app.listen(3000);
	});
});

app.get('/add', function(req, res)
{
	res.sendfile("index.html");
});

app.post("/add", function(req, res) {  
  db.collection('database').insert({document: req.body.query, created: new Date()}, function(err, result) {
    if (err == null) {
      res.sendfile("index.html");
    } else {
      res.send("Error:" + err);
    }
  });
});

app.get('/search', function(req, res)
{
	res.sendfile("search.html");
});

app.post("/search", function(req, res) {  
  // db.collection('database').find({"$text": {"$search": req.body.query}},{document: 1, created: 1,  _id: 1,  database: { $meta: "database" }},
  // 	{sort: { database: {$meta: "database"}} }).toArray(function(err, items) {res.send(pagelist(items)); }) });

db.collection('database').find({"$text": {"$search": req.body.query}},{document: 1, created: 1,  _id: 1, textScore: { $meta: "textScore" }},
  	{sort: { score: {$meta: "textScore"}} }).toArray(function(err, items) {
  		if(err) console.log("Error");
  		else
  		res.send(pagelist(items)); }) });




function pagelist(items) {  
  result = "<html><body><ul>";
  items.forEach( function(item) {
    itemstring = "<li>" + item._id + "<ul><li>" + item.textScore +
      "</li><li>" + item.created + "</li><li>" + item.document +
      "</li></ul></li>";
    result = result + itemstring;
  });
  result = result + "</ul></body></html>";
  return result;
}


//app.post-->search

//database data

