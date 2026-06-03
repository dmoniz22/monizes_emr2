<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>AI Scribe — Encounter</title>
<link rel="stylesheet" href="<%=request.getContextPath()%>/css/oscar-modern.css">
<link rel="stylesheet" href="<%=request.getContextPath()%>/js/oscar-ui/assets/variables-DTRBujtH.css">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#f5f5f5; }
  .header { background: linear-gradient(135deg,#1e40af,#2563eb); color:#fff; padding:10px 20px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 2px 8px rgba(0,0,0,0.15); position:sticky; top:0; z-index:100; }
  .header h2 { font-size:16px; font-weight:600; }
  .header .patient-badge { background:rgba(255,255,255,0.15); padding:4px 12px; border-radius:20px; font-size:13px; }
  .header .nav-links { display:flex; gap:8px; }
  .header .nav-links a { color:rgba(255,255,255,0.85); text-decoration:none; font-size:13px; padding:4px 10px; border-radius:4px; transition:background .15s; }
  .header .nav-links a:hover { background:rgba(255,255,255,0.15); color:#fff; }
  .layout { display:flex; min-height:calc(100vh - 48px); }
  .sidebar { width:220px; background:#fff; border-right:1px solid #e5e5e5; padding:12px 0; box-shadow:2px 0 8px rgba(0,0,0,0.05); }
  .sidebar a { display:block; padding:8px 16px; color:#525252; text-decoration:none; font-size:13px; border-left:3px solid transparent; transition:all .15s; }
  .sidebar a:hover { background:#eff6ff; color:#2563eb; border-left-color:#2563eb; }
  .sidebar a.active { background:#eff6ff; color:#2563eb; border-left-color:#2563eb; font-weight:600; }
  .main { flex:1; padding:16px; overflow:auto; }
</style>
</head>
<body>
<div class="header">
  <div style="display:flex;align-items:center;gap:16px;">
    <h2>OSCAR AI</h2>
    <a href="<%=request.getContextPath()%>/appointment/appointmentcontrol.jsp" class="nav-links" style="color:white;text-decoration:none;font-size:13px;">Schedule</a>
    <a href="<%=request.getContextPath()%>/demographic/demographiccontrol.jsp" class="nav-links" style="color:white;text-decoration:none;font-size:13px;">Patients</a>
    <a href="<%=request.getContextPath()%>/ai/intake.jsp" class="nav-links" style="color:white;text-decoration:none;font-size:13px;">Smart Intake</a>
  </div>
  <div style="display:flex;align-items:center;gap:12px;">
    <span style="font-size:13px;opacity:0.85;">Logged in</span>
    <a href="<%=request.getContextPath()%>/logout.jsp" style="color:white;font-size:12px;opacity:0.7;">Sign out</a>
  </div>
</div>
<div id="scribe-root">Loading AI Scribe encounter interface...</div>
<script type="module" src="<%=request.getContextPath()%>/js/oscar-ui/ai-scribe.bundle.js"></script>
</body>
</html>
