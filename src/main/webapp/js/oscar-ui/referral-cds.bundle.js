import { a as require_jsx_runtime, c as __toESM, i as Button, n as Tabs, o as require_client, r as Card, s as require_react, t as Badge } from "./chunks/variables-7eGJi_MU.js";
import { t as Input } from "./chunks/Input-BnBEo0IQ.js";
//#region src/entries/referral-cds.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_client = require_client();
var import_jsx_runtime = require_jsx_runtime();
var AI = "http://localhost:8000";
function ReferralCDSPanel() {
	const [patient, setPatient] = (0, import_react.useState)({
		name: "",
		age: "40",
		sex: "U"
	});
	const [reason, setReason] = (0, import_react.useState)("");
	const [specialty, setSpecialty] = (0, import_react.useState)("");
	const [history, setHistory] = (0, import_react.useState)("");
	const [diagnosis, setDiagnosis] = (0, import_react.useState)("");
	const [meds, setMeds] = (0, import_react.useState)("");
	const [referral, setReferral] = (0, import_react.useState)(null);
	const [cds, setCds] = (0, import_react.useState)(null);
	const [population, setPopulation] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("referral");
	const handleAnalyze = async () => {
		setError(null);
		setLoading(true);
		try {
			const [r, c, p] = await Promise.all([
				fetch(`${AI}/api/v1/referral/generate`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						patient_name: patient.name,
						patient_age: parseInt(patient.age),
						reason,
						history,
						specialty
					})
				}).then((r) => r.json()),
				fetch(`${AI}/api/v1/cds/evaluate`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						diagnosis,
						patient_age: parseInt(patient.age),
						patient_sex: patient.sex,
						medications: meds
					})
				}).then((r) => r.json()),
				fetch(`${AI}/api/v1/population/care-gaps`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						patient_count: 100,
						conditions: diagnosis
					})
				}).then((r) => r.json())
			]);
			setReferral(r);
			setCds(c);
			setPopulation(p);
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};
	const prioColor = (p) => p === "high" ? "error" : p === "medium" ? "warning" : "info";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			maxWidth: 800,
			margin: "0 auto",
			padding: "var(--spacing-4)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				style: {
					fontSize: "var(--font-size-2xl)",
					marginBottom: "var(--spacing-4)"
				},
				children: "Referral & Clinical Decision Support"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				title: "Patient Context",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "1fr 1fr 1fr",
							gap: "var(--spacing-3)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Patient Name",
								value: patient.name,
								onChange: (e) => setPatient({
									...patient,
									name: e.target.value
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Age",
								value: patient.age,
								onChange: (e) => setPatient({
									...patient,
									age: e.target.value
								}),
								type: "number"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Sex",
								value: patient.sex,
								onChange: (e) => setPatient({
									...patient,
									sex: e.target.value
								}),
								placeholder: "M/F/U"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: { marginTop: "var(--spacing-3)" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Diagnosis",
							value: diagnosis,
							onChange: (e) => setDiagnosis(e.target.value),
							placeholder: "e.g. Type 2 diabetes, hypertension"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "var(--spacing-3)",
							marginTop: "var(--spacing-3)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Referral Reason",
							value: reason,
							onChange: (e) => setReason(e.target.value),
							placeholder: "Why is referral needed?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Specialty",
							value: specialty,
							onChange: (e) => setSpecialty(e.target.value),
							placeholder: "e.g. Endocrinology"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "Clinical History",
						value: history,
						onChange: (e) => setHistory(e.target.value),
						placeholder: "Brief history for referral letter"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: { marginTop: "var(--spacing-3)" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleAnalyze,
							disabled: !reason && !diagnosis || loading,
							children: loading ? "Analyzing..." : "Generate Referral & CDS"
						})
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							marginTop: 8,
							padding: 8,
							background: "var(--color-error-light)",
							borderRadius: 4,
							color: "var(--color-error)",
							fontSize: 14
						},
						children: error
					})
				]
			}),
			(referral || cds || population) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: { marginTop: "var(--spacing-4)" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
					tabs: [
						{
							key: "referral",
							label: "Referral Letter"
						},
						{
							key: "cds",
							label: `CDS Alerts (${cds?.alerts?.length || 0})`
						},
						{
							key: "population",
							label: `Population (${population?.care_gaps?.length || 0})`
						}
					],
					activeKey: tab,
					onChange: setTab
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: { marginTop: "var(--spacing-4)" },
					children: [
						tab === "referral" && referral && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							title: `Referral: ${referral.specialty} (${referral.urgency})`,
							children: [
								referral.mock && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: { marginBottom: 8 },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "warning",
										children: "Offline template"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										whiteSpace: "pre-wrap",
										fontSize: "var(--font-size-sm)",
										lineHeight: 1.6,
										fontFamily: "var(--font-sans)",
										padding: "var(--spacing-3)",
										background: "var(--color-neutral-50)",
										borderRadius: 8
									},
									children: referral.letter
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										marginTop: "var(--spacing-3)",
										fontSize: "var(--font-size-sm)",
										color: "var(--color-neutral-500)"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Clinical question:" }),
										" ",
										referral.clinical_question
									]
								})
							]
						}),
						tab === "cds" && cds && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "var(--spacing-2)"
							},
							children: cds.alerts?.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									padding: "var(--spacing-3)",
									border: "1px solid var(--color-neutral-200)",
									borderRadius: 8,
									borderLeft: `4px solid var(--color-${a.priority === "warning" ? "warning" : "info"})`
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: 8,
											marginBottom: 4
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: a.priority === "warning" ? "warning" : "info",
											children: a.type
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: a.title })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: "var(--font-size-sm)",
											color: "var(--color-neutral-500)"
										},
										children: a.description
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: 12,
											color: "var(--color-neutral-400)",
											marginTop: 4
										},
										children: ["Source: ", a.source]
									})
								]
							}, i))
						}),
						tab === "population" && population && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "var(--spacing-2)"
							},
							children: population.care_gaps?.map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									padding: "var(--spacing-3)",
									border: "1px solid var(--color-neutral-200)",
									borderRadius: 8,
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: 8
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: prioColor(g.priority),
										children: g.priority
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: g.description })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: "var(--font-size-sm)",
										color: "var(--color-neutral-500)",
										marginTop: 4
									},
									children: [
										g.patients_affected,
										" patients affected — ",
										g.recommended_action
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: 12,
										color: "var(--color-neutral-400)"
									},
									children: g.due_date
								})]
							}, i))
						})
					]
				})]
			})
		]
	});
}
var el = document.getElementById("referral-root");
if (el) (0, import_client.createRoot)(el).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferralCDSPanel, {}));
//#endregion

//# sourceMappingURL=referral-cds.bundle.js.map