package edu.uoregon.servlets.groups;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.googlecode.objectify.NotFoundException;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.groups.Group;
import edu.uoregon.servlets.SaraServlet;

public class GetMyGroupsServlet extends HttpServlet {

	
	/**
	 * 
	 */
	private static final long serialVersionUID = -7127849159687649245L;

	/**
	 *  Creates a new Discussion and an initial comment.
	 */
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		
		//gives us the current user or NULL if they are not allowed in the site,
		SaraUser currentUser = SaraServlet.login(request,response);
		
		
		  
		if(currentUser != null){
        	Collection<Group> groups = Group.getAllGroup();
        	
        	//get ready to send things back to client
			Gson gson = new Gson();
    		response.setContentType("application/json");
    		response.setCharacterEncoding("UTF-8");
    		
    		Collection<HashMap<String, Object>> mygroups = new ArrayList<HashMap<String, Object>>();
			
    		for (Group group : groups) {
    			HashMap<String, Object> data = new HashMap<String, Object>();
    			String leaderEmail = group.getLeaderEmail();
				data.put("name", group.name); 
				data.put("timeCreated", group.timeCreated);
				data.put("leader",leaderEmail); 
				data.put("type", group.type); 
				data.put("description", group.description); 
				data.put("role", group.description); 
				mygroups.add(data);
			  		  					
			}
    		  
			try{
				response.getWriter().print(gson.toJson(mygroups));
        	} catch (NotFoundException e) {
        		e.printStackTrace();
        	}
    		
		}
	}

}
