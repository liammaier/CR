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

import edu.uoregon.models.Content;
import edu.uoregon.models.DAO;
import edu.uoregon.models.Resource;
import edu.uoregon.models.SaraUser;
import edu.uoregon.servlets.SaraServlet;

public class GetContentServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		response.setHeader("Access-Control-Allow-Origin", "*");

		Key<Resource> resourceKey = new Key<Resource>(Resource.class, new Long(request.getParameter("resourceID")));
		
		SaraUser currentUser = SaraServlet.login(request,response);
		//if they did not give a specific lib give them all of them
		if(resourceKey != null){
			DAO dao = new DAO();
			if(currentUser != null){
				
				Collection<Content> contents = dao.ofy().query(Content.class).filter("resource", resourceKey).order("order").list();
	        	
	        	//get ready to send things back to client
				Gson gson = new Gson();
	    		response.setContentType("application/json");
	    		response.setCharacterEncoding("UTF-8");
	    		
	    		Collection<HashMap<String, Object>> output = new ArrayList<HashMap<String, Object>>();
				
	    		for (Content content : contents) {
	    			HashMap<String, Object> data = new HashMap<String, Object>();
					data.put("title", content.title); 
					data.put("id", content.id); 
					data.put("description", content.description); 
					data.put("timeCreated", content.timeCreated);
					data.put("numPages", content.numPages);
					data.put("numSections", content.numSections);
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
