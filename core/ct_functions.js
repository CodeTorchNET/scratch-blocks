/**
 * @fileoverview CodeTorch's Functions extension in the editor.
 */
'use strict';

goog.provide('Blockly.CtFunctions');

goog.require('Blockly.Block');
goog.require('Blockly.CtPm');
goog.require('Blockly.Events');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabelSerializable');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.Xml');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.Gesture');

/**
 * Where each Functions block is placed.
 * @const {!Object<string, string>}
 */
Blockly.CtFunctions.CATEGORY = {
  call: 'control', run: 'control', launch: 'control', callList: 'control', runList: 'control',
  launchList: 'control', tell: 'control', ask: 'control', menu_sprites: 'control',
  newList: 'data_lists', numbers: 'data_lists',
  map: 'data_lists', keep: 'data_lists', findFirst: 'data_lists', combine: 'data_lists'
};

/**
 * Mix a #rrggbb colour with white.
 * @param {string} hex The colour
 * @param {number} amount amount
 * @return {string} The tint
 * @private
 */
Blockly.CtFunctions.tint_ = function(hex, amount) {
  var n = parseInt(String(hex).replace('#', ''), 16);
  if (isNaN(n)) return hex;
  var mix = function(c) {
    return Math.round(c + (255 - c) * amount);
  };
  var r = mix((n >> 16) & 255);
  var g = mix((n >> 8) & 255);
  var b = mix(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};

/**
 * Colour a Functions block like the category it's placed in.
 * @param {!Blockly.Block} block A ctFunctions_ block
 */
Blockly.CtFunctions.colourByCategory = function(block) {
  var name = block.type.slice('ctFunctions_'.length);
  var category = Blockly.CtFunctions.CATEGORY[name] || 'operators';
  var colours = Blockly.Colours[category] || Blockly.Colours.operators;
  if (!colours) return;
  if (Blockly.CtFunctions.RINGS[block.type]) {
    block.setColour(Blockly.CtFunctions.tint_(colours.primary, 0.45),
        Blockly.CtFunctions.tint_(colours.primary, 0.35), colours.tertiary);
  } else {
    block.setColour(colours.primary, colours.secondary, colours.tertiary);
  }
};

/**
 * The check of the slots that hold a ring's / script variables' parameter blocks, and of those.
 * @const {string}
 */
Blockly.CtFunctions.PARAM_DECL_CHECK = 'ctFunctionsParamDecl';

/**
 * Opcodes of the rings.
 */
Blockly.CtFunctions.RINGS = {
  'ctFunctions_reporterRing': true,
  'ctFunctions_predicateRing': true,
  'ctFunctions_commandRing': true
};

/**
 * What each kind of block has.
 * @const {!Object}
 */
Blockly.CtFunctions.NAMES = {
  ring: {attribute: 'params', prefix: 'PARAM', label: 'CT_FN_INPUT_NAMES', base: '#', numbered: true},
  declare: {attribute: 'names', prefix: 'NAME', label: null, base: 'a', numbered: false}
};

/**
 * Called from jsonInit.
 * @param {!Blockly.Block} block block
 * @param {string} kind kind
 */
Blockly.CtFunctions.init = function(block, kind) {
  if (kind === 'ring' || kind === 'declare') {
    Blockly.CtFunctions.initNames_(block, Blockly.CtFunctions.NAMES[kind]);
    if (kind === 'ring') {
      var suffix = block.type.slice('ctFunctions_'.length);
      block.inputList.forEach(function(input) {
        for (var i = input.fieldRow.length - 1; i >= 0; i--) {
          var field = input.fieldRow[i];
          if (!field.name && field.getText && field.getText() === suffix) {
            field.dispose();
            input.fieldRow.splice(i, 1);
          }
        }
      });
      if (block.outputConnection) block.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
    }
  } else if (kind === 'call') {
    Blockly.CtFunctions.initCall_(block, 'CT_FN_WITH_INPUTS');
  } else if (kind === 'items') {
    Blockly.CtFunctions.initCall_(block, null);
  } else if (kind === 'param') {
    Blockly.CtFunctions.initParam_(block);
  } else if (kind === 'nameMenu') {
    Blockly.CtFunctions.initNameMenu_(block);
  }
};

/**
 * @param {?string} text A JSON list of names
 * @return {!Array<string>} The names (never throws)
 */
Blockly.CtFunctions.parseNames = function(text) {
  try {
    var names = JSON.parse(text || '[]');
    return Array.isArray(names) ? names.map(String) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Give a ring or a script variables block its name list.
 * @param {!Blockly.Block} block The block
 * @param {!Object} spec Its entry in NAMES
 * @private
 */
Blockly.CtFunctions.initNames_ = function(block, spec) {
  block.ctFnNames_ = [];
  block.ctFnSpec_ = spec;
  var mixin = Blockly.CtFunctions.NamesMixin;
  for (var key in mixin) block[key] = mixin[key];
  Blockly.CtPm.ensureButtons(block);
};

/**
 * Methods of a block with a name list.
 */
Blockly.CtFunctions.NamesMixin = {
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute(this.ctFnSpec_.attribute, JSON.stringify(this.ctFnNames_));
    return container;
  },
  domToMutation: function(xmlElement) {
    this.ctPmApplyState_({names: Blockly.CtFunctions.parseNames(
        xmlElement.getAttribute(this.ctFnSpec_.attribute))});
    Blockly.CtPm.rerender_(this);
  },
  ctPmGetState_: function() {
    return {names: this.ctFnNames_.slice()};
  },
  ctPmNextState_: function(isAdding) {
    var names = this.ctFnNames_.slice();
    if (isAdding) {
      names.push(Blockly.CtFunctions.newName_(this, names));
    } else {
      if (!names.length) return null;
      names.pop();
    }
    return {names: names};
  },
  ctPmRemovedInputs_: function(state) {
    var removed = [];
    for (var i = state.names.length + 1; i <= this.ctFnNames_.length; i++) {
      removed.push(this.ctFnSpec_.prefix + i);
    }
    return removed;
  },
  ctPmApplyState_: function(state) {
    var spec = this.ctFnSpec_;
    for (var i = this.ctFnNames_.length; i > state.names.length; i--) {
      Blockly.CtPm.emptyInput_(this.getInput(spec.prefix + i));
      this.removeInput(spec.prefix + i, true);
    }
    for (var j = 1; j <= state.names.length; j++) {
      var input = this.getInput(spec.prefix + j);
      if (!input) {
        input = this.appendValueInput(spec.prefix + j).setCheck(Blockly.CtFunctions.PARAM_DECL_CHECK);
        if (j === 1 && spec.label) {
          input.appendField(Blockly.CtPm.msg(spec.label));
        }
      }
      var shadow = input.connection.targetBlock();
      if (shadow && shadow.getField('NAME') && shadow.getFieldValue('NAME') !== state.names[j - 1]) {
        shadow.ctFnSyncing_ = true;
        try {
          shadow.setFieldValue(state.names[j - 1], 'NAME');
        } finally {
          shadow.ctFnSyncing_ = false;
        }
      }
    }
    this.ctFnNames_ = state.names.slice();
    Blockly.CtPm.ensureButtons(this);
  },
  ctPmFillInputs_: function(oldState, state) {
    for (var i = oldState.names.length + 1; i <= state.names.length; i++) {
      Blockly.CtPm.fillShadow(this, this.ctFnSpec_.prefix + i, 'ctFunctions_param', 'NAME', state.names[i - 1]);
    }
  },
  ctPmOnExpandButton_: function(isAdding) {
    Blockly.CtPm.onExpandButton(this, isAdding);
  }
};

/**
 * A name for a new parameter / script variable, not used by the block yet.
 * @param {!Blockly.Block} block The block
 * @param {!Array<string>} names Its names so far
 * @return {string} The name
 * @private
 */
Blockly.CtFunctions.newName_ = function(block, names) {
  var spec = block.ctFnSpec_;
  for (var i = 1; ; i++) {
    var name = spec.numbered ? spec.base + i :
        (i <= 26 ? String.fromCharCode(96 + i) : 'v' + i);
    if (names.indexOf(name) === -1) return name;
  }
};

/**
 * Parameter blocks a block holds in its name inputs are created with the block.
 * @param {!Blockly.Block} block A ring or script variables block
 */
Blockly.CtFunctions.restoreMissingShadows = function(block) {
  if (!block.ctFnSpec_ || !block.workspace) return;
  for (var i = 1; i <= block.ctFnNames_.length; i++) {
    var input = block.getInput(block.ctFnSpec_.prefix + i);
    if (!input || input.connection.isConnected()) continue;
    var dom = Blockly.Xml.textToDom('<xml><shadow type="ctFunctions_param"><field name="NAME">' +
        goog.string.htmlEscape(block.ctFnNames_[i - 1]) + '</field></shadow></xml>').firstChild;
    Blockly.Events.disable();
    try {
      var shadow = Blockly.Xml.domToBlock(dom, block.workspace);
      input.connection.connect(shadow.outputConnection);
    } finally {
      Blockly.Events.enable();
    }
  }
};

/**
 * A parameter block's name, drawn as a label.
 * @param {string} text The name
 * @extends {Blockly.FieldLabelSerializable}
 * @constructor
 */
Blockly.CtFunctions.FieldParamName = function(text) {
  Blockly.CtFunctions.FieldParamName.superClass_.constructor.call(this, text);
};
goog.inherits(Blockly.CtFunctions.FieldParamName, Blockly.FieldLabelSerializable);

/**
 * Clickable.
 */
Blockly.CtFunctions.FieldParamName.prototype.EDITABLE = true;

/**
 * @return {boolean} True if this name can be renamed here: in the block that declares it
 */
Blockly.CtFunctions.FieldParamName.prototype.isCurrentlyEditable = function() {
  var block = this.sourceBlock_;
  return !!block && block.isShadow() && !block.isInFlyout && block.isEditable() &&
      !!Blockly.CtFunctions.declarer_(block);
};

/**
 * Click.
 * @private
 */
Blockly.CtFunctions.FieldParamName.prototype.showEditor_ = function() {
  var field = this;
  var block = this.sourceBlock_;
  var oldName = String(this.getValue());
  Blockly.prompt(Blockly.Msg.CT_FN_RENAME_PROMPT.replace('%1', oldName), oldName, function(text) {
    var name = text === null || text === undefined ? '' : String(text).trim();
    if (!name || name === oldName || !block.workspace) return;
    Blockly.Events.setGroup(true);
    try {
      field.setValue(name);
      Blockly.CtFunctions.renameDeclared_(block, oldName, name);
    } finally {
      Blockly.Events.setGroup(false);
    }
  }, Blockly.Msg.RENAME_VARIABLE_MODAL_TITLE);
};

/**
 * @param {!Blockly.Block} block A parameter block
 * @return {?Blockly.Block} The ring / script variables block it sits in (as a shadow), or null
 * @private
 */
Blockly.CtFunctions.declarer_ = function(block) {
  var parent = block.getParent();
  return parent && parent.ctFnSpec_ ? parent : null;
};

/**
 * Turn a parameter block into what it is now.
 * @param {!Blockly.Block} block A ctFunctions_param block
 * @private
 */
Blockly.CtFunctions.initParam_ = function(block) {
  Blockly.CtPm.DRAG_DUPLICATE_SHADOWS['ctFunctions_param'] = true;
  Blockly.CtFunctions.setParamField_(block, false);
  block.setOutput(true, null);
  var setShadow = block.setShadow;
  block.setShadow = function(shadow) {
    setShadow.call(this, shadow);
    Blockly.CtFunctions.setParamField_(this, shadow);
    this.setOutput(true, shadow ? Blockly.CtFunctions.PARAM_DECL_CHECK : null);
  };
};

/**
 * @param {!Blockly.Block} block A ctFunctions_param block
 * @param {boolean} editable editable
 * @private
 */
Blockly.CtFunctions.setParamField_ = function(block, editable) {
  var old = block.getField('NAME');
  var value = old ? old.getValue() : '';
  var isParamName = old instanceof Blockly.CtFunctions.FieldParamName;
  var isLabel = old instanceof Blockly.FieldLabelSerializable && !isParamName;
  if (old && (editable ? isParamName : isLabel)) return;
  var input = old ? old.sourceBlock_ && Blockly.CtFunctions.inputOfField_(block, old) : block.inputList[0];
  var field = editable ? new Blockly.CtFunctions.FieldParamName(value) :
      new Blockly.FieldLabelSerializable(value);
  var wasRendered = block.rendered;
  block.rendered = false;
  try {
    if (!input) input = block.appendDummyInput();
    if (old) input.removeField('NAME');
    input.appendField(field, 'NAME');
  } finally {
    block.rendered = wasRendered;
  }
  if (wasRendered) {
    field.init();
    block.render();
  }
};

/**
 * @param {!Blockly.Block} block A block
 * @param {!Blockly.Field} field One of its fields
 * @return {?Blockly.Input} The input holding it
 * @private
 */
Blockly.CtFunctions.inputOfField_ = function(block, field) {
  for (var i = 0; i < block.inputList.length; i++) {
    if (block.inputList[i].fieldRow.indexOf(field) !== -1) return block.inputList[i];
  }
  return null;
};

/**
 * A parameter / script variable was renamed in its declaring block.
 * @param {!Blockly.Block} paramBlock paramBlock
 * @param {string} oldName Its old name
 * @param {string} newName Its new name
 * @private
 */
Blockly.CtFunctions.renameDeclared_ = function(paramBlock, oldName, newName) {
  var declarer = Blockly.CtFunctions.declarer_(paramBlock);
  if (!declarer || oldName === newName) return;
  var index = -1;
  for (var i = 0; i < declarer.inputList.length; i++) {
    var input = declarer.inputList[i];
    if (input.connection && input.connection.targetBlock() === paramBlock) {
      index = parseInt(input.name.slice(declarer.ctFnSpec_.prefix.length), 10) - 1;
    }
  }
  if (index < 0 || declarer.ctFnNames_[index] !== oldName) return;
  var startedGroup = !Blockly.Events.getGroup();
  if (startedGroup) Blockly.Events.setGroup(true);
  try {
    var oldMutation = Blockly.Xml.domToText(declarer.mutationToDom());
    declarer.ctFnNames_[index] = newName;
    var newMutation = Blockly.Xml.domToText(declarer.mutationToDom());
    Blockly.Events.fire(new Blockly.Events.BlockChange(declarer, 'mutation', null, oldMutation, newMutation));
    Blockly.CtFunctions.blocksInScope_(declarer).forEach(function(b) {
      if (b.isShadow()) return;
      if ((b.type === 'ctFunctions_param' || b.ctFnNameMenu_) && b.getFieldValue('NAME') === oldName) {
        b.setFieldValue(newName, 'NAME');
      }
    });
  } finally {
    if (startedGroup) Blockly.Events.setGroup(false);
  }
};

/**
 * Blocks that see a declaring block's names.
 * @param {!Blockly.Block} declarer A ring or script variables block
 * @return {!Array<!Blockly.Block>} The blocks
 * @private
 */
Blockly.CtFunctions.blocksInScope_ = function(declarer) {
  var result = [];
  var collect = function(block, shadowed) {
    if (!block) return;
    if (block !== declarer && Blockly.CtFunctions.RINGS[block.type] && block.ctFnNames_) {
      shadowed = shadowed.concat(block.ctFnNames_);
    }
    if (!(block.type === 'ctFunctions_param' &&
        shadowed.indexOf(block.getFieldValue('NAME')) !== -1)) {
      result.push(block);
    }
    var children = block.getChildren(false);
    for (var i = 0; i < children.length; i++) {
      if (children[i] === block.getNextBlock() && block === declarer) continue;
      collect(children[i], shadowed);
    }
  };
  if (Blockly.CtFunctions.RINGS[declarer.type]) {
    var body = declarer.getInput('SUBSTACK');
    collect(body && body.connection && body.connection.targetBlock(), []);
  } else {
    collect(declarer.getNextBlock(), []);
  }
  return result;
};

/**
 * The −/+ inputs of call / run / launch.
 * @param {!Blockly.Block} block The block
 * @param {?string} label label
 * @private
 */
Blockly.CtFunctions.initCall_ = function(block, label) {
  block.ctFnCount_ = 0;
  block.ctFnInputsLabel_ = label;
  var mixin = Blockly.CtFunctions.CallMixin;
  for (var key in mixin) block[key] = mixin[key];
  Blockly.CtPm.ensureButtons(block);
};

/**
 * Methods of call / run / launch and "list".
 */
Blockly.CtFunctions.CallMixin = {
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('inputcount', String(this.ctFnCount_));
    return container;
  },
  domToMutation: function(xmlElement) {
    var count = parseInt(xmlElement.getAttribute('inputcount'), 10);
    this.ctPmApplyState_({count: isNaN(count) || count < 0 ? 0 : Math.min(count, 1000)});
    Blockly.CtPm.rerender_(this);
  },
  ctPmGetState_: function() {
    return {count: this.ctFnCount_};
  },
  ctPmNextState_: function(isAdding) {
    if (isAdding) return {count: this.ctFnCount_ + 1};
    return this.ctFnCount_ > 0 ? {count: this.ctFnCount_ - 1} : null;
  },
  ctPmRemovedInputs_: function(state) {
    var removed = [];
    for (var i = state.count + 1; i <= this.ctFnCount_; i++) removed.push('ARG' + i);
    return removed;
  },
  ctPmApplyState_: function(state) {
    for (var i = this.ctFnCount_; i > state.count; i--) {
      Blockly.CtPm.emptyInput_(this.getInput('ARG' + i));
      this.removeInput('ARG' + i, true);
    }
    for (var j = 1; j <= state.count; j++) {
      if (this.getInput('ARG' + j)) continue;
      var input = this.appendValueInput('ARG' + j);
      if (j === 1 && this.ctFnInputsLabel_) input.appendField(Blockly.CtPm.msg(this.ctFnInputsLabel_));
    }
    this.ctFnCount_ = state.count;
    Blockly.CtPm.ensureButtons(this);
  },
  ctPmFillInputs_: function(oldState, state) {
    for (var i = oldState.count + 1; i <= state.count; i++) {
      Blockly.CtPm.fillShadow(this, 'ARG' + i, 'text', 'TEXT', '');
    }
  },
  ctPmOnExpandButton_: function(isAdding) {
    Blockly.CtPm.onExpandButton(this, isAdding);
  }
};

/**
 * Replace the VM's placeholder menu with the names in scope where the block is.
 * @param {!Blockly.Block} block block
 * @private
 */
Blockly.CtFunctions.initNameMenu_ = function(block) {
  block.ctFnNameMenu_ = true;
  var old = block.getField('NAME');
  if (!old) return;
  var input = Blockly.CtFunctions.inputOfField_(block, old);
  var value = old.getValue();
  var index = input.fieldRow.indexOf(old);
  input.removeField('NAME');
  var menu = new Blockly.FieldDropdown(function() {
    return Blockly.CtFunctions.namesInScope(this.sourceBlock_).map(function(name) {
      return [name, name];
    });
  });
  menu.setValue(value);
  input.insertFieldAt(index, menu, 'NAME');
};

/**
 * Names a set / change / parameter block can mean where it is.
 * @param {Blockly.Block} block block
 * @return {!Array<string>} The names, without repeats
 */
Blockly.CtFunctions.namesInScope = function(block) {
  var names = [];
  var add = function(name) {
    if (name && names.indexOf(name) === -1) names.push(name);
  };
  if (!block) return ['a'];
  var current = block.getFieldValue('NAME');
  add(current);
  for (var b = block; b; ) {
    for (var prev = b.getPreviousBlock(); prev && prev.getNextBlock() === b; prev = prev.getPreviousBlock()) {
      if (prev.type === 'ctFunctions_declare' && prev.ctFnNames_) prev.ctFnNames_.forEach(add);
      b = prev;
    }
    var parent = b.getSurroundParent ? b.getSurroundParent() : b.getParent();
    if (!parent) parent = b.getParent();
    if (parent && Blockly.CtFunctions.RINGS[parent.type] && parent.ctFnNames_) parent.ctFnNames_.forEach(add);
    b = parent;
  }
  var workspace = block.workspace;
  if (workspace && workspace.getAllVariables) {
    workspace.getAllVariables().forEach(function(variable) {
      if (variable.type === '') add(variable.name);
    });
  }
  if (!names.length) add('a');
  return names;
};

(function() {
  var original = Blockly.Xml.domToBlock;
  Blockly.Xml.domToBlock = function(xmlBlock, workspace) {
    var block = original.apply(this, arguments);
    if (block && block.getDescendants) {
      var all = block.getDescendants(false);
      for (var i = 0; i < all.length; i++) {
        if (all[i].ctFnSpec_) Blockly.CtFunctions.restoreMissingShadows(all[i]);
      }
    }
    return block;
  };
})();

(function() {
  var original = Blockly.Gesture.prototype.doBlockClick_;
  Blockly.Gesture.prototype.doBlockClick_ = function() {
    var block = this.startBlock_;
    if (block && block.type === 'argument_reporter_local' && block.isShadow() && !this.flyout_ &&
        Blockly.CtPm.Procedures.renameScriptLocal(block)) {
      this.bringBlockToFront_();
      Blockly.Events.setGroup(false);
      return;
    }
    var field = block && block.type === 'ctFunctions_param' && !this.flyout_ && block.getField('NAME');
    if (field && field instanceof Blockly.CtFunctions.FieldParamName && field.isCurrentlyEditable()) {
      this.bringBlockToFront_();
      Blockly.Events.setGroup(false);
      field.showEditor_();
      return;
    }
    original.apply(this, arguments);
  };
})();
