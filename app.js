//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://Eoiny:Gunpowder@cluster0.zfwhrji.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser:true});

const itemSchema = {
  name:String
};

const Item = mongoose.model("items", itemSchema)

const item1 = new Item({
  name:"Welcome to your todo list"
})

const item2 = new Item({
  name:"Cook food"
})

const item3 = new Item({
  name:"Buy food"
})

const defaultItems= [item1, item2, item3]

const listSchema = {
  name: String,
  items:[itemSchema]}

  const List = mongoose.model("List", listSchema)

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

Item.find({},function(err,results) {
  console.log(results)
  if(results.length === 0) {
    Item.insertMany(defaultItems, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("succesfully saved data")
      }
    });
    res.redirect("/");
  } else {
    console.log("hi")
    res.render("list", {listTitle: "Today", newListItems: results});
  }

});

// const day = date.getDate();

});

app.get("/:customListName", function (req, res) {

  const customListName = _.capitalize(req.params.customListName)

  List.findOne({name:customListName}, function(err, foundList) {
    if(!err) {
      if(!foundList) {
        const list = new List({
        name:customListName,
        items: defaultItems
      });
      list.save()
      res.redirect("/" + customListName)
    } else{
      res.render("list", {listTitle: foundList.name, newListItems:foundList.items})
    }
  }
  })
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name:itemName});

  if (req.body.list === "Today") {
    item.save()
    res.redirect("/");
  } else {
    List.findOne({name:listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }
});

app.post("/delete", function(req,res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName
  if (listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err) {
    if(!err) {
      console.log("remove Item succesfully");
      res.redirect("/");
    }
  });
} else {
  List.findOneAndUpdate({name: listName}, {$pull:{items: {_id:checkItemId}}}, function(err, foundList) {
    if (!err) {
      res.redirect("/" + listName);
    }
  });
}
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
