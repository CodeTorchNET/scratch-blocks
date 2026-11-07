/**
 * @fileoverview Shadow blocks of the Advanced.
 */
'use strict';

goog.provide('Blockly.Blocks.ctPmShadows');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');

Blockly.Blocks['checkbox'] = {
  /**
   * The checkbox shadow.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_ct_pm_checkbox",
          "name": "CHECKBOX"
        }
      ],
      "output": "Boolean",
      "outputShape": Blockly.OUTPUT_SHAPE_HEXAGONAL,
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "colourQuaternary": Blockly.Colours.textField
    });
  }
};

Blockly.Blocks['polygon'] = {
  /**
   * The polygon shadow.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "output": null,
      "outputShape": Blockly.OUTPUT_SHAPE_SQUARE,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary,
      "colourQuaternary": Blockly.Colours.pen.quaternary
    });
    this.ctPmPoints_ = 0;
    this.ctPmAttributes_ = {};
  },

  mutationToDom: function() {
    var container = document.createElement('mutation');
    for (var name in this.ctPmAttributes_) {
      container.setAttribute(name, this.ctPmAttributes_[name]);
    }
    container.setAttribute('points', String(this.ctPmPoints_));
    return container;
  },

  domToMutation: function(xmlElement) {
    this.ctPmAttributes_ = {};
    for (var i = 0; i < xmlElement.attributes.length; i++) {
      var attribute = xmlElement.attributes[i];
      this.ctPmAttributes_[attribute.name] = attribute.value;
    }
    var points = parseInt(xmlElement.getAttribute('points'), 10);
    if (isNaN(points) || points < 0) points = 0;
    points = Math.min(points, 64);
    for (var p = this.ctPmPoints_; p > points; p--) {
      this.removeInput('x' + p, true);
      this.removeInput('y' + p, true);
    }
    for (var p = this.ctPmPoints_ + 1; p <= points; p++) {
      this.appendValueInput('x' + p).appendField('x:');
      this.appendValueInput('y' + p).appendField('y:');
    }
    this.ctPmPoints_ = points;
  }
};
