import { i as __toESM, n as require_client, r as require_react, t as require_jsx_runtime } from "./chunks/jsx-runtime-CV8b5LSl.js";
import { i as Button, n as Tabs, r as Card, t as Badge } from "./chunks/Badge-B5Ss0JGR.js";
import { t as Input } from "./chunks/Input-BOJJLj47.js";
/* empty css                          */
//#region src/entries/workflow-panel.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_client = require_client();
var import_jsx_runtime = require_jsx_runtime();
var AI = "http://localhost:8000";
function WorkflowPanel() {
	const [diagnosis, setDiagnosis] = (0, import_react.useState)("");
	const [assessment, setAssessment] = (0, import_react.useState)("");
	const [age, setAge] = (0, import_react.useState)("40");
	const [meds, setMeds] = (0, import_react.useState)("");
	const [allergies, setAllergies] = (0, import_react.useState)("");
	const [workflow, setWorkflow] = (0, import_react.useState)(null);
	const [rx, setRx] = (0, import_react.useState)(null);
	const [labs, setLabs] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("workflow");
	const [accepted, setAccepted] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const handlePredict = async () => {
		setError(null);
		setLoading(true);
		try {
			const ctx = {
				diagnosis,
				assessment,
				patient_age: parseInt(age) || 40,
				medications: meds,
				allergies
			};
			const [w, r, l] = await Promise.all([
				fetch(`${AI}/api/v1/workflow/predict`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...ctx,
						patient_sex: "U"
					})
				}).then((r) => r.json()),
				fetch(`${AI}/api/v1/prescription/suggest`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...ctx,
						patient_age: parseInt(age) || 40
					})
				}).then((r) => r.json()),
				fetch(`${AI}/api/v1/lab/suggest`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(ctx)
				}).then((r) => r.json())
			]);
			setWorkflow(w);
			setRx(r);
			setLabs(l);
			setAccepted(/* @__PURE__ */ new Set());
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};
	const toggle = (key) => setAccepted((p) => {
		const n = new Set(p);
		n.has(key) ? n.delete(key) : n.add(key);
		return n;
	});
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
				children: "AI Workflow Prediction"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				title: "Encounter Context",
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Patient Age",
								value: age,
								onChange: (e) => setAge(e.target.value),
								type: "number"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Assessment",
								value: assessment,
								onChange: (e) => setAssessment(e.target.value),
								placeholder: "e.g. A1C 7.8, BP 142/88"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Allergies",
								value: allergies,
								onChange: (e) => setAllergies(e.target.value),
								placeholder: "e.g. Penicillin, Sulfa"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: { marginTop: "var(--spacing-2)" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Current Medications",
							value: meds,
							onChange: (e) => setMeds(e.target.value),
							placeholder: "e.g. Metformin 500mg BID"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: { marginTop: "var(--spacing-3)" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handlePredict,
							disabled: !diagnosis || loading,
							children: loading ? "Analyzing..." : "Predict Actions"
						}), workflow?.mock && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { marginLeft: 8 },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "warning",
								children: "Offline mode"
							})
						})]
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
			(workflow || rx || labs) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: { marginTop: "var(--spacing-4)" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
					tabs: [
						{
							key: "workflow",
							label: `Actions (${(workflow?.prescriptions?.length || 0) + (workflow?.lab_orders?.length || 0) + (workflow?.referrals?.length || 0)})`
						},
						{
							key: "rx",
							label: `Prescriptions (${rx?.suggestions?.length || 0})`
						},
						{
							key: "labs",
							label: `Labs (${labs?.suggestions?.length || 0})`
						}
					],
					activeKey: tab,
					onChange: setTab
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: { marginTop: "var(--spacing-4)" },
					children: [
						tab === "workflow" && workflow && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "var(--spacing-4)"
							},
							children: [
								workflow.prescriptions?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									title: "Prescriptions",
									children: workflow.prescriptions.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
										label: p.drug,
										sub: `${p.dose} ${p.route} ${p.frequency} x ${p.duration}`,
										detail: p.rationale,
										conf: p.confidence,
										accepted,
										onToggle: () => toggle(`rx-${i}`)
									}, `rx-${i}`))
								}),
								workflow.lab_orders?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									title: "Lab Orders",
									children: workflow.lab_orders.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
										label: l.test,
										sub: l.urgency,
										detail: l.rationale,
										conf: l.confidence,
										accepted,
										onToggle: () => toggle(`lab-${i}`)
									}, `lab-${i}`))
								}),
								workflow.referrals?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									title: "Referrals",
									children: workflow.referrals.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
										label: r.specialty,
										sub: r.urgency,
										detail: r.rationale,
										conf: r.confidence,
										accepted,
										onToggle: () => toggle(`ref-${i}`)
									}, `ref-${i}`))
								}),
								workflow.follow_up?.timing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										padding: 12,
										background: "var(--color-neutral-50)",
										borderRadius: 8
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Follow-up:" }),
										" ",
										workflow.follow_up.timing,
										" — ",
										workflow.follow_up.reason
									]
								})
							]
						}),
						tab === "rx" && rx && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [rx.warnings?.length > 0 && rx.warnings.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								padding: 8,
								marginBottom: 8,
								background: "var(--color-error-light)",
								borderRadius: 4,
								color: "var(--color-error)",
								fontSize: 14
							},
							children: w
						}, i)), rx.suggestions?.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: 12,
								marginBottom: 8,
								border: "1px solid var(--color-neutral-200)",
								borderRadius: 8
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
										p.drug,
										" ",
										p.dose
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: p.confidence >= .85 ? "success" : "warning",
										children: [Math.round(p.confidence * 100), "%"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: 14,
										color: "var(--color-neutral-500)"
									},
									children: [
										p.route,
										" ",
										p.frequency,
										" x ",
										p.duration
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 13,
										color: "var(--color-neutral-400)",
										marginTop: 4
									},
									children: p.rationale
								}),
								p.interactions?.length > 0 && p.interactions.map((w, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										color: "var(--color-error)",
										fontSize: 12,
										marginTop: 2
									},
									children: w
								}, j)),
								p.allergy_check?.length > 0 && p.allergy_check.map((w, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										color: "var(--color-error)",
										fontSize: 12,
										marginTop: 2
									},
									children: w
								}, j))
							]
						}, i))] }),
						tab === "labs" && labs && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: labs.suggestions?.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: 12,
								borderBottom: "1px solid var(--color-neutral-100)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: l.test }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 13,
									color: "var(--color-neutral-400)"
								},
								children: l.rationale
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: l.urgency === "stat" ? "error" : l.urgency === "urgent" ? "warning" : "info",
								children: l.urgency
							})]
						}, i)) })
					]
				})]
			})
		]
	});
}
function Item({ label, sub, detail, conf, accepted, onToggle }) {
	const key = `${label}-${sub}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		onClick: onToggle,
		style: {
			display: "flex",
			alignItems: "flex-start",
			gap: 8,
			padding: 8,
			marginBottom: 4,
			borderRadius: 6,
			cursor: "pointer",
			border: accepted.has(key) ? "2px solid var(--color-success)" : "1px solid var(--color-neutral-200)",
			background: accepted.has(key) ? "var(--color-success-light)" : "#fff"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "checkbox",
			checked: accepted.has(key),
			onChange: () => {},
			style: { marginTop: 3 }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: { flex: 1 },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 6
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						style: { fontSize: 14 },
						children: label
					}),
					sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "neutral",
						children: sub
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: conf >= .85 ? "success" : conf >= .6 ? "warning" : "error",
						children: [Math.round(conf * 100), "%"]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					fontSize: 12,
					color: "var(--color-neutral-400)",
					marginTop: 2
				},
				children: detail
			})]
		})]
	});
}
var el = document.getElementById("workflow-root");
if (el) (0, import_client.createRoot)(el).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowPanel, {}));
//#endregion

//# sourceMappingURL=workflow-panel.bundle.js.map