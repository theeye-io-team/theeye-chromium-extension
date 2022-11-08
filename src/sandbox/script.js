window.executeCode = (url, script) => {
  const frame = document.querySelector('#frame')
  frame.src = url
  const frameDOM = frame.contentWindow
    ? frame.contentWindow.document
    : frame.contentDocument

  script = script.replace(/document./g, 'frameDOM.')

  eval(script)
}
