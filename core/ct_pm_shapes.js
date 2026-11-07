/**
 * @fileoverview PenguinMod's block shapes, ported as behaviour.
 */
'use strict';

goog.provide('Blockly.CtPm.Shapes');

goog.require('Blockly.Block');
goog.require('Blockly.BlockSvg.render');
goog.require('Blockly.Connection');
goog.require('Blockly.RenderedConnection');
goog.require('Blockly.constants');

/**
 * Output shape.
 * @const {number}
 */
Blockly.OUTPUT_SHAPE_LEAF = 4;

/**
 * Output shape.
 * @const {number}
 */
Blockly.OUTPUT_SHAPE_OCTAGONAL = 6;

/**
 * Output shape.
 * @const {number}
 */
Blockly.OUTPUT_SHAPE_ARRAY = 13;

/**
 * Value type -> shape.
 * @const {!Object<string, number>}
 */
Blockly.CtPm.Shapes.TYPE_SHAPES = {
  'Array': Blockly.OUTPUT_SHAPE_ARRAY,
  'Vector': Blockly.OUTPUT_SHAPE_LEAF,
  'Target': Blockly.OUTPUT_SHAPE_OCTAGONAL
};

/**
 * Edge and empty-slot drawing for the shapes vanilla doesn't have.
 * @const {!Object<number, !Object>}
 */
Blockly.CtPm.Shapes.SHAPES = {};

Blockly.CtPm.Shapes.SHAPES[Blockly.OUTPUT_SHAPE_LEAF] = {
  argType: 'leaf',
  emptyInputWidth: 12 * Blockly.BlockSvg.GRID_UNIT,
  emptyInputPath: (function(u) {
    return 'M ' + 6 * u + ' 0 l ' + 2 * u + ' 0 ' +
        'a ' + 4 * u + ' ' + 4 * u + ' 0 0 1 ' + 4 * u + ' ' + 4 * u + ' ' +
        'l 0 ' + 2.4 * u + ' ' +
        'a ' + 1.6 * u + ' ' + 1.6 * u + ' 0 0 1 ' + -1.6 * u + ' ' + 1.6 * u + ' ' +
        'h ' + -4 * u + ' l ' + -2.4 * u + ' 0 ' +
        'a ' + 4 * u + ' ' + 4 * u + ' 0 0 1 ' + -4 * u + ' ' + -4 * u + ' ' +
        'l 0 ' + -2.4 * u + ' ' +
        'a ' + 1.6 * u + ' ' + 1.6 * u + ' 0 0 1 ' + 1.6 * u + ' ' + -1.6 * u + ' z';
  })(Blockly.BlockSvg.GRID_UNIT),
  left: function(w) {
    return 'a ' + w + ' ' + w + ' 0 0 1 ' + -w + ' ' + -w + ' ' +
        'l 0 ' + -w * 0.6 + ' ' +
        'a ' + w * 0.4 + ' ' + w * 0.4 + ' 0 0 1 ' + w * 0.4 + ' ' + -w * 0.4;
  },
  right: function(w) {
    return 'a ' + w + ' ' + w + ' 0 0 1 ' + w + ' ' + w + ' ' +
        'l 0 ' + w * 0.6 + ' ' +
        'a ' + w * 0.4 + ' ' + w * 0.4 + ' 0 0 1 ' + -w * 0.4 + ' ' + w * 0.4;
  }
};

Blockly.CtPm.Shapes.SHAPES[Blockly.OUTPUT_SHAPE_OCTAGONAL] = {
  argType: 'octagonal',
  emptyInputWidth: 12 * Blockly.BlockSvg.GRID_UNIT,
  emptyInputPath: 'M 8 0 h 32 l 8 8 l 0 16 l -8 8 h -32 l -8 -8 l 0 -16 l 8 -8 z',
  left: function(w) {
    return 'l ' + -w / 2 + ' 0 l ' + -w / 2 + ' ' + -w / 2 + ' l 0 ' + -w + ' ' +
        'l ' + w / 2 + ' ' + -w / 2 + ' l ' + w / 2 + ' 0';
  },
  right: function(w) {
    return 'l ' + w / 2 + ' 0 l ' + w / 2 + ' ' + w / 2 + ' l 0 ' + w + ' ' +
        'l ' + -w / 2 + ' ' + w / 2 + ' l ' + -w / 2 + ' 0';
  }
};

/**
 * Output shape.
 * @const {number}
 */
Blockly.OUTPUT_SHAPE_CURLY = 12;

/**
 * Brace edges.
 * @param {number} w Edge width
 * @param {number} dir dir
 * @return {string} SVG path
 * @private
 */
Blockly.CtPm.Shapes.braceEdge_ = function(w, dir) {
  var r = function(n) { return Math.round(n * 100) / 100; };
  var seg = function(dx1, dy1, dx2, dy2, dx, dy) {
    return 'c ' + r(dir * dx1 * w) + ',' + r(dir * dy1 * w) + ' ' + r(dir * dx2 * w) + ',' +
        r(dir * dy2 * w) + ' ' + r(dir * dx * w) + ',' + r(dir * dy * w);
  };
  return [
    seg(0.45, 0, 0.5, 0.25, 0.5, 0.55), 'l 0,' + r(dir * 0.15 * w),
    seg(0, 0.2, 0.25, 0.3, 0.5, 0.3),
    seg(-0.25, 0, -0.5, 0.1, -0.5, 0.3), 'l 0,' + r(dir * 0.15 * w),
    seg(0, 0.3, -0.05, 0.55, -0.5, 0.55)
  ].join(' ');
};

/**
 * Corner radius as a share of the end width.
 */
Blockly.CtPm.Shapes.SOFT_CORNER = 2 / 3;

/**
 * One soft end.
 * @param {number} w w
 * @param {number} dir dir
 * @return {string} SVG path
 * @private
 */
Blockly.CtPm.Shapes.softEnd_ = function(w, dir) {
  var r = Math.round(Blockly.CtPm.Shapes.SOFT_CORNER * w * 100) / 100;
  var flat = Math.round((w - r) * 100) / 100;
  var side = Math.round((2 * w - 2 * r) * 100) / 100;
  var arc = function(dx, dy) {
    return 'a ' + r + ' ' + r + ' 0 0 1 ' + dx + ' ' + dy;
  };
  return 'h ' + dir * flat + ' ' + arc(dir * r, dir * r) + ' v ' + dir * side + ' ' +
      arc(-dir * r, dir * r) + ' h ' + -dir * flat;
};

Blockly.CtPm.Shapes.SHAPES[Blockly.OUTPUT_SHAPE_CURLY] = {
  argType: 'curly',
  emptyInputWidth: 12 * Blockly.BlockSvg.GRID_UNIT,
  emptyInputPath: (function() {
    var h = Blockly.BlockSvg.INPUT_SHAPE_HEIGHT / 2;
    var width = 12 * Blockly.BlockSvg.GRID_UNIT;
    return 'M ' + h + ' 0 H ' + (width - h) + ' ' + Blockly.CtPm.Shapes.softEnd_(h, 1) + ' H ' + h + ' ' +
        Blockly.CtPm.Shapes.softEnd_(h, -1) + ' z';
  })(),
  left: function(w) {
    return Blockly.CtPm.Shapes.softEnd_(w, -1);
  },
  right: function(w) {
    return Blockly.CtPm.Shapes.softEnd_(w, 1);
  }
};

/**
 * One bracket end of an array.
 * @param {number} w w
 * @param {number} dir dir
 * @return {string} SVG path
 * @private
 */
Blockly.CtPm.Shapes.bracketEnd_ = function(w, dir) {
  var r = 0.55 * w;
  var d = 0.3 * w;
  var run = 2 * w - 2 * r;
  var n = function(x) {
    return Math.round(x * 100) / 100;
  };
  var arc = function(dx, dy) {
    return 'a ' + n(r) + ' ' + n(r) + ' 0 0 1 ' + n(dx) + ' ' + n(dy);
  };
  return [
    'h', n(dir * (w - r)), arc(dir * r, dir * r),
    'q', n(-dir * 2 * d), n(dir * run / 2), '0', n(dir * run),
    arc(-dir * r, dir * r), 'h', n(-dir * (w - r))
  ].join(' ');
};

Blockly.CtPm.Shapes.SHAPES[Blockly.OUTPUT_SHAPE_ARRAY] = {
  argType: 'square',
  emptyInputWidth: 12 * Blockly.BlockSvg.GRID_UNIT,
  emptyInputPath: (function() {
    var h = Blockly.BlockSvg.INPUT_SHAPE_HEIGHT / 2;
    var width = 12 * Blockly.BlockSvg.GRID_UNIT;
    return 'M ' + h + ' 0 H ' + (width - h) + ' ' + Blockly.CtPm.Shapes.bracketEnd_(h, 1) + ' H ' + h + ' ' +
        Blockly.CtPm.Shapes.bracketEnd_(h, -1) + ' z';
  })(),
  left: function(w) {
    return Blockly.CtPm.Shapes.bracketEnd_(w, -1);
  },
  right: function(w) {
    return Blockly.CtPm.Shapes.bracketEnd_(w, 1);
  }
};

(function() {
  var u = Blockly.BlockSvg.GRID_UNIT;
  var table = Blockly.BlockSvg.SHAPE_IN_SHAPE_PADDING;
  var add = {
    1: {4: 5 * u, 6: 5 * u},
    2: {4: 3 * u, 6: 1 * u},
    3: {4: 2 * u, 6: 1 * u},
    4: {0: 3 * u, 1: 3 * u, 2: 2 * u, 3: 2 * u, 4: 1 * u, 6: 2 * u},
    6: {0: 3 * u, 1: 2 * u, 2: 1 * u, 3: 5 * u, 4: 5 * u, 6: 1 * u}
  };
  for (var outer in add) {
    table[outer] = table[outer] || {};
    for (var inner in add[outer]) {
      if (!(inner in table[outer])) table[outer][inner] = add[outer][inner];
    }
  }
  var arr = Blockly.OUTPUT_SHAPE_ARRAY;
  var sq = Blockly.OUTPUT_SHAPE_SQUARE;
  table[arr] = table[arr] || {};
  for (var k in table[sq]) {
    if (!(k in table[arr])) table[arr][k] = table[sq][k] + 2 * u;
  }
  for (var o2 in table) {
    if (!(arr in table[o2]) && sq in table[o2]) table[o2][arr] = table[o2][sq];
  }
  var curly = Blockly.OUTPUT_SHAPE_CURLY;
  var round = Blockly.OUTPUT_SHAPE_ROUND;
  table[curly] = table[curly] || {};
  for (var key in table[round]) {
    if (!(key in table[curly])) table[curly][key] = table[round][key];
  }
  for (var o in table) {
    if (!(curly in table[o]) && round in table[o]) table[o][curly] = table[o][round];
  }
})();

/**
 * Statement check -> notch, drawn in place of the standard one.
 * @const {!Object<string, {left: string, right: string}>}
 */
Blockly.CtPm.Shapes.NOTCHES = {
  'switchCase': {
    left: 'c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 c 2,0 4,-4 6,-4 c 2,0 4,4 6,4 ' +
        'c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2',
    right: 'c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 c -2,0 -4,-4 -6,-4 c -2,0 -4,4 -6,4 ' +
        'c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2'
  }
};

/**
 * @param {Blockly.Connection} connection connection
 * @param {string} side side
 * @return {?string} The notch path for this connection's check, or null for the standard notch
 */
Blockly.CtPm.Shapes.notch = function(connection, side) {
  var check = connection && connection.check_;
  if (!check) return null;
  for (var i = 0; i < check.length; i++) {
    var notch = Blockly.CtPm.Shapes.NOTCHES[check[i]];
    if (notch) return notch[side];
  }
  return null;
};

/**
 * @param {Array<string>} check A connection's check list
 * @param {Blockly.Workspace=} opt_workspace opt_workspace
 * @return {?number} The shape of its value type, or null for the standard shape.
 */
Blockly.CtPm.Shapes.typeShape = function(check, opt_workspace) {
  if (!check) return null;
  if (check.indexOf(Blockly.CtPm.LOCAL_REF_CHECK) !== -1) return Blockly.OUTPUT_SHAPE_CURLY;
  var shape = null;
  for (var i = 0; i < check.length; i++) {
    var c = check[i];
    if (typeof c !== 'string' || c.indexOf(Blockly.CtPm.TYPE_PREFIX) !== 0) continue;
    if (shape !== null) return null;
    var type = c.slice(Blockly.CtPm.TYPE_PREFIX.length);
    shape = type === 'Array' && Blockly.CtPm.isSnap(opt_workspace) ? Blockly.OUTPUT_SHAPE_ROUND :
        (Blockly.CtPm.Shapes.TYPE_SHAPES[type] || null);
    if (shape === null) return null;
  }
  return shape;
};

/**
 * Blocks whose labels say "array".
 */
Blockly.CtPm.Shapes.ARRAY_WORD_BLOCKS_ = /^(jwArray_|data_arraylist$)/;

/**
 * With Snap related behavior an array is a list, so the blocks that say "array" say "list".
 * @param {!Blockly.BlockSvg} block A block about to render
 */
Blockly.CtPm.Shapes.syncArrayWords = function(block) {
  if (!Blockly.CtPm.Shapes.ARRAY_WORD_BLOCKS_.test(block.type)) return;
  var snap = Blockly.CtPm.isSnap(block.workspace);
  if ((block.ctPmListWords_ || false) === snap) return;
  block.ctPmListWords_ = snap;
  for (var i = 0; i < block.inputList.length; i++) {
    var fields = block.inputList[i].fieldRow;
    for (var j = 0; j < fields.length; j++) {
      var field = fields[j];
      if (!(field instanceof Blockly.FieldLabel)) continue;
      if (field.ctPmArrayText_ === undefined) field.ctPmArrayText_ = field.getText();
      var text = snap ? field.ctPmArrayText_.replace(/\barray\b/g, 'list').replace(/\bArray\b/g, 'List')
          .replace(/\barrays\b/g, 'lists') : field.ctPmArrayText_;
      if (text === field.text_) continue;
      field.text_ = text;
      field.size_.width = 0;
    }
  }
};

/**
 * Does this block take the shape of the typed slot it's in? Shadows, untyped reporters, and the.
 * @param {!Blockly.Block} block A block with an output
 * @return {boolean} True if it adopts the slot's shape
 * @private
 */
Blockly.CtPm.Shapes.adoptsSlotShape_ = function(block) {
  for (var i = 0; i < block.inputList.length; i++) {
    if (block.inputList[i].type === Blockly.NEXT_STATEMENT) return false;
  }
  if (block.isShadow()) return true;
  var check = block.outputConnection.check_;
  return !check || Blockly.CtPm.UNTYPED_OUTPUTS[block.type] === true;
};

/**
 * The shape a block with an output is drawn in, if this file decides it.
 * @param {!Blockly.Block} block A block
 * @return {?number} Square for a reporter with a stack input, else its type's shape
 */
Blockly.CtPm.Shapes.blockShape = function(block) {
  var output = block.outputConnection;
  if (!output) return null;
  for (var i = 0; i < block.inputList.length; i++) {
    if (block.inputList[i].type === Blockly.NEXT_STATEMENT) return Blockly.OUTPUT_SHAPE_SQUARE;
  }
  var own = Blockly.CtPm.Shapes.typeShape(output.check_, block.workspace);
  if (own !== null) return own;
  var slot = output.targetConnection;
  if (!slot || slot.type !== Blockly.INPUT_VALUE) return null;
  var slotShape = Blockly.CtPm.Shapes.typeShape(slot.check_, block.workspace);
  if (slotShape === null || !Blockly.CtPm.Shapes.adoptsSlotShape_(block)) return null;
  return slotShape;
};

/**
 * @param {number} shape An output shape
 * @return {?{path: string, argType: string, width: number}} How How
 */
Blockly.CtPm.Shapes.inputShapeInfo = function(shape) {
  var s = Blockly.CtPm.Shapes.SHAPES[shape];
  return s ? {path: s.emptyInputPath, argType: s.argType, width: s.emptyInputWidth} : null;
};

/**
 * @param {number} shape An output shape
 * @return {number} Width of an empty slot of this shape, 0 if vanilla handles it
 */
Blockly.CtPm.Shapes.emptyInputWidth = function(shape) {
  var s = Blockly.CtPm.Shapes.SHAPES[shape];
  return s ? s.emptyInputWidth : 0;
};

/**
 * @param {number} shape An output shape
 * @return {boolean} True if this file draws its edges
 */
Blockly.CtPm.Shapes.hasEdge = function(shape) {
  return !!Blockly.CtPm.Shapes.SHAPES[shape];
};

/**
 * @param {number} shape shape
 * @param {string} side side
 * @param {number} width The block's edgeShapeWidth_
 * @return {string} SVG path of that edge
 */
Blockly.CtPm.Shapes.edgePath = function(shape, side, width) {
  return Blockly.CtPm.Shapes.SHAPES[shape][side](width);
};

/**
 * A reporter's tall content.
 * @param {!Blockly.BlockSvg} block The block being rendered
 * @param {number} shape Its output shape
 * @param {number} width width
 * @return {number} The end width to draw
 */
Blockly.CtPm.Shapes.edgeWidth = function(block, shape, width) {
  block.ctPmCap_ = null;
  if (shape !== Blockly.OUTPUT_SHAPE_ROUND && shape !== Blockly.OUTPUT_SHAPE_HEXAGONAL) return width;
  var cap = Blockly.CtPm.Shapes.capOf_(block);
  if (cap === null || cap >= width) return width;
  block.ctPmCap_ = {top: 2 * cap, run: 2 * (width - cap)};
  return cap;
};

/**
 * The end width a block gets around a tall child.
 * @param {!Blockly.Block} block A block with an output
 * @return {?number} The capped end width, or null if no child is tall (vanilla ends)
 * @private
 */
Blockly.CtPm.Shapes.capOf_ = function(block) {
  var tall = false;
  var cap = Blockly.BlockSvg.MIN_BLOCK_Y_REPORTER / 2;
  for (var i = 0; i < block.inputList.length; i++) {
    var input = block.inputList[i];
    if (input.type !== Blockly.INPUT_VALUE || !input.connection) continue;
    var child = input.connection.targetBlock();
    if (!child || !child.rendered) continue;
    var h;
    if (child.ctPmNub_) {
      tall = true;
      h = child.ctPmNub_.h;
    } else if (child.ctPmCap_) {
      tall = true;
      h = child.ctPmCap_.top;
    } else {
      h = child.height || 0;
    }
    cap = Math.max(cap, h / 2 + Blockly.BlockSvg.GRID_UNIT);
  }
  return tall ? cap : null;
};

/**
 * A square-ended block.
 * @param {!Blockly.BlockSvg} block block
 * @param {!Array} row row
 * @param {number} shape The block's output shape
 */
Blockly.CtPm.Shapes.padSquareInRound = function(block, row, shape) {
  if (shape !== Blockly.OUTPUT_SHAPE_ROUND || block.ctPmCap_) return;
  var r = row.height / 2;
  var clear = function(input) {
    var child = input && !input.fieldRow.length && input.connection && input.connection.targetBlock();
    if (!child || child.isShadow() || !child.rendered) return 0;
    var childShape = child.getOutputShape();
    if (childShape !== Blockly.OUTPUT_SHAPE_SQUARE && childShape !== Blockly.OUTPUT_SHAPE_ARRAY) return 0;
    var d = Math.min(r, (child.height || 0) / 2);
    return r - Math.sqrt(Math.max(0, r * r - d * d)) + Blockly.BlockSvg.GRID_UNIT / 2;
  };
  row.paddingStart = Math.max(row.paddingStart, clear(row[0]));
  var last = row[row.length - 1];
  if (last && last.connection) row.paddingEnd = Math.max(row.paddingEnd, clear(last));
};

/**
 * Keep a capped block's contents out of its ends.
 * @param {!Blockly.BlockSvg} block block
 * @param {!Array} row row
 * @param {number} shape The block's output shape
 */
Blockly.CtPm.Shapes.padCapped = function(block, row, shape) {
  if (shape !== Blockly.OUTPUT_SHAPE_ROUND && shape !== Blockly.OUTPUT_SHAPE_HEXAGONAL) return;
  var cap = Blockly.CtPm.Shapes.capOf_(block);
  if (cap === null || cap >= row.height / 2) return;
  var clear = cap + Blockly.BlockSvg.GRID_UNIT;
  var first = row[0];
  var firstChild = first && !first.fieldRow.length && first.connection && first.connection.targetBlock();
  if (firstChild && Blockly.CtPm.Shapes.tallChild(first)) {
    var nub = firstChild.ctPmNub_ ? firstChild.ctPmNub_.w : 0;
    row.paddingStart = Math.max(row.paddingStart, clear - nub);
  }
  var last = row[row.length - 1];
  if (last && last.connection && Blockly.CtPm.Shapes.tallChild(last)) {
    row.paddingEnd = Math.max(row.paddingEnd, clear);
  }
};

/**
 * The child in a value input, if it is tall.
 * @param {!Blockly.Input} input input
 * @return {?{left: number, right: number, h: number}} The The
 */
Blockly.CtPm.Shapes.tallChild = function(input) {
  var child = input.connection && input.type === Blockly.INPUT_VALUE && input.connection.targetBlock();
  if (!child || !child.rendered) return null;
  if (child.ctPmNub_) {
    return {left: child.ctPmNub_.shape, right: Blockly.OUTPUT_SHAPE_SQUARE, h: child.ctPmNub_.h};
  }
  if (child.ctPmCap_) {
    return {left: child.edgeShape_, right: child.edgeShape_, h: child.ctPmCap_.top};
  }
  return null;
};

/**
 * Where a row's labels and slots line up, when it holds a C-shaped reporter.
 * @param {!Array<!Blockly.Input>} row An inline row
 * @return {?number} Offset from the row's top, or null for vanilla (the middle)
 */
Blockly.CtPm.Shapes.rowLine = function(row) {
  return row.ctPmLine === null || row.ctPmLine === undefined ? null : row.ctPmLine;
};

/**
 * Lay out the line of each inline row holding a C-shaped reporter.
 * @param {!Array} rows rows
 * @private
 */
Blockly.CtPm.Shapes.layoutRowLines_ = function(rows) {
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    row.ctPmLine = null;
    if (row.type !== Blockly.BlockSvg.INLINE) continue;
    var tall = null;
    var others = [];
    for (var i = 0; i < row.length; i++) {
      var input = row[i];
      for (var f = 0; f < input.fieldRow.length; f++) {
        var size = input.fieldRow[f].getSize ? input.fieldRow[f].getSize() : null;
        if (size) others.push(size.height);
      }
      if (input.type !== Blockly.INPUT_VALUE || !input.connection) continue;
      var child = input.connection.targetBlock();
      if (child && child.rendered && !tall && child.ctPmLine_ !== null && child.ctPmLine_ !== undefined) {
        tall = child;
      } else {
        others.push(child && child.rendered ? child.height : Blockly.BlockSvg.INPUT_SHAPE_HEIGHT);
      }
    }
    if (!tall) continue;
    var pad = Math.max(0, (row.height - tall.height) / 2);
    var line = tall.ctPmLine_ + pad;
    for (var j = 0; j < others.length; j++) line = Math.max(line, others[j] / 2 + pad);
    var bottom = line - tall.ctPmLine_ + tall.height;
    for (var k = 0; k < others.length; k++) bottom = Math.max(bottom, line + others[k] / 2);
    bottom += pad;
    if (bottom > row.height) {
      if (typeof rows.bottomEdge === 'number') rows.bottomEdge += bottom - row.height;
      row.height = bottom;
    }
    row.ctPmLine = line;
  }
};

/**
 * @param {number} shape OUTPUT_SHAPE_ROUND or OUTPUT_SHAPE_HEXAGONAL
 * @param {string} side side
 * @param {number} w w
 * @param {number} run The straight part between the ends
 * @return {string} SVG path of that side
 */
Blockly.CtPm.Shapes.cappedEdgePath = function(shape, side, w, run) {
  var d = side === 'right' ? 1 : -1;
  if (shape === Blockly.OUTPUT_SHAPE_HEXAGONAL) {
    return 'l ' + (d * w) + ' ' + (d * w) + ' v ' + (d * run) + ' l ' + (-d * w) + ' ' + (d * w);
  }
  var arc = function(dx, dy) {
    return 'a ' + w + ' ' + w + ' 0 0 1 ' + dx + ' ' + dy;
  };
  return arc(d * w, d * w) + ' v ' + (d * run) + ' ' + arc(-d * w, d * w);
};

(function() {
  var original = Blockly.Block.prototype.getOutputShape;
  Blockly.Block.prototype.getOutputShape = function() {
    var shape = Blockly.CtPm.Shapes.blockShape(this);
    return shape === null ? original.call(this) : shape;
  };
})();

(function() {
  var original = Blockly.Connection.prototype.getOutputShape;
  Blockly.Connection.prototype.getOutputShape = function() {
    var shape = Blockly.CtPm.Shapes.typeShape(this.check_, this.sourceBlock_ && this.sourceBlock_.workspace);
    return shape === null ? original.call(this) : shape;
  };
})();

(function() {
  var original = Blockly.RenderedConnection.prototype.connect_;
  Blockly.RenderedConnection.prototype.connect_ = function(childConnection) {
    original.call(this, childConnection);
    if (this.type !== Blockly.INPUT_VALUE) return;
    var child = childConnection.getSourceBlock();
    if (!child.rendered || !this.getSourceBlock().rendered) return;
    if (Blockly.CtPm.Shapes.typeShape(this.check_, this.sourceBlock_ && this.sourceBlock_.workspace) === null) return;
    if (!Blockly.CtPm.Shapes.adoptsSlotShape_(child)) return;
    child.render();
  };
})();

/**
 * The left end drawn on the top row of a reporter wrapping a stack.
 * @param {!Blockly.Block} block A block
 * @return {?number} OUTPUT_SHAPE_ROUND or OUTPUT_SHAPE_HEXAGONAL, or null for no nub
 * @private
 */
Blockly.CtPm.Shapes.nubShape_ = function(block) {
  if (!block.outputConnection || block.RTL) return null;
  var hasStack = false;
  for (var i = 0; i < block.inputList.length; i++) {
    if (block.inputList[i].type === Blockly.NEXT_STATEMENT) hasStack = true;
  }
  if (!hasStack || Blockly.CtPm.Shapes.typeShape(block.outputConnection.check_, block.workspace) !== null) return null;
  return block.outputShape_ === Blockly.OUTPUT_SHAPE_HEXAGONAL ?
      Blockly.OUTPUT_SHAPE_HEXAGONAL : Blockly.OUTPUT_SHAPE_ROUND;
};

/**
 * The nub's outline, drawn upwards from the top row's bottom-left to the block's top-left.
 * @param {!{shape: number, w: number, h: number}} nub The block's nub
 * @return {string} SVG path
 */
Blockly.CtPm.Shapes.nubPath = function(nub) {
  var w = nub.w;
  if (nub.shape === Blockly.OUTPUT_SHAPE_HEXAGONAL) {
    return 'V ' + nub.h + ' l ' + -w + ' ' + -w + ' l ' + w + ' ' + -w;
  }
  return 'V ' + nub.h + ' a ' + w + ' ' + w + ' 0 0 1 0 ' + -nub.h;
};

(function() {
  var original = Blockly.BlockSvg.prototype.renderCompute_;
  Blockly.BlockSvg.prototype.renderCompute_ = function(iconWidth) {
    var rows = original.call(this, iconWidth);
    this.ctPmNub_ = null;
    this.ctPmLine_ = null;
    Blockly.CtPm.Shapes.layoutRowLines_(rows);
    var shape = Blockly.CtPm.Shapes.nubShape_(this);
    if (shape === null || !rows.length) return rows;
    var w = rows[0].height / 2;
    for (var i = 0; i < rows.length; i++) rows[i].paddingStart = (rows[i].paddingStart || 0) + w;
    rows.statementEdge += w;
    rows.rightEdge += w;
    this.ctPmNub_ = {shape: shape, w: w, h: rows[0].height};
    this.ctPmLine_ = rows[0].height / 2;
    return rows;
  };
})();
