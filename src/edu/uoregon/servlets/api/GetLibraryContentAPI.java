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

import edu.uoregon.models.Content;
import edu.uoregon.models.DAO;
import edu.uoregon.models.Resource;
import edu.uoregon.models.libraries.Library;

public class GetLibraryContentAPI extends HttpServlet {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	// Given a library ID, returns an array of JSONs of all the content that is in that library
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		response.setHeader("Access-Control-Allow-Origin", "*");
	    
    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
    	Objectify ofy = dao.ofy();
    	
    	Gson gson = new Gson();
    	response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
    	
		// Get library
		Long libid = Long.valueOf(request.getParameter("libraryID"));
    	Library library = ofy.get(new Key<Library>(Library.class, libid));
    	
    	// Add all resources of the library to a list
		ArrayList<Key<Resource>> resourceKeyList = new ArrayList<Key<Resource>>();
		resourceKeyList.addAll(library.resources);
		
		ArrayList<HashMap<String, Object>> contentoutput = new ArrayList<HashMap<String, Object>>();
		Iterator<Key<Resource>> it = resourceKeyList.iterator();
		while(it.hasNext()) {
			// Iterate through each resource, find all content attached to that resource, and then assemble a json
			Key<Resource> resKey = (Key<Resource>) it.next();
			List<Content> contentList = ofy.query(Content.class).filter("resource", resKey).list();
			
			Iterator<Content> it2 = contentList.iterator();
			while(it2.hasNext()) {
				Content c = (Content) it2.next();
				HashMap<String, Object> sectionoutput = new HashMap<String, Object>();
				
				// Put stuff in the JSON
				sectionoutput.put("title", c.title);
				sectionoutput.put("type", c.type);
				sectionoutput.put("description", c.description);
				sectionoutput.put("id", c.id);
				
				contentoutput.add(sectionoutput);
			}
			
		}
    		
    	response.getWriter().print(gson.toJson(contentoutput));
	
	}
	
	// Given a library ID, returns an array of JSONs of all the content that is in that library
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		response.setHeader("Access-Control-Allow-Origin", "*");
	    
    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
    	Objectify ofy = dao.ofy();  
    	
    	Gson gson = new Gson();
    	response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
    	
		// Get library
		Long libid = Long.valueOf(request.getParameter("libraryID"));
    	Library library = ofy.get(new Key<Library>(Library.class, libid));
    	
    	// Add all resources of the library to a list
		ArrayList<Key<Resource>> resourceKeyList = new ArrayList<Key<Resource>>();
		resourceKeyList.addAll(library.resources);
		
		ArrayList<HashMap<String, Object>> contentoutput = new ArrayList<HashMap<String, Object>>();
		Iterator<Key<Resource>> it = resourceKeyList.iterator();
		while(it.hasNext()) {
			// Iterate through each resource, find all content attached to that resource, and then assemble a json
			Key<Resource> resKey = (Key<Resource>) it.next();
			List<Content> contentList = ofy.query(Content.class).filter("resource", resKey).list();
			
			Iterator<Content> it2 = contentList.iterator();
			while(it2.hasNext()) {
				Content c = (Content) it2.next();
				HashMap<String, Object> sectionoutput = new HashMap<String, Object>();
				
				// Put stuff in the JSON
				sectionoutput.put("title", c.title);
				sectionoutput.put("type", c.type);
				sectionoutput.put("description", c.description);
				sectionoutput.put("id", c.id);
				
				contentoutput.add(sectionoutput);
			}
			
		}
    		
    	response.getWriter().print(gson.toJson(contentoutput));
	
	}
	
}
