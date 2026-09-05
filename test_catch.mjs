async function test() {
  const p = Promise.reject(new SyntaxError("Unexpected token '<', \"<!doctype \"... is not valid JSON"));
  const errData = await p.catch(() => ({ error: "Noma'lum xatolik" }));
  console.log("errData:", errData);
}
test();
