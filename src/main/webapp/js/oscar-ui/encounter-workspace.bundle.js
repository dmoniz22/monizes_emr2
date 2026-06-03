import { a as require_jsx_runtime, c as __toESM, i as Button, n as Tabs, o as require_client, r as Card, s as require_react, t as Badge } from "./chunks/variables-7eGJi_MU.js";
import { t as Input } from "./chunks/Input-BnBEo0IQ.js";
//#region src/entries/encounter-workspace.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_client = require_client();
var import_jsx_runtime = require_jsx_runtime();
var AI = "http://localhost:8000";
function useRecorder() {
	const [recording, setRecording] = (0, import_react.useState)(false);
	const mr = (0, import_react.useRef)(null);
	const chunks = (0, import_react.useRef)([]);
	const start = async () => {
		try {
			const s = await navigator.mediaDevices.getUserMedia({ audio: true });
			mr.current = new MediaRecorder(s, { mimeType: "audio/webm" });
			chunks.current = [];
			mr.current.ondataavailable = (e) => {
				if (e.data.size > 0) chunks.current.push(e.data);
			};
			mr.current.start();
			setRecording(true);
		} catch (e) {}
	};
	const stop = () => new Promise((resolve) => {
		if (!mr.current) return;
		mr.current.onstop = () => {
			resolve(new Blob(chunks.current, { type: "audio/webm" }));
			mr.current?.stream.getTracks().forEach((t) => t.stop());
		};
		mr.current.stop();
		setRecording(false);
	});
	return {
		recording,
		start,
		stop
	};
}
async function transcribe(blob) {
	const fd = new FormData();
	fd.append("file", blob, "recording.webm");
	return (await (await fetch(`${AI}/api/v1/scribe/transcribe`, {
		method: "POST",
		body: fd
	})).json()).text || "";
}
async function generateNote(transcript, patientCtx) {
	return (await fetch(`${AI}/api/v1/scribe/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			transcript,
			encounter_type: "visit",
			patient_context: patientCtx
		})
	})).json();
}
async function suggestBilling(diagnosis) {
	return (await fetch(`${AI}/api/v1/billing/suggest`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			diagnosis,
			encounter_type: "visit"
		})
	})).json();
}
async function predictWorkflow(diagnosis, assessment) {
	return (await fetch(`${AI}/api/v1/workflow/predict`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			diagnosis,
			assessment,
			patient_age: 40
		})
	})).json();
}
function EncounterWorkspace() {
	const [transcript, setTranscript] = (0, import_react.useState)("");
	const [soap, setSoap] = (0, import_react.useState)(null);
	const [billing, setBilling] = (0, import_react.useState)(null);
	const [workflow, setWorkflow] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [tab, setTab] = (0, import_react.useState)("scribe");
	const [edited, setEdited] = (0, import_react.useState)({});
	const { recording, start, stop } = useRecorder();
	const [patient, setPatient] = (0, import_react.useState)({
		name: "Sarah Johnson",
		age: "36",
		sex: "F",
		phn: "9876-543-21-BC",
		provider: "Dr. Smith"
	});
	const [vitals, setVitals] = (0, import_react.useState)([
		{
			l: "BP",
			v: "128/82",
			u: "mmHg",
			t: "stable"
		},
		{
			l: "HR",
			v: "72",
			u: "bpm",
			t: "stable"
		},
		{
			l: "Temp",
			v: "37.0",
			u: "°C",
			t: "stable"
		},
		{
			l: "O2",
			v: "98",
			u: "%",
			t: "stable"
		}
	]);
	const [problems, setProblems] = (0, import_react.useState)([{
		c: "E11.9",
		n: "Type 2 Diabetes",
		s: "active"
	}, {
		c: "I10",
		n: "Hypertension",
		s: "active"
	}]);
	const [meds, setMeds] = (0, import_react.useState)([{
		n: "Metformin",
		d: "500mg",
		r: "BID"
	}, {
		n: "Ramipril",
		d: "5mg",
		r: "daily"
	}]);
	const [allergies, setAllergies] = (0, import_react.useState)(["Penicillin", "Sulfa"]);
	const patientCtx = {
		name: patient.name,
		age: patient.age,
		sex: patient.sex,
		problems: problems.map((p) => p.n).join(", "),
		medications: meds.map((m) => `${m.n} ${m.d}`).join(", "),
		allergies: allergies.join(", ")
	};
	const handleRecord = async () => {
		if (recording) {
			setLoading(true);
			setError("");
			const blob = await stop();
			try {
				const text = await transcribe(blob);
				setTranscript(text);
				await processTranscript(text);
			} catch (e) {
				setError("Transcription failed: " + e.message);
			} finally {
				setLoading(false);
			}
		} else start();
	};
	const processTranscript = async (text) => {
		try {
			const [s, b, w] = await Promise.all([
				generateNote(text, patientCtx),
				suggestBilling(problems.map((p) => p.n).join(", ")),
				predictWorkflow(problems.map((p) => p.n).join(", "), "")
			]);
			setSoap(s);
			setBilling(b);
			setWorkflow(w);
			setEdited({});
		} catch (e) {
			setError("AI processing failed: " + e.message);
		}
	};
	const handlePasteGenerate = async () => {
		if (!transcript) return;
		setLoading(true);
		setError("");
		try {
			await processTranscript(transcript);
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};
	const data = soap ? {
		...soap,
		...edited
	} : null;
	const trendIcons = {
		up: "↑",
		down: "↓",
		stable: "→"
	};
	const trendColors = {
		up: "#dc2626",
		down: "#16a34a",
		stable: "#a3a3a3"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			height: "100vh",
			display: "flex",
			flexDirection: "column",
			fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
			background: "#f3f4f6"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
					color: "#fff",
					padding: "8px 20px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
					zIndex: 100,
					minHeight: 48
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: 20
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							style: {
								fontSize: 16,
								fontWeight: 600,
								margin: 0
							},
							children: "OSCAR AI Encounter"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 14,
								fontWeight: 500
							},
							children: patient.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontSize: 13,
								opacity: .8
							},
							children: [
								"DOB: ",
								patient.age,
								"y | ",
								patient.sex,
								" | PHN: ",
								patient.phn
							]
						}),
						allergies.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "error",
							children: [allergies.length, " allergies"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						fontSize: 13,
						opacity: .8
					},
					children: patient.provider
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flex: 1,
					overflow: "hidden"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						width: 240,
						background: "#fff",
						borderRight: "1px solid #e5e7eb",
						overflow: "auto",
						padding: "12px 0",
						boxShadow: "2px 0 8px rgba(0,0,0,0.04)"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: "Vitals",
							style: { margin: "0 8px 8px" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: 8
								},
								children: vitals.map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										textAlign: "center",
										padding: "8px 4px",
										background: "#f9fafb",
										borderRadius: 6
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 22,
											fontWeight: 700,
											color: "#1f2937"
										},
										children: v.v
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: 11,
											color: "#6b7280"
										},
										children: [
											v.l,
											" ",
											v.u,
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: trendColors[v.t],
													marginLeft: 2
												},
												children: trendIcons[v.t]
											})
										]
									})]
								}, i))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: "Active Problems",
							style: { margin: "0 8px 8px" },
							children: problems.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									padding: "4px 0",
									fontSize: 13,
									borderBottom: "1px solid #f3f4f6"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.n }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: 11,
										color: "#6b7280",
										fontFamily: "monospace"
									},
									children: p.c
								})]
							}, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: "Medications",
							style: { margin: "0 8px 8px" },
							children: meds.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: 13,
									padding: "4px 0",
									borderBottom: "1px solid #f3f4f6"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: m.n }),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: { color: "#6b7280" },
										children: [
											m.d,
											" ",
											m.r
										]
									})
								]
							}, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: "Allergies",
							style: { margin: "0 8px 8px" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									gap: 4,
									flexWrap: "wrap"
								},
								children: allergies.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "warning",
									children: a
								}, i))
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						flex: 1,
						display: "flex",
						flexDirection: "column",
						overflow: "hidden"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#fff",
							borderBottom: "1px solid #e5e7eb",
							padding: "10px 16px",
							display: "flex",
							alignItems: "center",
							gap: 12,
							flexWrap: "wrap"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: handleRecord,
								variant: recording ? "danger" : "primary",
								size: "sm",
								disabled: loading,
								children: recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
									display: "inline-block",
									width: 8,
									height: 8,
									borderRadius: "50%",
									background: "#fff",
									marginRight: 6,
									animation: "pulse 1s infinite"
								} }), "Stop Recording"] }) : loading ? "Processing..." : "Start Recording"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: transcript,
								onChange: (e) => setTranscript(e.target.value),
								placeholder: "Or paste transcript and generate...",
								style: { flex: 1 }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: handlePasteGenerate,
								disabled: !transcript || loading,
								variant: "secondary",
								size: "sm",
								children: "Generate"
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "#dc2626",
									fontSize: 13
								},
								children: error
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							flex: 1,
							overflow: "auto",
							padding: 16
						},
						children: [
							!data && !loading && transcript && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								title: "Transcript",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										whiteSpace: "pre-wrap",
										fontSize: 14,
										lineHeight: 1.6,
										color: "#374151"
									},
									children: transcript
								})
							}),
							!data && !loading && !transcript && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									textAlign: "center",
									padding: 60,
									color: "#9ca3af"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 48,
											marginBottom: 16
										},
										children: "🎙️"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 18,
											fontWeight: 500,
											marginBottom: 8
										},
										children: "Start an Encounter"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: { fontSize: 14 },
										children: "Click \"Start Recording\" to begin the AI scribe, or paste a transcript."
									})
								]
							}),
							loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									textAlign: "center",
									padding: 60,
									color: "#6b7280"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 24,
										fontWeight: 500,
										marginBottom: 8
									},
									children: recording ? "Recording..." : "Processing..."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
									width: 40,
									height: 40,
									border: "3px solid #e5e7eb",
									borderTopColor: "#2563eb",
									borderRadius: "50%",
									margin: "0 auto",
									animation: "spin 0.8s linear infinite"
								} })]
							}),
							data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
								tabs: [
									{
										key: "soap",
										label: "SOAP Note"
									},
									{
										key: "billing",
										label: `Billing (${billing?.suggestions?.length || 0})`
									},
									{
										key: "workflow",
										label: "Actions"
									}
								],
								activeKey: tab,
								onChange: setTab
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: { marginTop: 16 },
								children: [
									tab === "soap" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											flexDirection: "column",
											gap: 12
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableSec, {
												label: "Subjective",
												value: data.subjective,
												onChange: (v) => setEdited((p) => ({
													...p,
													subjective: v
												}))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableSec, {
												label: "Objective",
												value: data.objective,
												onChange: (v) => setEdited((p) => ({
													...p,
													objective: v
												}))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableSec, {
												label: "Assessment",
												value: data.assessment,
												onChange: (v) => setEdited((p) => ({
													...p,
													assessment: v
												}))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableSec, {
												label: "Plan",
												value: data.plan,
												onChange: (v) => setEdited((p) => ({
													...p,
													plan: v
												}))
											}),
											data.follow_up && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													padding: 12,
													background: "#eff6ff",
													borderRadius: 8,
													fontSize: 13,
													color: "#1e40af"
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Follow-up:" }),
													" ",
													data.follow_up,
													data.referral_needed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														style: {
															marginLeft: 12,
															color: "#d97706"
														},
														children: [
															"Refer: ",
															data.referral_specialty,
															" (",
															data.referral_urgency,
															")"
														]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
												style: {
													cursor: "pointer",
													fontSize: 13,
													color: "#6b7280"
												},
												children: "View Transcript"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													padding: 12,
													background: "#f9fafb",
													borderRadius: 6,
													fontSize: 13,
													whiteSpace: "pre-wrap",
													marginTop: 8,
													lineHeight: 1.5
												},
												children: transcript
											})] })
										]
									}),
									tab === "billing" && billing?.suggestions?.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											padding: 10,
											borderBottom: "1px solid #f3f4f6"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { fontSize: 16 },
												children: b.code
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: "#6b7280",
													fontSize: 14
												},
												children: b.description
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													fontSize: 12,
													color: "#9ca3af"
												},
												children: b.rationale
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: { textAlign: "right" },
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
												style: {
													fontSize: 16,
													color: "#2563eb"
												},
												children: ["$", b.fee?.toFixed(2)]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: b.confidence >= .85 ? "success" : "warning",
												children: [Math.round(b.confidence * 100), "%"]
											}) })]
										})]
									}, i)),
									tab === "billing" && !billing?.suggestions?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										style: {
											color: "#9ca3af",
											textAlign: "center",
											padding: 20
										},
										children: "No billing suggestions"
									}),
									tab === "workflow" && workflow && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											flexDirection: "column",
											gap: 16
										},
										children: [
											workflow.prescriptions?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
												title: "Prescriptions",
												children: workflow.prescriptions.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													style: {
														padding: 8,
														borderBottom: "1px solid #f3f4f6"
													},
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
															p.drug,
															" ",
															p.dose
														] }),
														" — ",
														p.route,
														" ",
														p.frequency,
														" x ",
														p.duration,
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															style: {
																fontSize: 12,
																color: "#6b7280"
															},
															children: p.rationale
														})
													]
												}, i))
											}),
											workflow.lab_orders?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
												title: "Lab Orders",
												children: workflow.lab_orders.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													style: {
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														padding: 8,
														borderBottom: "1px solid #f3f4f6"
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: l.test }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: l.urgency === "stat" ? "error" : l.urgency === "urgent" ? "warning" : "info",
														children: l.urgency
													})]
												}, i))
											}),
											workflow.referrals?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
												title: "Referrals",
												children: workflow.referrals.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													style: {
														padding: 8,
														borderBottom: "1px solid #f3f4f6"
													},
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: r.specialty }),
														" ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "warning",
															children: r.urgency
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															style: {
																fontSize: 12,
																color: "#6b7280"
															},
															children: r.rationale
														})
													]
												}, i))
											})
										]
									})
								]
							})] })
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes spin{to{transform:rotate(360deg)}}` })
		]
	});
}
function EditableSec({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
		style: {
			fontSize: 13,
			fontWeight: 600,
			color: "#1d4ed8",
			marginBottom: 4
		},
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		value,
		onChange: (e) => onChange(e.target.value),
		rows: 3,
		style: {
			width: "100%",
			padding: 8,
			fontSize: 13,
			border: "1px solid #d1d5db",
			borderRadius: 6,
			fontFamily: "inherit",
			resize: "vertical",
			background: "#fff"
		}
	})] });
}
var el = document.getElementById("encounter-root");
if (el) (0, import_client.createRoot)(el).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EncounterWorkspace, {}));
//#endregion

//# sourceMappingURL=encounter-workspace.bundle.js.map