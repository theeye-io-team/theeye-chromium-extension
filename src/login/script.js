const form = document.querySelector('form#login')
form.addEventListener('submit', (e) => {
  e.stopPropagation()
  e.preventDefault()

  let creds = {};
	let formData = new FormData(form);
	for (let key of formData.keys()) {
		creds[key] = formData.get(key);
	}


  fetch('https://app.theeye.io/api/auth/login', {
		method: 'POST',
		body: JSON.stringify(creds),
    headers: new Headers({
      'Authorization': 'Basic ' + btoa(creds.username + ":" + creds.password), 
      'Content-Type': 'application/json;charset=UTF-8'
    })
	}).then(function (response) {
		if (response.ok) {
			return response.json();
		}
		return Promise.reject(response);
	}).then(function (data) {
    const { access_token } = data
    fetch('https://app.theeye.io/api/bot/installer', {
      method: 'GET',
      headers: new Headers({
        'Authorization': 'Bearer ' + access_token, 
      })
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    }).then(function (data) {
      const client = { 
        id: data.client_id,
        secret: data.client_secret,
        customer_name: data.customer_name
      }
      console.log(client)
      fetch('https://app.theeye.io/api/auth/login', {
        method: 'POST',
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
        chrome.storage.local.set({ credentials: { ...client, token: data.access_token } })
        fetch('https://supervisor.theeye.io/host', {
          method: 'POST',
          headers: new Headers({
            'Authorization': 'Bearer ' + data.access_token, 
            'Content-Type': 'application/json;charset=UTF-8'
          }),
          body: JSON.stringify({ hostname: 'Chromium agent' }) // TODO: Make this user editable
        }).then(function (response) {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        }).then(function (data) {
          chrome.storage.local.set({ agent: data })
          window.close()
        })  
      })
    })
  }).catch(function (error) {
    alert('Credentials invalid')
		console.warn(error);
	});
})