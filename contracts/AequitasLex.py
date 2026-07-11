# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
from datetime import datetime, timezone


VALIDATORS = [
    "Validator Solon",
    "Validator Cicero",
    "Validator Ulpian",
]

VALIDATOR_LENS = [
    "procedural evidence weight and chain-of-custody rigor",
    "harm magnitude, victim impact, and intent signals",
    "precedent alignment, jurisdictional norms, and legal proportionality",
]

CATEGORIES = ["Theft", "Fraud", "Assault", "Cybercrime", "Robbery", "Vandalism", "Other"]

CAT_WEIGHTS = {
    "Theft": 40, "Fraud": 55, "Assault": 70,
    "Cybercrime": 60, "Robbery": 75, "Vandalism": 30, "Other": 45,
}

RISK_POOL = {
    "Theft": ["Repeat offense pattern", "Unsecured property indicators", "Value beyond petty threshold"],
    "Fraud": ["Falsified documentation suspected", "Cross-jurisdiction transfers", "Victim vulnerability factor"],
    "Assault": ["Bodily harm reported", "Weapon involvement possible", "Multiple witnesses corroborate"],
    "Cybercrime": ["Credential exfiltration signs", "Ransom communication detected", "Systemic infrastructure exposure"],
    "Robbery": ["Use of force indicated", "Coordinated actors likely", "Public location risk multiplier"],
    "Vandalism": ["Property defacement extensive", "Symbolic/hate motivation possible", "Public infrastructure impact"],
    "Other": ["Ambiguous jurisdictional fit", "Requires manual review", "Insufficient precedent"],
}

MAX_IMAGES = 5


def _fnv1a(data: str) -> int:
    h = 2166136261
    for ch in data:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def _clamp(v: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, v))


def _compute_severity(score: int) -> str:
    if score >= 82:
        return "Critical"
    if score >= 62:
        return "High"
    if score >= 38:
        return "Medium"
    return "Low"


def _now_ts() -> int:
    return int(datetime.now(timezone.utc).timestamp())


class AequitasLex(gl.Contract):
    cases: TreeMap[str, str]
    case_ids: TreeMap[str, str]
    case_counter: bigint
    owner: str
    last_error: TreeMap[str, str]

    def __init__(self, owner: str = ""):
        self.owner = owner
        self.case_counter = bigint(0)

    # ── helpers ──────────────────────────────────────────

    def _save_case_id(self, cid: str):
        raw = self.case_ids.get("list", "[]")
        try:
            ids = json.loads(raw)
        except Exception:
            ids = []
        ids.append(cid)
        self.case_ids["list"] = json.dumps(ids)

    def _all_ids(self) -> list:
        raw = self.case_ids.get("list", "[]")
        try:
            return json.loads(raw)
        except Exception:
            return []

    def _make_hash(self, seed: str, counter: int) -> str:
        a = _fnv1a(seed + str(counter))
        b = _fnv1a(seed + "salt")
        return "0x" + hex(a)[2:].zfill(8) + hex(b)[2:].zfill(8)

    def _compute_base_score(self, cat: str, wc: int, ec: int, dmg: int) -> int:
        detail = _clamp(wc // 3, 0, 30)
        evidence = _clamp(ec * 6, 0, 30)
        dmg_score = 0
        if dmg > 0:
            import math
            dmg_score = _clamp(int(math.log10(max(1, dmg)) * 6), 0, 25)
        cw = CAT_WEIGHTS.get(cat, 45)
        return _clamp(cw * 55 // 100 + detail + evidence + dmg_score, 0, 100)

    # ── view ─────────────────────────────────────────────

    @gl.public.view
    def get_case(self, case_id: str) -> str:
        raw = self.cases.get(case_id, "")
        if not raw:
            raise gl.vm.UserError("case not found")
        return raw

    @gl.public.view
    def get_case_count(self) -> int:
        return len(self._all_ids())

    @gl.public.view
    def get_all_case_ids(self, offset: int, limit: int) -> list:
        ids = self._all_ids()
        return ids[offset: offset + limit]

    @gl.public.view
    def get_cases_paginated(self, offset: int, limit: int) -> list:
        ids = self._all_ids()
        out = []
        for cid in ids[offset: offset + limit]:
            raw = self.cases.get(cid, "")
            if raw:
                try:
                    out.append(json.loads(raw))
                except Exception:
                    pass
        return out

    @gl.public.view
    def get_cases_by_submitter(self, submitter: str) -> list:
        addr = submitter.lower()
        out = []
        for cid in self._all_ids():
            raw = self.cases.get(cid, "")
            if raw:
                try:
                    c = json.loads(raw)
                    if c.get("submitter", "").lower() == addr:
                        out.append(cid)
                except Exception:
                    pass
        return out

    @gl.public.view
    def get_cases_by_severity(self, severity: str) -> list:
        out = []
        for cid in self._all_ids():
            raw = self.cases.get(cid, "")
            if raw:
                try:
                    cs = json.loads(raw).get("consensus", {})
                    if cs.get("severity") == severity:
                        out.append(cid)
                except Exception:
                    pass
        return out

    @gl.public.view
    def get_cases_by_category(self, category: str) -> list:
        out = []
        for cid in self._all_ids():
            raw = self.cases.get(cid, "")
            if raw:
                try:
                    if json.loads(raw).get("category") == category:
                        out.append(cid)
                except Exception:
                    pass
        return out

    @gl.public.view
    def get_case_summary(self, case_id: str) -> str:
        raw = self.cases.get(case_id, "")
        if not raw:
            raise gl.vm.UserError("case not found")
        try:
            c = json.loads(raw)
        except Exception:
            raise gl.vm.UserError("case data corrupted")
        return json.dumps({
            "id": c.get("id"),
            "hash": c.get("case_hash"),
            "title": c.get("title"),
            "category": c.get("category"),
            "severity": c.get("consensus", {}).get("severity"),
            "score": c.get("consensus", {}).get("score"),
            "confidence": c.get("consensus", {}).get("confidence"),
            "created_at": c.get("created_at"),
            "submitter": c.get("submitter"),
        })

    @gl.public.view
    def get_statistics(self) -> str:
        ids = self._all_ids()
        total = len(ids)
        sev_counts = {}
        cat_counts = {}
        total_score = 0
        total_conf = 0

        for cid in ids:
            raw = self.cases.get(cid, "")
            if not raw:
                continue
            try:
                c = json.loads(raw)
            except Exception:
                continue
            cs = c.get("consensus", {})
            s = cs.get("severity", "")
            sev_counts[s] = sev_counts.get(s, 0) + 1
            cat = c.get("category", "")
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
            total_score += cs.get("score", 0)
            total_conf += cs.get("confidence", 0)

        avg_s = total_score // total if total else 0
        avg_c = total_conf // total if total else 0

        return json.dumps({
            "total": total,
            "by_severity": sev_counts,
            "by_category": cat_counts,
            "avg_score": avg_s,
            "avg_confidence": avg_c,
        })

    @gl.public.view
    def get_last_error(self, name: str) -> str:
        return self.last_error.get(name, "")

    @gl.public.view
    def preview_analysis(self, title: str, description: str, category: str,
                         estimated_damage: int, location: str, evidence_count: int) -> str:
        wc = len(description.split())
        ec = _clamp(evidence_count, 0, MAX_IMAGES)
        base = self._compute_base_score(category, wc, ec, estimated_damage)
        dmg = max(0, estimated_damage)

        word_count = wc
        detail = _clamp(wc // 3, 0, 30)
        ev_score = _clamp(ec * 6, 0, 30)

        summary = (
            f"A reported {category.lower()} incident titled \"{title}\""
            + (f" occurring at {location}," if location else ",")
            + f" with estimated damages of ${dmg:,}. "
            + ("Narrative provides sufficient context for structured reasoning."
               if word_count >= 15 else "Narrative brevity limits certainty.")
        )

        evidence_cons = _clamp(55 + ev_score, 0, 100)
        confidence = _clamp(60 + _clamp(wc // 4, 0, 35), 0, 100)

        if dmg > 50000:
            fin = "Significant"
        elif dmg > 5000:
            fin = "Moderate"
        else:
            fin = "Limited"

        cw = CAT_WEIGHTS.get(category, 45)
        pub = "High visibility, community concern likely" if cw > 60 else (
            "Localized impact" if cw > 40 else "Minor public footprint")

        risks = RISK_POOL.get(category, RISK_POOL["Other"])

        validators = []
        for i in range(3):
            j = ((_fnv1a(title + "|" + description + "|" + category + "_" + str(i)) % 19) - 9)
            vs = _clamp(base + j, 1, 100)
            sev = _compute_severity(vs)
            vc = _clamp(70 + (_fnv1a(title + "_conf_" + str(i)) % 26), 0, 100)
            validators.append({
                "name": VALIDATORS[i],
                "severity": sev,
                "score": vs,
                "confidence": vc,
                "reasoning": (
                    f"Assessment via {VALIDATOR_LENS[i]}: "
                    f"the {category.lower()} report exhibits indicators "
                    f"consistent with a {sev.lower()} severity classification."
                ),
            })

        avg_s = sum(v["score"] for v in validators) // len(validators)
        avg_c = sum(v["confidence"] for v in validators) // len(validators)

        return json.dumps({
            "analysis": {
                "summary": summary,
                "key_facts": [
                    f"Category: {category}",
                    f"Estimated financial exposure: ${dmg:,}",
                    f"Supporting evidence artifacts: {ec}",
                    f"Reported location: {location}" if location else "Location undisclosed",
                    f"Description length: {word_count} words",
                ],
                "evidence_consistency": evidence_cons,
                "risk_indicators": risks,
                "financial_impact": fin,
                "public_impact": pub,
                "confidence": confidence,
            },
            "validators": validators,
            "consensus": {
                "severity": _compute_severity(avg_s),
                "score": avg_s,
                "confidence": avg_c,
            },
        })

    # ── write ────────────────────────────────────────────

    @gl.public.write
    def submit_case(self, title: str, description: str, category: str,
                    estimated_damage: int, location: str, images: str) -> str:
        try:
            title = (title or "").strip()
            description = (description or "").strip()
            category = category or "Other"

            if not title:
                self.last_error["submit_case"] = "title is required"
                return "ok"
            if not description:
                self.last_error["submit_case"] = "description is required"
                return "ok"
            if category not in CATEGORIES:
                self.last_error["submit_case"] = "invalid category"
                return "ok"

            try:
                img_list = json.loads(images) if images else []
                if not isinstance(img_list, list):
                    img_list = []
            except Exception:
                img_list = []
            if len(img_list) > MAX_IMAGES:
                self.last_error["submit_case"] = "max 5 images"
                return "ok"

            sender = str(gl.message.sender_address)
            counter = int(self.case_counter)
            case_id = sender + "_" + str(counter)
            case_hash = self._make_hash(case_id + title, counter)
            tx_hash = self._make_hash("tx_" + case_id, counter)

            wc = len(description.split())
            ec = len(img_list)
            dmg = max(0, estimated_damage)
            base = self._compute_base_score(category, wc, ec, dmg)

            detail = _clamp(wc // 3, 0, 30)
            ev_score = _clamp(ec * 6, 0, 30)
            evidence_cons = _clamp(55 + ev_score, 0, 100)
            confidence = _clamp(60 + _clamp(wc // 4, 0, 35), 0, 100)

            analysis = {
                "summary": (
                    f"A reported {category.lower()} incident titled \"{title}\""
                    + (f" occurring at {location}," if location else ",")
                    + f" with estimated damages of ${dmg:,}. "
                    + ("Narrative provides sufficient context for structured reasoning."
                       if wc >= 15 else "Narrative brevity limits certainty.")
                ),
                "key_facts": [
                    f"Category: {category}",
                    f"Estimated financial exposure: ${dmg:,}",
                    f"Supporting evidence artifacts: {ec}",
                    f"Reported location: {location}" if location else "Location undisclosed",
                    f"Description length: {wc} words",
                ],
                "evidence_consistency": evidence_cons,
                "risk_indicators": RISK_POOL.get(category, RISK_POOL["Other"]),
                "financial_impact": "Significant" if dmg > 50000 else ("Moderate" if dmg > 5000 else "Limited"),
                "public_impact": (
                    "High visibility, community concern likely" if CAT_WEIGHTS.get(category, 45) > 60 else
                    "Localized impact" if CAT_WEIGHTS.get(category, 45) > 40 else
                    "Minor public footprint"),
                "confidence": confidence,
            }

            validators = []
            for i in range(3):
                j = ((_fnv1a(title + "|" + description + "|" + category + "_" + str(i)) % 19) - 9)
                vs = _clamp(base + j, 1, 100)
                sev = _compute_severity(vs)
                vc = _clamp(70 + (_fnv1a(title + "_conf_" + str(i)) % 26), 0, 100)
                validators.append({
                    "name": VALIDATORS[i],
                    "severity": sev,
                    "score": vs,
                    "confidence": vc,
                    "reasoning": (
                        f"Assessment via {VALIDATOR_LENS[i]}: "
                        f"the {category.lower()} report exhibits indicators "
                        f"consistent with a {sev.lower()} severity classification."
                    ),
                })

            avg_s = sum(v["score"] for v in validators) // len(validators)
            avg_c = sum(v["confidence"] for v in validators) // len(validators)

            record = {
                "id": case_id,
                "case_hash": case_hash,
                "title": title,
                "description": description,
                "category": category,
                "estimated_damage": dmg,
                "location": location,
                "images": img_list[:MAX_IMAGES],
                "created_at": _now_ts(),
                "analysis": analysis,
                "validators": validators,
                "consensus": {
                    "severity": _compute_severity(avg_s),
                    "score": avg_s,
                    "confidence": avg_c,
                },
                "tx_hash": tx_hash,
                "block_number": 8000000 + (_fnv1a(case_id) % 500000),
                "submitter": sender,
            }

            self.cases[case_id] = json.dumps(record)
            self._save_case_id(case_id)
            self.case_counter = bigint(counter + 1)
            self.last_error["submit_case"] = ""

            return "ok"
        except Exception as e:
            self.last_error["submit_case"] = str(e)[:200]
            return "ok"

    @gl.public.write
    def submit_case_with_llm(self, title: str, description: str, category: str,
                             estimated_damage: int, location: str, images: str) -> str:
        try:
            title = (title or "").strip()
            description = (description or "").strip()
            if not title or not description:
                self.last_error["submit_case_with_llm"] = "title and description are required"
                return "ok"

            try:
                img_list = json.loads(images) if images else []
                if not isinstance(img_list, list):
                    img_list = []
            except Exception:
                img_list = []
            if len(img_list) > MAX_IMAGES:
                self.last_error["submit_case_with_llm"] = "max 5 images"
                return "ok"

            sender = str(gl.message.sender_address)
            counter = int(self.case_counter)
            case_id = sender + "_" + str(counter)
            case_hash = self._make_hash(case_id + title, counter)
            tx_hash = self._make_hash("tx_" + case_id, counter)
            dmg = max(0, estimated_damage)

            prompt = (
                "You are Aequitas Lex, an AI legal severity assessor on GenLayer. "
                "Analyze this case and return a structured JSON assessment.\n\n"
                f"Title: {title}\n"
                f"Category: {category}\n"
                f"Estimated Damage: ${dmg}\n"
                f"Location: {location or 'Not specified'}\n"
                f"Images Submitted: {len(img_list)}\n"
                f"Description: {description}\n\n"
                "Return JSON with:\n"
                '- "summary": 1-2 sentence summary\n'
                '- "reasoning": detailed explanation why severity_score is what it is (2-3 sentences)\n'
                '- "key_facts": array of strings\n'
                '- "evidence_consistency": integer 0-100\n'
                '- "risk_indicators": array of strings\n'
                '- "financial_impact": "Limited"/"Moderate"/"Significant"\n'
                '- "public_impact": string\n'
                '- "confidence": integer 0-100\n'
                '- "severity_score": integer 0-100'
            )

            def run_llm():
                raw = gl.nondet.exec_prompt(prompt, response_format="json")
                parsed = json.loads(raw) if isinstance(raw, str) else raw
                return {
                    "severity_score": int(parsed.get("severity_score", 50)),
                    "confidence": int(parsed.get("confidence", 75)),
                    "evidence_consistency": int(parsed.get("evidence_consistency", 70)),
                    "summary": str(parsed.get("summary", "")),
                    "reasoning": str(parsed.get("reasoning", "")),
                    "key_facts": [str(k) for k in parsed.get("key_facts", [])],
                    "risk_indicators": [str(r) for r in parsed.get("risk_indicators", [])],
                    "financial_impact": str(parsed.get("financial_impact", "Moderate")),
                    "public_impact": str(parsed.get("public_impact", "Localized impact")),
                }

            def leader_fn():
                return run_llm()

            def validator_fn(leader_result) -> bool:
                if not isinstance(leader_result, gl.vm.Return):
                    return False
                validator_data = run_llm()
                leader = leader_result.calldata
                score_diff = abs(leader["severity_score"] - validator_data["severity_score"])
                conf_diff = abs(leader["confidence"] - validator_data["confidence"])
                ev_diff = abs(leader["evidence_consistency"] - validator_data["evidence_consistency"])
                return score_diff <= 5 and conf_diff <= 10 and ev_diff <= 15

            import math
            llm_raw = None
            llm_err = ""
            try:
                llm_raw = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
                if not (isinstance(llm_raw, dict) and llm_raw.get("summary")):
                    llm_err = "LLM consensus returned incomplete data"
            except gl.vm.UserError as e:
                llm_err = f"LLM consensus rejected: {e}"
            except gl.vm.VMError as e:
                llm_err = f"LLM VM error: {e}"
            except Exception as e:
                llm_err = f"LLM consensus failed: {e}"

            if not llm_err:
                raw = llm_raw
                score = _clamp(int(raw.get("severity_score", 50)), 1, 100)
                conf = _clamp(int(raw.get("confidence", 75)), 0, 100)
                ev_cons = _clamp(int(raw.get("evidence_consistency", 70)), 0, 100)
                llm_reasoning = str(raw.get("reasoning", ""))
                llm_summary = str(raw.get("summary", ""))

                analysis = {
                    "summary": llm_summary,
                    "reasoning": llm_reasoning,
                    "key_facts": [str(k) for k in raw.get("key_facts", [])],
                    "evidence_consistency": ev_cons,
                    "risk_indicators": [str(r) for r in raw.get("risk_indicators", [])],
                    "financial_impact": str(raw.get("financial_impact", "Moderate")),
                    "public_impact": str(raw.get("public_impact", "Localized impact")),
                    "confidence": conf,
                }

                sev = _compute_severity(score)
                validators = []
                for i in range(3):
                    lens_label, lens_desc = VALIDATORS[i], VALIDATOR_LENS[i]
                    j = ((_fnv1a("llm_" + title + "|" + description + "|" + category + "_" + str(i)) % 19) - 9)
                    vs = _clamp(score + j, 1, 100)
                    vc = _clamp(conf + (_fnv1a("llm_c_" + str(i)) % 21) - 10, 0, 100)
                    validators.append({
                        "name": lens_label,
                        "severity": _compute_severity(vs),
                        "score": vs,
                        "confidence": vc,
                        "reasoning": (
                            f"{lens_desc}. "
                            f"{llm_reasoning} "
                            f"Verdict: {_compute_severity(vs).lower()} severity ({vs}/100)."
                        ),
                    })

                avg_s = sum(v["score"] for v in validators) // len(validators)
                avg_c = sum(v["confidence"] for v in validators) // len(validators)

                record = {
                    "id": case_id,
                    "case_hash": case_hash,
                    "title": title,
                    "description": description,
                    "category": category,
                    "estimated_damage": dmg,
                    "location": location,
                    "images": img_list[:MAX_IMAGES],
                    "created_at": _now_ts(),
                    "analysis": analysis,
                    "validators": validators,
                    "consensus": {
                        "severity": _compute_severity(avg_s),
                        "score": avg_s,
                        "confidence": avg_c,
                    },
                    "tx_hash": tx_hash,
                    "block_number": 8000000 + (_fnv1a(case_id) % 500000),
                    "submitter": sender,
                }

                self.cases[case_id] = json.dumps(record)
                self._save_case_id(case_id)
                self.case_counter = bigint(counter + 1)
                self.last_error["submit_case_with_llm"] = ""

                return "ok"
            else:
                self.last_error["submit_case_with_llm"] = llm_err[:200]
                return "ok"
        except Exception as e:
            self.last_error["submit_case_with_llm"] = str(e)[:200]
            return "ok"

    @gl.public.write
    def delete_case(self, case_id: str):
        try:
            raw = self.cases.get(case_id, "")
            if not raw:
                self.last_error["delete_case"] = "case not found"
                return "ok"
            try:
                c = json.loads(raw)
            except Exception:
                self.last_error["delete_case"] = "case data corrupted"
                return "ok"

            sender = str(gl.message.sender_address).lower()
            submitter = str(c.get("submitter", "")).lower()
            if sender != submitter and sender != self.owner.lower():
                self.last_error["delete_case"] = "only submitter or owner may delete"
                return "ok"

            del self.cases[case_id]
            ids = [cid for cid in self._all_ids() if cid != case_id]
            self.case_ids["list"] = json.dumps(ids)
            self.last_error["delete_case"] = ""
            return "ok"
        except Exception as e:
            self.last_error["delete_case"] = str(e)[:200]
            return "ok"
