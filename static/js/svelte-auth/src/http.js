const Response = resp=>{
  if (resp.ok) {
    if (resp.headers.get('Content-Type').toLowerCase().indexOf('application/json') >= 0) return resp.json();
    else return resp.text();
  }
  else return Promise.reject(resp);
};

/*async*/ function postJSON(url = '', data = {}) {
  // Default options are marked with *
/*  const response = await*/ return fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    //~ mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //~ credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    //~ redirect: 'follow', // manual, *follow, error
    //~ referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  }).then(Response)
  .catch(error => Promise.reject(error));
  //~ return response.json(); // parses JSON response into native JavaScript objects
}

export default {
  "post":postJSON,
  "get": (url)=>fetch(url, {"cache": 'no-cache',}).then(Response).catch(error => Promise.reject(error)),
};
