/**
 * @fileoverview PenguinMod compatibility.
 */
'use strict';

goog.provide('Blockly.CtPm');

goog.require('Blockly.Connection');
goog.require('Blockly.DataCategory');
goog.require('Blockly.Events');
goog.require('Blockly.Xml');
goog.require('Blockly.constants');
goog.require('Blockly.scratchBlocksUtils');
goog.require('Blockly.VariableModel');
goog.require('goog.string');

/**
 * Options of a workspace.
 * @param {!Blockly.Workspace} workspace The main workspace
 * @param {?Object} options options
 */
Blockly.CtPm.setWorkspaceOptions = function(workspace, options) {
  options = options || {};
  var wasSnap = Blockly.CtPm.isSnap(workspace);
  workspace.ctPmOptions_ = {
    advanced: !!options.advanced,
    loose: !!options.loose,
    anyType: !!options.anyType,
    essentials: !!options.essentials,
    snap: !!options.snap
  };
  if (wasSnap !== Blockly.CtPm.isSnap(workspace) && workspace.rendered) {
    var redraw = function(ws) {
      ws.getAllBlocks().reverse().forEach(function(block) {
        if (block.rendered) block.render(false);
      });
    };
    redraw(workspace);
    var flyout = workspace.getFlyout && workspace.getFlyout();
    if (flyout && flyout.getWorkspace()) {
      redraw(flyout.getWorkspace());
      if (flyout.reflow) flyout.reflow();
    }
  }
};

/**
 * @param {Blockly.Workspace} workspace workspace
 * @return {boolean} True if the project has Snap related behavior on
 */
Blockly.CtPm.isSnap = function(workspace) {
  var ws = workspace && workspace.isFlyout && workspace.targetWorkspace ? workspace.targetWorkspace : workspace;
  return !!(ws && ws.ctPmOptions_ && ws.ctPmOptions_.snap);
};

/**
 * Snap related behavior.
 * @param {!Blockly.Workspace} workspace The main workspace
 * @param {string} xml xml
 */
Blockly.CtPm.setSnapDataBlocks = function(workspace, xml) {
  workspace.ctSnapDataXml_ = xml || '';
};

/**
 * Appends the Snap blocks of the Variables flyout.
 * @param {!Array.<!Element>} xmlList The flyout's XML so far
 * @param {!Blockly.Workspace} workspace The workspace the flyout is for
 * @private
 */
Blockly.CtPm.addSnapDataBlocks_ = function(xmlList, workspace) {
  var xml = workspace && workspace.ctSnapDataXml_;
  if (!xml) return;
  var dom = Blockly.Xml.textToDom('<xml>' + xml + '</xml>');
  Blockly.DataCategory.addSep(xmlList);
  for (var child = dom.firstChild; child; child = child.nextSibling) {
    if (child.nodeType === 1) xmlList.push(child);
  }
};

/**
 * @param {Blockly.Workspace} workspace workspace
 * @return {boolean} True if the palette shows only the Essentials level of the Advanced blocks
 */
Blockly.CtPm.isEssentials = function(workspace) {
  return !!(workspace && workspace.ctPmOptions_ && workspace.ctPmOptions_.essentials);
};

/**
 * The advanced list blocks of the Variables flyout shown at the Essentials level.
 * @const {!Object<string, boolean>}
 */
Blockly.CtPm.ESSENTIAL_LIST_BLOCKS = {
  'data_reverselist': true,
  'data_filterlist': true,
  'data_listforeachitem': true,
  'data_listforeachnum': true,
  'data_amountinlist': true,
  'data_listisempty': true
};

/**
 * @param {Blockly.Workspace} workspace workspace
 * @return {boolean} True if any reporter may be dragged into a typed slot on this workspace
 */
Blockly.CtPm.isAnyType = function(workspace) {
  return !!(workspace && workspace.ctPmOptions_ && workspace.ctPmOptions_.anyType);
};

/**
 * @param {Blockly.Workspace} workspace workspace
 * @return {boolean} True if Advanced blocks are on for this workspace
 */
Blockly.CtPm.isAdvanced = function(workspace) {
  return !!(workspace && workspace.ctPmOptions_ && workspace.ctPmOptions_.advanced);
};

/**
 * @param {Blockly.Workspace} workspace workspace
 * @return {boolean} True if Loose block shapes are on for this workspace
 */
Blockly.CtPm.isLoose = function(workspace) {
  return !!(workspace && workspace.ctPmOptions_ && workspace.ctPmOptions_.loose);
};

/**
 * Statement check used by switch/case.
 * @const {string}
 */
Blockly.CtPm.SWITCH_CASE_CHECK = 'switchCase';

/**
 * Checks that only connect to each other.
 * @const {!Array<string>}
 */
Blockly.CtPm.EXCLUSIVE_CHECKS = [Blockly.CtPm.SWITCH_CASE_CHECK, 'ctPmArgumentCommand', 'ctFunctionsParamDecl'];

/**
 * Check of a custom block's local variable reporter.
 * @const {string}
 */
Blockly.CtPm.LOCAL_REF_CHECK = 'ctLocalRef';

/**
 * @param {!Blockly.Connection} connection A connection
 * @param {string} check A check name
 * @return {boolean} True if the connection's check list contains `check`
 * @private
 */
Blockly.CtPm.hasCheck_ = function(connection, check) {
  return !!connection.check_ && connection.check_.indexOf(check) !== -1;
};

/**
 * The connection-check extension point, called first by Blockly.Connection#checkType_.
 * @param {!Blockly.Connection} a One connection
 * @param {!Blockly.Connection} b The other connection
 * @return {?boolean} True/false to decide, null for "no opinion"
 */
Blockly.CtPm.checkType = function(a, b) {
  if (Blockly.CtPm.inDragCheck_) {
    var slot = a.type === Blockly.INPUT_VALUE && b.type === Blockly.OUTPUT_VALUE ? a :
        (b.type === Blockly.INPUT_VALUE && a.type === Blockly.OUTPUT_VALUE ? b : null);
    var reporter = slot && (slot === a ? b : a).getSourceBlock();
    if (reporter && reporter.type === Blockly.PROCEDURES_CALL_BLOCK_TYPE && reporter.getReturn &&
        reporter.getReturn() === Blockly.PROCEDURES_CALL_TYPE_REPORTER &&
        Blockly.CtPm.Procedures.refusesRound(slot)) {
      return false;
    }
  }
  var refInput = a.type === Blockly.INPUT_VALUE ? a : (b.type === Blockly.INPUT_VALUE ? b : null);
  var refOther = refInput === a ? b : a;
  if (refInput && Blockly.CtPm.hasCheck_(refInput, Blockly.CtPm.LOCAL_REF_CHECK) &&
      !Blockly.CtPm.hasCheck_(refOther, Blockly.CtPm.LOCAL_REF_CHECK)) {
    var inBlock = refInput.getSourceBlock();
    var outBlock = refOther.getSourceBlock();
    return !(inBlock && outBlock && inBlock.rendered && outBlock.rendered);
  }
  if (refInput && Blockly.CtPm.hasCheck_(refOther, Blockly.CtPm.LOCAL_REF_CHECK) &&
      !Blockly.CtPm.hasCheck_(refInput, Blockly.CtPm.LOCAL_REF_CHECK) && !refInput.check_) {
    return true;
  }
  for (var i = 0; i < Blockly.CtPm.EXCLUSIVE_CHECKS.length; i++) {
    var check = Blockly.CtPm.EXCLUSIVE_CHECKS[i];
    if (Blockly.CtPm.hasCheck_(a, check) === Blockly.CtPm.hasCheck_(b, check)) continue;
    var aBlock = a.getSourceBlock();
    var bBlock = b.getSourceBlock();
    if (aBlock && bBlock && aBlock.rendered && bBlock.rendered) {
      return false;
    }
    return true;
  }

  var typed = Blockly.CtPm.typedConnection_(a, b);
  if (typed) {
    if (!Blockly.CtPm.inDragCheck_) return true;
    var workspace = a.getSourceBlock() && a.getSourceBlock().workspace;
    if (Blockly.CtPm.isAnyType(workspace)) return true;
    if (Blockly.CtPm.hasCheck_(typed.input, Blockly.CtPm.TYPE_PREFIX + 'Array')) return true;
    var outputBlock = typed.output.getSourceBlock();
    if (Blockly.CtPm.hasTypedCheck_(typed.input) && outputBlock &&
        Blockly.CtPm.UNTYPED_OUTPUTS[outputBlock.type] === true) {
      return true;
    }
    if (!typed.input.check_ || Blockly.CtPm.hasTypedCheck_(typed.input)) {
      return Blockly.CtPm.vanillaCheck_(a, b);
    }
  }

  var sourceBlock = a.getSourceBlock();
  if (sourceBlock && Blockly.CtPm.isLoose(sourceBlock.workspace)) {
    var input = null;
    var output = null;
    if (a.type === Blockly.INPUT_VALUE && b.type === Blockly.OUTPUT_VALUE) {
      input = a;
      output = b;
    } else if (b.type === Blockly.INPUT_VALUE && a.type === Blockly.OUTPUT_VALUE) {
      input = b;
      output = a;
    }
    if (input && Blockly.CtPm.hasCheck_(input, 'Boolean') &&
        (Blockly.CtPm.hasCheck_(output, 'String') || Blockly.CtPm.hasCheck_(output, 'Number') ||
        Blockly.CtPm.hasCheck_(output, true) || Blockly.CtPm.hasTypedCheck_(output))) {
      return true;
    }
  }
  return null;
};

/**
 * Prefix of the checks of PenguinMod's value types.
 * @const {string}
 */
Blockly.CtPm.TYPE_PREFIX = 'ctPmType:';

/**
 * Reporters that hold any kind of value and so fit a typed slot, as in PenguinMod, where their.
 * @const {!Object<string, boolean>}
 */
Blockly.CtPm.UNTYPED_OUTPUTS = {
  'data_variable': true,
  'argument_reporter_string_number': true,
  'argument_reporter_local': true,
  'data_listcontents': true
};

/**
 * True while a drag asks whether a connection may be its snap target.
 * @type {boolean} result
 * @private
 */
Blockly.CtPm.inDragCheck_ = false;

/**
 * @param {!Blockly.Connection} connection A connection
 * @return {boolean} True if it has a value-type check
 * @private
 */
Blockly.CtPm.hasTypedCheck_ = function(connection) {
  var check = connection.check_;
  if (!check) return false;
  for (var i = 0; i < check.length; i++) {
    if (typeof check[i] === 'string' && check[i].indexOf(Blockly.CtPm.TYPE_PREFIX) === 0) return true;
  }
  return false;
};

/**
 * @param {!Blockly.Connection} a One connection
 * @param {!Blockly.Connection} b The other connection
 * @return {?{input: !Blockly.Connection, output: !Blockly.Connection}} The The
 * @private
 */
Blockly.CtPm.typedConnection_ = function(a, b) {
  var input = null;
  var output = null;
  if (a.type === Blockly.INPUT_VALUE && b.type === Blockly.OUTPUT_VALUE) {
    input = a;
    output = b;
  } else if (b.type === Blockly.INPUT_VALUE && a.type === Blockly.OUTPUT_VALUE) {
    input = b;
    output = a;
  }
  if (!input || !(Blockly.CtPm.hasTypedCheck_(input) || Blockly.CtPm.hasTypedCheck_(output))) return null;
  return {input: input, output: output};
};

/**
 * Blockly's own rule.
 * @param {!Blockly.Connection} a One connection
 * @param {!Blockly.Connection} b The other connection
 * @return {boolean} True if compatible
 * @private
 */
Blockly.CtPm.vanillaCheck_ = function(a, b) {
  if (!a.check_ || !b.check_) return true;
  for (var i = 0; i < a.check_.length; i++) {
    if (b.check_.indexOf(a.check_[i]) !== -1) return true;
  }
  return false;
};

(function() {
  var isConnectionAllowed = Blockly.Connection.prototype.isConnectionAllowed;
  /**
   * Marks the check as a drag's.
   * @param {!Blockly.Connection} candidate candidate
   * @return {boolean} True if allowed
   * @this {Blockly.Connection}
   */
  Blockly.Connection.prototype.isConnectionAllowed = function(candidate) {
    var was = Blockly.CtPm.inDragCheck_;
    Blockly.CtPm.inDragCheck_ = true;
    try {
      return isConnectionAllowed.call(this, candidate);
    } finally {
      Blockly.CtPm.inDragCheck_ = was;
    }
  };
})();

/**
 * Shadow blocks that behave like custom-block argument reporters.
 * @const {!Object<string, boolean>}
 */
Blockly.CtPm.DRAG_DUPLICATE_SHADOWS = {
  'control_from_to_index': true,
  'data_filterlistitem': true,
  'data_filterlistindex': true,
  'argument_reporter_command': true,
  'argument_reporter_local': true
};

(function() {
  var isShadowArgumentReporter = Blockly.scratchBlocksUtils.isShadowArgumentReporter;
  /**
   * Wraps the vanilla check so these shadows duplicate on drag and render in their own colour.
   * @param {!Blockly.Block} block The block
   * @return {boolean} True if dragging this shadow should drag out a copy
   */
  Blockly.scratchBlocksUtils.isShadowArgumentReporter = function(block) {
    return isShadowArgumentReporter(block) ||
        (block.isShadow() && Blockly.CtPm.DRAG_DUPLICATE_SHADOWS[block.type] === true);
  };
})();

/**
 * Appends the advanced list blocks to the Variables flyout, after all the vanilla ones.
 * @param {!Array.<!Element>} xmlList The flyout's XML so far
 * @param {!Blockly.Workspace} workspace The workspace the flyout is for
 */
Blockly.CtPm.addDataCategoryBlocks = function(xmlList, workspace) {
  Blockly.CtPm.addSnapDataBlocks_(xmlList, workspace);
  if (!Blockly.CtPm.isAdvanced(workspace)) {
    return;
  }
  var lists = workspace.getVariablesOfType(Blockly.LIST_VARIABLE_TYPE);
  if (!lists.length) {
    return;
  }
  lists.sort(Blockly.VariableModel.compareByName);
  var list = lists[0];
  var variables = workspace.getVariablesOfType('');
  variables.sort(Blockly.VariableModel.compareByName);
  var variable = variables.length ? variables[0] : null;

  var esc = function(text) {
    return goog.string.htmlEscape(text);
  };
  var listField = '<field name="LIST" id="' + esc(list.getId()) + '" variabletype="list">' +
      esc(list.name) + '</field>';
  var essentials = Blockly.CtPm.isEssentials(workspace);
  var pendingSep = false;
  var add = function(xml) {
    var type = /type="([^"]+)"/.exec(xml);
    var snapOn = !!workspace.ctSnapDataXml_;
    if (essentials && type && !Blockly.CtPm.ESSENTIAL_LIST_BLOCKS[type[1]] &&
        !(snapOn && type[1] === 'data_arraylist')) return;
    if (snapOn && type && (type[1] === 'data_listarray' || type[1] === 'data_filterlist')) return;
    if (pendingSep) {
      Blockly.DataCategory.addSep(xmlList);
      pendingSep = false;
    }
    xmlList.push(Blockly.Xml.textToDom('<xml>' + xml + '</xml>').firstChild);
  };
  var sep = function() {
    pendingSep = true;
  };

  sep();
  add('<block type="data_reverselist">' + listField + '</block>');
  add('<block type="data_shiftlist">' + listField +
      '<value name="INDEX"><shadow type="math_integer"><field name="NUM">1</field></shadow></value></block>');
  add('<block type="data_arraylist">' + listField +
      '<value name="VALUE"><shadow type="text"><field name="TEXT">["a", "b", "c"]</field></shadow></value></block>');
  add('<block type="data_filterlist">' + listField +
      '<value name="INDEX"><shadow type="data_filterlistindex"></shadow></value>' +
      '<value name="ITEM"><shadow type="data_filterlistitem"></shadow></value>' +
      '<value name="BOOL"><shadow type="checkbox"></shadow></value></block>');
  if (variable) {
    var variableField = '<field name="VARIABLE" id="' + esc(variable.getId()) + '" variabletype="">' +
        esc(variable.name) + '</field>';
    sep();
    add('<block type="data_listforeachitem">' + listField + variableField + '</block>');
    add('<block type="data_listforeachnum">' + listField + variableField + '</block>');
  }
  sep();
  add('<block type="data_amountinlist">' + listField +
      '<value name="VALUE"><shadow type="text"><field name="TEXT">thing</field></shadow></value></block>');
  add('<block type="data_itemexistslist">' + listField +
      '<value name="INDEX"><shadow type="math_integer"><field name="NUM">1</field></shadow></value></block>');
  add('<block type="data_listisempty">' + listField + '</block>');
  add('<block type="data_listarray">' + listField + '</block>');
};

/**
 * Handles a click on an expandable block's add/remove button.
 * @param {!Blockly.BlockSvg} block The expandable block
 * @param {boolean} isAdding isAdding
 */
Blockly.CtPm.onExpandButton = function(block, isAdding) {
  if (!block.workspace || block.isInFlyout || block.isInsertionMarker() || !block.isEditable()) {
    return;
  }
  var oldState = block.ctPmGetState_();
  var newState = block.ctPmNextState_(isAdding);
  if (!newState) {
    return;
  }
  var startedGroup = !Blockly.Events.getGroup();
  if (startedGroup) {
    Blockly.Events.setGroup(true);
  }
  try {
    var oldMutation = Blockly.Xml.domToText(block.mutationToDom());
    var removed = block.ctPmRemovedInputs_(newState);
    for (var i = 0; i < removed.length; i++) {
      Blockly.CtPm.emptyInput_(block.getInput(removed[i]));
    }
    Blockly.Events.disable();
    try {
      block.ctPmApplyState_(newState);
    } finally {
      Blockly.Events.enable();
    }
    var newMutation = Blockly.Xml.domToText(block.mutationToDom());
    Blockly.Events.fire(new Blockly.Events.BlockChange(block, 'mutation', null, oldMutation, newMutation));
    block.ctPmFillInputs_(oldState, newState);
    Blockly.CtPm.rerender_(block);
  } finally {
    if (startedGroup) {
      Blockly.Events.setGroup(false);
    }
  }
};

/**
 * Empties an input that is about to be removed.
 * @param {Blockly.Input} input input
 * @private
 */
Blockly.CtPm.emptyInput_ = function(input) {
  if (!input || !input.connection || !input.connection.isConnected()) {
    return;
  }
  input.connection.setShadowDom(null);
  var child = input.connection.targetBlock();
  if (child.isShadow()) {
    child.dispose();
  } else {
    child.unplug();
    if (child.rendered && child.bumpNeighbours_) {
      child.bumpNeighbours_();
    }
  }
};

/**
 * Re-renders a block after its inputs changed.
 * @param {!Blockly.Block} block The block
 * @private
 */
Blockly.CtPm.rerender_ = function(block) {
  if (block.rendered) {
    block.initSvg();
    block.render();
  }
};

/**
 * Creates a shadow block in an input, with events, the same way the toolbox would.
 * @param {!Blockly.Block} block The parent block
 * @param {string} inputName The input to fill
 * @param {string} type type
 * @param {string=} opt_fieldName Field to set on the shadow
 * @param {string=} opt_value Value for that field
 */
Blockly.CtPm.fillShadow = function(block, inputName, type, opt_fieldName, opt_value) {
  var input = block.getInput(inputName);
  if (!input || !input.connection || input.connection.isConnected()) {
    return;
  }
  var xml = '<xml><shadow type="' + type + '">';
  if (opt_fieldName) {
    xml += '<field name="' + opt_fieldName + '">' + goog.string.htmlEscape(String(opt_value)) + '</field>';
  }
  xml += '</shadow></xml>';
  var dom = Blockly.Xml.textToDom(xml).firstChild;
  var shadow;
  Blockly.Events.disable();
  try {
    shadow = Blockly.Xml.domToBlock(dom, block.workspace);
  } finally {
    Blockly.Events.enable();
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockCreate(shadow));
  }
  input.connection.connect(shadow.outputConnection || shadow.previousConnection);
};

/**
 * Builds an inline operator dropdown for expandable operator blocks.
 * @param {!Array.<!Array.<string>>} options options
 * @return {!Blockly.FieldDropdown} The dropdown
 */
Blockly.CtPm.makeOperatorDropdown = function(options) {
  var dropdown = new Blockly.FieldDropdown(options.map(function(option) {
    var label = option[0];
    return [label.charAt(0) === '@' ? Blockly.CtPm.msg(label.slice(1)) : label, option[1]];
  }));
  var setValue = dropdown.setValue;
  dropdown.setValue = function(value) {
    var block = this.sourceBlock_;
    if (!block || block.ctPmUpdating_ || !Blockly.Events.isEnabled() || value === this.getValue()) {
      Blockly.Events.disable();
      try {
        setValue.call(this, value);
      } finally {
        Blockly.Events.enable();
      }
      return;
    }
    var startedGroup = !Blockly.Events.getGroup();
    if (startedGroup) {
      Blockly.Events.setGroup(true);
    }
    try {
      var oldMutation = Blockly.Xml.domToText(block.mutationToDom());
      Blockly.Events.disable();
      try {
        setValue.call(this, value);
      } finally {
        Blockly.Events.enable();
      }
      var newMutation = Blockly.Xml.domToText(block.mutationToDom());
      Blockly.Events.fire(new Blockly.Events.BlockChange(block, 'mutation', null, oldMutation, newMutation));
    } finally {
      if (startedGroup) {
        Blockly.Events.setGroup(false);
      }
    }
  };
  return dropdown;
};

/**
 * Adds the remove/add buttons as the block's last input.
 * @param {!Blockly.Block} block The block
 * @param {number=} opt_align opt_align
 */
Blockly.CtPm.ensureButtons = function(block, opt_align) {
  var input = block.getInput('CT_PM_BUTTONS');
  if (!input) {
    input = block.appendDummyInput('CT_PM_BUTTONS')
        .appendField(new Blockly.CtPm.FieldExpandButton(false))
        .appendField(new Blockly.CtPm.FieldExpandButton(true));
    if (opt_align !== undefined) {
      input.setAlign(opt_align);
    }
  }
  var index = block.inputList.indexOf(input);
  if (index !== block.inputList.length - 1) {
    block.inputList.splice(index, 1);
    block.inputList.push(input);
  }
};

/**
 * Builds a variable-arity operator block definition.
 * @param {!Object} spec spec
 * @return {!Object} The Blockly.Blocks definition
 */
Blockly.CtPm.makeExpandableOperator = function(spec) {
  return {
    init: function() {
      var json = {
        "category": Blockly.Categories.operators,
        "extensions": ["colours_operators", spec.output]
      };
      if (spec.label) {
        json.message0 = spec.label();
      }
      this.jsonInit(json);
      this.ctPmCount_ = 0;
      this.ctPmOps_ = '';
      Blockly.CtPm.ensureButtons(this);
    },

    mutationToDom: function() {
      var container = document.createElement('mutation');
      container.setAttribute('inputcount', String(this.ctPmCount_));
      if (spec.ops) {
        var ops = this.ctPmReadOps_();
        container.setAttribute('menuvalues', ops);
        if (spec.optimizeAttribute) {
          var same = true;
          for (var i = 1; i < ops.length; i++) {
            if (ops[i] !== ops[0]) same = false;
          }
          container.setAttribute('optimize', String(same));
        }
      }
      return container;
    },

    domToMutation: function(xmlElement) {
      var count = parseInt(xmlElement.getAttribute('inputcount'), 10);
      var ops = xmlElement.getAttribute('menuvalues');
      this.ctPmApplyState_({
        count: isNaN(count) || count < 0 ? 0 : count,
        ops: ops === null ? '' : String(ops)
      });
      Blockly.CtPm.rerender_(this);
    },

    /**
     * @return {string} The operator codes currently selected, one per gap
     * @this Blockly.Block
     */
    ctPmReadOps_: function() {
      var ops = '';
      for (var i = 2; i <= this.ctPmCount_; i++) {
        var input = this.getInput(spec.prefix + i);
        var field = input && input.fieldRow[0];
        ops += field ? field.getValue() : (this.ctPmOps_[i - 2] || spec.defaultOp);
      }
      return ops;
    },

    ctPmGetState_: function() {
      return {count: this.ctPmCount_, ops: spec.ops ? this.ctPmReadOps_() : ''};
    },

    ctPmNextState_: function(isAdding) {
      var state = this.ctPmGetState_();
      if (isAdding) {
        return {count: state.count + 1, ops: spec.ops ? state.ops + spec.defaultOp : ''};
      }
      if (state.count <= 1) {
        return null;
      }
      return {count: state.count - 1, ops: state.ops.slice(0, Math.max(0, state.count - 2))};
    },

    ctPmRemovedInputs_: function(state) {
      var names = [];
      for (var i = state.count + 1; i <= this.ctPmCount_; i++) {
        names.push(spec.prefix + i);
      }
      return names;
    },

    ctPmApplyState_: function(state) {
      this.ctPmUpdating_ = true;
      try {
        for (var i = this.ctPmCount_; i > state.count; i--) {
          Blockly.CtPm.emptyInput_(this.getInput(spec.prefix + i));
          this.removeInput(spec.prefix + i, true);
        }
        for (var i = 1; i <= state.count; i++) {
          var name = spec.prefix + i;
          var input = this.getInput(name);
          if (!input) {
            input = this.appendValueInput(name);
            if (spec.check) {
              input.setCheck(spec.check);
            }
            if (spec.ops && i > 1) {
              input.appendField(Blockly.CtPm.makeOperatorDropdown(spec.ops));
            }
          }
          if (spec.ops && i > 1) {
            var code = state.ops[i - 2] || spec.defaultOp;
            if (!Blockly.CtPm.hasOption_(spec.ops, code)) {
              code = spec.defaultOp;
            }
            input.fieldRow[0].setValue(code);
          }
        }
        this.ctPmCount_ = state.count;
        this.ctPmOps_ = state.ops;
        Blockly.CtPm.ensureButtons(this);
      } finally {
        this.ctPmUpdating_ = false;
      }
    },

    ctPmFillInputs_: function(oldState, state) {
      for (var i = oldState.count + 1; i <= state.count; i++) {
        var shadow = spec.shadow(i);
        Blockly.CtPm.fillShadow(this, spec.prefix + i, shadow[0], shadow[1], shadow[2]);
      }
    },

    ctPmOnExpandButton_: function(isAdding) {
      Blockly.CtPm.onExpandButton(this, isAdding);
    }
  };
};

/**
 * @param {!Array.<!Array.<string>>} options Dropdown options
 * @param {string} value A value
 * @return {boolean} True if `value` is one of the options
 * @private
 */
Blockly.CtPm.hasOption_ = function(options, value) {
  for (var i = 0; i < options.length; i++) {
    if (options[i][1] === value) return true;
  }
  return false;
};

/**
 * Loop blocks, for working out which loop an "escape loop" block belongs to.
 * @const {!Object<string, boolean>}
 */
Blockly.CtPm.LOOP_TYPES = {
  'control_forever': true,
  'control_repeat': true,
  'control_repeat_until': true,
  'control_while': true,
  'control_for_each': true,
  'control_repeatForSeconds': true,
  'control_from_to': true,
  'data_listforeachitem': true,
  'data_listforeachnum': true
};

/**
 * @param {!Blockly.Block} block A block inside some loop
 * @return {Blockly.Block} The nearest loop around it, or null
 */
Blockly.CtPm.enclosingLoop = function(block) {
  var parent = block.getSurroundParent();
  while (parent && !Blockly.CtPm.LOOP_TYPES[parent.type]) {
    parent = parent.getSurroundParent();
  }
  return parent;
};

/**
 * Does this stack.
 * @param {Blockly.Block} block First block of a stack
 * @return {boolean} True if so
 */
Blockly.CtPm.stackHasOwnExit = function(block) {
  for (; block; block = block.getNextBlock()) {
    if (block.type === 'control_exitLoop') {
      return true;
    }
    if (Blockly.CtPm.LOOP_TYPES[block.type]) {
      continue;
    }
    for (var i = 0, input; input = block.inputList[i]; i++) {
      if (input.type === Blockly.NEXT_STATEMENT && input.connection &&
          Blockly.CtPm.stackHasOwnExit(input.connection.targetBlock())) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Brings a forever block's next connection in line with its contents, with undoable events.
 * @param {Blockly.Block} forever A control_forever block
 * @param {string=} opt_group opt_group
 */
Blockly.CtPm.updateForeverBreak = function(forever, opt_group) {
  if (!forever || forever.type !== 'control_forever' || !forever.workspace || forever.isInFlyout ||
      forever.isInsertionMarker() || !forever.ctPmSetBreak_) {
    return;
  }
  var hasBreak = Blockly.CtPm.stackHasOwnExit(forever.getInputTargetBlock('SUBSTACK'));
  if (hasBreak === !!forever.ctPmHasBreak_) {
    return;
  }
  var oldGroup = Blockly.Events.getGroup();
  if (opt_group) {
    Blockly.Events.setGroup(opt_group);
  } else if (!oldGroup) {
    Blockly.Events.setGroup(true);
  }
  try {
    if (!hasBreak && forever.nextConnection && forever.nextConnection.isConnected()) {
      var next = forever.nextConnection.targetBlock();
      next.unplug();
      if (next.rendered && next.bumpNeighbours_) {
        next.bumpNeighbours_();
      }
    }
    var oldMutation = '<mutation hasbreak="' + !hasBreak + '"></mutation>';
    var newMutation = '<mutation hasbreak="' + hasBreak + '"></mutation>';
    Blockly.Events.disable();
    try {
      forever.ctPmSetBreak_(hasBreak);
    } finally {
      Blockly.Events.enable();
    }
    Blockly.Events.fire(new Blockly.Events.BlockChange(forever, 'mutation', null, oldMutation, newMutation));
  } finally {
    Blockly.Events.setGroup(oldGroup);
  }
};

/**
 * Defines plain.
 * @param {!Object<string, function(): !Object>} defs defs
 */
Blockly.CtPm.defineBlocks = function(defs) {
  Object.keys(defs).forEach(function(type) {
    var factory = defs[type];
    Blockly.Blocks[type] = {
      init: function() {
        this.jsonInit(factory());
      }
    };
  });
};

/**
 * A message with a fallback, for keys a locale may not have yet.
 * @param {string} key Blockly.Msg key
 * @return {string} The message
 */
Blockly.CtPm.msg = function(key) {
  var text = Blockly.Msg[key];
  return text === undefined ? key : text;
};

/**
 * Argument helpers for block JSON.
 */
Blockly.CtPm.arg = {
  /**
   * @param {string} name Input name
   * @param {string=} opt_check Connection check
   * @return {!Object} A value input
   */
  value: function(name, opt_check) {
    var arg = {"type": "input_value", "name": name};
    if (opt_check) arg["check"] = opt_check;
    return arg;
  },
  /**
   * @param {string} name Input name
   * @param {string=} opt_check Connection check
   * @return {!Object} A statement input
   */
  statement: function(name, opt_check) {
    var arg = {"type": "input_statement", "name": name};
    if (opt_check) arg["check"] = opt_check;
    return arg;
  },
  /**
   * @param {string} name Field name
   * @param {!Array.<!Array.<string>>} options options
   * @return {!Object} A dropdown field
   */
  dropdown: function(name, options) {
    return {
      "type": "field_dropdown",
      "name": name,
      "options": options.map(function(option) {
        var label = option[0];
        if (label.charAt(0) === '@') label = Blockly.CtPm.msg(label.slice(1));
        return [label, option[1]];
      })
    };
  },
  /**
   * @param {string} file file
   * @param {string} alt Alt text
   * @return {!Object} An image field
   */
  image: function(file, alt) {
    return {
      "type": "field_image",
      "src": Blockly.mainWorkspace.options.pathToMedia + file,
      "width": 24,
      "height": 24,
      "alt": alt,
      "flip_rtl": true
    };
  },
  /**
   * @param {string} name Field name
   * @param {!Array.<string>} types Variable types
   * @return {!Object} A variable field
   */
  variable: function(name, types) {
    return {"type": "field_variable", "name": name, "variableTypes": types};
  }
};

/**
 * Shorthand for a plain block's JSON.
 * @param {string} key key
 * @param {!Array.<!Object>} args The args for that row
 * @param {!Array.<string>} extensions extensions
 * @param {Object=} opt_extra More JSON properties
 * @return {!Object} The block JSON
 */
Blockly.CtPm.json = function(key, args, extensions, opt_extra) {
  var json = {
    "message0": Blockly.CtPm.msg(key),
    "args0": args,
    "extensions": extensions
  };
  if (opt_extra) {
    for (var k in opt_extra) json[k] = opt_extra[k];
  }
  return json;
};
