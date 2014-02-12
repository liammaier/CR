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
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.models.UserContentProgress;

public class GetUsersInLibraryAPI extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	// Given a library, finds all users that are in that library
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		response.setHeader("Access-Control-Allow-Origin", "*");
	    
    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
    	Objectify ofy = dao.ofy(); 
    	
    	Gson gson = new Gson();
    	response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
    	
		// Get library key
    	Key<Library> libKey = new Key<Library>(Library.class, Long.valueOf(request.getParameter("libID")));
    	
    	// Find all UserLibraryRole entities
		List<UserLibraryRole> userLibList = ofy.query(UserLibraryRole.class).filter("library", libKey).list();
		
		/*get library object*/
		Library library = ofy.get(new Key<Library>(Library.class, Long.valueOf(request.getParameter("libID"))));
		/*get all contents from library*/
		ArrayList<Content> contentList = new ArrayList<Content>();
		if (library.resources != null){
			for(int i = 0; i < library.resources.size(); i++){
				// Query for all content under that resource
				contentList.addAll(ofy.query(Content.class).filter("resource", library.resources.get(i)).list());
			}
		}
		/*get all contents key*/
		ArrayList<Key<Content>> conKeyList = new ArrayList<Key<Content>>();
		for (Content content: contentList){
			Key<Content> newKey = Content.getResourceKeyById(content.id);
			conKeyList.add(newKey);
		}
		/*end*/
		
		// Now take all the users from the library roles
		ArrayList<HashMap<String, Object>> userList = new ArrayList<HashMap<String, Object>>();
		Iterator<UserLibraryRole> usLibIt = userLibList.iterator();
		while(usLibIt.hasNext()) {
			UserLibraryRole userLibRole = (UserLibraryRole) usLibIt.next();
			// Get the user
			SaraUser user = ofy.get(userLibRole.user);
			// Store user data in the hashmap
			HashMap<String, Object> userHash = new HashMap<String, Object>();
			userHash.put("id", user.id);
			userHash.put("name", user.name);
			userHash.put("email", user.getEmail());
			userHash.put("type", user.type);
			
			/** add highlight number **/
			int highlightsNum = 0;
			int notesNum = 0;
			int sectionsRead = 0;
			
			ArrayList<UserContentProgress> ucpList = new ArrayList<UserContentProgress>();
			ucpList.addAll(ofy.query(UserContentProgress.class).filter("user", user.getKey()).list());
			for (UserContentProgress ucp: ucpList){
				if (conKeyList.contains(ucp.content)){
					highlightsNum += ucp.highlightsMade;
					notesNum += ucp.notesTaken;
					sectionsRead += ucp.getNumSectionsRead();
				}
			}
			
			userHash.put("highlightsNum", highlightsNum);
			userHash.put("notesNum", notesNum);
			userHash.put("sectionsRead", sectionsRead);
			/*end*/
			
			userList.add(userHash);
		}
    		
    	response.getWriter().print(gson.toJson(userList));
	
	}
	
}
