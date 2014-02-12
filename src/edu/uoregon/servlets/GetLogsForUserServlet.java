package edu.uoregon.servlets;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.googlecode.objectify.Objectify;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraLog;
import edu.uoregon.models.SaraUser;

public class GetLogsForUserServlet extends HttpServlet {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		// gives us the current user or NULL if they are not allowed in the site
		SaraUser currentUser = SaraServlet.login(request,response);
		if(currentUser != null){
	    	
	    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
	    	Objectify ofy = dao.ofy();  
	    	
	    	Gson gson = new Gson();
	    	response.setContentType("application/json");
    		response.setCharacterEncoding("UTF-8");
	    	
    		
	    	String userEmail = request.getParameter("email");
			List<SaraLog> logList = ofy.query(SaraLog.class).filter("email", userEmail).list();
			Collections.sort(logList, new Comparator<Object>() {
		        public int compare(Object s1, Object s2) {
		            return ((SaraLog) s1).timeCreated.compareTo(((SaraLog) s2).timeCreated);
		        }
		    });

			
			ArrayList<HashMap<String, Object>> output = new ArrayList<HashMap<String, Object>>();
			Iterator<SaraLog> it = logList.iterator();
			while(it.hasNext()) {
				SaraLog log = it.next();
				
				//get ready to send things back to client				
				
    			HashMap<String, Object> data = new HashMap<String, Object>();
				data.put("email", log.email); 
				data.put("timeCreated", log.timeCreated); 
				data.put("data1", log.logData1);
				data.put("data2", log.logData2);
				data.put("type", log.logType);
				data.put("strategy", log.logStrategy);
				data.put("section", log.logSectionKey);
				data.put("content", log.logContentKey);
				data.put("id", log.id);
				
				output.add(data);
			}
	    		
	    	response.getWriter().print(gson.toJson(output));
    	
    	
		}
	}
	
}
