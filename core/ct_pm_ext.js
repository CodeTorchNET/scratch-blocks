/**
 * @fileoverview Advanced blocks.
 */
'use strict';

goog.provide('Blockly.CtPm.Ext');

goog.require('Blockly.Block');
goog.require('Blockly.CtPm');

(function() {
  var jsonInit = Blockly.Block.prototype.jsonInit;
  /**
   * Vanilla jsonInit, then the ct-pm marks.
   * @param {!Object} json Structured data describing the block
   * @this {Blockly.Block}
   */
  Blockly.Block.prototype.jsonInit = function(json) {
    jsonInit.call(this, json);
    if (json['ctPmDragDuplicate']) {
      Blockly.CtPm.DRAG_DUPLICATE_SHADOWS[this.type] = true;
    }
    if (json['ctPmCReporter']) {
      this.ctPmCReporter_ = true;
    }
  };
})();

/**
 * @param {!Blockly.Block} block The block
 * @return {boolean} True if it's an extension reporter wrapping a stack
 */
Blockly.CtPm.isCReporter = function(block) {
  return !!block.ctPmCReporter_;
};
