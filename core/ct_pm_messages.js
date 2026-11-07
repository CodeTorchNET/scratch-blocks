/**
 * @fileoverview English text of the Advanced.
 */
'use strict';

goog.provide('Blockly.CtPm.Msg');

goog.require('Blockly.Msg');
goog.require('Blockly.ScratchMsgs');

(function() {
  var messages = {
    CT_PM_PLAIN: '%1',
    CT_PM_PLAIN3: '%1 %2 %3',
    CT_PM_UP: 'up',
    CT_PM_DOWN: 'down',
    CT_PM_THISSPRITE: 'this sprite',
    CT_PM_JAVASCRIPT: 'javascript %1',
    CT_PM_UNSUPPORTED: 'unsupported block',

    CT_PM_CONTROL_ELSEIF: 'else if %1 then',
    CT_PM_CONTROL_DELETECLONESOF: 'delete clones of %1',
    CT_PM_CONTROL_ISCLONE: 'is clone?',
    CT_PM_CONTROL_IFRETURNELSERETURN: 'if %1 then %2 else %3',
    CT_PM_CONTROL_SWITCH: 'switch %1',
    CT_PM_CONTROL_DEFAULT: 'default',
    CT_PM_CONTROL_CASE: 'case %1',
    CT_PM_CONTROL_CASENEXT: 'run next case when %1',
    CT_PM_CONTROL_EXITCASE: 'exit case',
    CT_PM_CONTROL_BACKTOGREENFLAG: 'run %1',
    CT_PM_CONTROL_RUNASSPRITE: 'as %1 do',
    CT_PM_CONTROL_STOPSPRITE: 'stop %1',
    CT_PM_CONTROL_WAITSECONDSORUNTIL: 'wait %1 seconds or until %2',
    CT_PM_CONTROL_EXITLOOP: 'escape loop',
    CT_PM_CONTROL_CONTINUELOOP: 'continue loop',
    CT_PM_CONTROL_REPEATFORSECONDS: 'repeat for %1 seconds',
    CT_PM_CONTROL_TRY: 'try to do',
    CT_PM_CONTROL_CATCH: 'if a block errors',
    CT_PM_CONTROL_THROWERROR: 'throw error %1',
    CT_PM_CONTROL_ERROR: 'error',
    CT_PM_CONTROL_INLINESTACKOUTPUT: 'inline block',
    CT_PM_CONTROL_WAITTICK: 'wait until next tick',
    CT_PM_CONTROL_FROMTO: 'for %1 from %2 to %3',
    CT_PM_CONTROL_FROMTOINDEX: 'index',
    CT_PM_CONTROL_NEWSCRIPT: 'new script',
    CT_PM_CONTROL_SETCOUNTER: 'set counter to %1',
    CT_PM_CONTROL_DECRCOUNTER: 'decrease counter',

    CT_PM_EVENT_WHENSTOPCLICKED: 'when %1 clicked',
    CT_PM_EVENT_WHENANYTHING: 'when %1',
    CT_PM_EVENT_ALWAYS: 'always',
    CT_PM_EVENT_WHENKEYHIT: 'when %1 key hit',
    CT_PM_EVENT_WHENMOUSESCROLLED: 'when mouse is scrolled %1',
    CT_PM_EVENT_WHENJAVASCRIPT: 'when javascript %1 is true',

    CT_PM_MOTION_MOVEBACKSTEPS: 'move back %1 steps',
    CT_PM_MOTION_MOVEUPDOWNSTEPS: 'move %1 %2 steps',
    CT_PM_MOTION_TURNAROUNDXY: 'turn %1 %2 degrees around x: %3 y: %4',
    CT_PM_MOTION_TURNAROUND: 'turn around',
    CT_PM_MOTION_POINTINRANDOMDIRECTION: 'point in random direction',
    CT_PM_MOTION_POINTTOWARDSXY: 'point towards x: %1 y: %2',
    CT_PM_MOTION_CHANGEBYXY: 'change by x: %1 y: %2',
    CT_PM_MOTION_IFONSPRITEBOUNCE: 'if touching %1, bounce',
    CT_PM_MOTION_IFONXYBOUNCE: 'if touching x: %1 y: %2, bounce',
    CT_PM_MOTION_MOVETOSTAGESIDE: 'move to stage %1',
    CT_PM_MOTION_ROTATION_UPDOWN: 'up-down',
    CT_PM_MOTION_ROTATION_LOOKAT: 'look at',
    CT_PM_SIDE_BOTTOMLEFT: 'bottom-left',
    CT_PM_SIDE_BOTTOM: 'bottom',
    CT_PM_SIDE_BOTTOMRIGHT: 'bottom-right',
    CT_PM_SIDE_MIDDLE: 'middle',
    CT_PM_SIDE_TOPLEFT: 'top-left',
    CT_PM_SIDE_TOP: 'top',
    CT_PM_SIDE_TOPRIGHT: 'top-right',
    CT_PM_SIDE_LEFT: 'left',
    CT_PM_SIDE_RIGHT: 'right',

    CT_PM_LOOKS_SETFONT: 'set font to %1 size %2',
    CT_PM_LOOKS_SETCOLOR: 'set %1 color to %2',
    CT_PM_LOOKS_BUBBLE_STROKE: 'bubble border',
    CT_PM_LOOKS_BUBBLE_FILL: 'bubble fill',
    CT_PM_LOOKS_TEXT_FILL: 'text',
    CT_PM_LOOKS_SETSHAPE: 'set speech bubble %1 to %2',
    CT_PM_LOOKS_SHAPE_MIN_WIDTH: 'minimum width',
    CT_PM_LOOKS_SHAPE_MAX_LINE_WIDTH: 'maximum width',
    CT_PM_LOOKS_SHAPE_STROKE_WIDTH: 'border width',
    CT_PM_LOOKS_SHAPE_PADDING: 'padding',
    CT_PM_LOOKS_SHAPE_CORNER_RADIUS: 'corner radius',
    CT_PM_LOOKS_SHAPE_TAIL_HEIGHT: 'tail height',
    CT_PM_LOOKS_SHAPE_FONT_HEIGHT_RATIO: 'font padding percent',
    CT_PM_LOOKS_SHAPE_TEXLIM: 'text length limit',
    CT_PM_LOOKS_CHANGEVISIBILITYOFSPRITE: '%1 %2',
    CT_PM_LOOKS_SHOW: 'show',
    CT_PM_LOOKS_HIDE: 'hide',
    CT_PM_LOOKS_SHOWSPRITE: 'show %1',
    CT_PM_LOOKS_HIDESPRITE: 'hide %1',
    CT_PM_LOOKS_SETTINTCOLOR: 'set tint color to %1',
    CT_PM_LOOKS_TINTCOLOR: 'tint color',
    CT_PM_LOOKS_PREVIOUSCOSTUME: 'previous costume',
    CT_PM_LOOKS_PREVIOUSBACKDROP: 'previous backdrop',
    CT_PM_LOOKS_GOTARGETLAYER: 'go %1 %2',
    CT_PM_LOOKS_INFRONT: 'in front of',
    CT_PM_LOOKS_BEHIND: 'behind',
    CT_PM_LOOKS_LAYERSSETLAYER: 'go to layer %1',
    CT_PM_LOOKS_LAYERSGETLAYER: 'layer',
    CT_PM_LOOKS_SETSTRETCH: 'set stretch to x: %1 y: %2',
    CT_PM_LOOKS_CHANGESTRETCH: 'change stretch by x: %1 y: %2',
    CT_PM_LOOKS_STRETCHGETX: 'x stretch',
    CT_PM_LOOKS_STRETCHGETY: 'y stretch',
    CT_PM_LOOKS_GETSPRITEVISIBLE: 'visible?',
    CT_PM_LOOKS_GETOTHERSPRITEVISIBLE: 'is %1 visible?',
    CT_PM_LOOKS_GETEFFECTVALUE: '%1 effect',
    CT_PM_LOOKS_EFFECT_SATURATION: 'saturation',
    CT_PM_LOOKS_EFFECT_RED: 'red',
    CT_PM_LOOKS_EFFECT_GREEN: 'green',
    CT_PM_LOOKS_EFFECT_BLUE: 'blue',
    CT_PM_LOOKS_EFFECT_OPAQUE: 'opaque',
    CT_PM_LOOKS_EFFECT_HORIZONTAL_SHEAR: 'horizontal shear',
    CT_PM_LOOKS_EFFECT_VERTICAL_SHEAR: 'vertical shear',
    CT_PM_LOOKS_EFFECT_REPEAT_X: 'repeat x',
    CT_PM_LOOKS_EFFECT_REPEAT_Y: 'repeat y',
    CT_PM_LOOKS_SAYWIDTH: 'speech bubble width',
    CT_PM_LOOKS_SAYHEIGHT: 'speech bubble height',
    CT_PM_LOOKS_STOPTALKING: 'stop speaking',
    CT_PM_LOOKS_GETINPUTOFCOSTUME: '%1 of costume %2',
    CT_PM_LOOKS_INPUT_WIDTH: 'width',
    CT_PM_LOOKS_INPUT_HEIGHT: 'height',
    CT_PM_LOOKS_INPUT_ROTATIONCENTERX: 'rotation center x',
    CT_PM_LOOKS_INPUT_ROTATIONCENTERY: 'rotation center y',
    CT_PM_LOOKS_INPUT_DRAWINGMODE: 'drawing mode',
    CT_PM_LOOKS_SETVERTTRANSFORM: 'skew vertically %1 %',
    CT_PM_LOOKS_SETHORIZTRANSFORM: 'skew horizontally %1 %',

    CT_PM_SOUND_STOP: 'stop sound %1',
    CT_PM_SOUND_SETSTOPFADEOUTTO: 'set fade out to %1 seconds on %2',
    CT_PM_SOUND_PLAYATSECONDS: 'start sound %1 at %2 seconds',
    CT_PM_SOUND_PLAYATSECONDSUNTILDONE: 'play sound %1 from %2 seconds until done',
    CT_PM_SOUND_PLAYALLSOUNDS: 'play all sounds',
    CT_PM_SOUND_GETEFFECTVALUE: '%1 effect',
    CT_PM_SOUND_ISSOUNDPLAYING: 'is %1 playing?',
    CT_PM_SOUND_GETLENGTH: 'length of %1',
    CT_PM_SOUND_GETSOUNDVOLUME: 'volume of %1',

    CT_PM_SENSING_OBJECTTOUCHINGOBJECT: '%1 touching %2?',
    CT_PM_SENSING_OBJECTTOUCHINGCLONESPRITE: '%1 touching clone of %2?',
    CT_PM_SENSING_KEYHIT: 'key %1 hit?',
    CT_PM_SENSING_MOUSESCROLLING: 'mouse scrolling %1?',
    CT_PM_SENSING_MOUSECLICKED: 'mouse clicked?',
    CT_PM_SENSING_FINGERDOWN: 'finger %1 down?',
    CT_PM_SENSING_FINGERTAPPED: 'finger %1 tapped?',
    CT_PM_SENSING_FINGERX: 'finger %1 x',
    CT_PM_SENSING_FINGERY: 'finger %1 y',
    CT_PM_SENSING_SETCLIPBOARD: 'copy %1 to clipboard',
    CT_PM_SENSING_GETCLIPBOARD: 'clipboard',
    CT_PM_SENSING_GETDRAGMODE: 'draggable?',
    CT_PM_SENSING_SETOF: 'set %1 of %2 to %3',
    CT_PM_SENSING_SETOF_COSTUME: 'costume',
    CT_PM_SENSING_SETOF_BACKDROP: 'backdrop',
    CT_PM_SENSING_LOGGEDIN: 'signed in?',
    CT_PM_SENSING_REGEXTEST: 'regex %1 flags %2 matches %3?',
    CT_PM_SENSING_THINGISNUMBER: '%1 is a number?',
    CT_PM_SENSING_THINGISTEXT: '%1 is text?',
    CT_PM_SENSING_THINGHASNUMBER: '%1 contains a number?',
    CT_PM_SENSING_MOBILE: 'touch device?',
    CT_PM_SENSING_ISUPPERCASE: 'is %1 uppercase?',
    CT_PM_SENSING_GETSPRITEWITHATTRIB: 'sprite with %1 set to %2',
    CT_PM_SENSING_DISTANCETO: 'distance from x: %1 y: %2 to x: %3 y: %4',
    CT_PM_SENSING_DIRECTIONTO: 'direction to x: %1 y: %2 from x: %3 y: %4',
    CT_PM_SENSING_GETOPERATINGSYSTEM: 'operating system',
    CT_PM_SENSING_GETBROWSER: 'browser',
    CT_PM_SENSING_GETURL: 'page url',
    CT_PM_SENSING_GETXYOFTOUCHINGSPRITE: '%1 of point touching %2',

    CT_PM_OPERATORS_GTOREQUAL: '%1 ≥ %2',
    CT_PM_OPERATORS_LTOREQUAL: '%1 ≤ %2',
    CT_PM_OPERATORS_NOTEQUAL: '%1 ≠ %2',
    CT_PM_OPERATORS_NAND: '%1 nand %2',
    CT_PM_OPERATORS_NOR: '%1 nor %2',
    CT_PM_OPERATORS_XOR: '%1 xor %2',
    CT_PM_OPERATORS_XNOR: '%1 xnor %2',
    CT_PM_OP_AND: 'and',
    CT_PM_OP_OR: 'or',
    CT_PM_OP_XOR: 'xor',
    CT_PM_OP_NAND: 'nand',
    CT_PM_OP_NOR: 'nor',
    CT_PM_OP_XNOR: 'xnor',
    CT_PM_OPERATORS_TRUE: 'true',
    CT_PM_OPERATORS_FALSE: 'false',
    CT_PM_OPERATORS_RANDOMBOOLEAN: 'random true or false',
    CT_PM_OPERATORS_BOOLIFY: '%1 as true or false',
    CT_PM_OPERATORS_STRINGIFY: '%1 as text',
    CT_PM_OPERATORS_TEXTINCLUDESLETTERFROM: '%1 includes a letter from %2?',
    CT_PM_OPERATORS_TEXTSTARTSORENDSWITH: '%1 %2 with %3?',
    CT_PM_OPERATORS_STARTS: 'starts',
    CT_PM_OPERATORS_ENDS: 'ends',
    CT_PM_OPERATORS_JOIN3: 'join %1 %2 %3',
    CT_PM_OPERATORS_JOINLABEL: 'join',
    CT_PM_OPERATORS_ADVLOG: 'log base %1 of %2',
    CT_PM_OPERATORS_REGEXMATCH: 'matches of %1 with regex %2 flags %3',
    CT_PM_OPERATORS_REPLACEALL: 'in %1 replace all %2 with %3',
    CT_PM_OPERATORS_REPLACEFIRST: 'in %1 replace first %2 with %3',
    CT_PM_OPERATORS_LETTERSFROMUPTOBEFORE: 'letters from %1 up to before %2 of %3',
    CT_PM_OPERATORS_LETTERSFROMTOIN: 'letters %1 to %2 of %3',
    CT_PM_OPERATORS_READLINE: 'line %1 of %2',
    CT_PM_OPERATORS_NEWLINE: 'new line',
    CT_PM_OPERATORS_TAB: 'tab',
    CT_PM_OPERATORS_CHARTOCODE: 'code of letter %1',
    CT_PM_OPERATORS_CODETOCHAR: 'letter with code %1',
    CT_PM_OPERATORS_LERP: 'blend %1 to %2 by %3',
    CT_PM_OPERATORS_ROOT: 'root',
    CT_PM_OPERATORS_LOG: 'log',
    CT_PM_OPERATORS_ADVMATHEXPANDED: '%1 × %2 %3 %4',
    CT_PM_OPERATORS_POWER: '%1 ^ %2',
    CT_PM_OPERATORS_CONSTRAIN: 'limit %1 between %2 and %3',
    CT_PM_OPERATORS_INDEXOF: 'position of %1 in %2',
    CT_PM_OPERATORS_LASTINDEXOF: 'last position of %1 in %2',
    CT_PM_OPERATORS_COUNTAPPEARTIMES: 'times %1 appears in %2',
    CT_PM_OPERATORS_TOUPPERLOWER: '%1 to %2',
    CT_PM_OPERATORS_UPPERCASE: 'UPPERCASE',
    CT_PM_OPERATORS_LOWERCASE: 'lowercase',

    CT_PM_DATA_SHIFTLIST: 'shift %1 by %2',
    CT_PM_DATA_REVERSELIST: 'reverse %1',
    CT_PM_DATA_ARRAYLIST: 'set %1 to array %2',
    CT_PM_DATA_FILTERLIST: 'keep items of %1 where %2 %3 %4',
    CT_PM_DATA_FILTERLISTITEM: 'item',
    CT_PM_DATA_FILTERLISTINDEX: 'index',
    CT_PM_DATA_ITEMEXISTSLIST: 'item %1 exists in %2?',
    CT_PM_DATA_LISTISEMPTY: 'is %1 empty?',
    CT_PM_DATA_LISTARRAY: '%1 as array',
    CT_PM_DATA_AMOUNTINLIST: 'number of %1 in %2',
    CT_PM_DATA_LISTFOREACHITEM: 'for each item %1 in %2',
    CT_PM_DATA_LISTFOREACHNUM: 'for each index %1 in %2',

    CT_PM_PROCEDURES_SET: 'set %1 to %2',
    CT_PM_PROCEDURES_BRANCH_DEFAULT: 'branch',
    CT_PM_PROCEDURES_TO_BOOLEAN: 'Change To Boolean',
    CT_PM_PROCEDURES_TO_ROUND: 'Change To Round Reporter',
    CT_PM_PROCEDURES_LOCALROW: 'set %1 to %2',
    CT_PM_PROCEDURES_SETLOCAL: 'set %1 to %2',
    CT_PM_PROCEDURES_CHANGELOCAL: 'change %1 by %2',
    CT_PM_PROCEDURES_LOCALEDITOR: 'local %1',
    CT_PM_PROCEDURES_LOCAL_DEFAULT: 'local'
  };
  for (var key in messages) {
    if (Blockly.Msg[key] === undefined) {
      Blockly.Msg[key] = messages[key];
    }
  }
  Blockly.CtPm.Msg.EN = messages;
})();

/**
 * Translations of the messages above, by locale.
 * @type {!Object<string, !Object<string, string>>} result
 */
Blockly.CtPm.Msg.locales = Blockly.CtPm.Msg.locales || {};

/**
 * The table for a locale.
 * @param {string} locale A Scratch locale code
 * @return {Object<string, string>} The table, or null for English / untranslated locales
 */
Blockly.CtPm.Msg.tableFor = function(locale) {
  var tables = Blockly.CtPm.Msg.locales;
  if (!locale) return null;
  if (Object.prototype.hasOwnProperty.call(tables, locale)) return tables[locale];
  var language = String(locale).split('-')[0];
  return Object.prototype.hasOwnProperty.call(tables, language) ? tables[language] : null;
};

/**
 * ScratchMsgs.setLocale merges a locale's table over the current messages, and Scratch's tables.
 */
(function() {
  var setLocale = Blockly.ScratchMsgs.setLocale;
  Blockly.ScratchMsgs.setLocale = function(locale) {
    setLocale.call(this, locale);
    var current = Blockly.ScratchMsgs.currentLocale_;
    Object.assign(Blockly.Msg, Blockly.CtPm.Msg.EN, Blockly.CtPm.Msg.tableFor(current) || {});
  };
})();
