document.querySelector("#run-btn").addEventListener('click', async (e) => {
  chrome.tabs.create({url: "https://www.google.com"})
  let executed = false

  chrome.tabs.onUpdated.addListener(function (tabId , info) {
    if (info.status === 'complete' && !executed) {
      chrome.scripting.executeScript({
        target: {tabId: tabId},
        func: (a) => {
          executed = true
          document.querySelector('input[name="q"]').value = 'Hello, world!'
          document.querySelector('form[action="/search"]').submit()
        }
      })
    }
  });
})