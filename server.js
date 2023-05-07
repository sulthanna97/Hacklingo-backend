import app from "./app.js";
const port = 4001;

app.listen(port, () => {
  console.log("app now listening for requests!!!", port);
});