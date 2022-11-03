const promptUserForCredentials = () => {
  chrome.tabs.create({
    url: 'login/index.html'
  })
}

chrome.runtime.onInstalled.addListener((event) => {
  if (event.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    promptUserForCredentials()
  }
})

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log({changes, namespace})
})