import { i as __toESM, n as require_client, r as require_react, t as require_jsx_runtime } from "./chunks/jsx-runtime-CV8b5LSl.js";
import { i as Button, n as Tabs, r as Card, t as Badge } from "./chunks/Badge-B5Ss0JGR.js";
import { t as Input } from "./chunks/Input-BOJJLj47.js";
/* empty css                          */
//#region src/entries/fhir-viewer.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_client = require_client();
var import_jsx_runtime = require_jsx_runtime();
var AI = "http://localhost:8000";
function FHIRViewer() {
	const [patientId, setPatientId] = (0, import_react.useState)("1");
	const [fhirData, setFhirData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [activeTab, setActiveTab] = (0, import_react.useState)("patient");
	const handleQuery = async () => {
		setError(null);
		setLoading(true);
		try {
			const [p, c, o, m] = await Promise.all([
				fetch(`${AI}/api/v1/fhir/Patient/${patientId}`).then((r) => r.ok ? r.json() : null),
				fetch(`${AI}/api/v1/fhir/Condition?patient=${patientId}`).then((r) => r.ok ? r.json() : null),
				fetch(`${AI}/api/v1/fhir/Observation?patient=${patientId}`).then((r) => r.ok ? r.json() : null),
				fetch(`${AI}/api/v1/fhir/MedicationRequest?patient=${patientId}`).then((r) => r.ok ? r.json() : null)
			]);
			setFhirData({
				patient: p,
				conditions: c,
				observations: o,
				medications: m
			});
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};
	const entries = (d) => d?.entry?.length || 0;
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
				children: "FHIR Interoperability"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				title: "Patient Query",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: "var(--spacing-3)",
						alignItems: "end"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "Patient ID",
						value: patientId,
						onChange: (e) => setPatientId(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: handleQuery,
						disabled: !patientId || loading,
						children: loading ? "Querying..." : "Fetch FHIR Resources"
					})]
				}), error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						marginTop: 8,
						padding: 8,
						background: "var(--color-error-light)",
						borderRadius: 4,
						color: "var(--color-error)"
					},
					children: error
				})]
			}),
			fhirData && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: { marginTop: "var(--spacing-4)" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
					tabs: [
						{
							key: "patient",
							label: "Patient"
						},
						{
							key: "conditions",
							label: `Conditions (${entries(fhirData.conditions)})`
						},
						{
							key: "observations",
							label: `Observations (${entries(fhirData.observations)})`
						},
						{
							key: "medications",
							label: `Medications (${entries(fhirData.medications)})`
						}
					],
					activeKey: activeTab,
					onChange: setActiveTab
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: { marginTop: "var(--spacing-4)" },
					children: [
						activeTab === "patient" && fhirData.patient && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: `Patient: ${fhirData.patient.name?.[0]?.given?.[0] || ""} ${fhirData.patient.name?.[0]?.family || ""}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								style: {
									fontSize: 12,
									background: "var(--color-neutral-50)",
									padding: 12,
									borderRadius: 8,
									overflow: "auto",
									maxHeight: 500
								},
								children: JSON.stringify(fhirData.patient, null, 2)
							})
						}),
						activeTab === "conditions" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [fhirData.conditions?.entry?.map((e, i) => {
							const c = e.resource;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									padding: 8,
									marginBottom: 4,
									border: "1px solid var(--color-neutral-200)",
									borderRadius: 6
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: 8
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: c.clinicalStatus?.coding?.[0]?.code === "active" ? "warning" : "neutral",
											children: c.clinicalStatus?.coding?.[0]?.code || "?"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: c.code?.coding?.[0]?.display || c.code?.text }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: 12,
												color: "var(--color-neutral-400)",
												fontFamily: "monospace"
											},
											children: c.code?.coding?.[0]?.code
										})
									]
								}), c.onsetDateTime && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: 12,
										color: "var(--color-neutral-400)",
										marginTop: 2
									},
									children: ["Onset: ", c.onsetDateTime]
								})]
							}, i);
						}), !fhirData.conditions?.total && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: { color: "var(--color-neutral-400)" },
							children: "No conditions found."
						})] }),
						activeTab === "observations" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [fhirData.observations?.entry?.map((e, i) => {
							const o = e.resource;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									padding: 8,
									borderBottom: "1px solid var(--color-neutral-100)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: o.code?.text }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: { fontWeight: 600 },
									children: [
										o.valueQuantity?.value,
										" ",
										o.valueQuantity?.unit
									]
								})]
							}, i);
						}), !fhirData.observations?.total && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: { color: "var(--color-neutral-400)" },
							children: "No observations found."
						})] }),
						activeTab === "medications" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [fhirData.medications?.entry?.map((e, i) => {
							const m = e.resource;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									padding: 8,
									marginBottom: 4,
									border: "1px solid var(--color-neutral-200)",
									borderRadius: 6
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: 8
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: m.status === "active" ? "success" : "neutral",
										children: m.status
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: m.medicationCodeableConcept?.text })]
								}), m.dosageInstruction?.[0]?.text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 13,
										color: "var(--color-neutral-500)",
										marginTop: 2
									},
									children: m.dosageInstruction[0].text
								})]
							}, i);
						}), !fhirData.medications?.total && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: { color: "var(--color-neutral-400)" },
							children: "No medications found."
						})] })
					]
				})]
			})
		]
	});
}
var el = document.getElementById("fhir-root");
if (el) (0, import_client.createRoot)(el).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FHIRViewer, {}));
//#endregion

//# sourceMappingURL=fhir-viewer.bundle.js.map