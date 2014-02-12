package edu.uoregon.servlets.reader;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;


import javax.servlet.http.*;
import com.googlecode.objectify.*;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;

import edu.uoregon.models.reader.Note;
import edu.uoregon.models.reader.Section;
import edu.uoregon.servlets.SaraServlet;




public class GetNotesServlet extends HttpServlet {

	private static final long serialVersionUID = 3656850019620025909L;

	/*
	 *
	 *This should return a json with a list of notes, with no offsets or start/end container
	 *
	 * not finshed
	 *
	 */
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		Gson gson = new Gson();
		
		SaraUser currentUser = SaraServlet.login(req,resp);
		
		if(currentUser != null){
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			DAO dao = new DAO();
			if(req.getParameter("section") != null) {
				Long secId = new Long(req.getParameter("section")); 
				Key<Section> sectionKey = new Key<Section>(Section.class,secId);
//				Long libID = new Long(req.getParameter("libID"));
//				Key<Library> libraryK = new Key<Library>(Library.class, libID);
				
				//an array that contains each section's notes, which are arrays of JSON
				ArrayList<HashMap<String, Object>> outputList = new ArrayList<HashMap<String, Object>>();
				// Get an iterator on the section notes
				List<Note> sectionNotes = dao.ofy().query(Note.class).filter("user", userKey).filter("section", sectionKey).list();
				Iterator<Note> it = sectionNotes.iterator();
				
				// Iterate through notes, add them to outputList
				while(it.hasNext()){
					Note note = (Note) it.next();
					HashMap<String, Object> data = new HashMap<String, Object>();
					
					// Add note to the data hashmap	
					data.put("id", note.id); 
					data.put("type", note.type);
					data.put("user", note.user);
					data.put("section", secId);
					data.put("contents", note.contents.getValue());
					outputList.add(data);
						
					//all other types of notes
//					}else{
//						//get all of the instructors for the given library
//						List<UserLibraryRole> instructorRoles = dao.ofy().query(UserLibraryRole.class).filter("library",new Key<Library>(Library.class,libId)).filter("role","instructor").list();
//						List<Key<SaraUser>> instructors = new ArrayList<Key<SaraUser>>();
//						for(int j = 0; j< instructorRoles.size();j++){
//							instructors.add(instructorRoles.get(j).user);
//						}
//						List<Key<SaraUser>> selfAndInstructors =  new ArrayList<Key<SaraUser>>(instructors);
//						selfAndInstructors.add(userKey);
//								
//						Collection<Key<Note>> notes  = dao.ofy().query(Note.class).filter("section",sectionKey).filter("type", type).filter("user in",selfAndInstructors).listKeys();
//					
//						//highlights that we have hidden(instructor highlights)
//						Collection<NoteIgnore> temp = dao.ofy().query(NoteIgnore.class).filter("user",userKey).list();
//						Collection<Key<Note>> ignoredNotes = new ArrayList<Key<Note>>();
//						for(NoteIgnore noteIg : temp){
//							ignoredNotes.add(noteIg.note);
//						}
//						
//						notes.removeAll(ignoredNotes);
//						
//						Iterator<Key<Note>> noteIterator = notes.iterator();
//						
//						//for each note of the current type add it to the output
//						while(noteIterator.hasNext()){
//							
//							Key<Note> noteK = noteIterator.next();
//							HashMap<String, Object> data = new HashMap<String, Object>();
//							Note note =	dao.ofy().get(noteK);
//							
//							//if there is a note that isn't our(an instructor note) then tell the client
//							if(note.user.equals(userKey)){
//								data.put("instructor", false); 
//							}else{
//								data.put("instructor", true); 
//							}
//						
//							data.put("id", note.id); 
//							data.put("type", note.type); 
//							data.put("contents",note.contents.getValue());
//							data.put("reviewed",note.reviewed);
//							
//							typeArray.add(data);
//						}
//					}
//					outputList.add(i, typeArray);
				}
				// Wrap up by putting the 2D array in outerPut along with the section index
//				HashMap<String, Object> outerPut = new HashMap<String, Object>();
//				outerPut.put("notes", outputList);
//				outerPut.put("section", secId);
				resp.getWriter().print(gson.toJson(outputList));
				
			}
		}else{
			System.out.println("user out of sync");
		}
	}

}
