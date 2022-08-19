import {history} from './history';

let Http = '';
if (window.REACT_APP_CONFIG) {
  Http = window.REACT_APP_CONFIG.sso_api;
}
function getCookie(name) {
  const arr = document.cookie.split('; ');
  for (let i = 0, len = arr.length; i < len; i++) {
    const temp = arr[i].split('=');
    if (temp[0] === name) return unescape(temp[1]);
  }
  return null;
};
function headers() {
  const token = localStorage.getItem('token');
  const XSRF = getCookie('XSRF-TOKEN');
  return {
    'Access-Control-Allow-Origin': '*',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer ${token}`,
    'Authorization': '',
    'X-XSRF-TOKEN':`${XSRF}`,
    token,
  };
}

function formHeaders() {
  const token = localStorage.getItem('token');
  const XSRF = getCookie('XSRF-TOKEN');
  return {
    'Access-Control-Allow-Origin': '*',
    // 'Authorization': `Bearer ${token}`,
    'Authorization': '',
    'X-XSRF-TOKEN':`${XSRF}`,
    token,
  };
}

function blobHeaders() {
  const token = localStorage.getItem('token');
  const XSRF = getCookie('XSRF-TOKEN');
  return {
    'Access-Control-Allow-Origin': '*',
    'X-XSRF-TOKEN':`${XSRF}`,
    token,
  };
}

function parseResponse(response) {
  return response.json().then((json) => {
    if (json.status === 401 || json.code === 401) {
      localStorage.setItem('redirect', json.Redirect);
      history.replace('/full/timeout');
      return Promise.reject(json);
    }
    return json;
  });
}

function parseBlob(response) {
  return response.blob().then((blob) => {
    return blob;
  });
}

function queryString(params) {
  const query = Object.keys(params)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
  return `${query.length ? '?' : ''}${query}`;
}

export default {
  get(url, params = {}) {
    const fetchUrl = `${Http}/${url}${queryString(params)}`
    return fetch(fetchUrl, {
      method: 'GET',
      headers: headers(),

      credentials: 'include',
    })
      .then(parseResponse);
  },

  getBlob(url, params = {}) {
    const fetchUrl = `${Http}/${url}${queryString(params)}`
    return fetch(fetchUrl, {
      method: 'GET',
      headers: blobHeaders(),
      responseType: 'blob',
      credentials: 'include',
    })
      .then(parseBlob);
  },

  fetch(url, params = {}) {
    return this.get(url, params);
  },

  post(url, data) {
    const body = JSON.stringify(data);
    const fetchUrl = `${Http}/${url}`;
    return fetch(fetchUrl, {
      method: 'POST',
      headers: headers(),
      credentials: 'include',
      body,
    })
      .then(parseResponse);
  },

  postForm(url, formData) {
    const fetchUrl = `${Http}/${url}`;
    return fetch(fetchUrl, {
      method: 'POST',
      headers: formHeaders(),
      credentials: 'include',
      body: formData,
    })
      .then(parseResponse);
  },

  patch(url, data) {
    const body = JSON.stringify(data);
    const fetchUrl = `${Http}/${url}`;
    return fetch(fetchUrl, {
      method: 'PATCH',
      headers: headers(),

      credentials: 'include',
      body,
    })
      .then(parseResponse);
  },

  put(url, data) {
    const body = JSON.stringify(data);
    const fetchUrl = `${Http}/${url}`;
    return fetch(fetchUrl, {
      method: 'PUT',
      headers: headers(),

      credentials: 'include',
      body,
    })
      .then(parseResponse);
  },

  delete(url) {
    const fetchUrl = `${Http}/${url}`;
    return fetch(fetchUrl, {
      method: 'DELETE',
      headers: headers(),
      credentials: 'include',
    })
      .then(parseResponse);
  },
};
