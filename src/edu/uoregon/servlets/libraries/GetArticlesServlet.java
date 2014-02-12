package edu.uoregon.servlets.libraries;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.NotFoundException;

import edu.uoregon.models.DAO;
import edu.uoregon.models.Resource;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.servlets.SaraServlet;

public class GetArticlesServlet extends HttpServlet {

/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		// Give all articles for the given library
	
		response.setHeader("Access-Control-Allow-Origin", "*");
		Key<Library> libraryKey = new Key<Library>(Library.class, new Long(request.getParameter("libID")));
		SaraUser currentUser = SaraServlet.login(request,response);
		
		if(libraryKey != null){
			DAO dao = new DAO();
			if(currentUser != null){
				
				ArrayList<Key<Resource>> resourcekeys = dao.ofy().get(libraryKey).resources;
				if(resourcekeys == null){
					return;
				}
	        	
	        	//get ready to send things back to client
				Gson gson = new Gson();
	    		response.setContentType("application/json");
	    		response.setCharacterEncoding("UTF-8");
	    		
	    		Collection<HashMap<String, Object>> output = new ArrayList<HashMap<String, Object>>();
				
	    		Map<Key<Resource>, Resource> resources = dao.ofy().get(resourcekeys);
	    		for (Resource resource : resources.values()) {
	    			
	    			// only get the articles
	    			if (resource.type.equals("article")){
	    			
		    			HashMap<String, Object> data = new HashMap<String, Object>();
						data.put("title", resource.title); 
						data.put("id", resource.id); 
						data.put("description", resource.description); 
						data.put("timeCreated", resource.timeCreated);
						output.add(data); 					
	    			}
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
