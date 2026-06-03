import { i as __toESM, n as require_client, r as require_react, t as require_jsx_runtime } from "./chunks/variables-CHO5ILYh.js";
import { i as Button, r as Card, t as Badge } from "./chunks/Badge-DPVdTRGe.js";
import { t as Input } from "./chunks/Input-q0oFEVa4.js";
import { t as Select } from "./chunks/Select-BY-wfgi-.js";
//#region src/entries/billing-suggester.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_client = require_client();
var import_jsx_runtime = require_jsx_runtime();
var AI_SERVICE_URL = "http://localhost:8000";
function BillingSuggester() {
	const [diagnosis, setDiagnosis] = (0, import_react.useState)("");
	const [encounterType, setEncounterType] = (0, import_react.useState)("visit");
	const [age, setAge] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [suggestions, setSuggestions] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [accepted, setAccepted] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [isMock, setIsMock] = (0, import_react.useState)(false);
	const handleSuggest = async () => {
		setError(null);
		setLoading(true);
		try {
			const res = await fetch(`${AI_SERVICE_URL}/api/v1/billing/suggest`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					diagnosis,
					encounter_type: encounterType,
					patient_age: age ? parseInt(age) : void 0,
					provider_notes: notes
				})
			});
			if (!res.ok) throw new Error(`Server error: ${res.status}`);
			const data = await res.json();
			setSuggestions(data.suggestions);
			setIsMock(data.mock || false);
			setAccepted(/* @__PURE__ */ new Set());
		} catch (e) {
			setError(e.message || "Failed to get billing suggestions");
		} finally {
			setLoading(false);
		}
	};
	const toggleAccept = (code) => {
		setAccepted((prev) => {
			const next = new Set(prev);
			next.has(code) ? next.delete(code) : next.add(code);
			return next;
		});
	};
	const acceptAll = () => setAccepted(new Set(suggestions.map((s) => s.code)));
	const clearAll = () => setAccepted(/* @__PURE__ */ new Set());
	const totalAccepted = suggestions.filter((s) => accepted.has(s.code));
	const totalFee = totalAccepted.reduce((sum, s) => sum + s.fee, 0);
	const getConfidenceColor = (c) => {
		if (c >= .85) return "success";
		if (c >= .6) return "warning";
		return "error";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			maxWidth: 700,
			margin: "0 auto",
			padding: "var(--spacing-4)"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			title: "AI Billing Code Suggester",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "var(--spacing-3)"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Diagnosis",
							value: diagnosis,
							onChange: (e) => setDiagnosis(e.target.value),
							placeholder: "e.g. Type 2 diabetes, hypertension"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							label: "Encounter Type",
							value: encounterType,
							onChange: (e) => setEncounterType(e.target.value),
							options: [
								{
									value: "visit",
									label: "In-person visit"
								},
								{
									value: "phone",
									label: "Telephone"
								},
								{
									value: "home",
									label: "Home visit"
								}
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Patient Age",
							value: age,
							onChange: (e) => setAge(e.target.value),
							placeholder: "Optional",
							type: "number"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { marginTop: "var(--spacing-2)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: handleSuggest,
						disabled: diagnosis.length < 3 || loading,
						children: loading ? "Suggesting..." : "Suggest Billing Codes"
					})
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						marginTop: "var(--spacing-3)",
						padding: "var(--spacing-3)",
						background: "var(--color-error-light)",
						borderRadius: "var(--radius-md)",
						color: "var(--color-error)",
						fontSize: "var(--font-size-sm)"
					},
					children: error
				}),
				isMock && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { marginTop: "var(--spacing-2)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "warning",
						children: "Offline mode (mock suggestions)"
					})
				})
			]
		}), suggestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			title: "Suggested Codes",
			style: { marginTop: "var(--spacing-4)" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: "var(--spacing-2)",
						marginBottom: "var(--spacing-3)"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: acceptAll,
							children: "Accept All"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: clearAll,
							children: "Clear"
						}),
						totalAccepted.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontSize: "var(--font-size-sm)",
								color: "var(--color-success)",
								fontWeight: 600,
								alignSelf: "center"
							},
							children: [
								totalAccepted.length,
								" code",
								totalAccepted.length > 1 ? "s" : "",
								" — $",
								totalFee.toFixed(2)
							]
						})
					]
				}),
				suggestions.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "flex-start",
						gap: "var(--spacing-3)",
						padding: "var(--spacing-3)",
						marginBottom: "var(--spacing-2)",
						border: accepted.has(s.code) ? "2px solid var(--color-success)" : "1px solid var(--color-neutral-200)",
						borderRadius: "var(--radius-md)",
						backgroundColor: accepted.has(s.code) ? "var(--color-success-light)" : "#fff",
						cursor: "pointer",
						transition: "border-color var(--transition-fast)"
					},
					onClick: () => toggleAccept(s.code),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: accepted.has(s.code),
							onChange: () => {},
							style: { marginTop: 2 }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { flex: 1 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "var(--spacing-2)",
									marginBottom: 2
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { fontSize: "var(--font-size-lg)" },
										children: s.code
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "neutral",
										children: s.description
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: getConfidenceColor(s.confidence),
										children: [Math.round(s.confidence * 100), "%"]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "var(--font-size-sm)",
									color: "var(--color-neutral-500)"
								},
								children: s.rationale
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontWeight: 700,
								fontSize: "var(--font-size-lg)",
								color: "var(--color-primary-700)",
								minWidth: 60,
								textAlign: "right"
							},
							children: ["$", s.fee.toFixed(2)]
						})
					]
				}, s.code)),
				totalAccepted.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						marginTop: "var(--spacing-4)",
						padding: "var(--spacing-3)",
						background: "var(--color-primary-50)",
						borderRadius: "var(--radius-md)",
						textAlign: "right"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "var(--font-size-sm)",
							color: "var(--color-neutral-500)"
						},
						children: "Total billing: "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
						style: {
							fontSize: "var(--font-size-xl)",
							color: "var(--color-primary-700)"
						},
						children: ["$", totalFee.toFixed(2)]
					})]
				})
			]
		})]
	});
}
var el = document.getElementById("billing-root");
if (el) (0, import_client.createRoot)(el).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BillingSuggester, {}));
//#endregion

//# sourceMappingURL=billing-suggester.bundle.js.map