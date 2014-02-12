package edu.uoregon.servlets;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.labs.repackaged.org.json.JSONArray;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.google.appengine.labs.repackaged.org.json.JSONTokener;

import edu.uoregon.models.SaraLog;
import edu.uoregon.models.SaraUser;

public class BatchLogServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 7019387970593958549L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
    	
		SaraUser currentUser = SaraServlet.login(request, response);
    	//make sure that we are logged in as a valid user
		if(currentUser != null){
			
			try {
				
				// parse json
				JSONTokener tokener = new JSONTokener(request.getParameter("logs"));
				JSONArray logs = new JSONArray(tokener);
				
				String email = currentUser.email.getEmail().toLowerCase();
				System.out.println(logs);
				// loop through logs
				for (int i = 0; i < logs.length(); i++){
					JSONObject log = logs.getJSONObject(i);
					System.out.println("test");
					String type = null;
			    	String content = null;
			    	String strategy = null;
			    	String section = null;
			    	Long time = (long) 0;
			    	String data1 = null;
			    	String data2 = null; 
					
					try {
				    	type = log.getString("type");
				    	time = Long.parseLong(log.getString("time"));
				    	strategy = log.getString("strategy");
				    	content = log.getString("contentKey");
				    	section = log.getString("sectionKey");
				    	data1 = log.getString("data1");
				    	data2 = log.getString("data2");
					} catch (JSONException e){
						// just log and keep going
						e.printStackTrace();
					}
					
			    	if ((type == null) || (type.equals("")) || ((content == null) && (section == null)) || (strategy == null) || (time == null)) {
		    			throw new IllegalArgumentException();
			    	}
		    	
					SaraLog.log(email, time, type, strategy, section, content, data1, data2);
				}
				
			} catch (Exception e){
				e.printStackTrace();
			}
				    	
	    }else{
	    	System.err.println("User out of Sync");
	    }
			    
	}
	
}
