package edu.uoregon.servlets.api;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Objectify;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;

public class GetUserLibrariesAPI extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	// Given a user email, finds all libraries that the user is in
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		response.setHeader("Access-Control-Allow-Origin", "*");
	    
    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
    	Objectify ofy = dao.ofy();  
    	
    	Gson gson = new Gson();
    	response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
    	
		// Get user key
    	String userEmail = request.getParameter("email").replaceAll("\\s","");
    	//Key<SaraUser> userKey = new Key<SaraUser>(SaraUser.class, ofy.query(SaraUser.class).filter("email", userEmail).get().id);
    	
    	// Find all UserLibraryRole entities
		List<UserLibraryRole> userLibList = ofy.query(UserLibraryRole.class).filter("user", userEmail).list();
		
		// Now take all the resources from each of those libraries
		ArrayList<Library> libraryList = new ArrayList<Library>();
		Iterator<UserLibraryRole> usLibIt = userLibList.iterator();
		while(usLibIt.hasNext()) {
			UserLibraryRole userLibRole = (UserLibraryRole) usLibIt.next();
			// Add the library to the list
			libraryList.add(ofy.get(userLibRole.library));
		}
		
		Iterator<Library> it = libraryList.iterator();
		ArrayList<HashMap<String, Object>> output = new ArrayList<HashMap<String, Object>>();
		
		while(it.hasNext()) {
			// Iterate through each resource, find all content attached to that resource, and then assemble a json
			Library lib = (Library) it.next();
			
			// Put stuff in the JSON
			HashMap<String, Object> library = new HashMap<String, Object>();
			library.put("title", lib.name);
			library.put("type", lib.type);
			library.put("description", lib.description);
			library.put("id", lib.id);
			
			output.add(library);

			
		}
    		
    	response.getWriter().print(gson.toJson(output));
	
	}
	
	// Given a user email, finds all libraries that the user is in
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		response.setHeader("Access-Control-Allow-Origin", "*");
	    
    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
    	Objectify ofy = dao.ofy();  
    	
    	Gson gson = new Gson();
    	response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
    	
		// Get user key
    	String userEmail = request.getParameter("email").replaceAll("\\s","");
    	Key<SaraUser> userKey = new Key<SaraUser>(SaraUser.class, ofy.query(SaraUser.class).filter("email", userEmail).get().id);
    	
    	// Find all UserLibraryRole entities
		List<UserLibraryRole> userLibList = ofy.query(UserLibraryRole.class).filter("user", userKey).list();
		
		// Now take all the resources from each of those libraries
		ArrayList<Library> libraryList = new ArrayList<Library>();
		Iterator<UserLibraryRole> usLibIt = userLibList.iterator();
		while(usLibIt.hasNext()) {
			UserLibraryRole userLibRole = (UserLibraryRole) usLibIt.next();
			// Add the library to the list
			libraryList.add(ofy.get(userLibRole.library));
		}
		
		Iterator<Library> it = libraryList.iterator();
		ArrayList<HashMap<String, Object>> output = new ArrayList<HashMap<String, Object>>();
		
		while(it.hasNext()) {
			// Iterate through each resource, find all content attached to that resource, and then assemble a json
			Library lib = (Library) it.next();
			
			// Put stuff in the JSON
			HashMap<String, Object> library = new HashMap<String, Object>();
			library.put("title", lib.name);
			library.put("type", lib.type);
			library.put("description", lib.description);
			library.put("id", lib.id);
			
			output.add(library);

			
		}
    		
    	response.getWriter().print(gson.toJson(output));
	
	}

}
