/**
 * @fileoverview Fields used by the Advanced.
 */
'use strict';

goog.provide('Blockly.CtPm.FieldCheckbox');
goog.provide('Blockly.CtPm.FieldExpandButton');

goog.require('Blockly.BlockSvg.render');
goog.require('Blockly.Colours');
goog.require('Blockly.CtPm');
goog.require('Blockly.Field');
goog.require('Blockly.FieldImage');
goog.require('Blockly.utils');

/**
 * An add.
 * @param {boolean} isAdd True for the add button
 * @extends {Blockly.FieldImage}
 * @constructor
 */
Blockly.CtPm.FieldExpandButton = function(isAdd) {
  Blockly.CtPm.FieldExpandButton.superClass_.constructor.call(this,
      isAdd ? Blockly.CtPm.FieldExpandButton.ADD_SRC : Blockly.CtPm.FieldExpandButton.REMOVE_SRC,
      Blockly.CtPm.FieldExpandButton.WIDTH, Blockly.CtPm.FieldExpandButton.HEIGHT,
      isAdd ? '+' : '−', false);
  this.isAdd_ = isAdd;
};
goog.inherits(Blockly.CtPm.FieldExpandButton, Blockly.FieldImage);

/**
 * Size of a button, in workspace units.
 */
Blockly.CtPm.FieldExpandButton.WIDTH = 20;
Blockly.CtPm.FieldExpandButton.HEIGHT = 20;

/**
 * How much closer the plus sits to the minus than Blockly would put two clickable fields.
 */
Blockly.CtPm.FieldExpandButton.PAIR_TIGHTEN = 10;

/**
 * Minus/plus buttons in the block's own colours.
 * @param {boolean} isAdd True for the plus
 * @param {string=} opt_fill opt_fill
 * @param {string=} opt_stroke Circle outline
 * @param {string=} opt_glyph opt_glyph
 * @return {string} An SVG data URI
 * @private
 */
Blockly.CtPm.FieldExpandButton.icon_ = function(isAdd, opt_fill, opt_stroke, opt_glyph) {
  var bar = isAdd ? 'M10 5.5 V14.5 M5.5 10 H14.5' : 'M5.5 10 H14.5';
  return 'data:image/svg+xml;base64,' + btoa(
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">' +
      '<circle cx="10" cy="10" r="9" fill="' + (opt_fill || '#000') + '" fill-opacity="' +
      (opt_fill ? 1 : 0.15) + '" stroke="' + (opt_stroke || 'none') + '"/>' +
      '<path d="' + bar + '" stroke="' + (opt_glyph || '#fff') + '" stroke-width="2.2" ' +
      'stroke-linecap="round" fill="none"/>' +
      '</svg>');
};
Blockly.CtPm.FieldExpandButton.ADD_SRC = Blockly.CtPm.FieldExpandButton.icon_(true);
Blockly.CtPm.FieldExpandButton.REMOVE_SRC = Blockly.CtPm.FieldExpandButton.icon_(false);

/**
 * Redraw in the block's current colours.
 */
Blockly.CtPm.FieldExpandButton.prototype.updateColour = function() {
  var block = this.sourceBlock_;
  if (!block || !this.imageElement_) return;
  var src = Blockly.CtPm.FieldExpandButton.icon_(this.isAdd_, block.getColourSecondary(),
      block.getColourTertiary(), Blockly.Colours.text);
  if (src !== this.src_) this.setValue(src);
};

(function() {
  var original = Blockly.BlockSvg.prototype.updateColour;
  Blockly.BlockSvg.prototype.updateColour = function() {
    original.apply(this, arguments);
    for (var i = 0, input; input = this.inputList[i]; i++) {
      for (var j = 0, field; field = input.fieldRow[j]; j++) {
        if (field instanceof Blockly.CtPm.FieldExpandButton || field instanceof Blockly.CtPm.FieldCheckbox) {
          field.updateColour();
        }
      }
    }
  };
})();

/**
 * Clickable, but never saved.
 */
Blockly.CtPm.FieldExpandButton.prototype.EDITABLE = true;
Blockly.CtPm.FieldExpandButton.prototype.SERIALIZABLE = false;
Blockly.CtPm.FieldExpandButton.prototype.CURSOR = 'pointer';

/**
 * @param {!Object} options options
 * @return {!Blockly.CtPm.FieldExpandButton} The field
 */
Blockly.CtPm.FieldExpandButton.fromJson = function(options) {
  return new Blockly.CtPm.FieldExpandButton(!!options['add']);
};

/**
 * Builds the image and makes it clickable.
 */
Blockly.CtPm.FieldExpandButton.prototype.init = function() {
  if (this.fieldGroup_) {
    return;
  }
  Blockly.CtPm.FieldExpandButton.superClass_.init.call(this);
  this.fieldGroup_.style.cursor = this.CURSOR;
  this.updateColour();
  if (this.isAdd_ && !this.sourceBlock_.RTL) {
    this.imageElement_.setAttribute('x', -Blockly.CtPm.FieldExpandButton.PAIR_TIGHTEN);
    this.size_.width = Blockly.CtPm.FieldExpandButton.WIDTH - Blockly.CtPm.FieldExpandButton.PAIR_TIGHTEN;
  }
  this.mouseDownWrapper_ = Blockly.bindEventWithChecks_(this.imageElement_, 'mousedown', this,
      this.onMouseDown_);
};

/**
 * Unbinds the click handler, then disposes the image.
 */
Blockly.CtPm.FieldExpandButton.prototype.dispose = function() {
  if (this.mouseDownWrapper_) {
    Blockly.unbindEvent_(this.mouseDownWrapper_);
    this.mouseDownWrapper_ = null;
  }
  Blockly.CtPm.FieldExpandButton.superClass_.dispose.call(this);
};

/**
 * A click.
 * @private
 */
Blockly.CtPm.FieldExpandButton.prototype.showEditor_ = function() {
  var block = this.sourceBlock_;
  if (block && block.ctPmOnExpandButton_) {
    block.ctPmOnExpandButton_(this.isAdd_);
  }
};

Blockly.Field.register('field_ct_pm_expand_button', Blockly.CtPm.FieldExpandButton);
Blockly.Field.register('field_expandable_add', {
  fromJson: function() {
    return new Blockly.CtPm.FieldExpandButton(true);
  }
});
Blockly.Field.register('field_expandable_remove', {
  fromJson: function() {
    return new Blockly.CtPm.FieldExpandButton(false);
  }
});

/**
 * A checkbox showing a tick.
 * @param {string|boolean} state state
 * @param {Function=} opt_validator Optional validator
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.CtPm.FieldCheckbox = function(state, opt_validator) {
  Blockly.CtPm.FieldCheckbox.superClass_.constructor.call(this, '', opt_validator);
  this.setValue(state);
};
goog.inherits(Blockly.CtPm.FieldCheckbox, Blockly.Field);

/**
 * PenguinMod's look.
 */
Blockly.CtPm.FieldCheckbox.TRUE_COLOUR = '#33d833';
Blockly.CtPm.FieldCheckbox.TRUE_STROKE = '#26a826';
Blockly.CtPm.FieldCheckbox.FALSE_COLOUR = 'rgba(0, 0, 0, 0.2)';

/**
 * Tick and cross, centred on 0,0, drawn as strokes.
 */
Blockly.CtPm.FieldCheckbox.TICK_PATH = 'M -5 0.5 L -1.5 4 L 5 -3.5';
Blockly.CtPm.FieldCheckbox.CROSS_PATH = 'M -4 -4 L 4 4 M 4 -4 L -4 4';

/**
 * Width of the field in a slot.
 */
Blockly.CtPm.FieldCheckbox.WIDTH = 24;
Blockly.CtPm.FieldCheckbox.BOX_SIZE = 24;

Blockly.CtPm.FieldCheckbox.prototype.CURSOR = 'pointer';

/**
 * @param {!Object} options options
 * @return {!Blockly.CtPm.FieldCheckbox} The field
 */
Blockly.CtPm.FieldCheckbox.fromJson = function(options) {
  return new Blockly.CtPm.FieldCheckbox(options['checked'] ? 'TRUE' : 'FALSE');
};

/**
 * @return {string} result
 */
Blockly.CtPm.FieldCheckbox.prototype.getValue = function() {
  return this.state_ ? 'TRUE' : 'FALSE';
};

/**
 * @param {string|boolean} value value
 */
Blockly.CtPm.FieldCheckbox.prototype.setValue = function(value) {
  if (value === null || value === undefined) {
    return;
  }
  var newState = typeof value === 'string' ? value.toUpperCase() === 'TRUE' : !!value;
  if (newState === this.state_) {
    return;
  }
  var initialised = this.state_ !== undefined;
  var oldValue = this.getValue();
  this.state_ = newState;
  if (initialised && this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.sourceBlock_, 'field', this.name, oldValue, this.getValue()));
  }
  this.drawMark_();
  this.updateColour();
};

/**
 * Is this the checkbox shadow in a boolean slot.
 * @return {boolean} True for the shadow
 * @private
 */
Blockly.CtPm.FieldCheckbox.prototype.inSlot_ = function() {
  return !!this.sourceBlock_ && this.sourceBlock_.isShadow();
};

/**
 * Builds the mark.
 */
Blockly.CtPm.FieldCheckbox.prototype.init = function() {
  if (this.fieldGroup_) {
    return;
  }
  Blockly.CtPm.FieldCheckbox.superClass_.init.call(this);
  if (!this.inSlot_()) {
    var size = Blockly.CtPm.FieldCheckbox.BOX_SIZE;
    this.boxElement_ = Blockly.utils.createSvgElement('rect',
        {'width': size, 'height': size, 'rx': 4, 'ry': 4}, this.fieldGroup_);
  }
  this.markElement_ = Blockly.utils.createSvgElement('path', {
    'fill': 'none', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
  }, this.fieldGroup_);
  this.drawMark_();
  this.updateColour();
};

/**
 * Fixed width.
 */
Blockly.CtPm.FieldCheckbox.prototype.updateWidth = function() {
  this.arrowWidth_ = 0;
  this.size_.width = this.inSlot_() ? Blockly.CtPm.FieldCheckbox.WIDTH : Blockly.CtPm.FieldCheckbox.BOX_SIZE;
};

/**
 * Tick or cross, centred in the field.
 * @private
 */
Blockly.CtPm.FieldCheckbox.prototype.drawMark_ = function() {
  if (!this.markElement_) return;
  var cx = this.size_.width / 2;
  var cy = this.size_.height / 2;
  this.markElement_.setAttribute('d',
      this.state_ ? Blockly.CtPm.FieldCheckbox.TICK_PATH : Blockly.CtPm.FieldCheckbox.CROSS_PATH);
  this.markElement_.setAttribute('transform', 'translate(' + cx + ',' + cy + ')');
  this.markElement_.setAttribute('stroke', Blockly.Colours.text);
  this.markElement_.setAttribute('stroke-opacity', this.state_ ? 1 : 0.6);
  if (this.boxElement_) {
    var size = Blockly.CtPm.FieldCheckbox.BOX_SIZE;
    this.boxElement_.setAttribute('x', cx - size / 2);
    this.boxElement_.setAttribute('y', cy - size / 2);
  }
};

/**
 * Colours.
 */
Blockly.CtPm.FieldCheckbox.prototype.updateColour = function() {
  var block = this.sourceBlock_;
  if (!block || !this.markElement_) return;
  if (this.boxElement_) {
    this.boxElement_.setAttribute('fill',
        this.state_ ? Blockly.CtPm.FieldCheckbox.TRUE_COLOUR : block.getColourTertiary());
    return;
  }
  if (!block.svgPath_ || block.isInsertionMarker()) return;
  block.svgPath_.setAttribute('fill',
      this.state_ ? Blockly.CtPm.FieldCheckbox.TRUE_COLOUR : Blockly.CtPm.FieldCheckbox.FALSE_COLOUR);
  block.svgPath_.setAttribute('stroke', this.state_ ? Blockly.CtPm.FieldCheckbox.TRUE_STROKE : 'none');
};

/**
 * Draws the mark.
 * @private
 */
Blockly.CtPm.FieldCheckbox.prototype.render_ = function() {
  Blockly.CtPm.FieldCheckbox.superClass_.render_.call(this);
  this.drawMark_();
};

/**
 * Clicking toggles.
 * @private
 */
Blockly.CtPm.FieldCheckbox.prototype.showEditor_ = function() {
  var newState = !this.state_;
  if (this.sourceBlock_) {
    newState = this.callValidator(newState);
  }
  if (newState !== null) {
    this.setValue(!!newState);
  }
};

Blockly.Field.register('field_ct_pm_checkbox', Blockly.CtPm.FieldCheckbox);
Blockly.Field.register('field_checkbox_original', Blockly.CtPm.FieldCheckbox);
