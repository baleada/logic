(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Pressable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// /*
//  * Pressable.js
//  * (c) 2019 Alex Vipond
//  * Released under the MIT license
//  */
//
// /* Dependencies */
// import Dependency from '../wrappers/PressablePressure'
//
// /* Utils */
// import toNodeList from '../utils/toNodeList'
//
// export default class Pressable {
//   constructor (elements, options = {}) {
//     /* Options */
//
//     /* Public properties */
//     this.elements = elements
//
//     /* Private properties */
//
//     /* Dependency */
//     this.#dependencyOptions = this.#getDependencyOptions(options)
//     this.#dependency = new Dependency(this.elements, this.#dependencyOptions)
//   }
//
//   /* Public getters */
//   get manager () {
//     return this.#dependency.manager
//   }
//
//   /* Public methods */
//   setElements (elements) {
//     this.elements = toNodeList(elements)
//     return this
//   }
//
//   /* Private methods */
// }
"use strict";
},{}]},{},[1])(1)
});
