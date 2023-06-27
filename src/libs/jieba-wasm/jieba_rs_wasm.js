import * as wasm from "./jieba_rs_wasm_bg.wasm";
import { __wbg_set_wasm } from "./jieba_rs_wasm_bg.js";
__wbg_set_wasm(wasm);
export * from "./jieba_rs_wasm_bg.js";
