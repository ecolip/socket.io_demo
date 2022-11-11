const api = {
  hostname: 'https://cowork2.site/api/1.0',
  getProfile(jwtToken: string) {
    return fetch(`${this.hostname}/user/profile`, {
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      }),
    }).then((response) => response.json());
  },
  getMessages(jwtToken: string, body: any) {
    return fetch(`${this.hostname}/messages/changeroom`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      }),
      body: JSON.stringify(body),
    }).then((response) => response.json());
  },
  addMessages(jwtToken: string, body: any) {
    return fetch(`${this.hostname}/messages`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      }),
      body: JSON.stringify(body),
    }).then((response) => response.json());
  },
};

export default api;
