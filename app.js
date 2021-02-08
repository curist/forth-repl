import * as WasmForth from 'wasm-forth';
import wasmURL from 'wasm-forth/dist/kernel.wasm';
import coreURL from 'wasm-forth/dist/core.f';
import vdomURL from 'wasm-forth/dist/vdom.f';

const log = console.log.bind(console)
async function getEval(onPrint = log) {
  await WasmForth.boot({
    wasmURL,
    sources: [coreURL, vdomURL],
    write: onPrint,
  })
  WasmForth.source(': HELLO S" Hello, World!" TYPE ; HELLO\n')
  return function(line) {
    WasmForth.source(line + '\n')
  }
}

(async function start() {
  const $result = document.querySelector('#result')
  const $input = document.querySelector('form > input[type=text]')
  const $form = document.querySelector('form')
  const $clear = document.querySelector('#clear')
  const $body = document.body

  function appendLine(line, className = '') {
    const div = document.createElement('div')
    div.className = className
    div.textContent = line
    $result.appendChild(div)
    $body.scrollTop = $result.scrollHeight - 100
  }

  const evalLine = await getEval(appendLine)

  function sendLine() {
    const line = $input.value
    if(!line) {
      return
    }
    appendLine(line, 'cmd')
    evalLine(line)
    $input.value = ''
  }

  $form.addEventListener('submit', e => {
    e.preventDefault()
    sendLine()
  })

  $clear.addEventListener('click', e => {
    e.preventDefault()
    $input.value = ''
  })

  document.body.addEventListener('click', e => {
    if(e.target.className == 'cmd') {
      $input.value = e.target.textContent
      setTimeout(() => $input.focus())
      return
    }
  })
})();

