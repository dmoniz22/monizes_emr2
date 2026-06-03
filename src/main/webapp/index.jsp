<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="shortcut icon" href="images/Oscar.ico" />
<link href="<%=request.getContextPath() %>/css/oscar-modern.css" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%);
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
  }
  .login-card {
    background: #fff; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    width: 420px; max-width: 95%; overflow: hidden;
  }
  .login-header {
    background: linear-gradient(135deg, #1e40af, #2563eb);
    padding: 32px 24px 24px; text-align: center; color: #fff;
  }
  .login-header h1 { font-size: 22px; font-weight: 700; }
  .login-header p { font-size: 13px; opacity: 0.85; margin-top: 4px; }
  .login-body { padding: 24px; }
  .login-body label { display: block; font-size: 12px; font-weight: 600; color: #525252; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .login-body input { width: 100%; padding: 10px 12px; margin-bottom: 14px; border: 1px solid #d4d4d4; border-radius: 6px; font-size: 14px; outline: none; transition: border-color .15s,box-shadow .15s; }
  .login-body input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
  .login-body button { width: 100%; padding: 12px; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background .15s; margin-top: 4px; }
  .login-body button:hover { background: #1d4ed8; }
  .login-footer { text-align: center; padding: 8px 24px 16px; font-size: 11px; color: #a3a3a3; }
  .login-footer a { color: #3b82f6; text-decoration: none; }
  .error-msg { background: #fee2e2; color: #dc2626; padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 14px; }
</style>
</head>
<body>
<div class="login-card">
  <div class="login-header">
    <h1>OSCAR McMaster</h1>
    <p>Clinical Intelligence Platform</p>
  </div>
  <div class="login-body">
    <%
      String err = request.getParameter("errormsg");
      if (err != null) {
    %>
      <div class="error-msg"><%= err %></div>
    <% } %>
    <form name="loginForm" method="post" action="<%=request.getContextPath() %>/login.do">
      <label for="username">Username</label>
      <input type="text" id="username" name="username" autocomplete="off" placeholder="Enter username">
      <label for="password2">Password</label>
      <input type="password" id="password2" name="password" placeholder="Enter password">
      <label for="pin2">PIN <span style="font-weight:400;text-transform:none;font-size:11px;color:#a3a3a3">(optional)</span></label>
      <input type="text" id="pin2" name="pin2" autocomplete="off" placeholder="Enter PIN if configured">
      <input type="hidden" id="pin" name="pin" value="">
      <input type="hidden" id="oneIdKey" name="nameId" value="">
      <input type="hidden" id="email" name="email" value="">
      <input type="hidden" name="propname" value="oscar_mcmaster">
      <button type="submit">Sign In</button>
    </form>
  </div>
  <div class="login-footer">
    GPL v2 &middot; <a href="https://fammedmcmaster.ca" target="_blank">McMaster University</a> &middot; 
    <%= System.getProperty("java.version") %> &middot; Tomcat 9
  </div>
</div>
</body>
</html>
