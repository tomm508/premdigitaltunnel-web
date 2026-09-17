const firebaseConfig = { projectId: 'abc' };
const x = `PROJECT_ID="${firebaseConfig.projectId}"`; // this is fine
// But if I do:
try {
  const y = `PROJECT_ID="${PROJECT_ID}"`;
  console.log("Success");
} catch(e) {
  console.log("Error:", e.message);
}
