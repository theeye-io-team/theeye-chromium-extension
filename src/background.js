const promptUserForCredentials = () => {
  chrome.tabs.create({
    url: 'login/index.html'
  })
}

const refreshToken = () => {
  // TODO: Fix
  chrome.storage.local.get(['client'], (res) => {
    let client = res.client

    fetch(`https://app.theeye.io/api/token`, {
      method: 'POST',
      body: JSON.stringify({
        username: client.id,
        password: client.secret
      }),
      headers: new Headers({
        'Authorization': 'Basic ' + btoa(client.id + ":" + client.secret),
        'Content-Type': 'application/json;charset=UTF-8'
      })
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    }).then(function (data) {
      console.log(data)
    })
  })
}

const fetchJobs = () => {
  chrome.storage.local.get(['access_token', 'client'], (res) => {
    fetch(`https://supervisor.theeye.io/${ res.client.customer_name }/job?hostname=ChromiumAgent`, {
      method: 'GET',
      headers: new Headers({
        'Authorization': 'Bearer ' + res.access_token,
        'Content-Type': 'application/json;charset=UTF-8'
      })
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    }).then(function (data) {
      if (data.jobs.length > 0) {
        clearInterval(interval);
        executeJobs(data.jobs)
      }
    })
  })
}

executeJobs = (jobs) => {
  console.log(jobs)
  chrome.storage.local.get(['access_token', 'client'], (res) => {
    jobs.forEach(job => {
      console.log(job)
      fetch(`https://supervisor.theeye.io/${ res.client.customer_name }/file/${ job.script.id }/download`, {
        method: 'GET',
        headers: new Headers({
          'Authorization': 'Bearer ' + res.access_token,
          'Content-Type': 'application/json;charset=UTF-8'
        })
      }).then(response => response.text())
        .then(script => {
          executeScript(job.script_runas.split(' ')[0], script, (result) => {
            
            fetch(`https://supervisor.theeye.io/${ res.client.customer_name }/job/${ job.id }`, {
            method: 'PUT',
            headers: new Headers({
              'Authorization': 'Bearer ' + res.access_token,
              'Content-Type': 'application/json;charset=UTF-8'
            }),
            body: JSON.stringify(result)
          })
          
          interval = setInterval(fetchJobs, 10000)
        })
      })
    })
  })
}

let interval

chrome.runtime.onInstalled.addListener((event) => {
  if (event.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    promptUserForCredentials()
  } else {
    interval = setInterval(fetchJobs, 10000)
  }
})

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log({ changes, namespace })
  if (Object.keys(changes).includes("agent")) {
    console.log('success!')
    if (!interval) interval = setInterval(fetchJobs, 10000)
  }
})

const executeScript = async (url, script, callback) => {
  chrome.tabs.create({ url: '/sandbox/index.html' })
  let executed = false

  chrome.tabs.onUpdated.addListener(function (tabId , info) {
    if (info.status === 'complete' && !executed) {
      executed = true
      chrome.scripting.executeScript({
        target: {tabId: tabId},
        func: (url, script) => {
          window.executeCode(url, script)
        },
        args: [url, script]
      }, callback({
        result: {
          data: {
            output: 'aajasdja sdj ajsj dajs'
          },
          state: 'success'
        }
      }))
    }
  })
}
