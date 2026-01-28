// Rust Native 模块加载器
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
// 加载 native 模块
const native = require(join(__dirname, "..", "native", "index.cjs"));
export const kiroSearch = native.kiroSearch;
export const kiroBatchSearch = native.kiroBatchSearch;
//# sourceMappingURL=native.js.map