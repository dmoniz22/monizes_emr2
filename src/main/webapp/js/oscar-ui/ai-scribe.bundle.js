import { a as require_jsx_runtime, c as __toESM, i as Button, n as Tabs, o as require_client, r as Card, s as require_react, t as Badge } from "./chunks/variables-7eGJi_MU.js";
//#region src/entries/ai-scribe.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_client = require_client();
var import_jsx_runtime = require_jsx_runtime();
var AI_SERVICE_URL = "http://localhost:8000";
function Scribe() {
	const [transcript, setTranscript] = (0, import_react.useState)("");
	const [result, setResult] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [activeTab, setActiveTab] = (0, import_react.useState)("soap");
	const [edited, setEdited] = (0, import_react.useState)({});
	const handleGenerate = async () => {
		setError(null);
		setLoading(true);
		try {
			const res = await fetch(`${AI_SERVICE_URL}/api/v1/scribe/generate`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					transcript,
					encounter_type: "visit"
				})
			});
			if (!res.ok) throw new Error(`Server error: ${res.status}`);
			setResult(await res.json());
			setEdited({});
			setActiveTab("soap");
		} catch (e) {
			setError(e.message || "Failed to generate SOAP note");
		} finally {
			setLoading(false);
		}
	};
	const update = (field, value) => setEdited((p) => ({
		...p,
		[field]: value
	}));
	const data = result ? {
		...result,
		...edited
	} : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			maxWidth: 900,
			margin: "0 auto",
			padding: "var(--spacing-4)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				style: {
					fontSize: "var(--font-size-2xl)",
					marginBottom: "var(--spacing-4)"
				},
				children: "AI Scribe"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				title: "Encounter Transcript",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							color: "var(--color-neutral-500)",
							fontSize: "var(--font-size-sm)",
							marginBottom: "var(--spacing-3)"
						},
						children: "Paste the encounter transcript below. The AI will generate a structured SOAP note, billing codes, prescriptions, and follow-up plans."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: transcript,
						onChange: (e) => setTranscript(e.target.value),
						placeholder: "Paste clinical encounter transcript here...\n\ne.g. Patient John Smith, 45M, presents with cough and fever x 3 days...",
						rows: 10,
						style: {
							width: "100%",
							padding: "var(--spacing-3)",
							fontSize: "var(--font-size-base)",
							border: "1px solid var(--color-neutral-300)",
							borderRadius: "var(--radius-md)",
							resize: "vertical",
							fontFamily: "var(--font-sans)"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							marginTop: "var(--spacing-3)",
							display: "flex",
							gap: "var(--spacing-2)",
							alignItems: "center"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleGenerate,
							disabled: transcript.length < 20 || loading,
							children: loading ? "Generating..." : "Generate SOAP Note"
						}), data?.mock && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "warning",
							children: "Offline mode"
						})]
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
					})
				]
			}),
			data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: { marginTop: "var(--spacing-4)" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
					tabs: [
						{
							key: "soap",
							label: "SOAP Note"
						},
						{
							key: "billing",
							label: `Billing (${data.billing_suggestions.length})`
						},
						{
							key: "rx",
							label: `Prescriptions (${data.prescription_suggestions.length})`
						},
						{
							key: "labs",
							label: `Labs (${data.lab_suggestions.length})`
						}
					],
					activeKey: activeTab,
					onChange: setActiveTab
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: { marginTop: "var(--spacing-4)" },
					children: [
						activeTab === "soap" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "var(--spacing-4)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoapSection, {
									label: "Subjective",
									value: data.subjective,
									onChange: (v) => update("subjective", v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoapSection, {
									label: "Objective",
									value: data.objective,
									onChange: (v) => update("objective", v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoapSection, {
									label: "Assessment",
									value: data.assessment,
									onChange: (v) => update("assessment", v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoapSection, {
									label: "Plan",
									value: data.plan,
									onChange: (v) => update("plan", v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										padding: "var(--spacing-3)",
										background: "var(--color-neutral-50)",
										borderRadius: "var(--radius-md)",
										fontSize: "var(--font-size-sm)",
										color: "var(--color-neutral-700)"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Follow-up:" }),
										" ",
										data.follow_up || "Not specified",
										data.referral_needed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												marginLeft: "var(--spacing-3)",
												color: "var(--color-warning)"
											},
											children: [
												"Referral: ",
												data.referral_specialty,
												" (",
												data.referral_urgency,
												")"
											]
										})
									]
								})
							]
						}),
						activeTab === "billing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: data.billing_suggestions.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								padding: "var(--spacing-2) var(--spacing-3)",
								borderBottom: "1px solid var(--color-neutral-100)",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: b.code }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "neutral",
									children: b.description
								}),
								b.confidence >= .85 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "success",
									children: [Math.round(b.confidence * 100), "%"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "warning",
									children: [Math.round(b.confidence * 100), "%"]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
								style: { color: "var(--color-primary-700)" },
								children: ["$", b.fee?.toFixed(2)]
							})]
						}, i)) }),
						activeTab === "rx" && data.prescription_suggestions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: { color: "var(--color-neutral-400)" },
							children: "No prescriptions suggested."
						}),
						activeTab === "rx" && data.prescription_suggestions.map((rx, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "var(--spacing-3)",
								border: "1px solid var(--color-neutral-200)",
								borderRadius: "var(--radius-md)",
								marginBottom: "var(--spacing-2)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
									rx.drug,
									" ",
									rx.dose
								] }),
								" — ",
								rx.route,
								" ",
								rx.frequency,
								" x ",
								rx.duration,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "var(--font-size-sm)",
										color: "var(--color-neutral-500)",
										marginTop: 2
									},
									children: rx.rationale
								})
							]
						}, i)),
						activeTab === "labs" && data.lab_suggestions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: { color: "var(--color-neutral-400)" },
							children: "No labs suggested."
						}),
						activeTab === "labs" && data.lab_suggestions.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "var(--spacing-3)",
								border: "1px solid var(--color-neutral-200)",
								borderRadius: "var(--radius-md)",
								marginBottom: "var(--spacing-2)",
								display: "flex",
								justifyContent: "space-between"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: l.test }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "var(--font-size-sm)",
									color: "var(--color-neutral-500)"
								},
								children: l.rationale
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: l.urgency === "stat" ? "error" : l.urgency === "urgent" ? "warning" : "info",
								children: l.urgency
							})]
						}, i))
					]
				})]
			})
		]
	});
}
function SoapSection({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		style: {
			fontSize: "var(--font-size-base)",
			fontWeight: 600,
			marginBottom: "var(--spacing-1)",
			color: "var(--color-primary-700)"
		},
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		value,
		onChange: (e) => onChange(e.target.value),
		rows: 3,
		style: {
			width: "100%",
			padding: "var(--spacing-2)",
			fontSize: "var(--font-size-sm)",
			border: "1px solid var(--color-neutral-300)",
			borderRadius: "var(--radius-md)",
			fontFamily: "var(--font-sans)",
			resize: "vertical"
		}
	})] });
}
var el = document.getElementById("scribe-root");
if (el) (0, import_client.createRoot)(el).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scribe, {}));
//#endregion

//# sourceMappingURL=ai-scribe.bundle.js.map