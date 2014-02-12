package edu.uoregon.servlets.libraries;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;

import java.util.HashMap;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import com.google.gson.Gson;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.NotFoundException;


import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.libraries.Assignment;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.servlets.SaraServlet;

public class GetAssignmentsServlet extends HttpServlet {

	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
	 *  Creates a new Discussion and an initial comment.
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");

		String id = request.getParameter("id");
		String type = request.getParameter("type");
		if(id == null|| id.equals("null") |id.equals("")){			
			
			throw new IllegalArgumentException();
		}
		
		SaraUser currentUser = SaraServlet.login(request,response);
		//if they did not give a specific lib give them all of them
		if(id != null){
			DAO dao = new DAO();
			if(currentUser != null){
				
				// For JavaScript calendar
				if(type.equals("calendarEvents")){
					
					Library lib = dao.ofy().get(new Key<Library>(Library.class,Long.parseLong(id)));
					Collection<Assignment> assignments = lib.getAssignments();
		        	if(assignments == null){
		        		return;
		        	}
		        	//get ready to send things back to client
					Gson gson = new Gson();
		    		response.setContentType("application/json");
		    		response.setCharacterEncoding("UTF-8");
		    		
		    		Collection<HashMap<String, Object>> output = new ArrayList<HashMap<String, Object>>();
					
		    		for (Assignment assignment : assignments) {
		    			HashMap<String, Object> data = new HashMap<String, Object>();
						data.put("title", assignment.name); 
						data.put("id", assignment.id); 
						data.put("allDay", true); 
						data.put("start", assignment.dueDate); 
						data.put("className", "notlate");
						data.put("description", assignment.description);
						data.put("reminder", false);
						if(assignment.islate()){
							data.put("color", "#f2dede");
							data.put("textColor", "#b94a48");
							data.put("borderColor", "#b94a48");
						}else {
							data.put("color", "#dff0d8");
							data.put("textColor", "#468847");
							data.put("borderColor", "#468847");
						}
						output.add(data);
					}
		    		
					try{
						response.getWriter().print(gson.toJson(output));
		        	} catch (NotFoundException e) {
		        		e.printStackTrace();
		        	}
					
				}else {
					Library lib = dao.ofy().get(new Key<Library>(Library.class,Long.parseLong(id)));
					Collection<Assignment> assignments = lib.getAssignments();
		        	
		        	//get ready to send things back to client
					Gson gson = new Gson();
		    		response.setContentType("application/json");
		    		response.setCharacterEncoding("UTF-8");
		    		
		    		Collection<HashMap<String, Object>> output = new ArrayList<HashMap<String, Object>>();
					
		    		for (Assignment assignment : assignments) {
		    			HashMap<String, Object> data = new HashMap<String, Object>();
						data.put("name", assignment.name); 
						data.put("id", assignment.id); 
						data.put("dueDate", assignment.dueDate); 
						data.put("timeCreated", assignment.timeCreated);
						data.put("description", assignment.description); 
						output.add(data); 					
					}
		    		  
					try{
						response.getWriter().print(gson.toJson(output));
		        	} catch (NotFoundException e) {
		        		e.printStackTrace();
		        	}

				}
				
			}
		}
	}

}
