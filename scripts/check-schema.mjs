import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

const CONTRACT = "0xDFfd297E57e9285eEda7Ea87a210D5b1351B1a23";
const client = createClient({ chain: testnetBradbury });

async function tryRead(fn, args = []) {
  try {
    const r = await client.readContract({ address: CONTRACT, functionName: fn, args });
    console.log(`${fn}:`, JSON.stringify(r, null, 2));
  } catch(e) {
    console.log(`${fn}: ERROR -`, e.message?.slice(0, 200));
  }
}

console.log("=== Checking deployed contract schema ===\n");

await tryRead("getContractSchema");
await tryRead("ABI");
await tryRead("get_contract_name");
await tryRead("get_functions");
await tryRead("functions");
await tryRead("list_functions");

// Try to read a case to see if storage works
await tryRead("get_case", ["nonexistent"]);
await tryRead("get_statistics");
