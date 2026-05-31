package org.oscarehr.ws.rest;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.logging.log4j.Logger;
import org.oscarehr.common.model.Allergy;
import org.oscarehr.common.model.Demographic;
import org.oscarehr.managers.AllergyManager;
import org.oscarehr.managers.DemographicManager;
import org.oscarehr.util.LoggedInInfo;
import org.oscarehr.util.MiscUtils;
import org.oscarehr.util.SpringUtils;
import org.springframework.stereotype.Service;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

@Service
@Path("/ai/intake")
public class AiIntakeService extends AbstractServiceImpl {

    private static final Logger logger = MiscUtils.getLogger();

    @POST
    @Path("/create")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createPatient(String json) {
        LoggedInInfo loggedInInfo = getLoggedInInfo();
        JSONObject data = JSONObject.fromObject(json);

        DemographicManager demographicManager = SpringUtils.getBean(DemographicManager.class);
        AllergyManager allergyManager = SpringUtils.getBean(AllergyManager.class);

        Demographic demographic = new Demographic();
        demographic.setFirstName(optString(data, "first_name"));
        demographic.setLastName(optString(data, "last_name"));
        demographic.setHin(optString(data, "health_card_number"));
        demographic.setHcType(optString(data, "hc_type", "BC"));
        demographic.setPhone(optString(data, "phone"));
        demographic.setAddress(optString(data, "address"));
        demographic.setCity(optString(data, "city"));
        demographic.setProvince(optString(data, "province"));
        demographic.setPostal(optString(data, "postal_code"));
        demographic.setSex(optString(data, "sex", "U"));
        demographic.setProviderNo(loggedInInfo.getLoggedInProviderNo());

        String dob = optString(data, "dob");
        if (dob != null && !dob.isEmpty()) {
            demographic.setYearOfBirth(dob.substring(0, 4));
            if (dob.length() >= 7) {
                demographic.setMonthOfBirth(dob.substring(5, 7));
            }
            if (dob.length() >= 10) {
                demographic.setDateOfBirth(dob.substring(8, 10));
            }
        }

        demographicManager.createDemographic(loggedInInfo, demographic, null);
        logger.info("AI intake created patient: demographic_no=" + demographic.getDemographicNo());

        JSONArray allergiesArr = data.optJSONArray("allergies");
        if (allergiesArr != null && !allergiesArr.isEmpty()) {
            java.util.List<Allergy> allergyList = new java.util.ArrayList<>();
            for (int i = 0; i < allergiesArr.size(); i++) {
                String allergyDesc = allergiesArr.optString(i);
                if (allergyDesc != null && !allergyDesc.isEmpty()) {
                    Allergy allergy = new Allergy();
                    allergy.setDemographicNo(demographic.getDemographicNo());
                    allergy.setDescription(allergyDesc);
                    allergy.setEntryDate(new Date());
                    allergyList.add(allergy);
                }
            }
            if (!allergyList.isEmpty()) {
                allergyManager.saveAllergies(allergyList);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("demographic_no", demographic.getDemographicNo());
        result.put("status", "created");
        result.put("name", demographic.getFirstName() + " " + demographic.getLastName());

        return Response.ok(result).build();
    }

    private String optString(JSONObject obj, String key, String defaultValue) {
        String val = obj.optString(key, null);
        return (val != null && !val.isEmpty()) ? val : defaultValue;
    }

    private String optString(JSONObject obj, String key) {
        return optString(obj, key, null);
    }
}
