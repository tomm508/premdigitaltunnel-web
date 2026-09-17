const postData = JSON.stringify({
  fields: {
    cpuLoad: { integerValue: 10 },
    ramUsage: { integerValue: "20" }
  }
});

fetch('https://firestore.googleapis.com/v1/projects/premdigital-vpn/databases/(default)/documents/vps_nodes/test_node_xyz?key=AIzaSyCBKAcHs0TldS7_Ia78Mig3TR8tJMbt0jw', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: postData
}).then(r => r.json()).then(console.log).catch(console.error);
