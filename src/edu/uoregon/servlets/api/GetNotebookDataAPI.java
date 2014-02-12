package edu.uoregon.servlets.api;

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
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.models.reader.Note;
import edu.uoregon.models.reader.Section;

public class GetNotebookDataAPI extends HttpServlet {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
	    	
    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
    	Objectify ofy = dao.ofy();  
    	
    	Gson gson = new Gson();
    	response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
    	String userEmail = request.getParameter("email").replaceAll("\\s","");
    	Key<SaraUser> userKey = new Key<SaraUser>(SaraUser.class, ofy.query(SaraUser.class).filter("email", userEmail).get().id);
    	Long contentID = Long.parseLong(request.getParameter("contentID"));
    	Key<Content> contentKey = new Key<Content>(Content.class, contentID);
    	Long libraryID = Long.parseLong(request.getParameter("libraryID"));
    	Key<Library> libKey = new Key<Library>(Library.class, libraryID);
    	
    	// Get the sections of the content and sort them
		List<Section> sections = ofy.query(Section.class).filter("content", contentKey).list();
		Collections.sort(sections, new Comparator<Object>() {
	        public int compare(Object s1, Object s2) {
	            return ((Section) s1).sectionNum - ((Section) s2).sectionNum;
	        }
	    });
		
		// Also, we need to first find all instructors for the given library
		List<UserLibraryRole> userLibRoles = ofy.query(UserLibraryRole.class).filter("library", libKey).filter("role", "instructor").list();
		ArrayList<Key<SaraUser>> instructorKeys = new ArrayList<Key<SaraUser>>();
		Iterator<UserLibraryRole> userIt = userLibRoles.iterator();
		while(userIt.hasNext()){
			UserLibraryRole userLibRole = (UserLibraryRole) userIt.next();
			instructorKeys.add(userLibRole.user);
		}
		
		
		
		ArrayList<HashMap<String, Object>> contentoutput = new ArrayList<HashMap<String, Object>>();
		Iterator<Section> it = sections.iterator();
		while(it.hasNext()) {
			Section s = (Section) it.next();
			HashMap<String, Object> sectionoutput = new HashMap<String, Object>();
			sectionoutput.put("name", s.name);
			
			// put notes in the hashmap
			ArrayList<HashMap<String, Object>> notes = new ArrayList<HashMap<String, Object>>();
			// First put in user-made notes
			List<Note> noteObjects = ofy.query(Note.class).filter("user", userKey).filter("type", "Notes").filter("section", new Key<Section>(Section.class, s.id)).list();
			for(int i = 0; i < noteObjects.size(); i++){
				Note note = noteObjects.get(i);
				HashMap<String, Object> n = new HashMap<String, Object>();
				n.put("text", note.contents.getValue());
				n.put("instructorNote", false);
				notes.add(n);
			}
			// Now put in instructor notes
			Iterator<Key<SaraUser>>instructorIt = instructorKeys.iterator();
			while(instructorIt.hasNext()){
				Key<SaraUser> instructorKey = (Key<SaraUser>) instructorIt.next();
				if(userKey.equals(instructorKey)){
					// User is the instructor, so don't print those notes twice
					continue;
				}
				noteObjects = ofy.query(Note.class).filter("user", instructorKey).filter("type", "Notes").filter("section", new Key<Section>(Section.class, s.id)).list();
    			for(int i = 0; i < noteObjects.size(); i++){
					Note note = noteObjects.get(i);
					HashMap<String, Object> n = new HashMap<String, Object>();
					n.put("text", note.contents.getValue());
					n.put("instructorNote", true);
					notes.add(n);
				}
			}
			sectionoutput.put("notes", notes);
			
			
			// put highlights in the hashmap
			ArrayList<HashMap<String, Object>> highlights = new ArrayList<HashMap<String, Object>>();
			// First put in user-made highlights
			List<Note> highlightObjects = ofy.query(Note.class).filter("user", userKey).filter("type", "Highlight").filter("section", new Key<Section>(Section.class, s.id)).list();
			for(int i = 0; i < highlightObjects.size(); i++){
				Note highlight = highlightObjects.get(i);
				HashMap<String, Object> h = new HashMap<String, Object>();
				h.put("text", highlight.contents.getValue());
				h.put("instructorHighlight", false);
				highlights.add(h);
			}
			// Now put in instructor highlights
			instructorIt = instructorKeys.iterator();
			while(instructorIt.hasNext()){
				Key<SaraUser> instructorKey = (Key<SaraUser>) instructorIt.next();
				highlightObjects = ofy.query(Note.class).filter("user", instructorKey).filter("type", "Highlight").filter("section", new Key<Section>(Section.class, s.id)).list();
				for(int i = 0; i < highlightObjects.size(); i++){
					Note highlight = highlightObjects.get(i);
					HashMap<String, Object> h = new HashMap<String, Object>();
					h.put("text", highlight.contents.getValue());
					h.put("instructorHighlight", true);
					highlights.add(h);
				}
			}
			sectionoutput.put("highlights", highlights);
			
			// put section summary in the hashmap
			Note secsum = ofy.query(Note.class).filter("user", userKey).filter("type", "Section Summary").filter("section", new Key<Section>(Section.class, s.id)).get();
			sectionoutput.put("secsummary", secsum.contents.getValue());
			
			contentoutput.add(sectionoutput);
			
		}
    		
    	response.getWriter().print(gson.toJson(contentoutput));
	
	}
	
	
	

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
	    	
    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
    	Objectify ofy = dao.ofy();  
    	
    	Gson gson = new Gson();
    	response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
    	
    	String userEmail = request.getParameter("email").replaceAll("\\s","");
    	Key<SaraUser> userKey = new Key<SaraUser>(SaraUser.class, ofy.query(SaraUser.class).filter("email", userEmail).get().id);
    	Long contentID = Long.parseLong(request.getParameter("contentID"));
    	Key<Content> contentKey = new Key<Content>(Content.class, contentID);
    	Long libraryID = Long.parseLong(request.getParameter("libraryID"));
    	Key<Library> libKey = new Key<Library>(Library.class, libraryID);
    	
    	// Get the sections of the content and sort them
		List<Section> sections = ofy.query(Section.class).filter("content", contentKey).list();
		Collections.sort(sections, new Comparator<Object>() {
	        public int compare(Object s1, Object s2) {
	            return ((Section) s1).sectionNum - ((Section) s2).sectionNum;
	        }
	    });
		
		// Also, we need to first find all instructors for the given library
		List<UserLibraryRole> userLibRoles = ofy.query(UserLibraryRole.class).filter("library", libKey).filter("role", "instructor").list();
		ArrayList<Key<SaraUser>> instructorKeys = new ArrayList<Key<SaraUser>>();
		Iterator<UserLibraryRole> userIt = userLibRoles.iterator();
		while(userIt.hasNext()){
			UserLibraryRole userLibRole = (UserLibraryRole) userIt.next();
			instructorKeys.add(userLibRole.user);
		}
		
		
		
		ArrayList<HashMap<String, Object>> contentoutput = new ArrayList<HashMap<String, Object>>();
		Iterator<Section> it = sections.iterator();
		while(it.hasNext()) {
			Section s = (Section) it.next();
			HashMap<String, Object> sectionoutput = new HashMap<String, Object>();
			sectionoutput.put("name", s.name);
			
			// put notes in the hashmap
			ArrayList<HashMap<String, Object>> notes = new ArrayList<HashMap<String, Object>>();
			// First put in user-made notes
			List<Note> noteObjects = ofy.query(Note.class).filter("user", userKey).filter("type", "Notes").filter("section", new Key<Section>(Section.class, s.id)).list();
			for(int i = 0; i < noteObjects.size(); i++){
				Note note = noteObjects.get(i);
				HashMap<String, Object> n = new HashMap<String, Object>();
				n.put("text", note.contents.getValue());
				n.put("instructorNote", false);
				notes.add(n);
			}
			// Now put in instructor notes
			Iterator<Key<SaraUser>>instructorIt = instructorKeys.iterator();
			while(instructorIt.hasNext()){
				Key<SaraUser> instructorKey = (Key<SaraUser>) instructorIt.next();
				if(userKey.equals(instructorKey)){
					// User is the instructor, so don't print those notes twice
					continue;
				}
				noteObjects = ofy.query(Note.class).filter("user", instructorKey).filter("type", "Notes").filter("section", new Key<Section>(Section.class, s.id)).list();
    			for(int i = 0; i < noteObjects.size(); i++){
					Note note = noteObjects.get(i);
					HashMap<String, Object> n = new HashMap<String, Object>();
					n.put("text", note.contents.getValue());
					n.put("instructorNote", true);
					notes.add(n);
				}
			}
			sectionoutput.put("notes", notes);
			
			
			// put highlights in the hashmap
			ArrayList<HashMap<String, Object>> highlights = new ArrayList<HashMap<String, Object>>();
			// First put in user-made highlights
			List<Note> highlightObjects = ofy.query(Note.class).filter("user", userKey).filter("type", "Highlight").filter("section", new Key<Section>(Section.class, s.id)).list();
			for(int i = 0; i < highlightObjects.size(); i++){
				Note highlight = highlightObjects.get(i);
				HashMap<String, Object> h = new HashMap<String, Object>();
				h.put("text", highlight.contents.getValue());
				h.put("instructorHighlight", false);
				highlights.add(h);
			}
			// Now put in instructor highlights
			instructorIt = instructorKeys.iterator();
			while(instructorIt.hasNext()){
				Key<SaraUser> instructorKey = (Key<SaraUser>) instructorIt.next();
				highlightObjects = ofy.query(Note.class).filter("user", instructorKey).filter("type", "Highlight").filter("section", new Key<Section>(Section.class, s.id)).list();
				for(int i = 0; i < highlightObjects.size(); i++){
					Note highlight = highlightObjects.get(i);
					HashMap<String, Object> h = new HashMap<String, Object>();
					h.put("text", highlight.contents.getValue());
					h.put("instructorHighlight", true);
					highlights.add(h);
				}
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
