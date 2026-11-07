/**
 * @fileoverview Advanced blocks.
 */
'use strict';

goog.provide('Blockly.CtDynamicSlots');

goog.require('Blockly.Blocks');
goog.require('Blockly.CtPm');
goog.require('Blockly.DataCategory');
goog.require('Blockly.Variables');
goog.require('Blockly.Xml');

/**
 * Vanilla flyout block -> its Advanced version.
 */
Blockly.CtDynamicSlots.REPLACES = {
  'data_setvariableto': 'data_ct_setvariableto',
  'data_changevariableby': 'data_ct_changevariableby',
  'data_addtolist': 'data_ct_addtolist',
  'data_deleteoflist': 'data_ct_deleteoflist',
  'data_deletealloflist': 'data_ct_deletealloflist',
  'data_insertatlist': 'data_ct_insertatlist',
  'data_replaceitemoflist': 'data_ct_replaceitemoflist',
  'data_itemoflist': 'data_ct_itemoflist',
  'data_itemnumoflist': 'data_ct_itemnumoflist',
  'data_lengthoflist': 'data_ct_lengthoflist',
  'data_listcontainsitem': 'data_ct_listcontainsitem'
};

(function() {
  var listMenu = {"type": "input_value", "name": "LIST"};
  var variableMenu = {"type": "input_value", "name": "VARIABLE"};
  var value = function(name) {
    return {"type": "input_value", "name": name};
  };
  var LIST = ["colours_data_lists"];
  var VARS = ["colours_data"];
  var defs = {
    'data_ct_setvariableto': ['DATA_SETVARIABLETO', [variableMenu, value('VALUE')], VARS.concat("shape_statement")],
    'data_ct_changevariableby': ['DATA_CHANGEVARIABLEBY', [variableMenu, value('VALUE')], VARS.concat("shape_statement")],
    'data_ct_variableof': ['CT_PM_DATA_VARIABLEOF', [variableMenu], VARS.concat("output_string")],
    'data_ct_addtolist': ['DATA_ADDTOLIST', [value('ITEM'), listMenu], LIST.concat("shape_statement")],
    'data_ct_deleteoflist': ['DATA_DELETEOFLIST', [value('INDEX'), listMenu], LIST.concat("shape_statement")],
    'data_ct_deletealloflist': ['DATA_DELETEALLOFLIST', [listMenu], LIST.concat("shape_statement")],
    'data_ct_insertatlist': ['DATA_INSERTATLIST', [value('ITEM'), value('INDEX'), listMenu], LIST.concat("shape_statement")],
    'data_ct_replaceitemoflist': ['DATA_REPLACEITEMOFLIST', [value('INDEX'), listMenu, value('ITEM')],
      LIST.concat("shape_statement")],
    'data_ct_itemoflist': ['DATA_ITEMOFLIST', [value('INDEX'), listMenu], LIST.concat("output_string")],
    'data_ct_itemnumoflist': ['DATA_ITEMNUMOFLIST', [value('ITEM'), listMenu], LIST.concat("output_number")],
    'data_ct_lengthoflist': ['DATA_LENGTHOFLIST', [listMenu], LIST.concat("output_number")],
    'data_ct_listcontainsitem': ['DATA_LISTCONTAINSITEM', [listMenu, value('ITEM')], LIST.concat("output_boolean")]
  };
  Object.keys(defs).forEach(function(type) {
    var def = defs[type];
    var category = def[2][0] == "colours_data_lists" ? Blockly.Categories.dataLists : Blockly.Categories.data;
    Blockly.Blocks[type] = {
      init: function() {
        this.jsonInit({
          "message0": Blockly.Msg[def[0]] || def[0],
          "args0": def[1],
          "category": category,
          "extensions": def[2]
        });
      }
    };
  });

  var menu = function(fieldName, variableType, colours, category) {
    return {
      init: function() {
        this.jsonInit({
          "message0": "%1",
          "args0": [{
            "type": "field_variable",
            "name": fieldName,
            "variableTypes": [variableType],
            "defaultType": variableType
          }],
          "category": category,
          "extensions": [colours, "output_string"]
        });
      }
    };
  };
  Blockly.Blocks['data_ct_listmenu'] = menu('LIST', Blockly.LIST_VARIABLE_TYPE, "colours_data_lists",
      Blockly.Categories.dataLists);
  Blockly.Blocks['data_ct_variablemenu'] = menu('VARIABLE', '', "colours_data", Blockly.Categories.data);
})();

(function() {
  var workspace = null;
  var addCreateButton = Blockly.DataCategory.addCreateButton;
  Blockly.DataCategory.addCreateButton = function(xmlList, ws) {
    workspace = ws;
    return addCreateButton.apply(this, arguments);
  };
  var addBlock = Blockly.DataCategory.addBlock;
  Blockly.DataCategory.addBlock = function(xmlList, variable, blockType, fieldName, opt_value, opt_secondValue) {
    var replacement = Blockly.CtDynamicSlots.REPLACES[blockType];
    if (!replacement || !workspace || !Blockly.CtPm.isAdvanced(workspace) || !Blockly.Blocks[replacement]) {
      return addBlock.apply(this, arguments);
    }
    var values = '';
    if (opt_value) values += Blockly.DataCategory.createValue(opt_value[0], opt_value[1], opt_value[2]);
    if (opt_secondValue) {
      values += Blockly.DataCategory.createValue(opt_secondValue[0], opt_secondValue[1], opt_secondValue[2]);
    }
    var menuType = fieldName === 'LIST' ? 'data_ct_listmenu' : 'data_ct_variablemenu';
    var slot = '<value name="' + fieldName + '"><shadow type="' + menuType + '">' +
        Blockly.Variables.generateVariableFieldXml_(variable, fieldName) + '</shadow></value>';
    var make = function(type, inner) {
      return Blockly.Xml.textToDom('<xml><block type="' + type + '" gap="10">' + inner + '</block></xml>').firstChild;
    };
    xmlList.push(make(replacement, slot + values));
    if (blockType === 'data_changevariableby') {
      xmlList.push(make('data_ct_variableof', slot));
    }
  };
})();

(function() {
  var MENUS = {'data_ct_listmenu': true, 'data_ct_variablemenu': true};
  var original = Blockly.Xml.domToFieldVariable_;
  Blockly.Xml.domToFieldVariable_ = function(workspace, xml, text, field) {
    var block = field.sourceBlock_;
    var id = xml.getAttribute('id');
    if (!block || !MENUS[block.type] || text || (id && workspace.getVariableById(id)) || workspace.isFlyout) {
      return original.apply(this, arguments);
    }
    var type = block.type === 'data_ct_listmenu' ? Blockly.LIST_VARIABLE_TYPE : '';
    var existing = workspace.getVariablesOfType(type).slice().sort(Blockly.VariableModel.compareByName)[0];
    var name = type ? Blockly.Msg.CT_PM_DATA_DEFAULT_LIST : Blockly.Msg.CT_PM_DATA_DEFAULT_VARIABLE;
    var variable = existing || Blockly.Variables.getOrCreateVariablePackage(workspace, null, name, type);
    field.setValue(variable.getId());
  };
})();
