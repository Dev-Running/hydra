import "module-alias/register";
import "../websocket/websocket";

import {serverHTTP} from "./config";

const PORT = process.env.PORT ? process.env.PORT : 5000;

serverHTTP.listen(5000, () => {
  console.log(`Server is running on port ${PORT}`);
});
