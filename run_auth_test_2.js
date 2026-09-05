import fetch from 'node-fetch';
async function test() {
  const res = await fetch('http://localhost:3000/api/auth/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData: "fake", devModeId: 8594155055 })
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}
test();
