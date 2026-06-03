<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Smart Intake</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,segoe ui,Roboto,sans-serif}.header{background:linear-gradient(135deg,#1e40af,#2563eb);color:#fff;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,.15);position:sticky;top:0;z-index:100}.header h2{font-size:16px;font-weight:600}.header a{color:rgba(255,255,255,.85);text-decoration:none;font-size:13px;padding:4px 10px;border-radius:4px;transition:background .15s}.header a:hover{background:rgba(255,255,255,.15);color:#fff}</style>
    <link rel="stylesheet" href="<%=request.getContextPath()%>/js/oscar-ui/assets/variables-DTRBujtH.css">
</head>
<body style="margin:0;font-family:system-ui;">
    <div id="ai-intake-root">Loading AI Smart Intake...</div>
    <script type="module" src="<%=request.getContextPath()%>/js/oscar-ui/ai-intake.bundle.js"></script>
</body>
</html>
