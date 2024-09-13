/**
 * @fileoverview Explicitly list variables, objects or method whose names should not be mangled by the closer-compiler.
 *
 * @externs
 */


/**
 * Keep canvas roundRect (gets mangled for some reason)
 * @record
 */
CanvasRenderingContext2D.prototype.roundRect

/**
 * mainDiv
 * @record
 */
var mainDiv

/**
 * bgrCanvas
 * @record
 */
var bgrCanvas

/**
 * gameCanvas
 * @record
 */
var gameCanvas

/**
 * gameContainer
 * @record
 */
var gameContainer

/**
 * uiDiv
 * @record
 */
var uiDiv
