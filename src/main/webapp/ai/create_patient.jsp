<%@ page import="org.oscarehr.util.SpringUtils" %>
<%@ page import="org.oscarehr.common.model.Demographic" %>
<%@ page import="org.oscarehr.common.model.Allergy" %>
<%@ page import="org.oscarehr.managers.DemographicManager" %>
<%@ page import="org.oscarehr.managers.AllergyManager" %>
<%@ page import="org.oscarehr.util.LoggedInInfo" %>
<%@ page import="java.util.*" %>
<%
    String firstName = request.getParameter("first_name");
    String lastName = request.getParameter("last_name");
    String hin = request.getParameter("health_card_number");
    String phone = request.getParameter("phone");
    String address = request.getParameter("address");
    String city = request.getParameter("city");
    String province = request.getParameter("province");
    String postal = request.getParameter("postal_code");
    String dob = request.getParameter("dob");
    String allergies = request.getParameter("allergies");
    
    if (firstName == null && lastName == null) {
        response.sendRedirect("intake.jsp");
        return;
    }

    DemographicManager demographicManager = SpringUtils.getBean(DemographicManager.class);
    AllergyManager allergyManager = SpringUtils.getBean(AllergyManager.class);
    LoggedInInfo loggedInInfo = LoggedInInfo.getLoggedInInfoFromSession(request);

    Demographic d = new Demographic();
    d.setFirstName(firstName != null ? firstName : "");
    d.setLastName(lastName != null ? lastName : "");
    if (hin != null && !hin.isEmpty()) d.setHin(hin);
    if (phone != null && !phone.isEmpty()) d.setPhone(phone);
    if (address != null && !address.isEmpty()) d.setAddress(address);
    if (city != null && !city.isEmpty()) d.setCity(city);
    if (province != null && !province.isEmpty()) d.setProvince(province);
    if (postal != null && !postal.isEmpty()) d.setPostal(postal);
    d.setProviderNo(loggedInInfo.getLoggedInProviderNo());
    d.setMiddleNames("");
    
    if (dob != null && dob.length() >= 10) {
        d.setYearOfBirth(dob.substring(0, 4));
        d.setMonthOfBirth(dob.substring(5, 7));
        d.setDateOfBirth(dob.substring(8, 10));
    }

    demographicManager.createDemographic(loggedInInfo, d, null);

    if (allergies != null && !allergies.isEmpty()) {
        List<Allergy> allergyList = new ArrayList<>();
        for (String a : allergies.split(",")) {
            a = a.trim();
            if (!a.isEmpty()) {
                Allergy al = new Allergy();
                al.setDemographicNo(d.getDemographicNo());
                al.setDescription(a);
                al.setEntryDate(new Date());
                allergyList.add(al);
            }
        }
        if (!allergyList.isEmpty()) {
            allergyManager.saveAllergies(allergyList);
        }
    }
%>
<!DOCTYPE html>
<html>
<head><title>Patient Created</title>
<style>
  body { font-family: system-ui; max-width: 600px; margin: 2rem auto; padding: 1rem; }
  .success { color: #16a34a; font-weight: 700; }
  .card { border: 1px solid #e5e5e5; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
</style>
</head>
<body>
  <h1 class="success">Patient Created</h1>
  <div class="card">
    <p><strong><%= d.getFirstName() %> <%= d.getLastName() %></strong></p>
    <p>Record #: <%= d.getDemographicNo() %></p>
    <p>DOB: <%= dob != null ? dob : "N/A" %></p>
  </div>
  <p><a href="<%=request.getContextPath()%>/ai/intake.jsp">Add another patient</a></p>
  <p><a href="<%=request.getContextPath()%>/demographic/demographiccontrol.jsp?demographic_no=<%=d.getDemographicNo()%>&displaymode=edit&dboperation=search_detail">View patient record</a></p>
</body>
</html>
