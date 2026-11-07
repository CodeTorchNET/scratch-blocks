/**
 * @fileoverview Advanced.
 */
'use strict';

goog.provide('Blockly.Blocks.ctPmVanilla');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');

(function() {
  var arg = Blockly.CtPm.arg;

  var EXTRA_EFFECTS = [
    ['@CT_PM_LOOKS_EFFECT_SATURATION', 'SATURATION'],
    ['@CT_PM_LOOKS_EFFECT_RED', 'RED'],
    ['@CT_PM_LOOKS_EFFECT_GREEN', 'GREEN'],
    ['@CT_PM_LOOKS_EFFECT_BLUE', 'BLUE'],
    ['@CT_PM_LOOKS_EFFECT_OPAQUE', 'OPAQUE'],
    ['@CT_PM_LOOKS_EFFECT_HORIZONTAL_SHEAR', 'HORIZONTAL_SHEAR'],
    ['@CT_PM_LOOKS_EFFECT_VERTICAL_SHEAR', 'VERTICAL_SHEAR'],
    ['@CT_PM_LOOKS_EFFECT_REPEAT_X', 'REPEAT_X'],
    ['@CT_PM_LOOKS_EFFECT_REPEAT_Y', 'REPEAT_Y']
  ];

  /**
   * Vanilla menus PenguinMod extended.
   * @param {string} type Vanilla block type
   * @param {string} fieldName Its dropdown field
   * @param {!Array.<!Array.<string>>} extras extras
   */
  var extendVanillaMenu = function(type, fieldName, extras) {
    var definition = Blockly.Blocks[type];
    var init = definition.init;
    definition.init = function() {
      init.call(this);
      var field = this.getField(fieldName);
      var base = field && field.menuGenerator_;
      if (!Array.isArray(base)) {
        return;
      }
      field.menuGenerator_ = function() {
        var block = this.sourceBlock_;
        var workspace = block && block.workspace;
        if (workspace && workspace.isFlyout && workspace.targetWorkspace) {
          workspace = workspace.targetWorkspace;
        }
        if (!Blockly.CtPm.isAdvanced(workspace)) {
          return base;
        }
        return base.concat(arg.dropdown(fieldName, extras).options);
      };
      field.isOptionListDynamic = function() {
        return false;
      };
    };
  };
  extendVanillaMenu('looks_seteffectto', 'EFFECT', EXTRA_EFFECTS);
  extendVanillaMenu('looks_changeeffectby', 'EFFECT', EXTRA_EFFECTS);
  extendVanillaMenu('motion_setrotationstyle', 'STYLE', [
    ['@CT_PM_MOTION_ROTATION_UPDOWN', 'up-down'],
    ['@CT_PM_MOTION_ROTATION_LOOKAT', 'look at']
  ]);

  var forever = Blockly.Blocks['control_forever'];
  forever.mutationToDom = function() {
    if (!this.ctPmHasBreak_) {
      return null;
    }
    var container = document.createElement('mutation');
    container.setAttribute('hasbreak', 'true');
    return container;
  };
  forever.domToMutation = function(xmlElement) {
    this.ctPmSetBreak_(xmlElement.getAttribute('hasbreak') === 'true');
  };
  /**
   * Adds or removes the next connection.
   * @param {boolean} hasBreak hasBreak
   * @this Blockly.Block
   */
  forever.ctPmSetBreak_ = function(hasBreak) {
    hasBreak = !!hasBreak;
    if (hasBreak === !!this.ctPmHasBreak_) {
      return;
    }
    this.ctPmHasBreak_ = hasBreak;
    if (!hasBreak && this.nextConnection && this.nextConnection.isConnected()) {
      this.nextConnection.targetBlock().unplug();
    }
    this.setNextStatement(hasBreak);
    if (hasBreak && !this.ctPmWatching_ && !this.isInFlyout) {
      this.ctPmWatching_ = true;
      this.setOnChange(function(e) {
        if (this.ctPmHasBreak_ && e.recordUndo &&
            (e.type === Blockly.Events.BLOCK_MOVE || e.type === Blockly.Events.BLOCK_DELETE)) {
          Blockly.CtPm.updateForeverBreak(this, e.group);
        }
      });
    }
    if (this.rendered) {
      this.render();
    }
  };
})();

(function() {
  /**
   * The Make a Block editor's name field for a C argument.
   */
  Blockly.Blocks['argument_editor_command'] = {
    init: function() {
      this.jsonInit({
        "message0": " %1",
        "args0": [{"type": "field_input_removable", "name": "TEXT", "text": "branch"}],
        "colour": Blockly.Colours.textField,
        "colourSecondary": Blockly.Colours.textField,
        "colourTertiary": Blockly.Colours.textField,
        "colourQuaternary": Blockly.Colours.textField,
        "extensions": ["shape_statement"]
      });
    },
    removeFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.removeArgumentCallback_
  };
  var shapeOption = function(block) {
    var type = Blockly.CtPm.Procedures.returnShapeOf(block);
    if (type === Blockly.PROCEDURES_CALL_TYPE_STATEMENT || block.isInFlyout ||
        !block.workspace.procedureReturnsEnabled) {
      return null;
    }
    var toBoolean = type === Blockly.PROCEDURES_CALL_TYPE_REPORTER;
    return {
      enabled: true,
      text: toBoolean ? Blockly.Msg.CT_PM_PROCEDURES_TO_BOOLEAN : Blockly.Msg.CT_PM_PROCEDURES_TO_ROUND,
      callback: function() {
        Blockly.CtPm.Procedures.setReturnShape(block, toBoolean ?
            Blockly.PROCEDURES_CALL_TYPE_BOOLEAN : Blockly.PROCEDURES_CALL_TYPE_REPORTER);
      }
    };
  };
  var callMenu = Blockly.ScratchBlocks.VerticalExtensions.PROCEDURE_CALL_CONTEXTMENU.customContextMenu;
  Blockly.ScratchBlocks.VerticalExtensions.PROCEDURE_CALL_CONTEXTMENU.customContextMenu = function(menuOptions) {
    callMenu.call(this, menuOptions);
    if (!Blockly.Procedures.USER_CAN_CHANGE_CALL_TYPE) return;
    var option = shapeOption(this);
    if (option) menuOptions.push(option);
  };
  var defMenu = Blockly.ScratchBlocks.VerticalExtensions.PROCEDURE_DEF_CONTEXTMENU.customContextMenu;
  Blockly.ScratchBlocks.VerticalExtensions.PROCEDURE_DEF_CONTEXTMENU.customContextMenu = function(menuOptions) {
    defMenu.call(this, menuOptions);
    var option = shapeOption(this);
    if (option) menuOptions.push(option);
  };

  Blockly.Blocks['argument_reporter_local'].setShadow = function(shadow) {
    Object.getPrototypeOf(this).setShadow.call(this, shadow);
    this.setOutput(true, shadow ?
        [Blockly.CtPm.LOCAL_REF_CHECK, Blockly.CtPm.Procedures.LOCAL_DECL_CHECK] : Blockly.CtPm.LOCAL_REF_CHECK);
  };

  var scriptLocals = Blockly.Blocks['procedures_ct_locals'];
  var scriptLocalsInit = scriptLocals.init;
  scriptLocals.init = function() {
    scriptLocalsInit.call(this);
    this.ctLocals_ = [];
    var mixin = Blockly.CtPm.Procedures.ScriptLocals;
    for (var key in mixin) this[key] = mixin[key];
    Blockly.CtPm.ensureButtons(this);
  };
  Blockly.Blocks['procedures_definition'].mutationToDom = Blockly.CtPm.Procedures.DefinitionLocals.mutationToDom;
  Blockly.Blocks['procedures_definition'].domToMutation = Blockly.CtPm.Procedures.DefinitionLocals.domToMutation;
  var declaration = Blockly.Blocks['procedures_declaration'];
  var declarationInit = declaration.init;
  declaration.init = function() {
    declarationInit.call(this);
    Blockly.CtPm.Procedures.initDeclarationLocals(this);
  };
  var declarationToDom = declaration.mutationToDom;
  declaration.mutationToDom = function() {
    var container = declarationToDom.apply(this, arguments);
    if (container && this.ctLocalsKnown_) container.setAttribute('ctlocals', JSON.stringify(this.ctLocals_ || []));
    return container;
  };
  var declarationFromDom = declaration.domToMutation;
  declaration.domToMutation = function(xmlElement) {
    this.ctLocalsKnown_ = xmlElement.hasAttribute('ctlocals');
    this.ctLocals_ = Blockly.CtPm.Procedures.parseLocals(xmlElement.getAttribute('ctlocals'));
    return declarationFromDom.apply(this, arguments);
  };
  declaration.ctPmAfterInputs_ = Blockly.CtPm.Procedures.declarationAfterInputs;
  declaration.addLocalExternal = Blockly.CtPm.Procedures.addLocalExternal;

  Blockly.Blocks['argument_reporter_command'].setShadow = function(shadow) {
    Object.getPrototypeOf(this).setShadow.call(this, shadow);
    Blockly.CtPm.Procedures.setReporterConnections(this, shadow);
  };
  /**
   * The Make a Block editor's name field for a local variable, in the {} shape of its reporter.
   */
  Blockly.Blocks['argument_editor_local'] = {
    init: function() {
      this.jsonInit({
        "message0": " %1",
        "args0": [{"type": "field_input_removable", "name": "TEXT", "text": "local"}],
        "output": Blockly.CtPm.LOCAL_REF_CHECK,
        "colour": Blockly.Colours.textField,
        "colourSecondary": Blockly.Colours.textField,
        "colourTertiary": Blockly.Colours.textField,
        "colourQuaternary": Blockly.Colours.textField
      });
    },
    removeFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.removeArgumentCallback_
  };
  Blockly.Blocks['procedures_declaration'].addBranchExternal = Blockly.CtPm.Procedures.addBranchExternal;
  Blockly.Blocks['procedures_declaration'].setColourExternal = Blockly.CtPm.Procedures.setColourExternal;
  Blockly.Blocks['procedures_declaration'].getColourExternal = Blockly.CtPm.Procedures.getColourExternal;
})();

(function() {
  Blockly.Blocks['procedures_prototype'].setParent = function(newParent) {
    Object.getPrototypeOf(this).setParent.call(this, newParent);
    if (newParent && this.ctPmColour_) Blockly.CtPm.Procedures.applyColour(this);
  };

  /**
   * Argument reporters carry the colour of their custom block in their own mutation.
   */
  var reporterColour = {
    mutationToDom: function() {
      if (!this.ctPmColourAttr_) return null;
      var container = document.createElement('mutation');
      Blockly.CtPm.Procedures.colourToDom(this, container);
      return container;
    },
    domToMutation: function(xmlElement) {
      Blockly.CtPm.Procedures.colourFromDom(this, xmlElement);
      var colour = this.ctPmColour_;
      if (colour) this.setColour(colour[0], colour[1], colour[2]);
    }
  };
  ['argument_reporter_string_number', 'argument_reporter_boolean', 'argument_reporter_command'].forEach(function(type) {
    Blockly.Blocks[type].mutationToDom = reporterColour.mutationToDom;
    Blockly.Blocks[type].domToMutation = reporterColour.domToMutation;
  });
})();
