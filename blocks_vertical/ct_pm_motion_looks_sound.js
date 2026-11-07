/**
 * @fileoverview Advanced.
 */
'use strict';

goog.provide('Blockly.Blocks.ctPmMotionLooksSound');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');

(function() {
  var arg = Blockly.CtPm.arg;
  var json = Blockly.CtPm.json;
  var MOTION = ["colours_motion", "shape_statement"];
  var LOOKS = ["colours_looks", "shape_statement"];
  var SOUND = ["colours_sounds", "shape_statement"];
  var monitor = {"checkboxInFlyout": true};

  /**
   * A sprite-menu shadow.
   * @param {string} name Field name
   * @param {string} colours Colour extension
   * @return {function(): !Object} JSON factory
   */
  var spriteMenu = function(name, colours) {
    return function() {
      return {
        "message0": "%1",
        "args0": [arg.dropdown(name, [['@CT_PM_THISSPRITE', '_myself_']])],
        "extensions": [colours, "output_string"]
      };
    };
  };

  var turnAround = function(key, icon) {
    return function() {
      return json(key, [arg.image(icon, ''), arg.value('DEGREES'), arg.value('X'), arg.value('Y')], MOTION);
    };
  };

  var EFFECTS = [
    ['@LOOKS_EFFECT_COLOR', 'COLOR'],
    ['@LOOKS_EFFECT_FISHEYE', 'FISHEYE'],
    ['@LOOKS_EFFECT_WHIRL', 'WHIRL'],
    ['@LOOKS_EFFECT_PIXELATE', 'PIXELATE'],
    ['@LOOKS_EFFECT_MOSAIC', 'MOSAIC'],
    ['@LOOKS_EFFECT_BRIGHTNESS', 'BRIGHTNESS'],
    ['@LOOKS_EFFECT_GHOST', 'GHOST'],
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

  Blockly.CtPm.defineBlocks({
    'motion_movebacksteps': function() {
      return json('CT_PM_MOTION_MOVEBACKSTEPS', [arg.value('STEPS')], MOTION);
    },
    'motion_moveupdownsteps': function() {
      return json('CT_PM_MOTION_MOVEUPDOWNSTEPS',
          [arg.dropdown('DIRECTION', [['@CT_PM_UP', 'up'], ['@CT_PM_DOWN', 'down']]), arg.value('STEPS')], MOTION);
    },
    'motion_turnrightaroundxy': turnAround('CT_PM_MOTION_TURNAROUNDXY', 'rotate-right.svg'),
    'motion_turnleftaroundxy': turnAround('CT_PM_MOTION_TURNAROUNDXY', 'rotate-left.svg'),
    'motion_turnaround': function() {
      return json('CT_PM_MOTION_TURNAROUND', [], MOTION);
    },
    'motion_pointinrandomdirection': function() {
      return json('CT_PM_MOTION_POINTINRANDOMDIRECTION', [], MOTION);
    },
    'motion_pointtowardsxy': function() {
      return json('CT_PM_MOTION_POINTTOWARDSXY', [arg.value('X'), arg.value('Y')], MOTION);
    },
    'motion_changebyxy': function() {
      return json('CT_PM_MOTION_CHANGEBYXY', [arg.value('DX'), arg.value('DY')], MOTION);
    },
    'motion_ifonspritebounce': function() {
      return json('CT_PM_MOTION_IFONSPRITEBOUNCE', [arg.value('SPRITE')], MOTION);
    },
    'motion_ifonxybounce': function() {
      return json('CT_PM_MOTION_IFONXYBOUNCE', [arg.value('X'), arg.value('Y')], MOTION);
    },
    'motion_move_sprite_to_scene_side': function() {
      return json('CT_PM_MOTION_MOVETOSTAGESIDE', [arg.dropdown('ALIGNMENT', [
        ['@CT_PM_SIDE_BOTTOMLEFT', 'bottom-left'],
        ['@CT_PM_SIDE_BOTTOM', 'bottom'],
        ['@CT_PM_SIDE_BOTTOMRIGHT', 'bottom-right'],
        ['@CT_PM_SIDE_MIDDLE', 'middle'],
        ['@CT_PM_SIDE_TOPLEFT', 'top-left'],
        ['@CT_PM_SIDE_TOP', 'top'],
        ['@CT_PM_SIDE_TOPRIGHT', 'top-right'],
        ['@CT_PM_SIDE_LEFT', 'left'],
        ['@CT_PM_SIDE_RIGHT', 'right']
      ])], MOTION);
    },

    'looks_setFont': function() {
      return json('CT_PM_LOOKS_SETFONT', [arg.value('font'), arg.value('size')], LOOKS);
    },
    'looks_setColor': function() {
      return json('CT_PM_LOOKS_SETCOLOR', [arg.dropdown('prop', [
        ['@CT_PM_LOOKS_BUBBLE_STROKE', 'BUBBLE_STROKE'],
        ['@CT_PM_LOOKS_BUBBLE_FILL', 'BUBBLE_FILL'],
        ['@CT_PM_LOOKS_TEXT_FILL', 'TEXT_FILL']
      ]), arg.value('color')], LOOKS);
    },
    'looks_setShape': function() {
      return json('CT_PM_LOOKS_SETSHAPE', [arg.dropdown('prop', [
        ['@CT_PM_LOOKS_SHAPE_MIN_WIDTH', 'MIN_WIDTH'],
        ['@CT_PM_LOOKS_SHAPE_MAX_LINE_WIDTH', 'MAX_LINE_WIDTH'],
        ['@CT_PM_LOOKS_SHAPE_STROKE_WIDTH', 'STROKE_WIDTH'],
        ['@CT_PM_LOOKS_SHAPE_PADDING', 'PADDING'],
        ['@CT_PM_LOOKS_SHAPE_CORNER_RADIUS', 'CORNER_RADIUS'],
        ['@CT_PM_LOOKS_SHAPE_TAIL_HEIGHT', 'TAIL_HEIGHT'],
        ['@CT_PM_LOOKS_SHAPE_FONT_HEIGHT_RATIO', 'FONT_HEIGHT_RATIO'],
        ['@CT_PM_LOOKS_SHAPE_TEXLIM', 'texlim']
      ]), arg.value('color')], LOOKS);
    },
    'looks_changeVisibilityOfSprite_menu': spriteMenu('VISIBLE_OPTION', 'colours_looks'),
    'looks_getOtherSpriteVisible_menu': spriteMenu('VISIBLE_OPTION', 'colours_looks'),
    'looks_changeVisibilityOfSprite': function() {
      return json('CT_PM_LOOKS_CHANGEVISIBILITYOFSPRITE', [
        arg.dropdown('VISIBLE_TYPE', [['@CT_PM_LOOKS_SHOW', 'show'], ['@CT_PM_LOOKS_HIDE', 'hide']]),
        arg.value('VISIBLE_OPTION')
      ], LOOKS);
    },
    'looks_changeVisibilityOfSpriteShow': function() {
      return json('CT_PM_LOOKS_SHOWSPRITE', [arg.value('VISIBLE_OPTION')], LOOKS);
    },
    'looks_changeVisibilityOfSpriteHide': function() {
      return json('CT_PM_LOOKS_HIDESPRITE', [arg.value('VISIBLE_OPTION')], LOOKS);
    },
    'looks_setTintColor': function() {
      return json('CT_PM_LOOKS_SETTINTCOLOR', [arg.value('color')], LOOKS);
    },
    'looks_tintColor': function() {
      return json('CT_PM_LOOKS_TINTCOLOR', [], ["colours_looks", "output_string"], monitor);
    },
    'looks_previouscostume': function() {
      return json('CT_PM_LOOKS_PREVIOUSCOSTUME', [], LOOKS);
    },
    'looks_previousbackdrop': function() {
      return json('CT_PM_LOOKS_PREVIOUSBACKDROP', [], LOOKS);
    },
    'looks_goTargetLayer': function() {
      return json('CT_PM_LOOKS_GOTARGETLAYER', [
        arg.dropdown('FORWARD_BACKWARD', [['@CT_PM_LOOKS_INFRONT', 'infront'], ['@CT_PM_LOOKS_BEHIND', 'behind']]),
        arg.value('VISIBLE_OPTION')
      ], LOOKS);
    },
    'looks_layersSetLayer': function() {
      return json('CT_PM_LOOKS_LAYERSSETLAYER', [arg.value('NUM')], LOOKS);
    },
    'looks_layersGetLayer': function() {
      return json('CT_PM_LOOKS_LAYERSGETLAYER', [], ["colours_looks", "output_number"], monitor);
    },
    'looks_setStretch': function() {
      return json('CT_PM_LOOKS_SETSTRETCH', [arg.value('X'), arg.value('Y')], LOOKS);
    },
    'looks_changeStretch': function() {
      return json('CT_PM_LOOKS_CHANGESTRETCH', [arg.value('X'), arg.value('Y')], LOOKS);
    },
    'looks_stretchGetX': function() {
      return json('CT_PM_LOOKS_STRETCHGETX', [], ["colours_looks", "output_number"], monitor);
    },
    'looks_stretchGetY': function() {
      return json('CT_PM_LOOKS_STRETCHGETY', [], ["colours_looks", "output_number"], monitor);
    },
    'looks_getSpriteVisible': function() {
      return json('CT_PM_LOOKS_GETSPRITEVISIBLE', [], ["colours_looks", "output_boolean"], monitor);
    },
    'looks_getOtherSpriteVisible': function() {
      return json('CT_PM_LOOKS_GETOTHERSPRITEVISIBLE', [arg.value('VISIBLE_OPTION')],
          ["colours_looks", "output_boolean"]);
    },
    'looks_getEffectValue': function() {
      return json('CT_PM_LOOKS_GETEFFECTVALUE', [arg.dropdown('EFFECT', EFFECTS)],
          ["colours_looks", "output_number"], monitor);
    },
    'looks_sayWidth': function() {
      return json('CT_PM_LOOKS_SAYWIDTH', [], ["colours_looks", "output_number"], monitor);
    },
    'looks_sayHeight': function() {
      return json('CT_PM_LOOKS_SAYHEIGHT', [], ["colours_looks", "output_number"], monitor);
    },
    'looks_stoptalking': function() {
      return json('CT_PM_LOOKS_STOPTALKING', [], LOOKS);
    },
    'looks_getinputofcostume': function() {
      return json('CT_PM_LOOKS_GETINPUTOFCOSTUME', [arg.value('INPUT'), arg.value('COSTUME')],
          ["colours_looks", "output_number"]);
    },
    'looks_getinput_menu': function() {
      return {
        "message0": "%1",
        "args0": [arg.dropdown('INPUT', [
          ['@CT_PM_LOOKS_INPUT_WIDTH', 'width'],
          ['@CT_PM_LOOKS_INPUT_HEIGHT', 'height'],
          ['@CT_PM_LOOKS_INPUT_ROTATIONCENTERX', 'rotation center x'],
          ['@CT_PM_LOOKS_INPUT_ROTATIONCENTERY', 'rotation center y'],
          ['@CT_PM_LOOKS_INPUT_DRAWINGMODE', 'drawing mode']
        ])],
        "extensions": ["colours_looks", "output_string"]
      };
    },
    'looks_setVertTransform': function() {
      return json('CT_PM_LOOKS_SETVERTTRANSFORM', [arg.value('PERCENT')], LOOKS);
    },
    'looks_setHorizTransform': function() {
      return json('CT_PM_LOOKS_SETHORIZTRANSFORM', [arg.value('PERCENT')], LOOKS);
    },

    'sound_stop': function() {
      return json('CT_PM_SOUND_STOP', [arg.value('SOUND_MENU')], SOUND);
    },
    'sound_set_stop_fadeout_to': function() {
      return json('CT_PM_SOUND_SETSTOPFADEOUTTO', [arg.value('VALUE'), arg.value('SOUND_MENU')], SOUND);
    },
    'sound_play_at_seconds': function() {
      return json('CT_PM_SOUND_PLAYATSECONDS', [arg.value('SOUND_MENU'), arg.value('VALUE')], SOUND);
    },
    'sound_play_at_seconds_until_done': function() {
      return json('CT_PM_SOUND_PLAYATSECONDSUNTILDONE', [arg.value('SOUND_MENU'), arg.value('VALUE')], SOUND);
    },
    'sound_playallsounds': function() {
      return json('CT_PM_SOUND_PLAYALLSOUNDS', [], SOUND);
    },
    'sound_getEffectValue': function() {
      return json('CT_PM_SOUND_GETEFFECTVALUE', [arg.dropdown('EFFECT', [
        ['@SOUND_EFFECTS_PITCH', 'PITCH'],
        ['@SOUND_EFFECTS_PAN', 'PAN']
      ])], ["colours_sounds", "output_number"], monitor);
    },
    'sound_isSoundPlaying': function() {
      return json('CT_PM_SOUND_ISSOUNDPLAYING', [arg.value('SOUND_MENU')], ["colours_sounds", "output_boolean"]);
    },
    'sound_getLength': function() {
      return json('CT_PM_SOUND_GETLENGTH', [arg.value('SOUND_MENU')], ["colours_sounds", "output_number"]);
    },
    'sound_getSoundVolume': function() {
      return json('CT_PM_SOUND_GETSOUNDVOLUME', [arg.value('SOUND_MENU')], ["colours_sounds", "output_number"]);
    }
  });
})();
