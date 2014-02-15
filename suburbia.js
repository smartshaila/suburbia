var Suburbia = {};
var ctx = $('#playerSpace').getContext('2d');

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
  
  tiles.push({x:-3, y:0,  content:tokens.SE_Starter});
  tiles.push({x:-3, y:1,  content:tokens.E_Starter});
  tiles.push({x:-2, y:0,  content:tokens.Full_Starter});
  tiles.push({x:-1, y:-1, content:tokens.S_Starter});
  tiles.push({x:-1, y:0,  content:tokens.Full_Starter});
  tiles.push({x:0,  y:-1, content:tokens.Full_Starter});
  tiles.push({x:1,  y:-2, content:tokens.S_Starter});
  tiles.push({x:1,  y:-1, content:tokens.Full_Starter});
  tiles.push({x:2,  y:-2, content:tokens.Full_Starter});
  tiles.push({x:3,  y:-3, content:tokens.SW_Starter});
  tiles.push({x:3,  y:-2, content:tokens.W_Starter});
  tiles.push({x:0,  y:0,  content:tokens.Suburb});
  tiles.push({x:0,  y:1,  content:tokens.Community_Park});
  tiles.push({x:0,  y:2,  content:tokens.Heavy_Factory});
  return tiles;
}

function Tile (name, type, cost, level, icon, Effect) {
  this.name = name;
  this.type = type;
  this.cost = cost;
  this.level = level;
  this.icon = icon;
  this.Effect = Effect;
}

function Effect (timing, category, matching, range, amount) {
  // 0: Immediate
  // 1: Secondary
  this.timing = timing;
  
  // 0: Population
  // 1: Money
  // 2: Reputation
  // 3: Income
  this.category = category;
  
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

function drawBaseGrid() {
	
}

var tokens = {
  SE_Starter: new Tile('Starter', 'placeholder', 0, 0, null, []),
  SW_Starter: new Tile('Starter', 'placeholder', 0, 0, null, []),
  NE_Starter: new Tile('Starter', 'placeholder', 0, 0, null, []),
  NW_Starter: new Tile('Starter', 'placeholder', 0, 0, null, []),
  S_Starter: new Tile('Starter', 'placeholder', 0, 0, null, []),
  N_Starter: new Tile('Starter', 'placeholder', 0, 0, null, []),
  E_Starter: new Tile('Starter', 'placeholder', 0, 0, null, []),
  W_Starter: new Tile('Starter', 'placeholder', 0, 0, null, []),
  Starter: new Tile('Starter', 'placeholder', 0, 0, null, []),
  
  suburb: new Tile('Suburb', 'residential', 3, 0, null, [new Effect(0,0,[],0,2)]),
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
  casino: new Tile('Casino', 'commercial', 22, null, [
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
	new Effect(1,0,[{type:'residential'}],4)
  ]),
  university: new Tile('University', 'government', 15, 3, null, [
	new Effect(0,3,[],0,2),
	new Effect(1,2,[{icon:'school'}],4,1)
  ])
};