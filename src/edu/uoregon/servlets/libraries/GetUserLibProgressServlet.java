package edu.uoregon.servlets.libraries;

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
import edu.uoregon.models.UserContentProgress;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.reader.Highlight;
import edu.uoregon.models.reader.Section;

public class GetUserLibProgressServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	// Given a library id and user id, this returns all user progress objects (with basic content info)
	// for that user for each content in the library.
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		response.setHeader("Access-Control-Allow-Origin", "*");
	    
    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
    	Objectify ofy = dao.ofy(); 
    	
    	Gson gson = new Gson();
    	response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
    	
		// Get library key and user key
    	Library library = ofy.get(new Key<Library>(Library.class, Long.valueOf(request.getParameter("libID"))));
    	Key<SaraUser> userKey = new Key<SaraUser>(SaraUser.class, Long.valueOf(request.getParameter("userID")));
    	
    	// Get all content from the library
		ArrayList<Content> contentList = new ArrayList<Content>();
		
		// If there are no resources, then return
		if(library.resources == null){
			System.out.println("No resources in selected library.");
			return;
		}
		
		for(int i = 0; i < library.resources.size(); i++){
			// Query for all content under that resource
			contentList.addAll(ofy.query(Content.class).filter("resource", library.resources.get(i)).list());
		}
		// Now we have all the content, so get each userProgress for each content
		ArrayList<UserContentProgress> userProgressList = new ArrayList<UserContentProgress>();
		for(int i = 0; i < contentList.size(); i++){
			Key<Content> contentKey = new Key<Content>(Content.class, contentList.get(i).id);
			UserContentProgress ucp = ofy.query(UserContentProgress.class).filter("user", userKey).filter("content", contentKey).get();
			if(ucp != null){
				userProgressList.add(ucp);
			}
		}
		
		// Now put all the user progresses into a hashmap
		ArrayList<HashMap<String, Object>> output = new ArrayList<HashMap<String, Object>>();
		Iterator<UserContentProgress> usProgIt = userProgressList.iterator();
		while(usProgIt.hasNext()) {
			UserContentProgress ucp = (UserContentProgress) usProgIt.next();
			Content c = ofy.get(ucp.content);
			// Store data in the hashmap
			HashMap<String, Object> userHash = new HashMap<String, Object>();
			userHash.put("id", ucp.id);
			userHash.put("resourceName", ofy.get(c.resource).title);
			userHash.put("contentName", c.title);
			userHash.put("chapterNum", c.order+1);
			userHash.put("notesNum", ucp.notesTaken);
			userHash.put("highlightsNum", ucp.highlightsMade);
			userHash.put("minutesNum", ucp.minutesRead);
			userHash.put("lastUpdated", ucp.lastUpdated);
			userHash.put("curSection", ucp.getMostRecentSection());

/*here*/
			int sectionHighLigted = 0;
			
			for (int i = 0; i < c.numSections; i++){
				Section section = ofy.query(Section.class).filter("content", ucp.content).filter("sectionNum", i).get();
				List<Highlight> highlight = ofy.query(Highlight.class).filter("user", userKey).filter("section", new Key<Section>(Section.class, section.id)).list();
				if (!highlight.isEmpty()) {
					sectionHighLigted++;
				}
			}
			
			userHash.put("sectionHighLigted", sectionHighLigted);
/*here*/	userHash.put("sectionsRead", ucp.getNumSectionsRead());

			output.add(userHash);
		}
    		
    	response.getWriter().print(gson.toJson(output));
	
	}
	
}
