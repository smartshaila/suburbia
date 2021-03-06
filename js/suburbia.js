var Suburbia = {};

Suburbia.startingBoard = function() {
  // Returns tiles in the follow format, with 0,0 being in the center inlet
  
  /*
  
  +------------------+
  | \  /  \  /  \  / |
  |  --    --    --  | 
  | /  \  /  \  /  \ |
  +-    --    --    -+
  
  */
  
  var tiles = [];
  
  tiles.push({x:-3, y:0,  content:Suburbia.tokens.SE_Starter});
  tiles.push({x:-3, y:1,  content:Suburbia.tokens.E_Starter});
  tiles.push({x:-2, y:0,  content:Suburbia.tokens.Starter});
  tiles.push({x:-1, y:-1, content:Suburbia.tokens.S_Starter});
  tiles.push({x:-1, y:0,  content:Suburbia.tokens.Starter});
  tiles.push({x:0,  y:-1, content:Suburbia.tokens.Starter});
  tiles.push({x:1,  y:-2, content:Suburbia.tokens.S_Starter});
  tiles.push({x:1,  y:-1, content:Suburbia.tokens.Starter});
  tiles.push({x:2,  y:-2, content:Suburbia.tokens.Starter});
  tiles.push({x:3,  y:-3, content:Suburbia.tokens.SW_Starter});
  tiles.push({x:3,  y:-2, content:Suburbia.tokens.W_Starter});
  tiles.push({x:0,  y:0,  content:Suburbia.tokens.suburbs});
  tiles.push({x:0,  y:1,  content:Suburbia.tokens.community_park});
  tiles.push({x:0,  y:2,  content:Suburbia.tokens.heavy_factory});
  return tiles;
}

Suburbia.startingPlayers = function () {
  var players = [];
  
  players.push(new Player('player1', '#AABBCC'));
  players.forEach(function(p) {
    Suburbia.startingBoard().forEach(function(t) {
	  var res = p.place(t);
	});
  });
  return players;
}

Suburbia.player = function () {
  return Suburbia.players[Suburbia.current_player];
}

function Player (id, color) {
  this.id = id;
  this.color = color;
  this.income = 0;
  this.reputation = 0;
  this.money = 10;
  this.population = 0;
  this.board = new Board();
  this.hexGrid = new HexGrid('borough');
  this.updateStats();
}

Player.prototype.updateStats = function () {
  $('.' + this.id + ' .player_population').text(this.population);
  $('.' + this.id + ' .player_reputation').text(this.reputation);
  $('.' + this.id + ' .player_money').text(this.money);
  $('.' + this.id + ' .player_income').text(this.income);
  $('.' + this.id + ' .player_icon').css('background-color', this.color);
}

Player.prototype.place = function (tile) {
  var res = this.board.place(tile);
  console.log(res);
  var self = this;
  Object.keys(res).forEach(function(k) {
    self[k] += res[k];
  });
  this.updateStats();
}

function Board (player) {
  this.placedTiles = [];
}

Board.prototype.place = function (tile) {
  var placedTile = new PlacedTile(tile, this);
  this.placedTiles.push(placedTile);
  var results = _.flatten(_.union(placedTile.getEffects(0),
    placedTile.getEffects(1), 
    _.map(this.placedTiles, function(t) {return t.getEffects(1, placedTile);})
  )).reduce(function(res, e) {
    Object.keys(e).forEach(function(k) {
	  res[k] = (res[k] == null) ? e[k] : res[k] + e[k];
	});
	return res;
  }, {});
  return results;
}

Board.prototype.getHex = function (x, y) {
  var result = this.placedTiles.filter(function(t) {return t.x == x && t.y == y});
  return result.length > 0 ? result[0] : null;
}

Board.prototype.neighborCoordinates = function (x, y) {
  return [{x: x-1, y: y}, {x: x, y: y-1}, {x: x+1, y: y-1}, {x: x-1, y: y+1}, {x: x, y: y+1}, {x: x+1, y: y}];
}

Board.prototype.neighbors = function (x, y) {
  var self = this;
  return _.compact(this.neighborCoordinates(x, y).map(function(c) {return self.getHex(c.x, c.y)}));
}

Board.prototype.draw = function () {
  this.placedTiles.forEach(function(t){t.tile.draw('board', t);});
}

function Tile (name, type, cost, level, icon, effects, image) {
  this.name = name;
  this.type = type;
  this.cost = cost;
  this.level = level;
  this.icon = icon;
  this.effects = effects;
  this.image = image;
}

Tile.prototype.draw = function (draw_type, location) {
  if (draw_type == "real_estate") {
    var divName = '#tile' + location;
    $(divName).removeClass();
    $(divName).addClass(this.type).addClass(this.icon);
    $(divName + ' .tile_title').text(this.name);
    $(divName + ' .tile_cost').text('$' + this.cost);
  } else if (draw_type == "tooltip") {
    var container = $('<div>').addClass('tile_hover').css('background-image', 'url("' + this.image + '")');
	container.append($('<div>').addClass('notch'));
	var reTile = $('#tile' + location);
	$('#real_estate').append(container);
	container.css('top', reTile.offset().top + (reTile.outerHeight() / 2) - (container.outerHeight() / 2));
  } else if (draw_type == "board") {
	var hex = Suburbia.hexGrid.getHex(location.x, location.y) || new HexGrid.Hex(location.x, location.y, Suburbia.hexGrid);
    if (this.image.indexOf('.png') == -1) {
	  var fillPath = [];
	  switch(this.image) {
	    case 'SE_Starter': fillPath = [{x:'center', y:2}, {x:2, y:2}, {x:3, y:3}, {x:'center', y:3}]; break;
		case 'SW_Starter': fillPath = [{x:5, y:5}, {x:'center', y:5}, {x:'center', y:4}, {x:4, y:4}]; break;
		case 'NE_Starter': fillPath = [{x:'center', y:2}, {x:2, y:2}, {x:1, y:1}, {x:'center', y:1}]; break;
		case 'NW_Starter': fillPath = [{x:5, y:5}, {x:'center', y:5}, {x:'center', y:0}, {x:0, y:0}]; break;
		case 'S_Starter': fillPath = [{x:5, y:5}, {x:2, y:2}, {x:3, y:3}, {x:4, y:4}]; break;
		case 'N_Starter': fillPath = [{x:5, y:5}, {x:2, y:2}, {x:1, y:1}, {x:0, y:0}]; break;
		case 'W_Starter': fillPath = [{x:'center', y:0}, {x:'center', y:4}, {x:4, y:4}, {x:5, y:5}, {x:0, y:0}]; break;
		case 'E_Starter': fillPath = [{x:'center', y:0}, {x:'center', y:3}, {x:3, y:3}, {x:2, y:2}, {x:1, y:1}]; break;
		case 'Starter': fillPath = [{x:0, y:0}, {x:1, y:1}, {x:2, y:2}, {x:3, y:3}, {x:4, y:4}, {x:5, y:5}]; break;
	  }
	  if (fillPath.length > 0) {
	    hex.setCustomShape({fill: Suburbia.player().color, path: fillPath, relativePath: true});
	  }
	} else if (this.imageObj) {
	  hex.setImage(this.imageObj);
	}
	Suburbia.hexGrid.draw();
  }
}

Tile.prototype.matches = function (matching) {
  var self = this;
  return _.any(matching, function(m) {
    var key = Object.keys(m)[0];
    var val = m[key];
    return self[key] == val;
  });
}

function PlacedTile (properties, board) {
  this.x = properties.x;
  this.y = properties.y;
  this.tile = properties.content;
  this.board = board;
}

PlacedTile.prototype.getEffects = function (timing, newTile) {
  var self = this;
  var effects = this.tile.effects.filter(function(e) {return e.timing == timing});
  var results = effects.map(function(e) {
    var r = {};
    if (e.range == 0) {
	  r[e.category] = e.amount;
	} else {
	  r[e.category] = e.amount * e.findMatches(self.board, self.x, self.y, newTile);
	}
	return r;
  });
  return results;
}

function Effect (timing, category, matching, range, amount) {
  // 0: Immediate
  // 1: Secondary
  this.timing = timing;
  
  // 0: Population
  // 1: Money
  // 2: Reputation
  // 3: Income
  this.category = Effect.CATEGORIES[category];
  
  // Array of K/V pairs, such as [{type:'residential', type:'industrial'}] or [{icon:'airport'}]
  this.matching = matching;
  
  // 0: Exactly
  // 1: Bordering
  // 2: All in Borough
  // 3: All in Other Boroughs
  // 4: All Owned
  // 5: All built after (Restaurant/Skyscraper/Car Dealership)
  // 6: Weird modifier (Waterfront Realty)
  // 7: After red line crossed
  this.range = range;
  
  this.amount = amount;
}

Effect.CATEGORIES = ['population', 'money', 'reputation', 'income'];

Effect.prototype.findMatches = function(board, x, y, placedTile) {
  var count = 0;
  var self = this;
  if (placedTile) {
    switch(this.range) {
	  case 1: 
	    count += board.neighborCoordinates(x, y).filter(function(c){return c.x == placedTile.x && c.y == placedTile.y && placedTile.tile.matches(self.matching)}).length;
		break;
	  case 2:
	  case 4:
	  case 5:
	    count += ((placedTile.x != x || placedTile.y != y) && placedTile.tile.matches(self.matching)) ? 1 : 0;
		break;
	}
  } else {
    switch (this.range) {
      //case 0: break;
	  case 1:
	    count += board.neighbors(x, y).filter(function(t) {return t.tile.matches(self.matching);}).length;
		break;
      case 2:
      case 4:
	    count += board.placedTiles.filter(function(t) {return t.tile.matches(self.matching);}).length;
		break;
      //case 3: break;
	  //case 5: break;
    }
  }
  return count;
}

Suburbia.tokens = {
  SE_Starter: new Tile('Starter', 'placeholder', 0, 0, null, [], 'SE_Starter'),
  SW_Starter: new Tile('Starter', 'placeholder', 0, 0, null, [], 'SW_Starter'),
  NE_Starter: new Tile('Starter', 'placeholder', 0, 0, null, [], 'NE_Starter'),
  NW_Starter: new Tile('Starter', 'placeholder', 0, 0, null, [], 'NW_Starter'),
  S_Starter: new Tile('Starter', 'placeholder', 0, 0, null, [], 'S_Starter'),
  N_Starter: new Tile('Starter', 'placeholder', 0, 0, null, [], 'N_Starter'),
  E_Starter: new Tile('Starter', 'placeholder', 0, 0, null, [], 'E_Starter'),
  W_Starter: new Tile('Starter', 'placeholder', 0, 0, null, [], 'W_Starter'),
  Starter: new Tile('Starter', 'placeholder', 0, 0, null, [], 'Starter'),
  
  suburbs: new Tile('Suburbs', 'residential', 3, 0, null, [new Effect(0,0,[],0,2)]),
  community_park: new Tile('Community Park', 'government', 4, 0, null, [
    new Effect(0,3,[],0,-1),
    new Effect(1,2,[{type:'commercial'},{type:'residential'},{type:'industrial'}],1,1)
  ]),
  heavy_factory: new Tile('Heavy Factory', 'industrial', 3, 0, null, [
    new Effect(0,3,[],0,1),
    new Effect(1,2,[{type:'government'},{type:'residential'}],1,-1)
  ]),
  lake: new Tile('Lake', 'lake', 0, 0, null, [
    new Effect(1,1,[{type:'industrial'},{type:'government'},{type:'residential'},{type:'commercial'}],1,2)
  ]),
  
  business_supply: new Tile('Business Supply Store', 'commercial', 8, 1, null, [
    new Effect(0,3,[],0,1),
    new Effect(1,3,[{icon:'office'}],4,1)
  ]),
  convenience_store: new Tile('Convenience Store', 'commercial', 6, 1, null, [new Effect(0,3,[],0,1)]),
  fancy_restaurant: new Tile('Fancy Restaurant', 'commercial', 9, 1, 'restaurant', [
    new Effect(0,3,[],0,3),
    new Effect(1,3,[{icon:'restaurant'}],5,-1)
  ]),
  farm: new Tile('Farm', 'industrial', 9, 1, null, [
    new Effect(0,2,[],0,-1),
    new Effect(1,3,[{icon:'restaurant'}],4,1)
  ]),
  fast_food: new Tile('Fast Food Restaurant', 'commercial', 7, 1, 'restaurant', [
    new Effect(0,3,[],0,1),
    new Effect(1,0,[{type:'residential'}],1,3)
  ]),
  freeway: new Tile('Freeway', 'industrial', 5, 1, null, [
    new Effect(1,2,[{type:'residential'}],1,-1),
    new Effect(1,3,[{type:'commercial'}],1,1)
  ]),
  landfill: new Tile('Landfill', 'industrial', 4, 1, null, [
    new Effect(0,3,[],0,2),
    new Effect(1,2,[{type:'industrial'},{type:'government'},{type:'residential'},{type:'commercial'}],1,-1)
  ]),
  hoa: new Tile("Homeowner's Association", 'residential', 6, 1, null, [
    new Effect(0,0,[],0,1),
    new Effect(1,1,[{type:'residential'}],4,2)
  ]),
  mint: new Tile('Mint', 'government', 15, 1, null, [
    new Effect(0,3,[],0,3),
    new Effect(1,1,[{type:'government'}],2,2)
  ]),
  mobile_home: new Tile('Mobile Home Community', 'residential', 4, 1, null, [new Effect(0,0,[],0,6)]),
  municipal_airport: new Tile('Municipal Airport', 'industrial', 6, 1, 'airport', [
    new Effect(1,3,[{icon:'airport'}],4,1),
    new Effect(1,2,[{type:'residential'}],1,-1)
  ]),
  office_building: new Tile('Office Building', 'commercial', 9, 1, 'office', [
    new Effect(0,3,[],0,1),
    new Effect(1,3,[{type:'commercial'}],1,1)
  ]),
  parking_lot: new Tile('Parking Lot', 'commercial', 12, 1, null, [
    new Effect(0,3,[],0,1),
    new Effect(1,3,[{type:'commercial'},{type:'government'}],1,1)
  ]),
  slaughterhouse: new Tile('Slaughterhouse', 'industrial', 5, 1, null, [
    new Effect(0,2,[],0,-2),
    new Effect(1,3,[{icon:'restaurant'}],4,1)
  ]),
  waterfront: new Tile('Waterfront Realty', 'commercial', 6, 1, null, [new Effect(1,1,[{name:'Lake'}],6,2)]),
  
  domestic_airport: new Tile('Domestic Airport', 'industrial', 11, 2, 'airport', [
    new Effect(0,3,[],0,1),
    new Effect(1,2,[{icon:'airport'}],4,1),
    new Effect(1,2,[{type:'residential'}],1,-1)
  ]),
  movie_theater: new Tile('Movie Theater', 'commercial', 10, 2, null, [
    new Effect(0,3,[],0,1),
    new Effect(1,3,[{type:'residential'}],1,1)
  ]),
  gas_station: new Tile('Gas Station', 'commercial', 7, 2, null, [
    new Effect(0,3,[],0,1),
    new Effect(1,0,[{type:'residential'}],1,1)
  ]),
  skyscraper: new Tile('Skyscraper', 'commercial', 11, 2, 'skyscraper', [
    new Effect(0,3,[],0,3),
    new Effect(1,3,[{icon:'skyscraper'}],5,-1)
  ]),
  casino: new Tile('Casino', 'commercial', 22, 2, null, [
    new Effect(0,2,[],0,-3),
    new Effect(1,3,[],7,1)
  ]),
  shipping_center: new Tile('Shipping Center', 'commercial', 16, 2, null, [
    new Effect(0,3,[],0,1),
    new Effect(1,1,[{type:'commercial'}],4,2)
  ]),
  bureaucracy: new Tile('Office of Bureaucracy', 'government', 9, 2, 'office', [
    new Effect(0,2,[],0,-2),
    new Effect(1,3,[{type:'government'}],2,1)
  ]),
  museum: new Tile('Museum','government', 8, 2, null, [
    new Effect(0,2,[],0,1),
    new Effect(1,2,[{type:'government'}],1,1)
  ]),
  elementary_school: new Tile('Elementary School', 'government', 5, 2, 'school', [
    new Effect(0,2,[],0,1),
    new Effect(1,0,[{type:'residential'}],2,1)
  ]),
  postal_service: new Tile('Postal Service', 'government', 12, 2, null, [
    new Effect(1,3,[{type:'commercial'}],2,1)
  ]),
  power_station: new Tile('Power Station', 'government', 11, 2, null, [
    new Effect(1,3,[{type:'industrial'}],2,1)
  ]),
  housing_projects: new Tile('Housing Projects', 'residential', 8, 2, null, [
    new Effect(0,0,[],0,10),
    new Effect(1,2,[{type:'government'},{type:'residential'},{type:'commercial'}],1,-2)
  ]),
  retirement_village: new Tile('Retirement Village', 'residential', 8, 2, null, [
    new Effect(0,0,[],0,5)
  ]),
  hostel: new Tile('Hostel', 'residential', 0, 2, null, [
    new Effect(0,0,[],0,2),
    new Effect(1,2,[{type:'commercial'}],1,-1)
  ]),
  burg_alspach: new Tile('Burg Von Alspach', 'residential', 12, 2, null, [
    new Effect(0,0,[],0,3),
    new Effect(1,2,[{type:'residential'}],1,1)
  ]),
  stadium: new Tile('Stadium', 'government', 16, 2, null, [
    new Effect(0,3,[],0,1),
    new Effect(1,2,[{type:'residential'}],1,2)
  ]),
  warehouse: new Tile('Warehouse', 'industrial', 13, 2, null, [
    new Effect(0,2,[],0,-1),
    new Effect(1,3,[{type:'commercial'}],1,2)
  ]),
   
  //End of B Tiles
  
  //Start of Expansion Tiles
  cemetery: new Tile('Cemetery', 'government', 4, 1, null, [
    new Effect(0,0,[],0,-2),
    new Effect(1,3,[{type:'residential'}],1,1)
  ]),
  county_assessor: new Tile('County Assessor', 'government', 11, 1, null, [
    new Effect(0,2,[],0,1),
    new Effect(1,1,[{type:'industrial'},{type:'government'},{type:'residential'},{type:'commercial'}],2,2)
  ]),
  investment_property: new Tile('Investment Property', 'residential', 8, 1, null, [
    new Effect(0,0,[],0,1),
    new Effect(1,3,[{type:'residential'}],1,1)
  ]),
  light_rail: new Tile('Light Rail', 'industrial', 12, 2, null, [
    new Effect(1,2,[{type:'commercial'},{type:'residential'}],1,1),
    new Effect(1,3,[{type:'commercial'},{type:'residential'}],1,1)
  ]),
  new_construction: new Tile('New Construction', 'residential', 4, 2, null, [
    new Effect(1,0,[{type:'industrial'},{type:'residential'},{type:'government'},{type:'commercial'}],1,2)
  ]),
  water_purification: new Tile('Water Purification Plant', 'industrial', 7, 2, null, [
    new Effect(0,2,[],0,7),
    new Effect(1,1,[{type:'industrial'}],4,-2)
  ]),
  indoor_mall: new Tile('Indoor Mall', 'commercial', 22, 3, null, [
    new Effect(0,3,[],0,2),
    new Effect(1,2,[{type:'commercial'}],2,1)
  ]),
  
  apartments: new Tile('Apartments', 'residential', 12, 3, null, [
    new Effect(0,0,[],0,5),
    new Effect(1,0,[{type:'commercial'}],1,2)
  ]),
  bnb: new Tile('Bed & Breakfast', 'residential', 9, 3, null, [
    new Effect(0,0,[],0,2),
    new Effect(1,0,[{type:'residential'}],2,1)
  ]),
  boutique: new Tile('Boutique', 'commercial', 9, 3, null, [
    new Effect(0,3,[],0,1),
    new Effect(1,2,[{type:'residential'}],1,1)
  ]),
  chip_fab: new Tile('Chip Fabrication Plant', 'industrial', 18, 3, null, [
    new Effect(0,2,[],0,2),
    new Effect(1,3,[{type:'commercial'}],2,1)
  ]),
  condo: new Tile('Condominium', 'residential', 14, 3, null, [
    new Effect(0,0,[],0,5),
    new Effect(1,0,[{type:'commercial'}],1,3)
  ]),
  high_school: new Tile('High School', 'government', 18, 3, 'school', [
    new Effect(0,2,[],0,1),
    new Effect(1,0,[{type:'residential'}],2,3)
  ]),
  hotel: new Tile('Hotel', 'commercial', 13, 3, null, [
    new Effect(0,3,[],0,1),
    new Effect(1,0,[{type:'residential'}],3,1)
  ]),
  int_airport: new Tile('International Airport', 'industrial', 18, 3, 'airport', [
    new Effect(1,3,[{icon:'airport'}],4,1),
    new Effect(1,2,[{icon:'airport'}],4,1),
    new Effect(1,2,[{type:'residential'}],1,1)
  ]),
  epa: new Tile('Local EPA Office', 'government', 12, 3, 'office', [
    new Effect(0,2,[],0,1),
    new Effect(1,1,[{type:'industrial'}],4,2)
  ]),
  middle_school: new Tile('Middle School', 'government', 10, 3, 'school', [
    new Effect(0,2,[],0,1),
    new Effect(1,0,[{type:'residential'}],2,2)
  ]),
  car_dealer: new Tile('New Car Dealership', 'commercial', 12, 3, 'car', [
    new Effect(0,3,[],0,5),
    new Effect(1,3,[{icon:'car'}],5,-2)
  ]),
  pr_firm: new Tile('PR Firm', 'commercial', 20, 3, null, [
    new Effect(0,3,[],0,-2),
    new Effect(1,2,[],7,1)
  ]),
  recycling_plant: new Tile('Recycling Plant', 'industrial', 17, 3, null, [
    new Effect(0,2,[],0,1),
    new Effect(1,2,[{type:'industrial'}],1,2)
  ]),
  resort: new Tile('Resort', 'commercial', 16, 3, null, [
    new Effect(0,3,[],0,1),
    new Effect(1,0,[{type:'residential'}],4,1)
  ]),
  university: new Tile('University', 'government', 15, 3, null, [
    new Effect(0,3,[],0,2),
    new Effect(1,2,[{icon:'school'}],4,1)
  ])
};

Object.keys(Suburbia.tokens).forEach(function (t) {
  if (t.indexOf("Starter") > -1) {
    Suburbia.tokens[t].image = t;
  } else {
    var img = new Image();
	img.src = 'images/' + t + '.png';
    Suburbia.tokens[t].image = img.src;
	Suburbia.tokens[t].imageObj = img;
  }
});

var tileSets = {
  base: [
    ['business_supply' , 2],
    ['convenience_store' , 2],
    ['fancy_restaurant' , 3],
    ['farm' , 2], 
    ['fast_food' , 2], 
    ['freeway' , 2], 
    ['landfill' , 2], 
    ['hoa' , 2], 
    ['mint' , 2], 
    ['mobile_home' , 2], 
    ['municipal_airport' , 2], 
    ['office_building' , 3], 
    ['parking_lot' , 2], 
    ['slaughterhouse' , 2], 
    ['waterfront' , 2], 
    ['burg_alspach', 2],
    ['domestic_airport' , 2], 
    ['elementary_school', 3],
    ['gas_station', 2],
    ['hostel', 2],
    ['housing_projects', 2],
    ['movie_theater', 2],
    ['casino', 2],
    ['museum', 2],
    ['bureaucracy', 2],
    ['postal_service', 2],
    ['power_station', 2],
    ['retirement_village', 2],
    ['skyscraper', 2], 
    ['shipping_center', 2], 
    ['stadium', 2], 
    ['warehouse', 2],
    ['apartments', 2],
    ['bnb', 2], 
    ['boutique', 2], 
    ['chip_fab', 2], 
    ['condo', 2], 
    ['high_school', 3],
    ['hotel', 2], 
    ['int_airport', 2],
    ['epa', 2], 
    ['middle_school', 3],
    ['car_dealer', 2],
    ['pr_firm', 2], 
    ['recycling_plant', 2],
    ['resort', 2], 
    ['university', 2]
  ]
};

function randomize_tiles() {
  [1,2,3,4,5,6,7].map(function(id) {
    divName = '#tile' + id;
    tile = {};
    do {
      tile = Suburbia.tokens[Object.keys(Suburbia.tokens)[Math.floor(Math.random() * (Object.keys(Suburbia.tokens).length))]];
    } while (typeof(tile.type) ==  'undefined' || tile.type == 'placeholder')
    $(divName).removeClass();
    $(divName).addClass(tile.type).addClass(tile.icon);
    $(divName + ' .tile_title').text(tile.name);
    $(divName + ' .tile_cost').text('$' + tile.cost);
    return tile;
  });
}

function selectTiles(tile_set, counts) {
  choices = [1,2,3].map(function(level) {return $.map(tile_set.filter(function(t){
    return Suburbia.tokens[t[0]].level == level;
  }).map(function(t) {
    return Array.apply(null, new Array(t[1])).map(String.prototype.valueOf, t[0]);
  }), function(i){return i;})});
  return choices.map(function(level_array, index) {
    var chosen = [];
    for (var i=0; i<counts[index]; i++) {
      chosen.push(level_array.splice(Math.floor(Math.random() * level_array.length), 1)[0]);
    }
    return chosen;
  });
};

Suburbia.fillStacks = function () {
  Suburbia.set = Suburbia.set || 'base';
  Suburbia.a_start |= 18;
  Suburbia.b_start |= 15;
  Suburbia.c_start |= 22;
  Suburbia.stacks = {};
  var stackList = selectTiles(tileSets[Suburbia.set], [Suburbia.a_start, Suburbia.b_start, Suburbia.c_start]);
  Suburbia.stacks.a = stackList[0];
  Suburbia.stacks.b = stackList[1];
  Suburbia.stacks.c = stackList[2];
  Suburbia.real_estate = [];
  Suburbia.updateRealEstate();
}

Suburbia.updateRealEstate = function () {
  while (Suburbia.real_estate.length < 7) {
    Suburbia.real_estate.push(Suburbia.nextTile());
  }
  Suburbia.real_estate.forEach(function (tile, i) {
    Suburbia.tokens[tile].draw('real_estate', i);
  });
  Object.keys(Suburbia.stacks).forEach(function(stack){
    $('#' + stack + '_supply').text(Suburbia.stacks[stack].length);
  });
}

Suburbia.updateHexGrid = function () {
  Suburbia.player().board.draw();
  Suburbia.hexGrid.reCenter();
}

Suburbia.nextTile = function () {
  if (Suburbia.stacks.a.length) {
    return Suburbia.stacks.a.pop();
  } else if (Suburbia.stacks.b.length) {
    return Suburbia.stacks.b.pop();
  } else if (Suburbia.stacks.c.length) {
    return Suburbia.stacks.c.pop();
  } else {
    return 'No More Tiles';
  }
}

$().ready(function(){
  Suburbia.fillStacks();
  Suburbia.players = Suburbia.startingPlayers();
  Suburbia.current_player = 0;
  $('#real_estate li').on('click', function() {
    if (Suburbia.selectedId != null) {
	  $('#tile' + Suburbia.selectedId).removeClass('selected');
	}
    Suburbia.selectedId = Number(this.id.substr(4,1));
	$(this).addClass('selected');
  });
  $('#real_estate li').hover(function() {
    var id = Number(this.id.substr(4,1));
	Suburbia.tokens[Suburbia.real_estate[id]].draw('tooltip', id);
  }, function() {
	$('.tile_hover').remove();
  });
  Suburbia.hexGrid = new HexGrid('borough');
  Suburbia.hexGrid.resize();
  $(window).resize(Suburbia.hexGrid.resize);
  $(window).mousewheel(Suburbia.hexGrid.zoom);
  Suburbia.updateHexGrid();
});
