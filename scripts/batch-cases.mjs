import { execSync } from "child_process";

function run(cmd) {
  console.log(`> ${cmd}`);
  const out = execSync(cmd, { timeout: 120000, shell: true });
  console.log(out.toString().slice(0, 300));
  return out.toString();
}

const RPC = "https://bradbury.genlayer.org/";
const CONTRACT = "0x10d7c33c3709dDd5f701C34b960C0d099F0Ca32d";

const cases = [
  {
    title: "Data Breach at FinCorp HQ",
    description: "Sensitive client financial data accessed by unauthorized party via compromised VPN credential. Affected records include 15,000 client profiles with tax IDs and account numbers.",
    category: "Cybercrime",
    damage: 450000,
  },
  {
    title: "Retail Inventory Shrinkage — Warehouse 12",
    description: "Systematic inventory discrepancy discovered during quarterly audit. Stock records show 230 units of high-value electronics missing over 3-month period, valued at $178,000.",
    category: "Theft",
    damage: 178000,
  },
  {
    title: "Construction Site Equipment Theft",
    description: "Two excavators and a bulldozer stolen from secured construction site overnight. CCTV cameras were disabled prior to the incident. Security guard reported no suspicious activity.",
    category: "Robbery",
    damage: 520000,
  },
  {
    title: "Insurance Claim Fraud Investigation",
    description: "Claimant submitted documentation for vehicle accident that never occurred. Police report number corresponds to a different incident. Medical invoices appear digitally altered.",
    category: "Fraud",
    damage: 35000,
  },
  {
    title: "Graffiti Vandalism at Public Library",
    description: "Exterior walls of the main library branch defaced with political graffiti spanning 40 meters. Security footage shows three masked individuals during night hours. Cleaning costs estimated at $12,000.",
    category: "Vandalism",
    damage: 12000,
  },
  {
    title: "Altercation at Municipal Court Entrance",
    description: "Two parties involved in a custody dispute engaged in a physical fight in the courthouse lobby. One individual sustained minor injuries. Bailiffs intervened and police were called.",
    category: "Assault",
    damage: 5000,
  },
  {
    title: "Ransomware Attack on Regional Hospital",
    description: "Critical medical record systems encrypted by ransomware. Patient care rerouted to neighboring hospitals for 72 hours. No patient data exfiltrated per forensic analysis. Recovery costs included.",
    category: "Cybercrime",
    damage: 950000,
  },
  {
    title: "Cargo Hijacking at Port Terminal",
    description: "Shipping container carrying electronics hijacked during transport from port to distribution center. Armed individuals intercepted the truck at a rest stop. Driver unharmed. Container valued at $340,000.",
    category: "Robbery",
    damage: 340000,
  },
  {
    title: "Academic Credential Forgery Ring",
    description: "Organized operation discovered selling forged university diplomas and transcripts. Over 200 fake credentials sold across 15 institutions in 3 years. Scheme uncovered during employer background check.",
    category: "Fraud",
    damage: 89000,
  },
  {
    title: "Park Equipment Vandalism Spree",
    description: "Multiple playgrounds and public park facilities vandalized over two weekends. Damaged equipment includes slides, benches, lighting fixtures, and irrigation systems across 5 park locations.",
    category: "Vandalism",
    damage: 28000,
  },
];

async function main() {
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    const args = [
      `"${c.title}"`,
      `"${c.description}"`,
      c.category,
      c.damage,
      '""',
      '"[]"',
    ].join(" ");

    const cmd = `npx genlayer write --rpc ${RPC} ${CONTRACT} submit_case --args ${args}`;
    console.log(`\n--- [${i + 1}/${cases.length}] ${c.title} ---`);
    try {
      const out = run(cmd);
      if (out.includes("Error") || out.includes("error") || out.includes("rejected")) {
        console.log("  FAILED, skipping");
      } else {
        console.log("  OK");
      }
    } catch (e) {
      console.log(`  ERROR: ${e.message.slice(0, 100)}`);
    }
  }
  console.log("\n=== DONE ===");
}

main().catch(console.error);
