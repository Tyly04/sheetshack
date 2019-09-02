var ranges = ["A", "B", "C", "D", "E","F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
function install(){
  var initTiles = {width: 10, height: 10};
  for(var i = 0; i < initTiles.height + 1; i++){
    var jTile = [];
    for(var j = 0; j< initTiles.width; j++){
      jTile.push(Math.floor(Math.random() * 2));
    }
    initTiles[i] = jTile;
  }
  var player = {
    x: 0,
    y: 0,
    cX: 0,
    cY: 0,
    inventory: [{
      name: "Item",
      description: "An item"
    }]
  };
  PropertiesService.getScriptProperties().setProperty("player", JSON.stringify(player));
  PropertiesService.getScriptProperties().setProperty("tiles", JSON.stringify(initTiles));
  var sheet = SpreadsheetApp.getActive();
  for(var i = 1; i < ranges.length; i++){
    sheet.setColumnWidth(i, 20) 
  }
  Logger.log("A" + (initTiles.height + 1) + ":" + "Z" + (initTiles.height + 1));
  sheet.getRange("A" + (initTiles.height + 1) + ":" + "Z" + (initTiles.height + 1)).merge();
  PropertiesService.getScriptProperties().setProperty("status", "A" + (initTiles.height + 1));
  PropertiesService.getScriptProperties().setProperty("statusQueue", ["Press w s a and d to move."].toString());
  PropertiesService.getScriptProperties().setProperty("inventory", "null");
  loop({tiles:initTiles, player: player, statusLoc: "A" + (initTiles.height + 1), statusQueue: "Press w s a and d to move.", inventory: "null"});
}
function onOpen(e) {
  SpreadsheetApp.getUi().createAddonMenu().addItem("Install", "install").addToUi();
  var tiles = PropertiesService.getScriptProperties().getProperty("tiles");
  if(tiles === null || tiles === undefined){
    tiles = {};
    set("tiles", JSON.stringify(tiles.toString));
  }
  var player = JSON.parse(PropertiesService.getScriptProperties().getProperty("player"));
  var statusLoc = PropertiesService.getScriptProperties().getProperty("status");
  var statusQueue = PropertiesService.getScriptProperties().getProperty("statusQueue");
  var inventory = PropertiesService.getScriptProperties().getProperty("inventory");
  loop({tiles:tiles, player: player, statusLoc: statusLoc, statusQueue: statusQueue, inventory: inventory});
}
function loop(args){
  var sheet = SpreadsheetApp.getActive();
  Logger.log(args.inventory);
  if(args.inventory === "null"){
    if(args.statusQueue !== null){
      args.statusQueue = args.statusQueue.split(",");
    }
    //Render the current player x and y
    for(var i = args.player.cY; i < args.tiles.height; i++){
      Logger.log(i);
      var row = args.tiles[(i).toString()];
      for(var j = 0; j < row.length; j++){
        var cell = sheet.getRange(ranges[i] + (j + 1));
        if(!(args.player.x === i && args.player.y === j)){
          var tile = row[j];
          cell.setValue(tile);
          cell.setFontColor("green");
        } else {
          cell.setValue("☺");
          cell.setFontColor("black");
        }
      }
    }  
    var status = sheet.getRange(args.statusLoc);
    Logger.log(args.statusLoc);
    if(args.statusQueue.length > 0){
      status.setValue(args.statusQueue[0]);
      args.statusQueue.splice(0, 1);
    }
  } else {
    var cells = sheet.getRange("A1:" + ranges[args.tiles.width - 1] + (args.tiles.height - 1));
    cells.setValue("");
    args.player.inventory.forEach(function(item, index){
      var cell = sheet.getRange("A" + (index + 1));
      cell.setValue((index + 1) + ") " + item.name + ":" + item.description);
    });
  }
}
function onEdit(e){
  var sheet = SpreadsheetApp.getActive();
  var range = null;
  if(e){
    range = e.range;
  } else {
    range = sheet.getActiveCell();
  }
  var cell = sheet.getRange(range.getA1Notation());
  var input = cell.getValue();
  cell.setValue("");
  getInput(input);
}
function getInput(i){
  Logger.log("Input: " + i); 
  tiles = JSON.parse(PropertiesService.getScriptProperties().getProperty("tiles"));
  var player = JSON.parse(PropertiesService.getScriptProperties().getProperty("player"));
  var tiles = JSON.parse(PropertiesService.getScriptProperties().getProperty("tiles"));
  var statusLoc = PropertiesService.getScriptProperties().getProperty("status");
  var statusQueue = PropertiesService.getScriptProperties().getProperty("statusQueue");
  var inventory = PropertiesService.getScriptProperties().getProperty("inventory");
  var inputs = i.split("");
  inputs.forEach(function(input, j){
    if(inventory === "null"){
      if(input === "w"){
        player.y -= 1;
        if(player.y < 0){
          player.y = 0;
        }
      }
      if(input === "s"){
        player.y += 1;
        if(player.y >= tiles.height){
          player.y = tiles.height - 1;
          if(player.cY + player.y <= Object.keys(tiles).length){
            player.y = tiles.height - 2;
            player.cY += 1;
          }
        }
      }
      if(input === "a"){
        player.x -= 1;
        if(player.x < 0){
          player.x = 0;
        }
      }
      if(input === "d"){
        player.x += 1;
        if(player.x >= tiles.width){
          player.x = tiles.height - 1;
        }
      }
      if(input === "i"){
        inventory = 1;
        PropertiesService.getScriptProperties().setProperty("inventory", inventory);
      }
    } else {
      if(input === "i"){
        inventory = "null";
        PropertiesService.getScriptProperties().setProperty("inventory", inventory);
      }
      if(!isNaN(parseInt(input))){
        var n = parseInt(input);
        //Select inventory item
        var inventoryItem = player[n];
      }
    }
    if(j !== inputs.length - 1){
      loop({tiles:tiles, player: player, statusLoc: statusLoc, statusQueue: statusQueue, inventory: inventory});
    }
  });
  PropertiesService.getScriptProperties().setProperty("player", JSON.stringify(player));
  PropertiesService.getScriptProperties().setProperty("tiles", JSON.stringify(tiles));
  loop({tiles:tiles, player: player, statusLoc: statusLoc, statusQueue: statusQueue, inventory: inventory});
}