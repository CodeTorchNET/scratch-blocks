/**
 * @fileoverview Advanced.
 */
'use strict';

goog.provide('Blockly.Blocks.ctPmSensingOperators');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');

(function() {
  var arg = Blockly.CtPm.arg;
  var json = Blockly.CtPm.json;
  var SENSING = ["colours_sensing", "shape_statement"];
  var S_BOOL = ["colours_sensing", "output_boolean"];
  var S_NUM = ["colours_sensing", "output_number"];
  var S_STR = ["colours_sensing", "output_string"];
  var O_BOOL = ["colours_operators", "output_boolean"];
  var O_NUM = ["colours_operators", "output_number"];
  var O_STR = ["colours_operators", "output_string"];
  var LISTS = ["colours_data_lists", "shape_statement"];
  var monitor = {"checkboxInFlyout": true};
  var LIST = Blockly.LIST_VARIABLE_TYPE;

  var menu = function(name, options, colours) {
    return function() {
      return {"message0": "%1", "args0": [arg.dropdown(name, options)], "extensions": [colours, "output_string"]};
    };
  };
  var binary = function(key, extensions, check) {
    return function() {
      return json(key, [arg.value('OPERAND1', check), arg.value('OPERAND2', check)], extensions);
    };
  };

  Blockly.CtPm.defineBlocks({
    'sensing_fulltouchingobjectmenu': menu('FULLTOUCHINGOBJECTMENU', [
      ['@SENSING_TOUCHINGOBJECT_POINTER', '_mouse_'],
      ['@SENSING_TOUCHINGOBJECT_EDGE', '_edge_'],
      ['@CT_PM_THISSPRITE', '_myself_']
    ], 'colours_sensing'),
    'sensing_touchingobjectmenusprites': menu('SPRITETOUCHINGOBJECTMENU',
        [['@CT_PM_THISSPRITE', '_myself_']], 'colours_sensing'),
    'sensing_objecttouchingobject': function() {
      return json('CT_PM_SENSING_OBJECTTOUCHINGOBJECT',
          [arg.value('FULLTOUCHINGOBJECTMENU'), arg.value('SPRITETOUCHINGOBJECTMENU')], S_BOOL);
    },
    'sensing_objecttouchingclonesprite': function() {
      return json('CT_PM_SENSING_OBJECTTOUCHINGCLONESPRITE',
          [arg.value('FULLTOUCHINGOBJECTMENU'), arg.value('SPRITETOUCHINGOBJECTMENU')], S_BOOL);
    },
    'sensing_keyhit': function() {
      return json('CT_PM_SENSING_KEYHIT', [arg.value('KEY_OPTION')], S_BOOL);
    },
    'sensing_mousescrolling': function() {
      return json('CT_PM_SENSING_MOUSESCROLLING', [arg.value('SCROLL_OPTION')], S_BOOL);
    },
    'sensing_scrolldirections': menu('SCROLL_OPTION', [['@CT_PM_UP', 'up'], ['@CT_PM_DOWN', 'down']],
        'colours_sensing'),
    'sensing_mouseclicked': function() {
      return json('CT_PM_SENSING_MOUSECLICKED', [], S_BOOL, monitor);
    },
    'sensing_fingeroptions': menu('FINGER_OPTION', [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']],
        'colours_sensing'),
    'sensing_fingerdown': function() {
      return json('CT_PM_SENSING_FINGERDOWN', [arg.value('FINGER_OPTION')], S_BOOL);
    },
    'sensing_fingertapped': function() {
      return json('CT_PM_SENSING_FINGERTAPPED', [arg.value('FINGER_OPTION')], S_BOOL);
    },
    'sensing_fingerx': function() {
      return json('CT_PM_SENSING_FINGERX', [arg.value('FINGER_OPTION')], S_NUM);
    },
    'sensing_fingery': function() {
      return json('CT_PM_SENSING_FINGERY', [arg.value('FINGER_OPTION')], S_NUM);
    },
    'sensing_setclipboard': function() {
      return json('CT_PM_SENSING_SETCLIPBOARD', [arg.value('ITEM')], SENSING);
    },
    'sensing_getclipboard': function() {
      return json('CT_PM_SENSING_GETCLIPBOARD', [], S_STR, monitor);
    },
    'sensing_getdragmode': function() {
      return json('CT_PM_SENSING_GETDRAGMODE', [], S_BOOL, monitor);
    },
    'sensing_set_of': function() {
      return json('CT_PM_SENSING_SETOF', [arg.dropdown('PROPERTY', [
        ['@SENSING_OF_XPOSITION', 'x position'],
        ['@SENSING_OF_YPOSITION', 'y position'],
        ['@SENSING_OF_DIRECTION', 'direction'],
        ['@CT_PM_SENSING_SETOF_COSTUME', 'costume'],
        ['@SENSING_OF_SIZE', 'size'],
        ['@SENSING_OF_VOLUME', 'volume'],
        ['@CT_PM_SENSING_SETOF_BACKDROP', 'backdrop']
      ]), arg.value('OBJECT'), arg.value('VALUE')], SENSING);
    },
    'sensing_loggedin': function() {
      return json('CT_PM_SENSING_LOGGEDIN', [], S_BOOL, monitor);
    },
    'sensing_regextest': function() {
      return json('CT_PM_SENSING_REGEXTEST', [arg.value('reg'), arg.value('regrule'), arg.value('text')], S_BOOL);
    },
    'sensing_thing_is_number': function() {
      return json('CT_PM_SENSING_THINGISNUMBER', [arg.value('TEXT1')], S_BOOL);
    },
    'sensing_thing_is_text': function() {
      return json('CT_PM_SENSING_THINGISTEXT', [arg.value('TEXT1')], S_BOOL);
    },
    'sensing_thing_has_number': function() {
      return json('CT_PM_SENSING_THINGHASNUMBER', [arg.value('TEXT1')], S_BOOL);
    },
    'sensing_mobile': function() {
      return json('CT_PM_SENSING_MOBILE', [], S_BOOL);
    },
    'sensing_isUpperCase': function() {
      return json('CT_PM_SENSING_ISUPPERCASE', [arg.value('text')], S_BOOL);
    },
    'sensing_getspritewithattrib': function() {
      return json('CT_PM_SENSING_GETSPRITEWITHATTRIB', [arg.value('var'), arg.value('val')], S_STR);
    },
    'sensing_distanceTo': function() {
      return json('CT_PM_SENSING_DISTANCETO',
          [arg.value('x1'), arg.value('y1'), arg.value('x2'), arg.value('y2')], S_NUM);
    },
    'sensing_directionTo': function() {
      return json('CT_PM_SENSING_DIRECTIONTO',
          [arg.value('x2'), arg.value('y2'), arg.value('x1'), arg.value('y1')], S_NUM);
    },
    'sensing_getoperatingsystem': function() {
      return json('CT_PM_SENSING_GETOPERATINGSYSTEM', [], S_STR);
    },
    'sensing_getbrowser': function() {
      return json('CT_PM_SENSING_GETBROWSER', [], S_STR);
    },
    'sensing_geturl': function() {
      return json('CT_PM_SENSING_GETURL', [], S_STR);
    },
    'sensing_getxyoftouchingsprite': function() {
      return json('CT_PM_SENSING_GETXYOFTOUCHINGSPRITE',
          [arg.dropdown('XY', [['x', 'x'], ['y', 'y']]), arg.value('SPRITE')], S_NUM);
    },

    'operator_gtorequal': binary('CT_PM_OPERATORS_GTOREQUAL', O_BOOL),
    'operator_ltorequal': binary('CT_PM_OPERATORS_LTOREQUAL', O_BOOL),
    'operator_notequal': binary('CT_PM_OPERATORS_NOTEQUAL', O_BOOL),
    'operator_nand': binary('CT_PM_OPERATORS_NAND', O_BOOL, 'Boolean'),
    'operator_nor': binary('CT_PM_OPERATORS_NOR', O_BOOL, 'Boolean'),
    'operator_xor': binary('CT_PM_OPERATORS_XOR', O_BOOL, 'Boolean'),
    'operator_xnor': binary('CT_PM_OPERATORS_XNOR', O_BOOL, 'Boolean'),
    'operator_trueBoolean': function() {
      return json('CT_PM_OPERATORS_TRUE', [], O_BOOL);
    },
    'operator_falseBoolean': function() {
      return json('CT_PM_OPERATORS_FALSE', [], O_BOOL);
    },
    'operator_randomBoolean': function() {
      return json('CT_PM_OPERATORS_RANDOMBOOLEAN', [], O_BOOL);
    },
    'operator_checkboxBoolean': function() {
      return json('CT_PM_PLAIN', [{"type": "field_ct_pm_checkbox", "name": "CHECKBOX"}], O_BOOL);
    },
    'operator_boolify': function() {
      return json('CT_PM_OPERATORS_BOOLIFY', [arg.value('ONE')], O_BOOL);
    },
    'operator_stringify': function() {
      return json('CT_PM_OPERATORS_STRINGIFY', [arg.value('ONE')], O_STR);
    },
    'operator_textIncludesLetterFrom': function() {
      return json('CT_PM_OPERATORS_TEXTINCLUDESLETTERFROM', [arg.value('TEXT1'), arg.value('TEXT2')], O_BOOL);
    },
    'operator_textStartsOrEndsWith': function() {
      return json('CT_PM_OPERATORS_TEXTSTARTSORENDSWITH', [
        arg.value('TEXT1'),
        arg.dropdown('OPTION', [['@CT_PM_OPERATORS_STARTS', 'starts'], ['@CT_PM_OPERATORS_ENDS', 'ends']]),
        arg.value('TEXT2')
      ], O_BOOL);
    },
    'operator_join3': function() {
      return json('CT_PM_OPERATORS_JOIN3', [arg.value('STRING1'), arg.value('STRING2'), arg.value('STRING3')], O_STR);
    },
    'operator_advlog': function() {
      return json('CT_PM_OPERATORS_ADVLOG', [arg.value('NUM1'), arg.value('NUM2')], O_NUM);
    },
    'operator_regexmatch': function() {
      return json('CT_PM_OPERATORS_REGEXMATCH', [arg.value('text'), arg.value('reg'), arg.value('regrule')], O_STR);
    },
    'operator_replaceAll': function() {
      return json('CT_PM_OPERATORS_REPLACEALL', [arg.value('text'), arg.value('term'), arg.value('res')], O_STR);
    },
    'operator_replaceFirst': function() {
      return json('CT_PM_OPERATORS_REPLACEFIRST', [arg.value('text'), arg.value('term'), arg.value('res')], O_STR);
    },
    'operator_getLettersFromIndexToIndexInText': function() {
      return json('CT_PM_OPERATORS_LETTERSFROMUPTOBEFORE',
          [arg.value('INDEX1'), arg.value('INDEX2'), arg.value('TEXT')], O_STR);
    },
    'operator_getLettersFromIndexToIndexInTextFixed': function() {
      return json('CT_PM_OPERATORS_LETTERSFROMTOIN',
          [arg.value('INDEX1'), arg.value('INDEX2'), arg.value('TEXT')], O_STR);
    },
    'operator_readLineInMultilineText': function() {
      return json('CT_PM_OPERATORS_READLINE', [arg.value('LINE'), arg.value('TEXT')], O_STR);
    },
    'operator_newLine': function() {
      return json('CT_PM_OPERATORS_NEWLINE', [], O_STR);
    },
    'operator_tabCharacter': function() {
      return json('CT_PM_OPERATORS_TAB', [], O_STR);
    },
    'operator_character_to_code': function() {
      return json('CT_PM_OPERATORS_CHARTOCODE', [arg.value('ONE')], O_NUM);
    },
    'operator_code_to_character': function() {
      return json('CT_PM_OPERATORS_CODETOCHAR', [arg.value('ONE')], O_STR);
    },
    'operator_lerpFunc': function() {
      return json('CT_PM_OPERATORS_LERP', [arg.value('ONE'), arg.value('TWO'), arg.value('AMOUNT')], O_NUM);
    },
    'operator_advMath': function() {
      return json('CT_PM_PLAIN3', [
        arg.value('ONE'),
        arg.dropdown('OPTION', [['^', '^'], ['@CT_PM_OPERATORS_ROOT', 'root'], ['@CT_PM_OPERATORS_LOG', 'log']]),
        arg.value('TWO')
      ], O_NUM);
    },
    'operator_advMathExpanded': function() {
      return json('CT_PM_OPERATORS_ADVMATHEXPANDED', [
        arg.value('ONE'),
        arg.value('TWO'),
        arg.dropdown('OPTION', [['@CT_PM_OPERATORS_ROOT', 'root'], ['@CT_PM_OPERATORS_LOG', 'log']]),
        arg.value('THREE')
      ], O_NUM);
    },
    'operator_power': function() {
      return json('CT_PM_OPERATORS_POWER', [arg.value('NUM1'), arg.value('NUM2')], O_NUM);
    },
    'operator_constrainnumber': function() {
      return json('CT_PM_OPERATORS_CONSTRAIN', [arg.value('inp'), arg.value('min'), arg.value('max')], O_NUM);
    },
    'operator_indexOfTextInText': function() {
      return json('CT_PM_OPERATORS_INDEXOF', [arg.value('TEXT1'), arg.value('TEXT2')], O_NUM);
    },
    'operator_lastIndexOfTextInText': function() {
      return json('CT_PM_OPERATORS_LASTINDEXOF', [arg.value('TEXT1'), arg.value('TEXT2')], O_NUM);
    },
    'operator_countAppearTimes': function() {
      return json('CT_PM_OPERATORS_COUNTAPPEARTIMES', [arg.value('TEXT1'), arg.value('TEXT2')], O_NUM);
    },
    'operator_toUpperLowerCase': function() {
      return json('CT_PM_OPERATORS_TOUPPERLOWER', [
        arg.value('TEXT'),
        arg.dropdown('OPTION', [['@CT_PM_OPERATORS_UPPERCASE', 'upper'], ['@CT_PM_OPERATORS_LOWERCASE', 'lower']])
      ], O_STR);
    },
    'operator_javascript_output': function() {
      return json('CT_PM_JAVASCRIPT', [arg.value('JS')], O_STR);
    },
    'operator_javascript_boolean': function() {
      return json('CT_PM_JAVASCRIPT', [arg.value('JS')], O_BOOL);
    },

    'data_shiftlist': function() {
      return json('CT_PM_DATA_SHIFTLIST', [arg.variable('LIST', [LIST]), arg.value('INDEX')], LISTS);
    },
    'data_reverselist': function() {
      return json('CT_PM_DATA_REVERSELIST', [arg.variable('LIST', [LIST])], LISTS);
    },
    'data_arraylist': function() {
      return json('CT_PM_DATA_ARRAYLIST', [arg.variable('LIST', [LIST]), arg.value('VALUE')], LISTS);
    },
    'data_filterlist': function() {
      return json('CT_PM_DATA_FILTERLIST', [
        arg.variable('LIST', [LIST]), arg.value('INDEX'), arg.value('ITEM'), arg.value('BOOL', 'Boolean')
      ], LISTS);
    },
    'data_filterlistitem': function() {
      return json('CT_PM_DATA_FILTERLISTITEM', [], ["colours_data_lists", "output_string"]);
    },
    'data_filterlistindex': function() {
      return json('CT_PM_DATA_FILTERLISTINDEX', [], ["colours_data_lists", "output_number"]);
    },
    'data_itemexistslist': function() {
      return json('CT_PM_DATA_ITEMEXISTSLIST', [arg.value('INDEX'), arg.variable('LIST', [LIST])],
          ["colours_data_lists", "output_boolean"]);
    },
    'data_listisempty': function() {
      return json('CT_PM_DATA_LISTISEMPTY', [arg.variable('LIST', [LIST])], ["colours_data_lists", "output_boolean"]);
    },
    'data_listarray': function() {
      return json('CT_PM_DATA_LISTARRAY', [arg.variable('LIST', [LIST])], ["colours_data_lists", "output_string"]);
    },
    'data_amountinlist': function() {
      return json('CT_PM_DATA_AMOUNTINLIST', [arg.value('VALUE'), arg.variable('LIST', [LIST])],
          ["colours_data_lists", "output_number"]);
    },
    'data_listforeachitem': function() {
      return {
        "message0": Blockly.CtPm.msg('CT_PM_DATA_LISTFOREACHITEM'),
        "args0": [arg.variable('VARIABLE', ['']), arg.variable('LIST', [LIST])],
        "message1": "%1",
        "args1": [arg.statement('SUBSTACK')],
        "message2": "%1",
        "args2": [arg.image("repeat.svg", "*")],
        "lastDummyAlign2": "RIGHT",
        "extensions": LISTS
      };
    },
    'data_listforeachnum': function() {
      return {
        "message0": Blockly.CtPm.msg('CT_PM_DATA_LISTFOREACHNUM'),
        "args0": [arg.variable('VARIABLE', ['']), arg.variable('LIST', [LIST])],
        "message1": "%1",
        "args1": [arg.statement('SUBSTACK')],
        "message2": "%1",
        "args2": [arg.image("repeat.svg", "*")],
        "lastDummyAlign2": "RIGHT",
        "extensions": LISTS
      };
    },

    'procedures_definition_return': function() {
      return {
        "message0": Blockly.CtPm.msg('PROCEDURES_DEFINITION'),
        "args0": [arg.statement('custom_block')],
        "extensions": ["colours_more", "shape_hat", "procedure_def_contextmenu"]
      };
    },
    'procedures_set': function() {
      return json('CT_PM_PROCEDURES_SET', [arg.value('PARAM'), arg.value('VALUE')],
          ["colours_more", "shape_statement"]);
    },
    'argument_reporter_command': function() {
      return json('CT_PM_PLAIN', [{"type": "field_label_serializable", "name": "VALUE", "text": ""}],
          ["colours_more", "shape_statement"]);
    },

    'argument_reporter_local': function() {
      return json('CT_PM_PLAIN', [{"type": "field_label_serializable", "name": "VALUE", "text": ""}],
          ["colours_more"], {"output": Blockly.CtPm.LOCAL_REF_CHECK});
    },
    'procedures_ct_setlocal': function() {
      return json('CT_PM_PROCEDURES_SETLOCAL',
          [arg.value('PARAM', Blockly.CtPm.LOCAL_REF_CHECK), arg.value('VALUE')],
          ["colours_more", "shape_statement"]);
    },
    'procedures_ct_changelocal': function() {
      return json('CT_PM_PROCEDURES_CHANGELOCAL',
          [arg.value('PARAM', Blockly.CtPm.LOCAL_REF_CHECK), arg.value('VALUE')],
          ["colours_more", "shape_statement"]);
    }
  });

  Blockly.Blocks['operator_expandablejoininputs'] = Blockly.CtPm.makeExpandableOperator({
    prefix: 'INPUT',
    label: function() {
      return Blockly.CtPm.msg('CT_PM_OPERATORS_JOINLABEL');
    },
    output: 'output_string',
    shadow: function(i) {
      var words = ['OPERATORS_JOIN_APPLE', 'OPERATORS_JOIN_BANANA'];
      return ['text', 'TEXT', i <= words.length ? Blockly.CtPm.msg(words[i - 1]) : ''];
    }
  });
  Blockly.Blocks['operator_expandableMath'] = Blockly.CtPm.makeExpandableOperator({
    prefix: 'NUM',
    output: 'output_number',
    ops: [['+', '+'], ['-', '-'], ['*', '*'], ['/', '/'], ['^', '^']],
    defaultOp: '+',
    shadow: function() {
      return ['math_number', 'NUM', ''];
    }
  });
  Blockly.Blocks['operator_expandableBool'] = Blockly.CtPm.makeExpandableOperator({
    prefix: 'BOOL',
    output: 'output_boolean',
    check: 'Boolean',
    ops: [['@CT_PM_OP_AND', 'a'], ['@CT_PM_OP_OR', 'o'], ['@CT_PM_OP_XOR', 'x'], ['@CT_PM_OP_NAND', 'n'],
      ['@CT_PM_OP_NOR', 'N'], ['@CT_PM_OP_XNOR', 'X']],
    defaultOp: 'a',
    optimizeAttribute: true,
    shadow: function() {
      return ['checkbox'];
    }
  });
  Blockly.Blocks['operator_expandableCompare'] = Blockly.CtPm.makeExpandableOperator({
    prefix: 'INPUT',
    output: 'output_boolean',
    ops: [['>', 'm'], ['≥', 'M'], ['<', 'l'], ['≤', 'L'], ['=', 'e'], ['===', 'E'], ['≠', 'n']],
    defaultOp: 'm',
    shadow: function() {
      return ['text', 'TEXT', ''];
    }
  });
})();
