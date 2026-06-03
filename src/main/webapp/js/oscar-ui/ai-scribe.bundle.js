import { i as __toESM, n as require_client, r as require_react, t as require_jsx_runtime } from "./chunks/jsx-runtime-CV8b5LSl.js";
import { i as Button, n as Tabs, r as Card, t as Badge } from "./chunks/Badge-B5Ss0JGR.js";
/* empty css                          */
//#region src/entries/ai-scribe.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_client = require_client();
var import_jsx_runtime = require_jsx_runtime();
var AI = "http://localhost:8000";
function LiveScribe() {
	const [recording, setRecording] = (0, import_react.useState)(false);
	const [transcript, setTranscript] = (0, import_react.useState)("");
	const [result, setResult] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("soap");
	const [edited, setEdited] = (0, import_react.useState)({});
	const [step, setStep] = (0, import_react.useState)("record");
	const mediaRecorder = (0, import_react.useRef)(null);
	const chunks = (0, import_react.useRef)([]);
	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
			chunks.current = [];
			mediaRecorder.current.ondataavailable = (e) => {
				if (e.data.size > 0) chunks.current.push(e.data);
			};
			mediaRecorder.current.onstop = handleTranscribe;
			mediaRecorder.current.start();
			setRecording(true);
			setError(null);
		} catch (e) {
			setError("Microphone access denied. Please allow microphone permissions.");
		}
	};
	const stopRecording = () => {
		mediaRecorder.current?.stop();
		mediaRecorder.current?.stream.getTracks().forEach((t) => t.stop());
		setRecording(false);
		setStep("transcribing");
	};
	const handleTranscribe = async () => {
		const blob = new Blob(chunks.current, { type: "audio/webm" });
		const formData = new FormData();
		formData.append("file", blob, "recording.webm");
		try {
			const data = await (await fetch(`${AI}/api/v1/scribe/transcribe`, {
				method: "POST",
				body: formData
			})).json();
			setTranscript(data.text);
			setStep("generating");
			await handleGenerate(data.text);
		} catch (e) {
			setError("Transcription failed: " + e.message);
			setStep("record");
		}
	};
	const handleGenerate = async (text) => {
		setLoading(true);
		try {
			setResult(await (await fetch(`${AI}/api/v1/scribe/generate`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					transcript: text,
					encounter_type: "visit"
				})
			})).json());
			setEdited({});
			setStep("done");
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};
	const handleManualTranscribe = async () => {
		if (!transcript) return;
		setStep("generating");
		await handleGenerate(transcript);
	};
	const update = (f, v) => setEdited((p) => ({
		...p,
		[f]: v
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
				children: "Live AI Scribe"
			}),
			!result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				title: "Encounter Recording",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							color: "var(--color-neutral-500)",
							fontSize: 14,
							marginBottom: 16
						},
						children: "Record the patient encounter. Whisper large-v3 will transcribe it, then the clinical AI generates a structured SOAP note."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 16,
							flexWrap: "wrap"
						},
						children: [!recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: startRecording,
							disabled: step === "transcribing" || step === "generating",
							children: step === "transcribing" ? "Transcribing..." : step === "generating" ? "Generating..." : "Start Recording"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "danger",
							onClick: stopRecording,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
								display: "inline-block",
								width: 8,
								height: 8,
								borderRadius: "50%",
								background: "#fff",
								marginRight: 8,
								animation: "pulse 1s infinite"
							} }), " Stop Recording"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontSize: 14,
								color: "var(--color-neutral-500)"
							},
							children: [
								step === "transcribing" && "Transcribing audio...",
								step === "generating" && "AI generating SOAP note...",
								recording && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "error",
									children: "Recording"
								})
							]
						})]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							marginTop: 12,
							padding: 10,
							background: "var(--color-error-light)",
							borderRadius: 6,
							color: "var(--color-error)",
							fontSize: 13
						},
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						style: { marginTop: 16 },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								style: {
									cursor: "pointer",
									fontSize: 13,
									color: "var(--color-neutral-500)"
								},
								children: "Or paste transcript manually..."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: transcript,
								onChange: (e) => setTranscript(e.target.value),
								rows: 6,
								placeholder: "Paste transcript here...",
								style: {
									width: "100%",
									padding: 10,
									border: "1px solid var(--color-neutral-300)",
									borderRadius: 6,
									fontSize: 14,
									fontFamily: "var(--font-sans)",
									resize: "vertical",
									marginTop: 8
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: { marginTop: 8 },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: handleManualTranscribe,
									disabled: !transcript || loading,
									size: "sm",
									children: "Generate SOAP Note"
								})
							})
						]
					})
				]
			}),
			data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: { marginTop: "var(--spacing-4)" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
						tabs: [
							{
								key: "soap",
								label: "SOAP Note"
							},
							{
								key: "billing",
								label: `Billing (${data.billing_suggestions?.length || 0})`
							},
							{
								key: "rx",
								label: `Rx (${data.prescription_suggestions?.length || 0})`
							},
							{
								key: "labs",
								label: `Labs (${data.lab_suggestions?.length || 0})`
							}
						],
						activeKey: tab,
						onChange: setTab
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: { marginTop: "var(--spacing-4)" },
						children: [
							tab === "soap" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: "var(--spacing-4)"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableSection, {
										label: "Subjective",
										value: data.subjective,
										onChange: (v) => update("subjective", v)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableSection, {
										label: "Objective",
										value: data.objective,
										onChange: (v) => update("objective", v)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableSection, {
										label: "Assessment",
										value: data.assessment,
										onChange: (v) => update("assessment", v)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableSection, {
										label: "Plan",
										value: data.plan,
										onChange: (v) => update("plan", v)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											padding: 12,
											background: "var(--color-neutral-50)",
											borderRadius: 8,
											fontSize: 13
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Follow-up:" }),
											" ",
											data.follow_up || "Not specified",
											data.referral_needed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: {
													marginLeft: 12,
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
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
										style: {
											cursor: "pointer",
											fontSize: 13,
											color: "var(--color-neutral-500)"
										},
										children: "Transcript"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											padding: 12,
											background: "var(--color-neutral-50)",
											borderRadius: 6,
											fontSize: 13,
											whiteSpace: "pre-wrap",
											marginTop: 8
										},
										children: transcript
									})] })
								]
							}),
							tab === "billing" && data.billing_suggestions?.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									padding: 8,
									borderBottom: "1px solid var(--color-neutral-100)",
									alignItems: "center"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: b.code }),
									" ",
									b.description
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									style: { color: "var(--color-primary-700)" },
									children: ["$", b.fee?.toFixed(2)]
								})]
							}, i)),
							tab === "rx" && data.prescription_suggestions?.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									padding: 8,
									border: "1px solid var(--color-neutral-200)",
									borderRadius: 6,
									marginBottom: 8
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
										r.drug,
										" ",
										r.dose
									] }),
									" — ",
									r.route,
									" ",
									r.frequency,
									" x ",
									r.duration,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 12,
											color: "var(--color-neutral-500)",
											marginTop: 2
										},
										children: r.rationale
									})
								]
							}, i)),
							tab === "labs" && data.lab_suggestions?.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									padding: 8,
									borderBottom: "1px solid var(--color-neutral-100)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: l.test }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: l.urgency === "stat" ? "error" : l.urgency === "urgent" ? "warning" : "info",
									children: l.urgency
								})]
							}, i))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							marginTop: "var(--spacing-4)",
							display: "flex",
							gap: 8,
							justifyContent: "flex-end"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => {
								setResult(null);
								setStep("record");
								setTranscript("");
							},
							children: "New Recording"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `@keyframes pulse {0%,100%{opacity:1}50%{opacity:0.3}}` })
		]
	});
}
function EditableSection({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
		style: {
			fontSize: 14,
			fontWeight: 600,
			marginBottom: 4,
			color: "var(--color-primary-700)"
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
			border: "1px solid var(--color-neutral-300)",
			borderRadius: 6,
			fontFamily: "var(--font-sans)",
			resize: "vertical"
		}
	})] });
}
var el = document.getElementById("scribe-root");
if (el) (0, import_client.createRoot)(el).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveScribe, {}));
//#endregion

//# sourceMappingURL=ai-scribe.bundle.js.map