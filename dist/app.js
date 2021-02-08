(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
  var __commonJS = (callback, module) => () => {
    if (!module) {
      module = {exports: {}};
      callback(module.exports, module);
    }
    return module.exports;
  };
  var __exportStar = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
    }
    return target;
  };
  var __toModule = (module) => {
    if (module && module.__esModule)
      return module;
    return __exportStar(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", {value: module, enumerable: true})), module);
  };

  // node_modules/wasm-forth/dist/wasm-forth.js
  var require_wasm_forth = __commonJS((exports, module) => {
    (function webpackUniversalModuleDefinition(root, factory) {
      if (typeof exports === "object" && typeof module === "object")
        module.exports = factory();
      else if (typeof define === "function" && define.amd)
        define([], factory);
      else if (typeof exports === "object")
        exports["WasmForth"] = factory();
      else
        root["WasmForth"] = factory();
    })(typeof self !== "undefined" ? self : exports, function() {
      return function(modules) {
        var installedModules = {};
        function __webpack_require__(moduleId) {
          if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
          }
          var module2 = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
          };
          modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
          module2.l = true;
          return module2.exports;
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.d = function(exports2, name, getter) {
          if (!__webpack_require__.o(exports2, name)) {
            Object.defineProperty(exports2, name, {
              configurable: false,
              enumerable: true,
              get: getter
            });
          }
        };
        __webpack_require__.n = function(module2) {
          var getter = module2 && module2.__esModule ? function getDefault() {
            return module2["default"];
          } : function getModuleExports() {
            return module2;
          };
          __webpack_require__.d(getter, "a", getter);
          return getter;
        };
        __webpack_require__.o = function(object, property) {
          return Object.prototype.hasOwnProperty.call(object, property);
        };
        __webpack_require__.p = "";
        return __webpack_require__(__webpack_require__.s = 0);
      }([
        function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          Object.defineProperty(__webpack_exports__, "__esModule", {value: true});
          __webpack_exports__["source"] = source2;
          __webpack_exports__["boot"] = boot2;
          let interpreter;
          let memBytes;
          let memCells;
          let inputBuffer = "";
          let onSourceAvailable;
          function decodeString(memoryIndex, nBytes) {
            let chars = [];
            for (let i = 0; i < nBytes; i++) {
              chars.push(String.fromCharCode(memBytes[memoryIndex + i]));
            }
            return chars.join("");
          }
          function encodeString(target, value, limit) {
            limit = Math.min(limit, value.length);
            for (let i = 0; i < limit; i++) {
              memBytes[target + i] = value.charCodeAt(i);
            }
            return limit;
          }
          function makeFFI(config) {
            let currentEvent = null;
            let io = {
              read: (token, memoryIndex, nBytes) => {
                let continuation = () => {
                  let limit = encodeString(memoryIndex, inputBuffer, nBytes);
                  inputBuffer = inputBuffer.substr(limit);
                  onSourceAvailable = void 0;
                  interpreter.exports.exec(token, limit);
                };
                if (inputBuffer.length > 0) {
                  setTimeout(continuation, 0);
                } else {
                  onSourceAvailable = continuation;
                }
              },
              patchBody: (memoryIndex, unused) => {
                let parent = document.querySelector("#body"), nodeIdx = 0;
                let parentStack = [], idxStack = [];
                loop:
                  for (let idx = memoryIndex / 4; ; idx += 2) {
                    switch (memCells[idx]) {
                      case 1: {
                        let structAddr = memCells[idx + 1];
                        let nameAddr = memCells[structAddr / 4];
                        let name2 = decodeString(nameAddr + 2, memBytes[nameAddr] - 1);
                        let valueNBytes = memCells[structAddr / 4 + 1];
                        if (valueNBytes === 4294967295) {
                          parent.childNodes[nodeIdx][name2] = void 0;
                        } else if (name2 === "focus") {
                        } else if (name2 === "input-value") {
                          parent.childNodes[nodeIdx].value = "";
                        } else if (name2 === "checked") {
                          parent.childNodes[nodeIdx].checked = false;
                        } else {
                          parent.childNodes[nodeIdx].removeAttribute(name2);
                        }
                        break;
                      }
                      case 2: {
                        let structAddr = memCells[idx + 1];
                        let nameAddr = memCells[structAddr / 4];
                        let name2 = decodeString(nameAddr + 2, memBytes[nameAddr] - 1);
                        let valueNBytes = memCells[structAddr / 4 + 1];
                        let valueAddr = memCells[structAddr / 4 + 2];
                        if (valueNBytes === 4294967295) {
                          parent.childNodes[nodeIdx][name2] = (evt) => {
                            currentEvent = evt;
                            interpreter.exports.exec(0, valueAddr);
                          };
                        } else if (name2 === "focus") {
                          parent.childNodes[nodeIdx].focus();
                        } else if (name2 === "input-value") {
                          parent.childNodes[nodeIdx].value = decodeString(valueAddr, valueNBytes);
                        } else if (name2 === "checked") {
                          parent.childNodes[nodeIdx].checked = true;
                        } else {
                          parent.childNodes[nodeIdx].setAttribute(name2, decodeString(valueAddr, valueNBytes));
                        }
                        break;
                      }
                      case 3:
                        let addr = memCells[idx + 1];
                        let nBytes = memBytes[addr];
                        let name = decodeString(addr + 2, nBytes - 2);
                        let elem = document.createElement(name);
                        parent.insertBefore(elem, parent.childNodes[nodeIdx]);
                        break;
                      case 4:
                        nodeIdx += memCells[idx + 1];
                        break;
                      case 5:
                        parent.removeChild(parent.childNodes[nodeIdx]);
                        break;
                      case 6:
                        parentStack.push(parent);
                        idxStack.push(nodeIdx);
                        parent = parent.childNodes[nodeIdx];
                        nodeIdx = 0;
                        break;
                      case 7:
                        parent = parentStack.pop();
                        nodeIdx = idxStack.pop();
                        break;
                      case 8:
                        break loop;
                      case 9:
                        parent.insertBefore(document.createTextNode(""), parent.childNodes[nodeIdx]);
                        break;
                      case 10:
                        let textNBytes = memCells[memCells[idx + 1] / 4 + 1];
                        let textAddr = memCells[memCells[idx + 1] / 4 + 2];
                        parent.childNodes[nodeIdx].textContent = decodeString(textAddr, textNBytes);
                        break;
                      default:
                        console.log("unknown opcode:" + memCells[idx]);
                        break loop;
                    }
                  }
              },
              write: (memoryIndex, nBytes) => {
                try {
                  config.write(decodeString(memoryIndex, nBytes));
                } catch (e) {
                  console.error(e);
                }
              },
              evtAttr: (memoryIndex, nBytes, targetAddr, limit) => {
                let path = decodeString(memoryIndex, nBytes).split(".");
                let value = currentEvent;
                for (let item of path) {
                  value = value[item];
                }
                if (value === true || value === false) {
                  return value;
                }
                if (typeof value === "number") {
                  return value;
                }
                return encodeString(targetAddr, value, limit);
              }
            };
            return {io};
          }
          function source2(text) {
            inputBuffer += text;
            if (onSourceAvailable) {
              onSourceAvailable();
            }
          }
          function boot2(config) {
            return fetch(config.wasmURL).then((res) => res.arrayBuffer()).then((bytes) => WebAssembly.instantiate(bytes, makeFFI(config))).then((compiled) => {
              interpreter = compiled.instance;
              memBytes = new Uint8Array(interpreter.exports.mem.buffer);
              memCells = new Uint32Array(interpreter.exports.mem.buffer);
              window.memBytes = memBytes;
              window.memCells = memCells;
              interpreter.exports.exec(0, 0);
            }).then(() => Promise.all(config.sources.map((url) => fetch(url)))).then((results) => Promise.all(results.map((res) => res.text()))).then((texts) => texts.forEach(source2));
          }
        }
      ]);
    });
  });

  // app.js
  var WasmForth = __toModule(require_wasm_forth());

  // node_modules/wasm-forth/dist/kernel.wasm
  var kernel_default = "/forth-repl/dist/kernel.5NER7SE2.wasm";

  // node_modules/wasm-forth/dist/core.f
  var core_default = "/forth-repl/dist/core.5S33DRZU.f";

  // node_modules/wasm-forth/dist/vdom.f
  var vdom_default = "/forth-repl/dist/vdom.2S3NVEUL.f";

  // app.js
  var log = console.log.bind(console);
  async function getEval(onPrint = log) {
    await WasmForth.boot({
      wasmURL: kernel_default,
      sources: [core_default, vdom_default],
      write: onPrint
    });
    WasmForth.source(': HELLO S" Hello, World!" TYPE ; HELLO\n');
    return function(line) {
      WasmForth.source(line + "\n");
    };
  }
  (async function start() {
    const $result = document.querySelector("#result");
    const $input = document.querySelector("form > input[type=text]");
    const $form = document.querySelector("form");
    const $clear = document.querySelector("#clear");
    const $body = document.body;
    function appendLine(line, className = "") {
      const div = document.createElement("div");
      div.className = className;
      div.textContent = line;
      $result.appendChild(div);
      $body.scrollTop = $result.scrollHeight - 100;
    }
    const evalLine = await getEval(appendLine);
    function sendLine() {
      const line = $input.value;
      if (!line) {
        return;
      }
      appendLine(line, "cmd");
      evalLine(line);
      $input.value = "";
    }
    $form.addEventListener("submit", (e) => {
      e.preventDefault();
      sendLine();
    });
    $clear.addEventListener("click", (e) => {
      e.preventDefault();
      $input.value = "";
    });
    document.body.addEventListener("click", (e) => {
      if (e.target.className == "cmd") {
        $input.value = e.target.textContent;
        setTimeout(() => $input.focus());
        return;
      }
    });
  })();
})();
