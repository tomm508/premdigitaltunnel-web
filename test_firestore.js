const postData = JSON.stringify({
  fields: {
    name: { stringValue: 'Test Node' },
    status: { stringValue: 'Online' }
  }
});

fetch('https://firestore.googleapis.com/v1/projects/ais-dev-ka7cnzv6vkn4rk657flo3u/databases/(default)/documents/vps_nodes/test_node_xyz', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: postData
}).then(r => r.json()).then(console.log).catch(console.error);
