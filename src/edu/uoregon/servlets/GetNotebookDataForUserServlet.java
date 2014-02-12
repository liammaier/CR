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
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Objectify;

import edu.uoregon.models.Content;
import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.reader.Note;
import edu.uoregon.models.reader.Section;

public class GetNotebookDataForUserServlet extends HttpServlet {
	
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
	    	
	    	String userEmail = request.getParameter("email").replaceAll("\\s","");
	    	Key<SaraUser> userKey = new Key<SaraUser>(SaraUser.class, ofy.query(SaraUser.class).filter("email", userEmail).get().id);
	    	Long contentID = Long.parseLong(request.getParameter("contentID"));
	    	Key<Content> contentKey = new Key<Content>(Content.class, contentID);
	    	
			List<Section> sections = ofy.query(Section.class).filter("content", contentKey).list();
			
			Collections.sort(sections, new Comparator<Object>() {
		        public int compare(Object s1, Object s2) {
		            return ((Section) s1).sectionNum - ((Section) s2).sectionNum;
		        }
		    });
			
			ArrayList<HashMap<String, Object>> contentoutput = new ArrayList<HashMap<String, Object>>();
			Iterator<Section> it = sections.iterator();
			while(it.hasNext()) {
				Section s = (Section) it.next();
				HashMap<String, Object> sectionoutput = new HashMap<String, Object>();
				sectionoutput.put("name", s.name);
				
				// put notes in the hashmap
    			ArrayList<String> notes = new ArrayList<String>();
				List<Note> noteObjects = ofy.query(Note.class).filter("user", userKey).filter("type", "Notes").filter("section", new Key<Section>(Section.class, s.id)).list();
				for(int i = 0; i < noteObjects.size(); i++){
					notes.add(noteObjects.get(i).contents.getValue());
				}
				sectionoutput.put("notes", notes);
				
				// put highlights in the hashmap
				ArrayList<String> highlights = new ArrayList<String>();
				List<Note> highlightObjects = ofy.query(Note.class).filter("user", userKey).filter("type", "Highlight").filter("section", new Key<Section>(Section.class, s.id)).list();
				for(int i = 0; i < highlightObjects.size(); i++){
					highlights.add(highlightObjects.get(i).contents.getValue());
				}
				sectionoutput.put("highlights", highlights);
				
				// put section summary in the hashmap
				Note secsum = ofy.query(Note.class).filter("user", userKey).filter("type", "Section Summary").filter("section", new Key<Section>(Section.class, s.id)).get();
				sectionoutput.put("secsummary", secsum.contents.getValue());
				
				contentoutput.add(sectionoutput);
				
			}
	    		
	    	response.getWriter().print(gson.toJson(contentoutput));
    	
    	
		}
	}
	
}
