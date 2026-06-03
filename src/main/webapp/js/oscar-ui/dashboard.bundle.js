import { i as __toESM, n as require_client, r as require_react, t as require_jsx_runtime } from "./chunks/jsx-runtime-CV8b5LSl.js";
//#region src/entries/dashboard.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_client = require_client();
var import_jsx_runtime = require_jsx_runtime();
var AI = "http://localhost:8000";
function Dashboard() {
	const [appts, setAppts] = (0, import_react.useState)([]);
	const [search, setSearch] = (0, import_react.useState)("");
	const [searchResults, setSearchResults] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		fetch(`${AI}/api/v1/schedule/today`).then((r) => r.json()).then((d) => {
			setAppts(d.appointments || []);
			setLoading(false);
		}).catch(() => setLoading(false));
	}, []);
	const handleSearch = async (e) => {
		e.preventDefault();
		if (!search) return;
		try {
			window.location.href = `/oscar/demographic/demographiccontrol.jsp?displaymode=search&search_mode=search_name&search_name=${encodeURIComponent(search)}&dboperation=search_name`;
		} catch {}
	};
	const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			minHeight: "100vh",
			fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
			background: "#f3f4f6"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
				color: "#fff",
				padding: "10px 24px",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				boxShadow: "0 2px 12px rgba(0,0,0,0.15)"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 24
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					style: {
						fontSize: 18,
						fontWeight: 700,
						margin: 0
					},
					children: "OSCAR McMaster"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					style: {
						display: "flex",
						gap: 4
					},
					children: [
						{
							l: "Schedule",
							h: "/oscar/ai/dashboard.jsp"
						},
						{
							l: "Patients",
							h: "/oscar/demographic/demographiccontrol.jsp?displaymode=search&search_mode=search_name&dboperation=search_all"
						},
						{
							l: "AI Encounter",
							h: "/oscar/ai/encounter.jsp"
						},
						{
							l: "Smart Intake",
							h: "/oscar/ai/intake.jsp"
						},
						{
							l: "Billing",
							h: "/oscar/ai/billing.jsp"
						},
						{
							l: "Scribe",
							h: "/oscar/ai/scribe.jsp"
						}
					].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: m.h,
						style: {
							color: "rgba(255,255,255,0.9)",
							textDecoration: "none",
							padding: "4px 10px",
							borderRadius: 4,
							fontSize: 13,
							transition: "background .15s"
						},
						onMouseOver: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)",
						onMouseOut: (e) => e.currentTarget.style.background = "transparent",
						children: m.l
					}, m.l))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 16
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
					onSubmit: handleSearch,
					style: {
						display: "flex",
						gap: 4
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Search patients...",
						style: {
							padding: "6px 12px",
							border: "none",
							borderRadius: 6,
							fontSize: 13,
							width: 200,
							outline: "none"
						}
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/oscar/logout.jsp",
					style: {
						color: "rgba(255,255,255,0.7)",
						fontSize: 12,
						textDecoration: "none"
					},
					children: "Logout"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				maxWidth: 1100,
				margin: "0 auto",
				padding: "20px 24px"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
					gap: 12,
					marginBottom: 20
				},
				children: [
					{
						label: "Today",
						value: dateStr.split(",")[0] || "Today",
						icon: "📅"
					},
					{
						label: "Patients",
						value: appts.length + " scheduled",
						icon: "👥"
					},
					{
						label: "Quick Links",
						value: "Modules",
						icon: "⚡"
					}
				].map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "#fff",
						padding: 16,
						borderRadius: 10,
						border: "1px solid #e5e7eb",
						boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 24,
								marginBottom: 4
							},
							children: s.icon
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 12,
								color: "#6b7280",
								marginBottom: 2
							},
							children: s.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 18,
								fontWeight: 700,
								color: "#1f2937"
							},
							children: s.value
						})
					]
				}, i))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "2fr 1fr",
					gap: 16
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "#fff",
						border: "1px solid #e5e7eb",
						borderRadius: 10,
						boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
						overflow: "hidden"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: "14px 18px",
							borderBottom: "1px solid #f3f4f6",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							style: {
								fontSize: 16,
								fontWeight: 600,
								margin: 0,
								color: "#1f2937"
							},
							children: "Today's Schedule"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: 13,
								color: "#6b7280"
							},
							children: dateStr
						})]
					}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							padding: 40,
							textAlign: "center",
							color: "#9ca3af"
						},
						children: "Loading..."
					}) : appts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							padding: 40,
							textAlign: "center",
							color: "#9ca3af"
						},
						children: "No appointments today"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						style: {
							width: "100%",
							borderCollapse: "collapse"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							style: { background: "#f9fafb" },
							children: [
								"Time",
								"Patient",
								"Provider",
								"Notes"
							].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: {
									padding: "8px 14px",
									fontSize: 11,
									textTransform: "uppercase",
									color: "#6b7280",
									fontWeight: 600,
									textAlign: "left",
									borderBottom: "2px solid #e5e7eb"
								},
								children: h
							}, h))
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: appts.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							style: {
								borderBottom: "1px solid #f3f4f6",
								cursor: "pointer"
							},
							onClick: () => a.demographic_no && (window.location.href = `/oscar/ai/encounter.jsp?demographicNo=${a.demographic_no}`),
							onMouseOver: (e) => e.currentTarget.style.background = "#f0f4ff",
							onMouseOut: (e) => e.currentTarget.style.background = "transparent",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									style: {
										padding: "8px 14px",
										fontSize: 13,
										fontWeight: 500
									},
									children: [
										a.start?.substring(0, 5),
										" - ",
										a.end?.substring(0, 5)
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										padding: "8px 14px",
										fontSize: 13
									},
									children: a.patient
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										padding: "8px 14px",
										fontSize: 13,
										color: "#6b7280"
									},
									children: a.provider_name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										padding: "8px 14px",
										fontSize: 12,
										color: "#9ca3af"
									},
									children: a.notes?.substring(0, 30)
								})
							]
						}, i)) })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: 10
					},
					children: [
						{
							t: "New Encounter",
							d: "Start AI scribe for a patient",
							h: "/oscar/ai/encounter.jsp",
							c: "#2563eb"
						},
						{
							t: "Smart Intake",
							d: "Register a new patient with AI",
							h: "/oscar/ai/intake.jsp",
							c: "#059669"
						},
						{
							t: "Billing",
							d: "AI billing code suggestions",
							h: "/oscar/ai/billing.jsp",
							c: "#7c3aed"
						},
						{
							t: "Patient Search",
							d: "Find and manage patients",
							h: "/oscar/demographic/demographiccontrol.jsp?displaymode=search",
							c: "#d97706"
						},
						{
							t: "Referrals",
							d: "Generate and track referrals",
							h: "/oscar/ai/referral.jsp",
							c: "#dc2626"
						},
						{
							t: "Prescriptions",
							d: "Manage medications",
							h: "/oscar/oscarRx/choosePatient.do",
							c: "#0891b2"
						}
					].map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: a.h,
						style: {
							display: "block",
							padding: "14px",
							background: "#fff",
							border: "1px solid #e5e7eb",
							borderRadius: 8,
							borderLeft: `4px solid ${a.c}`,
							textDecoration: "none",
							transition: "box-shadow .15s",
							boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
						},
						onMouseOver: (e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)",
						onMouseOut: (e) => e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 14,
								fontWeight: 600,
								color: "#1f2937"
							},
							children: a.t
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 12,
								color: "#6b7280",
								marginTop: 2
							},
							children: a.d
						})]
					}, i))
				})]
			})]
		})]
	});
}
var el = document.getElementById("dashboard-root");
if (el) (0, import_client.createRoot)(el).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}));
//#endregion

//# sourceMappingURL=dashboard.bundle.js.map