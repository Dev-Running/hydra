"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const config_1 = require("@/main/config");
const PORT = process.env.PORT ? process.env.PORT : 3000;
config_1.app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
