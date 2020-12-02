package org.upgrad.upstac.shared;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import java.io.UnsupportedEncodingException;
import java.util.*;
import java.util.HashMap;
import org.json.*;

public class Blockchain {

    public static boolean blockchainRequest(String useBlockchain, String url, HashMap<String, String> body) {

        // Use Blockchain Check
        if (!useBlockchain.equals("true")) return false;

        // Post Request
        HttpPost post = new HttpPost(url);
        post.addHeader("content-type", "application/json");

        // Build Body JSON
        StringBuilder json = new StringBuilder();
        json.append("{");
        for (Map.Entry mapElement : body.entrySet()) {
            String key = (String)mapElement.getKey();
            String value = (String) mapElement.getValue();
            String jsonParam = "";
            if (value.contains("{")){
                jsonParam = "\"".concat(key).concat("\":").concat(value).concat(",");
            }else{
                jsonParam = "\"".concat(key).concat("\":\"").concat(value).concat("\",");
            }
            json.append(jsonParam);
        }
        json.setLength(json.length() - 1);
        json.append("}");
        System.out.println("=================================================================");
        System.out.println(url);
        System.out.println(json);

        // Append JSON data in Request
        try {
            post.setEntity(new StringEntity(json.toString()));
        } catch (UnsupportedEncodingException e) {
            System.out.println(e);
            e.printStackTrace();
        }

        // Post Request
        try {
            try (CloseableHttpClient httpClient = HttpClients.createDefault(); CloseableHttpResponse response = httpClient.execute(post)) {

                // Response
                String result = EntityUtils.toString(response.getEntity());

                // Parse Response
                JSONObject resultJson = new JSONObject(result);
                String success = resultJson.getString("success");
                if (success.equals("false")){
                    throw new Exception(resultJson.getString("error"));
                }

            } catch (JSONException e) {
                e.printStackTrace();
                throw new Exception(e);
            } catch (Exception e) {
                e.printStackTrace();
                throw new Exception("Blockchain Error : " + e.getMessage());
            }
        } catch (Exception e) {
            e.printStackTrace();
// TODO : Discuss            throw new Exception("Blockchain Error : " + e.getMessage());
        }
        return true;
    }

}
