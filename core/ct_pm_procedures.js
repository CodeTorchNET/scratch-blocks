/**
 * @fileoverview Advanced blocks.
 */
'use strict';

goog.provide('Blockly.CtPm.Procedures');

goog.require('Blockly.BlockSvg.render');
goog.require('Blockly.Events');
goog.require('Blockly.FieldTextInputRemovable');
goog.require('Blockly.Gesture');
goog.require('goog.string');
goog.require('Blockly.WidgetDiv');
goog.require('Blockly.Workspace');
goog.require('Blockly.utils');

/**
 * Prefix of a C argument's id.
 */
Blockly.CtPm.Procedures.ID_PREFIX = 'SUBSTACK';

/**
 * Connection check on the prototype's C inputs.
 * @const {string}
 */
Blockly.CtPm.Procedures.PROTOTYPE_CHECK = 'ctPmArgumentCommand';

/**
 * Does this procedure block use C arguments at all?
 * @param {!Blockly.Block} block A procedures_call, _prototype or _declaration block
 * @return {boolean} True if any argument id is a C argument's
 */
Blockly.CtPm.Procedures.hasBranches = function(block) {
  var ids = block.argumentIds_ || [];
  for (var i = 0; i < ids.length; i++) {
    if (Blockly.CtPm.Procedures.isBranchId(ids[i])) return true;
  }
  return false;
};

/**
 * @param {string} id An argument id
 * @return {boolean} True if it is a C argument's id
 */
Blockly.CtPm.Procedures.isBranchId = function(id) {
  return typeof id === 'string' && id.indexOf(Blockly.CtPm.Procedures.ID_PREFIX) === 0;
};

/**
 * The regular expression procedures.js splits a proccode with.
 * @param {!Blockly.Block} block The procedure block
 * @return {!RegExp} Vanilla's, or one that also splits at %c
 */
Blockly.CtPm.Procedures.splitter = function(block) {
  return Blockly.CtPm.Procedures.hasBranches(block) ? /(?=[^\\]%[nbsc])/ : /(?=[^\\]%[nbs])/;
};

/**
 * Append the input for a C argument.
 * @param {!Blockly.Block} block The procedure block
 * @param {string} id id
 * @return {!Blockly.Input} The statement input
 */
Blockly.CtPm.Procedures.appendBranchInput = function(block, id) {
  var input = block.appendStatementInput(id);
  if (block.type === 'procedures_prototype') {
    input.setCheck(Blockly.CtPm.Procedures.PROTOTYPE_CHECK);
  }
  return input;
};

/**
 * Create a shadow block for a C argument.
 * @param {!Blockly.Block} owner The procedure block
 * @param {string} type type
 * @param {string} fieldName fieldName
 * @param {string} displayName The argument's name
 * @return {!Blockly.Block} The new shadow
 * @private
 */
Blockly.CtPm.Procedures.newShadow_ = function(owner, type, fieldName, displayName) {
  Blockly.Events.disable();
  try {
    var block = owner.workspace.newBlock(type);
    block.setShadow(true);
    block.setFieldValue(displayName, fieldName);
    if (!owner.isInsertionMarker()) {
      block.initSvg();
      block.render(false);
    }
  } finally {
    Blockly.Events.enable();
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockCreate(block));
  }
  return block;
};

/**
 * Take the block that was in this input before the mutation changed, if any.
 * @param {Object} connectionMap See procedures.js disconnectOldBlocks_
 * @param {string} id The argument id
 * @return {Blockly.Block} The old block, or null
 * @private
 */
Blockly.CtPm.Procedures.oldBlock_ = function(connectionMap, id) {
  if (connectionMap && (id in connectionMap) && connectionMap[id]) {
    return connectionMap[id]['block'] || null;
  }
  return null;
};

/**
 * procedures_call.
 * @this Blockly.Block
 * @param {number} index Argument index
 * @param {Object} connectionMap See procedures.js
 * @param {string} id The argument id
 * @param {!Blockly.Input} input The statement input
 */
Blockly.CtPm.Procedures.populateCaller = function(index, connectionMap, id, input) {
  var old = Blockly.CtPm.Procedures.oldBlock_(connectionMap, id);
  if (old && old.previousConnection) {
    connectionMap[input.name] = null;
    input.connection.connect(old.previousConnection);
  }
};

/**
 * procedures_prototype.
 * @this Blockly.Block
 * @param {number} index Argument index
 * @param {Object} connectionMap See procedures.js
 * @param {string} id The argument id
 * @param {!Blockly.Input} input The statement input
 */
Blockly.CtPm.Procedures.populatePrototype = function(index, connectionMap, id, input) {
  var displayName = this.displayNames_[index];
  var old = Blockly.CtPm.Procedures.oldBlock_(connectionMap, id);
  var reporter;
  if (old && old.type === 'argument_reporter_command') {
    reporter = old;
    reporter.setFieldValue(displayName, 'VALUE');
    connectionMap[input.name] = null;
  } else {
    reporter = Blockly.CtPm.Procedures.newShadow_(this, 'argument_reporter_command', 'VALUE', displayName);
  }
  input.connection.connect(reporter.previousConnection);
};

/**
 * procedures_declaration.
 * @this Blockly.Block
 * @param {number} index Argument index
 * @param {Object} connectionMap See procedures.js
 * @param {string} id The argument id
 * @param {!Blockly.Input} input The statement input
 */
Blockly.CtPm.Procedures.populateDeclaration = function(index, connectionMap, id, input) {
  var displayName = this.displayNames_[index];
  var old = Blockly.CtPm.Procedures.oldBlock_(connectionMap, id);
  var editor;
  if (old && old.type === 'argument_editor_command') {
    editor = old;
    editor.setFieldValue(displayName, 'TEXT');
    connectionMap[input.name] = null;
  } else {
    editor = Blockly.CtPm.Procedures.newShadow_(this, 'argument_editor_command', 'TEXT', displayName);
  }
  input.connection.connect(editor.previousConnection);
};

/**
 * procedures_declaration.
 * @this Blockly.Block
 */
Blockly.CtPm.Procedures.addBranchExternal = function() {
  Blockly.WidgetDiv.hide(true);
  this.procCode_ = this.procCode_ + ' %c';
  this.displayNames_.push(Blockly.Msg.CT_PM_PROCEDURES_BRANCH_DEFAULT || 'branch');
  this.argumentIds_.push(Blockly.CtPm.Procedures.ID_PREFIX + Blockly.utils.genUid());
  this.argumentDefaults_.push('');
  this.updateDisplay_();
  this.focusLastEditor_();
};

/**
 * PenguinMod's default custom-block colours.
 */
Blockly.CtPm.Procedures.DEFAULT_COLOUR = ['#ff6680', '#ff4d6a', '#ff3355'];

/**
 * Read a `color` mutation attribute.
 * @param {?string} text The attribute
 * @return {Array<string>} Three '#rrggbb' colours, or null if absent or not usable
 */
Blockly.CtPm.Procedures.parseColour = function(text) {
  if (!text) return null;
  var value;
  try {
    value = JSON.parse(text);
  } catch (e) {
    return null;
  }
  if (value && !Array.isArray(value) && typeof value === 'object') {
    value = [value.primary, value.secondary, value.tertiary];
  }
  if (!Array.isArray(value) || value.length < 1) return null;
  var out = [];
  for (var i = 0; i < Math.min(value.length, 3); i++) {
    var c = typeof value[i] === 'string' ? value[i].slice(0, 7).toLowerCase() : '';
    if (!/^#[0-9a-f]{6}$/.test(c)) return null;
    out.push(c);
  }
  while (out.length < 3) out.push(Blockly.CtPm.Procedures.darken_(out[0], out.length === 1 ? 0.1 : 0.2));
  return out;
};

/**
 * @param {string} colour colour
 * @param {number} amount amount
 * @return {string} The darker colour, '#rrggbb'
 * @private
 */
Blockly.CtPm.Procedures.darken_ = function(colour, amount) {
  var out = '#';
  for (var i = 1; i < 7; i += 2) {
    var v = Math.round(parseInt(colour.substr(i, 2), 16) * (1 - amount));
    out += (v < 16 ? '0' : '') + v.toString(16);
  }
  return out;
};

/**
 * domToMutation hook.
 * @param {!Blockly.Block} block A procedure block or argument reporter
 * @param {!Element} xmlElement Its mutation
 */
Blockly.CtPm.Procedures.colourFromDom = function(block, xmlElement) {
  var text = xmlElement.getAttribute('color');
  block.ctPmColourAttr_ = text || null;
  var colour = Blockly.CtPm.Procedures.parseColour(text);
  var isDefault = colour && colour.join() === Blockly.CtPm.Procedures.DEFAULT_COLOUR.join();
  block.ctPmColour_ = colour && !isDefault ? colour : null;
};

/**
 * mutationToDom hook.
 * @param {!Blockly.Block} block The block
 * @param {!Element} container Its mutation element being built
 */
Blockly.CtPm.Procedures.colourToDom = function(block, container) {
  if (block.ctPmColourAttr_) container.setAttribute('color', block.ctPmColourAttr_);
};

/**
 * After the block's inputs are rebuilt.
 * @param {!Blockly.Block} block A procedure block
 */
Blockly.CtPm.Procedures.applyColour = function(block) {
  var colour = block.ctPmColour_;
  if (!colour) {
    if (!block.ctPmColourShown_) return;
    colour = Blockly.CtPm.Procedures.themeColour_();
  }
  block.ctPmColourShown_ = !!block.ctPmColour_;
  block.setColour(colour[0], colour[1], colour[2]);
  if (block.type === 'procedures_prototype') {
    var parent = block.getParent();
    if (parent && parent.type === 'procedures_definition') parent.setColour(colour[0], colour[1], colour[2]);
    for (var i = 0; i < block.inputList.length; i++) {
      var input = block.inputList[i];
      var reporter = input.connection && input.connection.targetBlock();
      if (reporter && /^argument_reporter_/.test(reporter.type)) {
        reporter.ctPmColourAttr_ = block.ctPmColourAttr_;
        reporter.ctPmColour_ = block.ctPmColour_;
        reporter.setColour(colour[0], colour[1], colour[2]);
      }
    }
  }
};

/**
 * @return {!Array<string>} The editor theme's custom-block colours
 * @private
 */
Blockly.CtPm.Procedures.themeColour_ = function() {
  var more = Blockly.Colours.more;
  return [more.primary, more.secondary, more.tertiary];
};

/**
 * The `color` attribute for a colour picked in Make a Block.
 * @param {?string} primary primary
 * @return {?string} The attribute, or null
 */
Blockly.CtPm.Procedures.colourAttrFor = function(primary) {
  var colour = primary ? Blockly.CtPm.Procedures.parseColour(JSON.stringify([primary])) : null;
  if (!colour || colour[0] === Blockly.CtPm.Procedures.DEFAULT_COLOUR[0]) return null;
  return JSON.stringify(colour);
};

/**
 * Make a Block.
 * @param {?string} primary primary
 * @this Blockly.Block
 */
Blockly.CtPm.Procedures.setColourExternal = function(primary) {
  var attr = Blockly.CtPm.Procedures.colourAttrFor(primary);
  this.ctPmColourAttr_ = attr;
  this.ctPmColour_ = Blockly.CtPm.Procedures.parseColour(attr);
  Blockly.CtPm.Procedures.applyColour(this);
  var tertiary = this.getColourTertiary();
  for (var i = 0; i < this.inputList.length; i++) {
    var fields = this.inputList[i].fieldRow;
    for (var j = 0; j < fields.length; j++) {
      if (fields[j] instanceof Blockly.FieldTextInput && fields[j].box_) {
        fields[j].box_.setAttribute('fill', tertiary);
      }
    }
  }
  var children = this.getChildren(false);
  for (var k = 0; k < children.length; k++) {
    if (children[k].rendered) children[k].updateColour();
  }
  var owner = Blockly.WidgetDiv.isVisible() && Blockly.WidgetDiv.owner_;
  if (owner instanceof Blockly.FieldTextInput && owner.sourceBlock_ &&
      (owner.sourceBlock_ === this || owner.sourceBlock_.getParent() === this)) {
    Blockly.WidgetDiv.DIV.style.borderColor = owner.sourceBlock_.getColourTertiary();
  }
};

/**
 * Make a Block.
 * @return {?string} result
 * @this Blockly.Block
 */
Blockly.CtPm.Procedures.getColourExternal = function() {
  return this.ctPmColour_ ? this.ctPmColour_[0] : null;
};

/**
 * Before an edit changes a custom block.
 * @param {!Blockly.Block} prototypeBlock The procedures_prototype
 * @return {!Object<string, string>} Mutation text by reporter id
 */
Blockly.CtPm.Procedures.snapshotReporters = function(prototypeBlock) {
  var out = {};
  var children = prototypeBlock.getChildren(false);
  for (var i = 0; i < children.length; i++) {
    if (/^argument_reporter_/.test(children[i].type)) {
      var dom = children[i].mutationToDom();
      out[children[i].id] = dom ? Blockly.Xml.domToText(dom) : Blockly.CtPm.Procedures.EMPTY_MUTATION_;
    }
  }
  return out;
};

/**
 * A reporter without a colour has no mutation; the VM still needs a parsable one to clear it.
 */
Blockly.CtPm.Procedures.EMPTY_MUTATION_ = '<mutation></mutation>';

/**
 * After an edit changed a custom block, send the VM.
 * @param {!Blockly.Block} defineBlock The procedures_definition
 * @param {!Blockly.Block} prototypeBlock Its prototype, already updated
 * @param {!Object<string, string>} before before
 */
Blockly.CtPm.Procedures.recolourDefinition = function(defineBlock, prototypeBlock, before) {
  var empty = Blockly.CtPm.Procedures.EMPTY_MUTATION_;
  var text = function(b) {
    var dom = b.mutationToDom();
    return dom ? Blockly.Xml.domToText(dom) : empty;
  };
  var attr = prototypeBlock.ctPmColourAttr_ || null;
  var colour = prototypeBlock.ctPmColour_ || Blockly.CtPm.Procedures.themeColour_();
  var blocks = defineBlock.getDescendants(false);
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    if (!/^argument_reporter_/.test(b.type)) continue;
    var oldText;
    if (b.getParent() === prototypeBlock) {
      oldText = before[b.id] || empty;
    } else {
      if ((b.ctPmColourAttr_ || null) === attr) continue;
      oldText = text(b);
      b.ctPmColourAttr_ = attr;
      b.ctPmColour_ = prototypeBlock.ctPmColour_ || null;
      b.setColour(colour[0], colour[1], colour[2]);
    }
    var newText = text(b);
    if (oldText !== newText) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(b, 'mutation', null, oldText, newText));
    }
  }
};

/**
 * Is this removable field below the first row of a Make a Block declaration.
 * @param {!Blockly.Field} field A field being edited
 * @return {boolean} True if the field is in a later row
 */
Blockly.CtPm.Procedures.belowFirstRow = function(field) {
  var block = field.sourceBlock_;
  if (!block) return false;
  var root = block.type === 'procedures_declaration' ? block : block.getParent();
  if (!root || root.type !== 'procedures_declaration') return false;
  for (var i = 0, input; input = root.inputList[i]; i++) {
    if (input.type === Blockly.NEXT_STATEMENT) return true;
    if (input.fieldRow.indexOf(field) !== -1) return false;
    if (input.connection && input.connection.targetBlock() === block) return false;
  }
  return false;
};

(function() {
  var original = Blockly.FieldTextInputRemovable.prototype.showEditor_;
  Blockly.FieldTextInputRemovable.prototype.showEditor_ = function() {
    original.apply(this, arguments);
    if (!Blockly.CtPm.Procedures.belowFirstRow(this)) return;
    var div = Blockly.WidgetDiv.DIV;
    var icon = div.querySelector('.blocklyTextRemoveIcon');
    if (!icon) return;
    icon.style.top = '50%';
    icon.style.marginTop = '-12px';
    icon.style.left = 'calc(100% + 12px)';
    icon.style.marginLeft = '0';
    var backdrop = document.createElement('div');
    backdrop.className = 'ctPmControlsBackdrop';
    backdrop.style.cssText = 'position: absolute; left: calc(100% + 4px); top: 50%; ' +
        'width: 40px; height: 32px; margin-top: -16px; border-radius: 16px; ' +
        'background: #fff; box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15); pointer-events: none;';
    div.insertBefore(backdrop, icon);
  };
})();

/**
 * Height of an editable label in the Make a Block editor when it sits in the short row under a C.
 * @const {number}
 */
Blockly.CtPm.Procedures.COMPACT_LABEL_HEIGHT = 5 * Blockly.BlockSvg.GRID_UNIT;

/**
 * How far a compact label is drawn below its slot.
 * @const {number}
 */
Blockly.CtPm.Procedures.COMPACT_LABEL_SHIFT = 1 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Size an editable label of the declaration for the row it's in.
 * @param {!Blockly.Field} field A field of the declaration block
 * @param {boolean} compact compact
 * @private
 */
Blockly.CtPm.Procedures.sizeLabel_ = function(field, compact) {
  if (!field.box_ || !field.textElement_) return;
  var height = compact ? Blockly.CtPm.Procedures.COMPACT_LABEL_HEIGHT : Blockly.BlockSvg.FIELD_HEIGHT;
  var shift = compact ? Blockly.CtPm.Procedures.COMPACT_LABEL_SHIFT : 0;
  field.ctPmCompact_ = compact;
  if (field.size_.height === height) return;
  field.size_.height = height;
  field.box_.setAttribute('height', height);
  field.box_.setAttribute('y', shift);
  field.textElement_.setAttribute('y', shift + height / 2 + Blockly.BlockSvg.FIELD_TOP_PADDING);
};

/**
 * Is this input's row.
 * @param {!Blockly.Block} block The declaration block
 * @param {!Blockly.Input} input An input in the row
 * @return {boolean} True if the row holds no value input
 * @private
 */
Blockly.CtPm.Procedures.onlyLabelsInRow_ = function(block, input) {
  var list = block.inputList;
  var at = list.indexOf(input);
  var i;
  for (i = at; i >= 0 && list[i].type !== Blockly.NEXT_STATEMENT; i--) {
    if (list[i].type === Blockly.INPUT_VALUE) return false;
  }
  for (i = at + 1; i < list.length && list[i].type !== Blockly.NEXT_STATEMENT; i++) {
    if (list[i].type === Blockly.INPUT_VALUE) return false;
  }
  return true;
};

(function() {
  var original = Blockly.BlockSvg.prototype.computeInputHeight_;
  Blockly.BlockSvg.prototype.computeInputHeight_ = function(input, row, previousRow) {
    if (this.type === 'argument_reporter_local' && this.isShadow() && this.outputConnection) {
      return Blockly.BlockSvg.MIN_BLOCK_Y_SINGLE_FIELD_OUTPUT;
    }
    if (input.ctPmSection_) previousRow = null;
    if (this.type === 'procedures_declaration') {
      if (previousRow !== row) {
        row.ctPmUnderBranch_ = !!previousRow && previousRow.type === Blockly.NEXT_STATEMENT;
      }
      var compact = !!row.ctPmUnderBranch_ && Blockly.CtPm.Procedures.onlyLabelsInRow_(this, input);
      for (var i = 0; i < input.fieldRow.length; i++) {
        Blockly.CtPm.Procedures.sizeLabel_(input.fieldRow[i], compact);
      }
    }
    return original.call(this, input, row, previousRow);
  };
})();

/**
 * Connections of a C argument's reporter.
 * @param {!Blockly.Block} block An argument_reporter_command
 * @param {boolean} shadow shadow
 */
Blockly.CtPm.Procedures.setReporterConnections = function(block, shadow) {
  if (shadow) {
    if (!block.previousConnection || !block.previousConnection.isConnected() ||
        block.previousConnection.targetConnection.check_) {
      block.setPreviousStatement(true, Blockly.CtPm.Procedures.PROTOTYPE_CHECK);
    }
    if (block.nextConnection && !block.nextConnection.isConnected()) {
      block.setNextStatement(false);
    }
  } else {
    block.setPreviousStatement(true, null);
    block.setNextStatement(true, null);
  }
};

/**
 * A shadow argument reporter outside its slot.
 * @param {!Blockly.Block} block A shadow that drags out copies
 * @return {boolean} True if it's out of place
 * @private
 */
Blockly.CtPm.Procedures.isStrayShadow_ = function(block) {
  var parent = block.getParent();
  if (!parent) return true;
  if (block.type === 'argument_reporter_local') return parent.type !== 'procedures_definition';
  return block.type.indexOf('argument_reporter_') === 0 && parent.type !== 'procedures_prototype';
};

(function() {
  var original = Blockly.Gesture.prototype.duplicateOnDrag_;
  Blockly.Gesture.prototype.duplicateOnDrag_ = function() {
    var source = this.targetBlock_;
    original.apply(this, arguments);
    if (source && source !== this.targetBlock_ && source.isShadow() && !source.isInFlyout &&
        source.workspace && Blockly.CtPm.Procedures.isStrayShadow_(source)) {
      var holder = source.outputConnection || source.previousConnection;
      if (holder && holder.targetConnection) holder.targetConnection.setShadowDom(null);
      source.dispose(false);
    }
  };
})();

/**
 * Check of the define block's {name} slot.
 * @const {string}
 */
Blockly.CtPm.Procedures.LOCAL_DECL_CHECK = 'ctLocalDecl';

/**
 * @param {?string} text A `ctlocals` attribute
 * @return {!Array<{id: string, name: string}>} The The
 */
Blockly.CtPm.Procedures.parseLocals = function(text) {
  if (!text) return [];
  try {
    var list = JSON.parse(text);
    if (!Array.isArray(list)) return [];
    return list.filter(function(l) {
      return l && typeof l.id === 'string' && typeof l.name === 'string';
    }).map(function(l) {
      return {id: l.id, name: l.name};
    });
  } catch (e) {
    return [];
  }
};

/**
 * Parts of a message with %1, %2.
 * @param {string} message The message
 * @return {!Array<string|number>} Tokens.
 * @private
 */
Blockly.CtPm.Procedures.tokens_ = function(message) {
  return Blockly.utils.tokenizeInterpolation(message).map(function(t) {
    return typeof t === 'string' ? t.trim() : t;
  }).filter(function(t) {
    return t !== '';
  });
};

/**
 * Append a row.
 * @param {!Blockly.Block} block The block
 * @param {string} message The row's message
 * @param {!Array<function(): !Blockly.Input>} slots slots
 * @param {string} id id
 * @private
 */
Blockly.CtPm.Procedures.appendRow_ = function(block, message, slots, id) {
  var first = true;
  var label = 0;
  Blockly.CtPm.Procedures.tokens_(message).forEach(function(token) {
    var input;
    if (typeof token === 'number') {
      input = slots[token - 1]();
    } else {
      input = block.appendDummyInput('LOCALLABEL_' + id + '_' + (label++));
      input.appendField(token);
    }
    input.ctPmLocalId_ = id;
    if (first) input.ctPmRowStart_ = true;
    first = false;
  });
};

/**
 * Inputs of a block that belong to local variable rows.
 * @param {!Blockly.Block} block The block
 * @return {!Array<!Blockly.Input>} Those inputs
 * @private
 */
Blockly.CtPm.Procedures.localInputs_ = function(block) {
  return block.inputList.filter(function(input) {
    return !!input.ctPmLocalId_;
  });
};

/**
 * Run fn with the local rows' inputs taken out of the input list.
 * @param {!Blockly.Block} block The declaration
 * @param {function()} fn What to run
 * @return {*} What fn returns
 * @private
 */
Blockly.CtPm.Procedures.withoutLocals_ = function(block, fn) {
  var saved = block.inputList;
  block.inputList = saved.filter(function(input) {
    return !input.ctPmLocalId_;
  });
  try {
    return fn();
  } finally {
    var kept = block.inputList;
    block.inputList = kept.concat(saved.filter(function(input) {
      return input.ctPmLocalId_ && kept.indexOf(input) === -1;
    }));
  }
};

/**
 * procedures_definition.
 * @param {!Blockly.Block} block The define block
 */
Blockly.CtPm.Procedures.syncDefinitionInputs = function(block) {
  var wasRendered = block.rendered;
  block.rendered = false;
  try {
    Blockly.CtPm.Procedures.syncDefinitionRows_(block);
  } finally {
    block.rendered = wasRendered;
  }
  if (wasRendered) {
    block.initSvg();
    block.render();
  }
};

/**
 * @param {!Blockly.Block} block A procedures_definition
 * @private
 */
Blockly.CtPm.Procedures.syncDefinitionRows_ = function(block) {
  var list = block.ctLocals_ || [];
  var wanted = {};
  list.forEach(function(l) {
    wanted[l.id] = true;
  });
  Blockly.CtPm.Procedures.localInputs_(block).forEach(function(input) {
    if (wanted[input.ctPmLocalId_]) return;
    var target = input.connection && input.connection.targetBlock();
    if (target) {
      input.connection.setShadowDom(null);
      target.unplug();
      target.dispose();
    }
    block.removeInput(input.name);
  });
  list.forEach(function(l) {
    if (block.getInput('LOCALVAL_' + l.id)) return;
    Blockly.CtPm.Procedures.appendRow_(block, Blockly.Msg.CT_PM_PROCEDURES_LOCALROW, [
      function() {
        return block.appendValueInput('LOCALREF_' + l.id).setCheck(Blockly.CtPm.Procedures.LOCAL_DECL_CHECK);
      },
      function() {
        return block.appendValueInput('LOCALVAL_' + l.id);
      }
    ], l.id);
  });
};

/**
 * Mixin for procedures_definition.
 */
Blockly.CtPm.Procedures.DefinitionLocals = {
  /**
   * @return {Element} The mutation, or null with no locals (as before locals existed)
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var hasLocals = !!(this.ctLocals_ && this.ctLocals_.length);
    if (!hasLocals && !this.ctReturn_) return null;
    var container = document.createElement('mutation');
    if (hasLocals) container.setAttribute('ctlocals', JSON.stringify(this.ctLocals_));
    if (this.ctReturn_) container.setAttribute('ctreturn', String(this.ctReturn_));
    return container;
  },
  /**
   * @param {!Element} xmlElement The mutation
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.ctReturn_ = Blockly.CtPm.Procedures.parseReturn_(xmlElement.getAttribute('ctreturn'));
    this.ctLocals_ = Blockly.CtPm.Procedures.parseLocals(xmlElement.getAttribute('ctlocals'));
    Blockly.CtPm.Procedures.syncDefinitionInputs(this);
  }
};

/**
 * Give a define block new locals.
 * @param {!Blockly.Block} defineBlock The define block
 * @param {!Array<{id: string, name: string}>} list The new locals
 */
Blockly.CtPm.Procedures.setLocals = function(defineBlock, list) {
  var old = defineBlock.ctLocals_ || [];
  if (JSON.stringify(old) === JSON.stringify(list)) return;
  var oldById = {};
  old.forEach(function(l) {
    oldById[l.id] = l;
  });
  var newById = {};
  list.forEach(function(l) {
    newById[l.id] = l;
  });
  old.forEach(function(l) {
    if (newById[l.id]) return;
    ['LOCALREF_', 'LOCALVAL_'].forEach(function(prefix) {
      var input = defineBlock.getInput(prefix + l.id);
      var target = input && input.connection.targetBlock();
      if (target) {
        input.connection.setShadowDom(null);
        target.unplug();
        target.dispose();
      }
    });
  });
  list.forEach(function(l) {
    var before = oldById[l.id];
    if (!before || before.name === l.name) return;
    defineBlock.getDescendants(false).forEach(function(b) {
      if (b.type === 'argument_reporter_local' && b.getFieldValue('VALUE') === before.name) {
        b.setFieldValue(l.name, 'VALUE');
      }
    });
  });
  var oldMutation = Blockly.Xml.domToText(defineBlock.mutationToDom() || document.createElement('mutation'));
  defineBlock.ctLocals_ = list.map(function(l) {
    return {id: l.id, name: l.name};
  });
  Blockly.CtPm.Procedures.syncDefinitionInputs(defineBlock);
  var newMutation = Blockly.Xml.domToText(defineBlock.mutationToDom() || document.createElement('mutation'));
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(defineBlock, 'mutation', null, oldMutation, newMutation));
  }
  list.forEach(function(l) {
    if (oldById[l.id]) return;
    var ref = Blockly.CtPm.Procedures.newShadow_(defineBlock, 'argument_reporter_local', 'VALUE', l.name);
    defineBlock.getInput('LOCALREF_' + l.id).connection.connect(ref.outputConnection);
    var value = Blockly.CtPm.Procedures.newShadow_(defineBlock, 'text', 'TEXT', '');
    defineBlock.getInput('LOCALVAL_' + l.id).connection.connect(value.outputConnection);
  });
  if (defineBlock.rendered) defineBlock.render();
};

/**
 * mutateCallersAndPrototype.
 * @param {!Blockly.Block} defineBlock The define block
 * @param {!Element} mutation The editor's mutation
 */
Blockly.CtPm.Procedures.applyLocalsFromMutation = function(defineBlock, mutation) {
  if (!mutation.hasAttribute('ctlocals')) return;
  Blockly.CtPm.Procedures.setLocals(defineBlock,
      Blockly.CtPm.Procedures.parseLocals(mutation.getAttribute('ctlocals')));
};

/**
 * editProcedureCallback_.
 * @param {!Blockly.Block} prototypeBlock The prototype
 * @param {!Element} mutation mutation
 */
Blockly.CtPm.Procedures.addLocalsForEditor = function(prototypeBlock, mutation) {
  var defineBlock = prototypeBlock.getParent();
  var locals = (defineBlock && defineBlock.ctLocals_) || [];
  if (locals.length || Blockly.CtPm.isAdvanced(prototypeBlock.workspace)) {
    mutation.setAttribute('ctlocals', JSON.stringify(locals));
  }
};

/**
 * createProcedureCallbackFactory_.
 * @param {!Element} mutation mutation
 * @return {{mutation: string, inputs: string}} XML to put in the define block
 */
Blockly.CtPm.Procedures.definitionXml = function(mutation) {
  var locals = Blockly.CtPm.Procedures.parseLocals(mutation.getAttribute('ctlocals'));
  mutation.removeAttribute('ctlocals');
  if (!locals.length) return {mutation: '', inputs: ''};
  var esc = function(text) {
    return goog.string.htmlEscape(text);
  };
  return {
    mutation: '<mutation ctlocals="' + esc(JSON.stringify(locals)) + '"></mutation>',
    inputs: locals.map(function(l) {
      return '<value name="LOCALREF_' + esc(l.id) + '"><shadow type="argument_reporter_local">' +
          '<field name="VALUE">' + esc(l.name) + '</field></shadow></value>' +
          '<value name="LOCALVAL_' + esc(l.id) + '"><shadow type="text"><field name="TEXT"></field>' +
          '</shadow></value>';
    }).join('')
  };
};

/**
 * procedures_declaration, after its signature's inputs are made.
 * @param {Object} connectionMap connectionMap
 * @this Blockly.Block
 */
Blockly.CtPm.Procedures.declarationAfterInputs = function(connectionMap) {
  var block = this;
  (this.ctLocals_ || []).forEach(function(l) {
    Blockly.CtPm.Procedures.appendRow_(block, Blockly.Msg.CT_PM_PROCEDURES_LOCALEDITOR, [
      function() {
        var input = block.appendValueInput('LOCAL_' + l.id);
        var old = Blockly.CtPm.Procedures.oldBlock_(connectionMap, input.name);
        var editor;
        if (old && old.type === 'argument_editor_local') {
          editor = old;
          editor.setFieldValue(l.name, 'TEXT');
          connectionMap[input.name] = null;
        } else {
          editor = Blockly.CtPm.Procedures.newShadow_(block, 'argument_editor_local', 'TEXT', l.name);
        }
        input.connection.connect(editor.outputConnection);
        return input;
      }
    ], l.id);
  });
  var first = Blockly.CtPm.Procedures.localInputs_(block)[0];
  if (first) first.ctPmSection_ = true;
};

(function() {
  var original = Blockly.BlockSvg.prototype.renderDraw_;
  Blockly.BlockSvg.prototype.renderDraw_ = function(iconWidth, inputRows) {
    this.ctPmSectionY_ = null;
    if (Blockly.CtPm.Procedures.localInputs_(this).length) {
      var heights = inputRows.map(function(row) {
        return row.height;
      });
      original.call(this, iconWidth, inputRows);
      inputRows.forEach(function(row, i) {
        row.height = heights[i];
      });
      this.ctPmSectionY_ = null;
    }
    original.call(this, iconWidth, inputRows);
    var line = this.ctPmSectionLine_;
    if (this.ctPmSectionY_ === null) {
      if (line) line.setAttribute('display', 'none');
      return;
    }
    if (!line) {
      line = this.ctPmSectionLine_ = Blockly.utils.createSvgElement('line',
          {'class': 'ctPmSectionLine', 'stroke-width': 2, 'stroke-dasharray': '4 4'}, this.svgGroup_);
    }
    var y = this.ctPmSectionY_;
    var inset = 2 * Blockly.BlockSvg.GRID_UNIT;
    line.setAttribute('display', '');
    line.setAttribute('stroke', this.getColourTertiary());
    line.setAttribute('x1', inset);
    line.setAttribute('x2', this.width - inset);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
  };
})();

/**
 * @param {Array<!Blockly.Input>} row row
 * @return {boolean} True if the row starts a section of its own (the editor's local variables)
 */
Blockly.CtPm.Procedures.startsSection = function(row) {
  return !!(row && row[0] && row[0].ctPmSection_);
};

/**
 * The locals' names, as the editor shows them now.
 * @param {!Blockly.Block} block The declaration
 * @private
 */
Blockly.CtPm.Procedures.readLocalNames_ = function(block) {
  var byId = {};
  Blockly.CtPm.Procedures.localInputs_(block).forEach(function(input) {
    var editor = input.connection && input.connection.targetBlock();
    if (editor && editor.type === 'argument_editor_local') byId[input.ctPmLocalId_] = editor.getFieldValue('TEXT');
  });
  block.ctLocals_ = (block.ctLocals_ || []).filter(function(l) {
    return Object.prototype.hasOwnProperty.call(byId, l.id);
  }).map(function(l) {
    return {id: l.id, name: byId[l.id]};
  });
};

/**
 * A name for a new local.
 * @param {!Blockly.Block} block The declaration
 * @return {string} The name
 * @private
 */
Blockly.CtPm.Procedures.newLocalName_ = function(block) {
  var used = {};
  (block.displayNames_ || []).forEach(function(n) {
    used[n] = true;
  });
  (block.ctLocals_ || []).forEach(function(l) {
    used[l.name] = true;
  });
  var base = Blockly.Msg.CT_PM_PROCEDURES_LOCAL_DEFAULT || 'local';
  var name = base;
  for (var i = 2; used[name]; i++) name = base + i;
  return name;
};

/**
 * procedures_declaration.
 * @this Blockly.Block
 */
Blockly.CtPm.Procedures.addLocalExternal = function() {
  Blockly.WidgetDiv.hide(true);
  this.ctLocalsKnown_ = true;
  var id = Blockly.utils.genUid();
  this.ctLocals_ = (this.ctLocals_ || []).concat([{id: id, name: Blockly.CtPm.Procedures.newLocalName_(this)}]);
  this.updateDisplay_();
  var input = this.getInput('LOCAL_' + id);
  var editor = input && input.connection.targetBlock();
  if (editor) editor.getField('TEXT').showEditor_();
};

/**
 * Wrap a declaration instance's methods that read the whole input list as the signature.
 * @param {!Blockly.Block} block A new procedures_declaration
 */
Blockly.CtPm.Procedures.initDeclarationLocals = function(block) {
  block.ctLocals_ = block.ctLocals_ || [];
  var onChange = block.onChangeFn;
  block.onChangeFn = function() {
    var args = arguments;
    var self = this;
    Blockly.CtPm.Procedures.withoutLocals_(this, function() {
      return onChange.apply(self, args);
    });
    Blockly.CtPm.Procedures.readLocalNames_(this);
  };
  var focusLast = block.focusLastEditor_;
  if (focusLast) {
    block.focusLastEditor_ = function() {
      var self = this;
      return Blockly.CtPm.Procedures.withoutLocals_(this, function() {
        return focusLast.call(self);
      });
    };
  }
};

/**
 * My Blocks.
 * @param {!Array<!Element>} xmlList xmlList
 * @param {!Blockly.Workspace} workspace The workspace
 */
Blockly.CtPm.Procedures.addLocalBlocks = function(xmlList, workspace) {
  if (!Blockly.CtPm.isAdvanced(workspace)) return;
  var at = 0;
  for (var i = 0; i < xmlList.length; i++) {
    if (xmlList[i].getAttribute && xmlList[i].getAttribute('type') === Blockly.PROCEDURES_RETURN_BLOCK_TYPE) {
      at = i + 1;
    }
  }
  var make = function(type, value) {
    return Blockly.Xml.textToDom('<xml><block type="' + type + '" gap="12"><value name="VALUE">' +
        '<shadow type="' + (value === '' ? 'text' : 'math_number') + '"><field name="' +
        (value === '' ? 'TEXT' : 'NUM') + '">' + value + '</field></shadow></value></block></xml>').firstChild;
  };
  xmlList.splice(at, 0, make('procedures_ct_setlocal', ''), make('procedures_ct_changelocal', '1'));
};

/**
 * @param {?string} value A `ctreturn` attribute
 * @return {?number} PROCEDURES_CALL_TYPE_REPORTER or _BOOLEAN, or null
 * @private
 */
Blockly.CtPm.Procedures.parseReturn_ = function(value) {
  var type = +value;
  return type === Blockly.PROCEDURES_CALL_TYPE_REPORTER || type === Blockly.PROCEDURES_CALL_TYPE_BOOLEAN ?
      type : null;
};

/**
 * Does this value slot refuse a round custom reporter? Boolean slots do.
 * @param {!Blockly.Connection} input A value input's connection
 * @return {boolean} True if it refuses one
 */
Blockly.CtPm.Procedures.refusesRound = function(input) {
  var block = input.getSourceBlock();
  if (block && Blockly.CtPm.isAnyType(block.workspace)) return false;
  if (Blockly.CtPm.hasCheck_(input, 'Boolean')) return true;
  return Blockly.CtPm.Shapes.typeShape(input.check_) === Blockly.OUTPUT_SHAPE_HEXAGONAL;
};

/**
 * Give one call block a new shape, in place.
 * @param {!Blockly.Block} call A procedures_call reporter
 * @param {number} type PROCEDURES_CALL_TYPE_REPORTER or _BOOLEAN
 * @param {boolean} bump bump
 * @private
 */
Blockly.CtPm.Procedures.setCallReturn_ = function(call, type, bump) {
  var dom = call.mutationToDom();
  var oldMutation = Blockly.Xml.domToText(dom);
  dom.setAttribute('return', type);
  call.domToMutation(dom);
  var newMutation = Blockly.Xml.domToText(call.mutationToDom());
  if (oldMutation !== newMutation && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(call, 'mutation', null, oldMutation, newMutation));
  }
  var target = call.outputConnection && call.outputConnection.targetConnection;
  if (bump && target && type === Blockly.PROCEDURES_CALL_TYPE_REPORTER &&
      Blockly.CtPm.Procedures.refusesRound(target)) {
    call.unplug();
    if (call.rendered) call.outputConnection.bumpAwayFrom_(target);
  }
};

/**
 * Bring every placed copy of the workspace's custom reporters to their block's shape.
 * @param {!Blockly.Workspace} workspace The workspace
 * @param {boolean} bump bump
 */
Blockly.CtPm.Procedures.syncCallShapes = function(workspace, bump) {
  var types = Blockly.Procedures.getAllProcedureReturnTypes(workspace);
  var blocks = workspace.getAllBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    var call = blocks[i];
    if (call.type !== Blockly.PROCEDURES_CALL_BLOCK_TYPE || call.isInsertionMarker() || !call.getReturn) continue;
    var current = call.getReturn();
    if (current === Blockly.PROCEDURES_CALL_TYPE_STATEMENT) continue;
    var wanted = types[call.getProcCode()];
    if (!wanted || wanted === Blockly.PROCEDURES_CALL_TYPE_STATEMENT || wanted === current) continue;
    Blockly.CtPm.Procedures.setCallReturn_(call, wanted, bump);
  }
};

/**
 * The right-click choice.
 * @param {!Blockly.Block} block block
 * @param {number} type PROCEDURES_CALL_TYPE_REPORTER or _BOOLEAN
 */
Blockly.CtPm.Procedures.setReturnShape = function(block, type) {
  var workspace = block.workspace;
  var defineBlock = block.type === Blockly.PROCEDURES_DEFINITION_BLOCK_TYPE ? block :
      Blockly.Procedures.getDefineBlock(block.getProcCode(), workspace);
  Blockly.Events.setGroup(true);
  try {
    if (!defineBlock) {
      Blockly.CtPm.Procedures.setCallReturn_(block, type, true);
      return;
    }
    var oldMutation = Blockly.Xml.domToText(defineBlock.mutationToDom() || document.createElement('mutation'));
    defineBlock.ctReturn_ = type;
    var newMutation = Blockly.Xml.domToText(defineBlock.mutationToDom() || document.createElement('mutation'));
    if (oldMutation !== newMutation && Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(defineBlock, 'mutation', null, oldMutation, newMutation));
    }
    Blockly.CtPm.Procedures.syncCallShapes(workspace, true);
    workspace.refreshToolboxSelection_ && workspace.refreshToolboxSelection_();
  } finally {
    Blockly.Events.setGroup(false);
  }
};

/**
 * The shape a custom block has now.
 * @param {!Blockly.Block} block block
 * @return {number} Its call type
 */
Blockly.CtPm.Procedures.returnShapeOf = function(block) {
  if (block.type === Blockly.PROCEDURES_DEFINITION_BLOCK_TYPE) return Blockly.Procedures.getBlockReturnType(block);
  return block.getReturn();
};

(function() {
  var original = Blockly.Workspace.prototype.fireChangeListener;
  var KINDS = {};
  KINDS[Blockly.Events.BLOCK_CREATE] = true;
  KINDS[Blockly.Events.BLOCK_DELETE] = true;
  KINDS[Blockly.Events.BLOCK_CHANGE] = true;
  KINDS[Blockly.Events.BLOCK_MOVE] = true;
  Blockly.Workspace.prototype.fireChangeListener = function(event) {
    original.call(this, event);
    if (!event.recordUndo || !KINDS[event.type] || !this.rendered || this.isFlyout) return;
    if (!this.procedureReturnsEnabled) return;
    var workspace = this;
    workspace.ctPmShapeGroup_ = event.group;
    if (workspace.ctPmShapeTimer_) return;
    var run = function() {
      workspace.ctPmShapeTimer_ = null;
      if (workspace.isDragging && workspace.isDragging()) {
        workspace.ctPmShapeTimer_ = setTimeout(run, 100);
        return;
      }
      if (!workspace.rendered) return;
      var group = Blockly.Events.getGroup();
      Blockly.Events.setGroup(workspace.ctPmShapeGroup_ || false);
      try {
        Blockly.CtPm.Procedures.syncCallShapes(workspace, false);
      } finally {
        Blockly.Events.setGroup(group || false);
      }
    };
    workspace.ctPmShapeTimer_ = setTimeout(run, 0);
  };
})();
