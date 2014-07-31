/* Coordinates for flat-topped hexes:
          _____
	_____/ 0, 0\_____
   /-1, 1\_____/ 1, 1\
   \_____/ 0, 1\_____/
	     \_____/

*/

function HexGrid (container) {
  this.stage = new Kinetic.Stage({
    container: container,
	draggable: true,
	width: $(window).width() - ($('#tile_supply').outerWidth() + $('#player_info').outerWidth()) - 2, 
	height: $(window).height() - ($('#header').outerHeight() + $('#game_log').outerHeight()) - 2
  });
  this.layer = new Kinetic.Layer();
  this.stage.add(this.layer);
  this.radius = 50;
  this.strokeColor = 'darkblue';
  this.fillColor = null;
  this.hexes = [];
}

Math.SQRT3 = Math.sqrt(3);

HexGrid.prototype.getHex = function (x, y) {
  var results = this.hexes.filter(function(h) {return h.x == x && h.y == y});
  if (results.length) {
    return results[0];
  } else {
    return null;
  }
}

HexGrid.prototype.add = function (hex) {
  this.hexes.push(hex);
  this.layer.add(hex.group);
  this.draw();
}

HexGrid.prototype.draw = function () {
  this.stage.draw();
}

HexGrid.prototype.resize = function () {
  var width = $(window).width() - ($('#tile_supply').outerWidth() + $('#player_info').outerWidth()) - 2;
  var height = $(window).height() - ($('#header').outerHeight() + $('#game_log').outerHeight()) - 2;
  Suburbia.hexGrid.stage.size({width: width, height: height});
  // var bounds = boardBoundaries();
  Suburbia.hexGrid.draw();
}

HexGrid.prototype.zoom = function (e) {
  var zoomAmount = 0.1 * e.deltaY;
  var xScale = Suburbia.hexGrid.layer.scale().x + zoomAmount;
  var yScale = Suburbia.hexGrid.layer.scale().y + zoomAmount;
  console.log(zoomAmount);
  Suburbia.hexGrid.layer.scale({x: xScale, y: yScale});
  Suburbia.hexGrid.draw();
}

HexGrid.prototype.reCenter = function () {
  var x = this.hexes.map(function(h){return h.pixelCenter.x});
  var y = this.hexes.map(function(h){return h.pixelCenter.y});
  var width = this.radius * 2 + (Math.max.apply(null, x) - Math.min.apply(null, x));
  var height = this.radius * Math.SQRT3 + (Math.max.apply(null, y) - Math.min.apply(null, y));
  this.stage.x((this.stage.width() / 2) + ((Math.min.apply(null, x) - this.radius) + (width / 2)));
  this.stage.y((this.stage.height() / 2) - ((Math.min.apply(null, y) - this.radius * (Math.SQRT3 / 2)) + (height / 2)));
}

HexGrid.Hex = function (x, y, grid) {
  this.x = x;
  this.y = y;
  this.parent = grid;
  this.pixelCenter = {
    y: this.parent.radius * Math.SQRT3 * (this.y + this.x / 2),
	x: this.parent.radius * 1.5 * this.x,
  }
  this.group = new Kinetic.Group();
  this.drawShape = new Kinetic.RegularPolygon({
    x: this.pixelCenter.x,
	y: this.pixelCenter.y,
	radius: this.parent.radius,
	sides: 6,
	rotationDeg: 90,
	stroke: 'grey',
	strokeWidth: 2
  });
  this.drawLabel = new Kinetic.Text({
    x: this.pixelCenter.x,
	y: this.pixelCenter.y,
	text: '(' + this.x + ', ' + this.y + ')',
	fill: 'grey',
	fontSize: 10,
	align: 'center'
  });
  this.group.add(this.drawShape);
  this.group.add(this.drawLabel);
  var self = this;
  this.group.on('mouseover', function () {
    self.drawShape.stroke('black');
	self.drawShape.strokeWidth(4);
	self.group.moveToTop();
	if (self.customShape) {
	  self.customShape.fill('red');
	}
	self.parent.layer.draw();
  });
  this.group.on('mouseout', function () {
    self.drawShape.stroke('gray');
	self.drawShape.strokeWidth(2);
	if (self.customShape) {
	  self.customShape.fill('blue');
	}
	self.parent.layer.draw();
  });
  this.parent.add(this);
}

HexGrid.Hex.prototype.getPoints = function () {
  var center_x = 0;
  var center_y = 0;
  var radius = this.parent.radius
  var angle_base = 2 * Math.PI / 6;
  return [4,5,0,1,2,3].map(function(i) {
    var angle = angle_base * i;
    return {
	  x: center_x + radius * Math.cos(angle),
      y: center_y + radius * Math.sin(angle)
	}
  });
}

HexGrid.Hex.prototype.relativePath = function (points) {
  var self = this;
  if (!points) {
    return null;
  } else {
    var hexPoints = this.getPoints();
    return points.map(function(p) {
      var result = {x: null, y: null};
	  result.x = p.x == 'center' ? 0 : hexPoints[p.x].x;
	  result.y = p.y == 'center' ? 0 : hexPoints[p.y].y;
	  return result;
	});
  }
}

HexGrid.Hex.prototype.setCustomShape = function (options) {
  var path = options.relativePath ? (this.relativePath(options.path)) : (options.path || []);
  options.x = this.pixelCenter.x;
  options.y = this.pixelCenter.y;
  options.drawFunc = function(context) {
	  context.beginPath();
	  context.moveTo(path[0].x, path[0].y)
	  path.forEach(function(p){
	    context.lineTo(p.x, p.y);
	  });
	  context.closePath();
	  context.fillStrokeShape(this);
	}
  this.drawShape.visible(false);
  this.drawLabel.visible(false);
  this.customShape = new Kinetic.Shape(options);
  this.group.add(this.customShape);
}

HexGrid.Hex.prototype.setImage = function(imagePath) {
  var imageObj = new Image();
  var self = this;
  imageObj.onload = function() {
    self.drawShape.fillPatternImage(imageObj);
	self.drawShape.fillPatternOffset({x: -imageObj.width / 2, y: -imageObj.height / 2});
	self.drawShape.fillPatternRotation(-90);
	self.drawShape.fillPatternScale({x: (self.parent.radius * 2) / imageObj.width, y: (Math.SQRT3 * self.parent.radius) / imageObj.height});
	self.drawLabel.visible(false);
	Suburbia.hexGrid.draw();
  }
  imageObj.src = imagePath;
  this.neighborCoordinates().forEach(function(location) {
    Suburbia.hexGrid.getHex(location.x, location.y) || new HexGrid.Hex(location.x, location.y, Suburbia.hexGrid);
  });
}

HexGrid.Hex.prototype.neighborCoordinates = function () {
  return [
    {x: this.x + 1, y: this.y - 1},
	{x: this.x + 1, y: this.y},
	{x: this.x, y: this.y + 1},
	{x: this.x - 1, y: this.y + 1},
	{x: this.x - 1, y: this.y},
	{x: this.x, y: this.y - 1}
  ];
}

HexGrid.Hex.prototype.distance = function(otherHex) {
	var deltaX = this.x - otherHex.x;
	var deltaY = this.y - otherHex.y;
	return ((Math.abs(deltaX) + Math.abs(deltaY) + Math.abs(deltaX + deltaY)) / 2);
};