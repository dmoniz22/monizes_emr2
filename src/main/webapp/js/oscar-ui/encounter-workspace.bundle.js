import { i as __toESM, n as require_client, r as require_react, t as require_jsx_runtime } from "./chunks/variables-CHO5ILYh.js";
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
async function genNote(text, ctx) {
	return (await fetch(`${AI}/api/v1/scribe/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			transcript: text,
			encounter_type: "visit",
			patient_context: ctx
		})
	})).json();
}
async function billing(dx) {
	return (await fetch(`${AI}/api/v1/billing/suggest`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ diagnosis: dx })
	})).json();
}
async function workflow(dx) {
	return (await fetch(`${AI}/api/v1/workflow/predict`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			diagnosis: dx,
			assessment: ""
		})
	})).json();
}
function Badge({ variant = "neutral", children }) {
	const [bg, cl] = {
		success: "#dcfce7,#16a34a",
		warning: "#fef3c7,#d97706",
		error: "#fee2e2,#dc2626",
		info: "#dbeafe,#2563eb",
		neutral: "#f3f4f6,#6b7280"
	}[variant].split(",");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		style: {
			display: "inline-flex",
			alignItems: "center",
			padding: "1px 8px",
			fontSize: 11,
			fontWeight: 600,
			borderRadius: 9999,
			background: bg,
			color: cl
		},
		children
	});
}
function Button({ variant = "primary", size = "md", loading, disabled, onClick, children, style }) {
	const s = {
		primary: {
			bg: "#2563eb",
			c: "#fff"
		},
		secondary: {
			bg: "#f3f4f6",
			c: "#374151",
			border: "1px solid #d1d5db"
		},
		danger: {
			bg: "#dc2626",
			c: "#fff"
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		disabled: disabled || loading,
		style: {
			background: s[variant].bg,
			color: s[variant].c,
			border: s[variant].border || "none",
			borderRadius: 6,
			fontWeight: 500,
			cursor: disabled ? "not-allowed" : "pointer",
			opacity: disabled ? .5 : 1,
			...{
				sm: {
					padding: "6px 12px",
					fontSize: 12
				},
				md: {
					padding: "8px 16px",
					fontSize: 13
				}
			}[size],
			...style
		},
		children: [loading && "⏳ ", children]
	});
}
function Card({ title, children, style }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			background: "#fff",
			border: "1px solid #e5e7eb",
			borderRadius: 8,
			boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
			overflow: "hidden",
			...style
		},
		children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				padding: "10px 14px",
				borderBottom: "1px solid #f3f4f6",
				fontSize: 13,
				fontWeight: 600,
				color: "#374151"
			},
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: { padding: 12 },
			children
		})]
	});
}
function Encounter() {
	const [patient, setPatient] = (0, import_react.useState)(null);
	const [pid, setPid] = (0, import_react.useState)("");
	const [problems, setProblems] = (0, import_react.useState)([]);
	const [meds, setMeds] = (0, import_react.useState)([]);
	const [allergies, setAllergies] = (0, import_react.useState)([]);
	const [encounters, setEncounters] = (0, import_react.useState)([]);
	const [transcript, setTranscript] = (0, import_react.useState)("");
	const [soap, setSoap] = (0, import_react.useState)(null);
	const [bill, setBill] = (0, import_react.useState)(null);
	const [wf, setWf] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("scribe");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [saved, setSaved] = (0, import_react.useState)(false);
	const { recording, start, stop } = useRecorder();
	const vitals = [
		{
			l: "BP",
			v: "128/82",
			u: "mmHg"
		},
		{
			l: "HR",
			v: "72",
			u: "bpm"
		},
		{
			l: "Temp",
			v: "37.0",
			u: "°C"
		},
		{
			l: "O2",
			v: "98",
			u: "%"
		}
	];
	(0, import_react.useEffect)(() => {
		const no = document.getElementById("encounter-root")?.dataset.demoNo || "";
		setPid(no);
		if (no) {
			fetch(`${AI}/api/v1/patient/${no}`).then((r) => r.json()).then((d) => {
				setPatient(d);
				setProblems(d.problems || []);
				setMeds(d.medications || []);
				setAllergies(d.allergies || []);
			}).catch(() => {});
			fetch(`${AI}/api/v1/patient/${no}/encounters`).then((r) => r.json()).then((d) => setEncounters(d.encounters || [])).catch(() => {});
		}
	}, []);
	const handleRecord = async () => {
		if (recording) {
			setLoading(true);
			setError("");
			setSaved(false);
			try {
				const text = await transcribe(await stop());
				setTranscript(text);
				await process(text);
			} catch (e) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		} else start();
	};
	const process = async (text) => {
		const ctx = {
			name: patient?.name || "",
			age: patient?.dob ? (/* @__PURE__ */ new Date()).getFullYear() - parseInt(patient.dob.substring(0, 4)) : 40,
			sex: patient?.sex || "U",
			problems: problems.map((p) => p.name).join(", "),
			medications: meds.map((m) => m.name).join(", "),
			allergies: allergies.join(", ")
		};
		try {
			const [s, b, w] = await Promise.all([
				genNote(text, ctx),
				billing(problems.map((p) => p.name).join(", ")),
				workflow(problems.map((p) => p.name).join(", "))
			]);
			setSoap(s);
			setBill(b);
			setWf(w);
		} catch (e) {
			setError("AI error: " + e.message);
		}
	};
	const handleSave = async () => {
		if (!soap || !pid) return;
		const note = `${soap.subjective || ""}\n\nOBJECTIVE:\n${soap.objective || ""}\n\nASSESSMENT:\n${soap.assessment || ""}\n\nPLAN:\n${soap.plan || ""}`;
		try {
			await fetch(`${AI}/api/v1/patient/${pid}/encounters`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					note,
					provider_no: patient?.provider_no || "999998",
					type: "visit"
				})
			});
			setSaved(true);
		} catch (e) {
			setError("Save failed: " + e.message);
		}
	};
	const dob = patient?.dob || "";
	const age = dob ? (/* @__PURE__ */ new Date()).getFullYear() - parseInt(dob.substring(0, 4)) : "";
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
					padding: "6px 16px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
					zIndex: 100,
					minHeight: 44
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							style: {
								fontSize: 15,
								fontWeight: 600,
								margin: 0
							},
							children: "OSCAR AI Encounter"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: 14,
								fontWeight: 500
							},
							children: patient?.name || "Loading..."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontSize: 12,
								opacity: .8
							},
							children: [
								dob && `${dob} (${age}y)`,
								" | ",
								patient?.sex,
								" | PHN: ",
								patient?.hin
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: 10,
						fontSize: 11
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `/oscar/demographic/demographiccontrol.jsp?demographic_no=${pid}&displaymode=edit`,
							target: "_blank",
							style: {
								color: "rgba(255,255,255,0.85)",
								textDecoration: "none"
							},
							children: "Edit Patient"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `/oscar/oscarEncounter/IncomingEncounter.do?demographicNo=${pid}`,
							target: "_blank",
							style: {
								color: "rgba(255,255,255,0.85)",
								textDecoration: "none",
								padding: "2px 6px",
								border: "1px solid rgba(255,255,255,0.3)",
								borderRadius: 4
							},
							children: "Classic"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#",
							onClick: () => window.open(`/oscar/oscarRx/choosePatient.do?demographicNo=${pid}`, "Rx", "width=700,height=1027"),
							style: {
								color: "rgba(255,255,255,0.85)",
								textDecoration: "none"
							},
							children: "Rx"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#",
							onClick: () => window.open(`/oscar/dms/inboxManage.do?method=prepareForIndexPage&demographicNo=${pid}`, "Labs", "width=700,height=900"),
							style: {
								color: "rgba(255,255,255,0.85)",
								textDecoration: "none"
							},
							children: "Labs"
						})
					]
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
						width: 220,
						background: "#fff",
						borderRight: "1px solid #e5e7eb",
						overflow: "auto",
						padding: "10px 0"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: "Vitals",
							style: { margin: "0 6px 8px" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: 6
								},
								children: vitals.map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										textAlign: "center",
										padding: 6,
										background: "#f9fafb",
										borderRadius: 6
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 20,
											fontWeight: 700,
											color: "#1f2937"
										},
										children: v.v
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: 10,
											color: "#6b7280"
										},
										children: [
											v.l,
											" ",
											v.u
										]
									})]
								}, i))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: "Problems",
							style: { margin: "0 6px 8px" },
							children: problems.length > 0 ? problems.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									padding: "3px 0",
									fontSize: 12,
									borderBottom: "1px solid #f3f4f6"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										color: "#9ca3af",
										fontFamily: "monospace",
										fontSize: 10
									},
									children: p.code
								})]
							}, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									color: "#9ca3af",
									textAlign: "center",
									padding: 6
								},
								children: "None"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: "Meds",
							style: { margin: "0 6px 8px" },
							children: meds.length > 0 ? meds.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									padding: "3px 0",
									borderBottom: "1px solid #f3f4f6"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: m.name })
							}, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									color: "#9ca3af",
									textAlign: "center",
									padding: 6
								},
								children: "None"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: "Allergies",
							style: { margin: "0 6px 8px" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									gap: 3,
									flexWrap: "wrap"
								},
								children: allergies.length > 0 ? allergies.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "warning",
									children: typeof a === "string" ? a : a.name
								}, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: 11,
										color: "#9ca3af"
									},
									children: "None"
								})
							})
						}),
						encounters.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: "Past Encounters",
							style: { margin: "0 6px 8px" },
							children: encounters.slice(0, 5).map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: 11,
									padding: "3px 0",
									borderBottom: "1px solid #f3f4f6"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: { color: "#6b7280" },
									children: [
										e.date?.substring(0, 10),
										" — ",
										e.type
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										color: "#374151",
										maxHeight: 32,
										overflow: "hidden"
									},
									children: [e.note?.substring(0, 60), "..."]
								})]
							}, i))
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
							padding: "8px 14px",
							display: "flex",
							alignItems: "center",
							gap: 10
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: handleRecord,
								variant: recording ? "danger" : "primary",
								size: "sm",
								disabled: loading,
								children: [
									recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
										display: "inline-block",
										width: 8,
										height: 8,
										borderRadius: "50%",
										background: "#fff",
										marginRight: 6,
										animation: "pulse 1s infinite"
									} }) : "▶",
									" ",
									recording ? "Stop" : "Record"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: transcript,
								onChange: (e) => setTranscript(e.target.value),
								placeholder: "Or paste transcript then generate...",
								style: {
									flex: 1,
									padding: "6px 10px",
									border: "1px solid #d1d5db",
									borderRadius: 6,
									fontSize: 13
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => process(transcript),
								disabled: !transcript || loading,
								variant: "secondary",
								size: "sm",
								children: "Generate"
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: saved ? "#16a34a" : "#dc2626",
									fontSize: 12,
									fontWeight: 500
								},
								children: error
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							flex: 1,
							overflow: "auto",
							padding: 14
						},
						children: [
							!soap && !loading && !transcript && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									textAlign: "center",
									padding: 80,
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
											fontWeight: 500
										},
										children: "Start an Encounter"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 14,
											marginTop: 4
										},
										children: "Click Record or paste a transcript to begin."
									})
								]
							}),
							!soap && !loading && transcript && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
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
							loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									textAlign: "center",
									padding: 80,
									color: "#6b7280"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 20,
										fontWeight: 500,
										marginBottom: 12
									},
									children: recording ? "Recording..." : "Processing..."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
									width: 36,
									height: 36,
									border: "3px solid #e5e7eb",
									borderTopColor: "#2563eb",
									borderRadius: "50%",
									margin: "0 auto",
									animation: "spin 0.8s linear infinite"
								} })]
							}),
							soap && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "flex",
										gap: 0,
										borderBottom: "2px solid #e5e7eb",
										marginBottom: 16
									},
									children: [
										{
											k: "scribe",
											n: "SOAP Note"
										},
										{
											k: "billing",
											n: `Billing (${bill?.suggestions?.length || 0})`
										},
										{
											k: "workflow",
											n: "Actions"
										}
									].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setTab(t.k),
										style: {
											padding: "8px 16px",
											background: "none",
											border: "none",
											borderBottom: tab === t.k ? "2px solid #2563eb" : "2px solid transparent",
											marginBottom: -2,
											color: tab === t.k ? "#2563eb" : "#6b7280",
											fontWeight: tab === t.k ? 600 : 400,
											cursor: "pointer",
											fontSize: 13
										},
										children: t.n
									}, t.k))
								}),
								tab === "scribe" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										flexDirection: "column",
										gap: 12
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Editable, {
											label: "Subjective",
											value: soap.subjective,
											onChange: (v) => setSoap({
												...soap,
												subjective: v
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Editable, {
											label: "Objective",
											value: soap.objective,
											onChange: (v) => setSoap({
												...soap,
												objective: v
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Editable, {
											label: "Assessment",
											value: soap.assessment,
											onChange: (v) => setSoap({
												...soap,
												assessment: v
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Editable, {
											label: "Plan",
											value: soap.plan,
											onChange: (v) => setSoap({
												...soap,
												plan: v
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												gap: 8,
												marginTop: 8
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												onClick: handleSave,
												variant: "primary",
												children: saved ? "Saved ✓" : "Save to Oscar"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												onClick: () => {
													setSoap(null);
													setTranscript("");
													setSaved(false);
												},
												variant: "secondary",
												children: "New Encounter"
											})]
										})
									]
								}),
								tab === "billing" && bill?.suggestions?.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
												fontSize: 11,
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
								tab === "billing" && !bill?.suggestions?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									style: {
										color: "#9ca3af",
										textAlign: "center",
										padding: 20
									},
									children: "No billing suggestions"
								}),
								tab === "workflow" && wf && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										flexDirection: "column",
										gap: 16
									},
									children: [
										wf.prescriptions?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
											title: "Prescriptions",
											children: wf.prescriptions.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													padding: 8,
													borderBottom: "1px solid #f3f4f6",
													fontSize: 13
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
															fontSize: 11,
															color: "#6b7280"
														},
														children: p.rationale
													})
												]
											}, i))
										}),
										wf.lab_orders?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
											title: "Labs",
											children: wf.lab_orders.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													justifyContent: "space-between",
													padding: 8,
													borderBottom: "1px solid #f3f4f6",
													fontSize: 13
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													l.test,
													" — ",
													l.rationale
												] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: l.urgency === "stat" ? "error" : l.urgency === "urgent" ? "warning" : "info",
													children: l.urgency
												})]
											}, i))
										}),
										wf.referrals?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
											title: "Referrals",
											children: wf.referrals.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													padding: 8,
													borderBottom: "1px solid #f3f4f6",
													fontSize: 13
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: r.specialty }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													style: {
														fontSize: 11,
														color: "#6b7280"
													},
													children: r.rationale
												})]
											}, i))
										})
									]
								})
							] })
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: "@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes spin{to{transform:rotate(360deg)}}" })
		]
	});
}
function Editable({ label, value, onChange }) {
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
if (el) (0, import_client.createRoot)(el).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Encounter, {}));
//#endregion

//# sourceMappingURL=encounter-workspace.bundle.js.map