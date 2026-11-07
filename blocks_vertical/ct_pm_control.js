/**
 * @fileoverview Advanced.
 */
'use strict';

goog.provide('Blockly.Blocks.ctPmControl');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');

(function() {
  var arg = Blockly.CtPm.arg;
  var json = Blockly.CtPm.json;
  var msg = Blockly.CtPm.msg;
  var CONTROL = ["colours_control", "shape_statement"];
  var CONTROL_END = ["colours_control", "shape_end"];
  var CASE = Blockly.CtPm.SWITCH_CASE_CHECK;

  /**
   * A C-block.
   * @param {string} key Message key of the first row
   * @param {!Array.<!Object>} args Args of the first row
   * @param {string} branch Statement input name
   * @param {boolean} loopIcon loopIcon
   * @return {!Object} Block JSON
   */
  var cBlock = function(key, args, branch, loopIcon) {
    var block = {
      "message0": msg(key),
      "args0": args,
      "message1": "%1",
      "args1": [arg.statement(branch)],
      "extensions": CONTROL
    };
    if (loopIcon) {
      block["message2"] = "%1";
      block["args2"] = [arg.image("repeat.svg", "*")];
      block["lastDummyAlign2"] = "RIGHT";
    }
    return block;
  };

  /**
   * The sprite-menu shadows.
   * @param {string} name Field name
   * @param {!Array.<!Array.<string>>} options Static options
   * @return {function(): !Object} JSON factory
   */
  var spriteMenu = function(name, options) {
    return function() {
      return {
        "message0": "%1",
        "args0": [arg.dropdown(name, options)],
        "extensions": ["colours_control", "output_string"]
      };
    };
  };

  Blockly.CtPm.defineBlocks({
    'control_delete_clones_of': function() {
      return json('CT_PM_CONTROL_DELETECLONESOF', [arg.value('CLONE_OPTION')], CONTROL);
    },
    'control_is_clone': function() {
      return json('CT_PM_CONTROL_ISCLONE', [], ["colours_control", "output_boolean"]);
    },
    'control_if_return_else_return': function() {
      return json('CT_PM_CONTROL_IFRETURNELSERETURN',
          [arg.value('boolean', 'Boolean'), arg.value('TEXT1'), arg.value('TEXT2')],
          ["colours_control"], {"output": null, "outputShape": Blockly.OUTPUT_SHAPE_ROUND});
    },
    'control_switch': function() {
      return {
        "message0": msg('CT_PM_CONTROL_SWITCH'),
        "args0": [arg.value('CONDITION')],
        "message1": "%1",
        "args1": [arg.statement('SUBSTACK', CASE)],
        "extensions": CONTROL
      };
    },
    'control_switch_default': function() {
      return {
        "message0": msg('CT_PM_CONTROL_SWITCH'),
        "args0": [arg.value('CONDITION')],
        "message1": "%1",
        "args1": [arg.statement('SUBSTACK1', CASE)],
        "message2": msg('CT_PM_CONTROL_DEFAULT'),
        "message3": "%1",
        "args3": [arg.statement('SUBSTACK2')],
        "extensions": CONTROL
      };
    },
    'control_case': function() {
      return {
        "message0": msg('CT_PM_CONTROL_CASE'),
        "args0": [arg.value('CONDITION')],
        "message1": "%1",
        "args1": [arg.statement('SUBSTACK')],
        "previousStatement": CASE,
        "nextStatement": CASE,
        "extensions": ["colours_control"]
      };
    },
    'control_case_next': function() {
      return json('CT_PM_CONTROL_CASENEXT', [arg.value('CONDITION')], ["colours_control"],
          {"previousStatement": CASE, "nextStatement": CASE});
    },
    'control_exitCase': function() {
      return json('CT_PM_CONTROL_EXITCASE', [], CONTROL_END);
    },
    'control_backToGreenFlag': function() {
      return json('CT_PM_CONTROL_BACKTOGREENFLAG', [arg.image("green-flag.svg", "flag")], CONTROL);
    },
    'control_run_as_sprite': function() {
      return cBlock('CT_PM_CONTROL_RUNASSPRITE', [arg.value('RUN_AS_OPTION')], 'SUBSTACK', false);
    },
    'control_run_as_sprite_menu': spriteMenu('RUN_AS_OPTION', [['@SENSING_OF_STAGE', '_stage_']]),
    'control_stop_sprite': function() {
      return json('CT_PM_CONTROL_STOPSPRITE', [arg.value('STOP_OPTION')], CONTROL);
    },
    'control_stop_sprite_menu': spriteMenu('STOP_OPTION', [['@SENSING_OF_STAGE', '_stage_']]),
    'control_waitsecondsoruntil': function() {
      return json('CT_PM_CONTROL_WAITSECONDSORUNTIL',
          [arg.value('DURATION'), arg.value('CONDITION', 'Boolean')], CONTROL);
    },
    'control_continueLoop': function() {
      return json('CT_PM_CONTROL_CONTINUELOOP', [], CONTROL_END);
    },
    'control_repeatForSeconds': function() {
      return cBlock('CT_PM_CONTROL_REPEATFORSECONDS', [arg.value('TIMES')], 'SUBSTACK', true);
    },
    'control_try_catch': function() {
      return {
        "message0": msg('CT_PM_CONTROL_TRY'),
        "message1": "%1",
        "args1": [arg.statement('SUBSTACK')],
        "message2": msg('CT_PM_CONTROL_CATCH'),
        "message3": "%1",
        "args3": [arg.statement('SUBSTACK2')],
        "extensions": CONTROL
      };
    },
    'control_throw_error': function() {
      return json('CT_PM_CONTROL_THROWERROR', [arg.value('ERROR')], CONTROL_END);
    },
    'control_error': function() {
      return json('CT_PM_CONTROL_ERROR', [], ["colours_control", "output_string"]);
    },
    'control_inline_stack_output': function() {
      return {
        "message0": msg('CT_PM_CONTROL_INLINESTACKOUTPUT'),
        "message1": "%1",
        "args1": [arg.statement('SUBSTACK')],
        "output": null,
        "outputShape": Blockly.OUTPUT_SHAPE_SQUARE,
        "extensions": ["colours_control"]
      };
    },
    'control_waittick': function() {
      return json('CT_PM_CONTROL_WAITTICK', [], CONTROL);
    },
    'control_from_to': function() {
      return cBlock('CT_PM_CONTROL_FROMTO', [arg.value('SHADOW'), arg.value('FROM'), arg.value('TO')],
          'SUBSTACK', true);
    },
    'control_from_to_index': function() {
      return json('CT_PM_CONTROL_FROMTOINDEX', [], ["colours_control", "output_number"]);
    },
    'control_new_script': function() {
      return cBlock('CT_PM_CONTROL_NEWSCRIPT', [], 'SUBSTACK', false);
    },
    'control_set_counter': function() {
      return json('CT_PM_CONTROL_SETCOUNTER', [arg.value('VALUE')], CONTROL);
    },
    'control_decr_counter': function() {
      return json('CT_PM_CONTROL_DECRCOUNTER', [], CONTROL);
    },
    'control_javascript_command': function() {
      return json('CT_PM_JAVASCRIPT', [arg.value('JS')], CONTROL);
    },
    'control_dualblock': function() {
      return json('CT_PM_UNSUPPORTED', [], CONTROL);
    },
    'your_mom': function() {
      return json('CT_PM_UNSUPPORTED', [], CONTROL);
    },

    'event_whenstopclicked': function() {
      return json('CT_PM_EVENT_WHENSTOPCLICKED', [arg.image("icons/control_stop.svg", "stop")],
          ["colours_event", "shape_hat"]);
    },
    'event_whenanything': function() {
      return json('CT_PM_EVENT_WHENANYTHING', [arg.value('ANYTHING', 'Boolean')], ["colours_event", "shape_hat"]);
    },
    'event_always': function() {
      return json('CT_PM_EVENT_ALWAYS', [], ["colours_event", "shape_hat"]);
    },
    'event_whenkeyhit': function() {
      return json('CT_PM_EVENT_WHENKEYHIT', [arg.dropdown('KEY_OPTION', Blockly.CtPm.keyOptions())],
          ["colours_event", "shape_hat"]);
    },
    'event_whenmousescrolled': function() {
      return json('CT_PM_EVENT_WHENMOUSESCROLLED',
          [arg.dropdown('KEY_OPTION', [['@CT_PM_UP', 'up'], ['@CT_PM_DOWN', 'down']])],
          ["colours_event", "shape_hat"]);
    },
    'event_whenjavascript': function() {
      return json('CT_PM_EVENT_WHENJAVASCRIPT', [arg.value('JS')], ["colours_event", "shape_hat"]);
    }
  });

  /**
   * The key list of "when key pressed", for "when key hit".
   * @return {!Array.<!Array.<string>>} Dropdown options
   */
  Blockly.CtPm.keyOptions = function() {
    var options = [
      ['@EVENT_WHENKEYPRESSED_SPACE', 'space'],
      ['@EVENT_WHENKEYPRESSED_UP', 'up arrow'],
      ['@EVENT_WHENKEYPRESSED_DOWN', 'down arrow'],
      ['@EVENT_WHENKEYPRESSED_RIGHT', 'right arrow'],
      ['@EVENT_WHENKEYPRESSED_LEFT', 'left arrow'],
      ['@EVENT_WHENKEYPRESSED_ANY', 'any']
    ];
    var keys = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < keys.length; i++) {
      options.push([keys.charAt(i), keys.charAt(i)]);
    }
    return options;
  };

  Blockly.Blocks['control_expandableIf'] = {
    init: function() {
      this.jsonInit({
        "category": Blockly.Categories.control,
        "extensions": CONTROL
      });
      this.ctPmBranches_ = 0;
      this.ctPmElse_ = false;
      this.ctPmApplyState_({branches: 1, endsInElse: false});
    },

    mutationToDom: function() {
      var container = document.createElement('mutation');
      container.setAttribute('branches', String(this.ctPmBranches_));
      container.setAttribute('ends-in-else', String(this.ctPmElse_));
      return container;
    },

    domToMutation: function(xmlElement) {
      var branches = parseInt(xmlElement.getAttribute('branches'), 10);
      var endsInElse = xmlElement.getAttribute('ends-in-else') === 'true';
      if (isNaN(branches) || branches < 1) branches = 1;
      if (branches < 2) endsInElse = false;
      this.ctPmApplyState_({branches: branches, endsInElse: endsInElse});
      Blockly.CtPm.rerender_(this);
    },

    ctPmGetState_: function() {
      return {branches: this.ctPmBranches_, endsInElse: this.ctPmElse_};
    },

    ctPmNextState_: function(isAdding) {
      var n = this.ctPmBranches_;
      if (isAdding) {
        return this.ctPmElse_ ? {branches: n, endsInElse: false} : {branches: n + 1, endsInElse: true};
      }
      if (n <= 1) return null;
      return {branches: n - 1, endsInElse: false};
    },

    /**
     * @param {!Object} state state
     * @return {!Array.<string>} Names of the inputs this block has in that state, in order
     * @this Blockly.Block
     */
    ctPmInputNames_: function(state) {
      var names = [];
      var conditions = state.endsInElse ? state.branches - 1 : state.branches;
      for (var i = 1; i <= conditions; i++) {
        names.push('BOOL' + i, 'CT_PM_THEN' + i, 'SUBSTACK' + i);
      }
      if (state.endsInElse) {
        names.push('CT_PM_ELSE', 'SUBSTACK' + state.branches);
      }
      names.push('CT_PM_BUTTONS');
      return names;
    },

    ctPmRemovedInputs_: function(state) {
      var keep = this.ctPmInputNames_(state);
      var removed = [];
      for (var i = 0, input; input = this.inputList[i]; i++) {
        if (keep.indexOf(input.name) === -1) removed.push(input.name);
      }
      return removed;
    },

    ctPmApplyState_: function(state) {
      var names = this.ctPmInputNames_(state);
      for (var i = this.inputList.length - 1; i >= 0; i--) {
        var name = this.inputList[i].name;
        if (names.indexOf(name) === -1) {
          Blockly.CtPm.emptyInput_(this.inputList[i]);
          this.removeInput(name);
        }
      }
      var ifParts = msg('CONTROL_IF').split('%1');
      var elseIfParts = msg('CT_PM_CONTROL_ELSEIF').split('%1');
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        var input = this.getInput(name);
        if (name.indexOf('BOOL') === 0) {
          var parts = name === 'BOOL1' ? ifParts : elseIfParts;
          if (!input) {
            input = this.appendValueInput(name).setCheck('Boolean');
            input.appendField(parts[0].trim(), 'CT_PM_IF_LABEL');
          }
        } else if (name.indexOf('CT_PM_THEN') === 0) {
          var then = (name === 'CT_PM_THEN1' ? ifParts : elseIfParts)[1] || '';
          if (!input) this.appendDummyInput(name).appendField(then.trim());
        } else if (name.indexOf('SUBSTACK') === 0) {
          if (!input) this.appendStatementInput(name);
        } else if (name === 'CT_PM_ELSE') {
          if (!input) this.appendDummyInput(name).appendField(msg('CONTROL_ELSE'));
        }
      }
      Blockly.CtPm.ensureButtons(this, Blockly.ALIGN_RIGHT);
      var order = {};
      for (var i = 0; i < names.length; i++) order[names[i]] = i;
      this.inputList.sort(function(a, b) {
        return order[a.name] - order[b.name];
      });
      this.ctPmBranches_ = state.branches;
      this.ctPmElse_ = state.endsInElse;
    },

    ctPmFillInputs_: function(oldState, state) {
      var conditions = state.endsInElse ? state.branches - 1 : state.branches;
      for (var i = 1; i <= conditions; i++) {
        Blockly.CtPm.fillShadow(this, 'BOOL' + i, 'checkbox');
      }
    },

    ctPmOnExpandButton_: function(isAdding) {
      Blockly.CtPm.onExpandButton(this, isAdding);
    }
  };

  Blockly.CtPm.defineBlocks({
    'control_exitLoop': function() {
      return json('CT_PM_CONTROL_EXITLOOP', [], CONTROL_END);
    }
  });
  var exitLoop = Blockly.Blocks['control_exitLoop'];
  /**
   * After a move/delete, update the forever this block left and the one it's now in.
   * @param {!Blockly.Events.Abstract} e The event
   * @this Blockly.Block
   */
  exitLoop.onchange = function(e) {
    if (!this.workspace || this.isInFlyout || this.isInsertionMarker() || !e.recordUndo ||
        (e.type !== Blockly.Events.BLOCK_MOVE && e.type !== Blockly.Events.BLOCK_CREATE)) {
      return;
    }
    var loop = Blockly.CtPm.enclosingLoop(this);
    var forever = loop && loop.type === 'control_forever' ? loop : null;
    var previous = this.ctPmForever_;
    this.ctPmForever_ = forever;
    if (previous && previous !== forever) {
      Blockly.CtPm.updateForeverBreak(previous, e.group);
    }
    if (forever) {
      Blockly.CtPm.updateForeverBreak(forever, e.group);
    }
  };
})();
