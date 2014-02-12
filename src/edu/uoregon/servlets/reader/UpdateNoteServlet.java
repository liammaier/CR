package edu.uoregon.servlets.reader;

import com.google.appengine.api.datastore.Text;
import com.google.appengine.labs.repackaged.org.json.JSONObject;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import javax.servlet.http.*;
import com.googlecode.objectify.*;

import edu.uoregon.models.DAO;
import edu.uoregon.models.FeedData;
import edu.uoregon.models.SaraLog;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.UserContentProgress;

import edu.uoregon.models.SaraLog.Strategy;
import edu.uoregon.models.SaraLog.Type;
import edu.uoregon.models.reader.Note;
import edu.uoregon.models.reader.NoteIgnore;

import edu.uoregon.models.reader.Section;
import edu.uoregon.servlets.SaraServlet;




public class UpdateNoteServlet extends HttpServlet {

	private static final long serialVersionUID = 3656850019620025909L;

	//returns a note given an id in the url
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");

		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
			
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			Long noteId = new Long(req.getPathInfo().substring(1));
			
			if(noteId != null){
				DAO dao = new DAO();
				Note note = dao.ofy().get(new Key<Note>(Note.class,noteId));
				
				//check to make sure the user owns the note
				if(note.user.equals(userKey)){
					
					resp.setContentType("application/json");
		    		resp.setCharacterEncoding("UTF-8");
		    		
		    		Gson gson = new Gson();	
		    		HashMap<String, Object> data = new HashMap<String, Object>();
		    		data.put("id", note.id); 
					data.put("type", note.type); 
					data.put("contents",note.contents.getValue());
					data.put("section", dao.ofy().get(note.section).id);
					data.put("reviewed",note.reviewed);
					resp.getWriter().print(gson.toJson(data));
				}else{
					System.err.println("cannot access other user notes");
				}			
			}
		}else{
			System.err.println("user out of sync");
		}
	}
	
	public void doDelete(HttpServletRequest req, HttpServletResponse resp){

		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
			
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			
			//id for note we should be deleting
			Long noteId = new Long(req.getPathInfo().substring(1));
			
			
			if(noteId != null){
				DAO dao = new DAO();
				
				Note note = dao.ofy().get(new Key<Note>(Note.class,noteId));
				if(note.user.equals(userKey)){
					
					resp.setContentType("application/json");
		    		resp.setCharacterEncoding("UTF-8");
		    		dao.ofy().delete(note);
		    		
		    		//log it
		    		//SaraLog(String email,Type type, Strategy strategy, Key<Content> contentKey, int sectionNum, String data1, String data2) 
		    		SaraLog log = new SaraLog(dao.ofy().get(userKey).email.getEmail(),Type.NOTE_DELETED, Strategy.READ, null, note.section, ""+note.contents, note.type);
			    	dao.ofy().put(log);
			    	
				}else{
					NoteIgnore ignoreNote = new NoteIgnore(userKey,new Key<Note>(Note.class,noteId));
					dao.ofy().put(ignoreNote);
				}			
			}
		}else{
			System.err.println("user out of sync");
		}
	}
	//edit
	public void doPut(HttpServletRequest req, HttpServletResponse resp){
		
		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
			
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			// ID for note we should be updating
			Long noteId = new Long(req.getPathInfo().substring(1));
			// gets contents to update for note
			JSONObject noteObj = SaraServlet.readJSON(req);
			if(noteId != null){
				DAO dao = new DAO();
				Note note = dao.ofy().get(new Key<Note>(Note.class, noteId));
				
				//if the note belongs to this user
				if(note.user.equals(userKey)){
					
					//delete the old version
		    		dao.ofy().delete(note);
			    	try{
				    	note.contents = new Text(noteObj.get("contents").toString());
				    	note.reviewed = new Boolean(new Boolean(noteObj.get("reviewed").toString()));
				    	//save the new version
				    	saveNote(note);
				    	
				    	//log it
			    		//SaraLog(String email,Type type, Strategy strategy, Key<Content> contentKey, int sectionNum, String data1, String data2) 
			    		SaraLog log = new SaraLog(dao.ofy().get(userKey).email.getEmail(),Type.NOTE_UPDATED, Strategy.READ, null, note.section, ""+note.contents, note.type);
				    	dao.ofy().put(log);
				    	
			    	}catch(Exception e){
			    		e.printStackTrace();
			    	}
				}else{
					System.err.println("cannot access other user notes");
				}			
			}
		}else{
			System.err.println("user out of sync");
		}
	}
	
	//creates note for the given section id
	public void doPost(HttpServletRequest req, HttpServletResponse resp){
		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
				
			try {
				DAO dao = new DAO();
				JSONObject noteObj = SaraServlet.readJSON(req);
				Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
				Key<Section> sectionK = new Key<Section>(Section.class,new Long(noteObj.get("sectionID").toString()));
				
				//"highlights" leave out the type and contents of a note			
				Note newNote = new Note(sectionK, noteObj.get("type").toString(), noteObj.get("contents").toString(), "", userKey);
				saveNote(newNote);
				
				//log it
	    		//SaraLog(String email,Type type, Strategy strategy, Key<Content> contentKey, int sectionNum, String data1, String data2) 
	    		SaraLog log = new SaraLog(dao.ofy().get(userKey).email.getEmail(),Type.NOTE_CREATED, Strategy.READ, null, sectionK, ""+newNote.contents.getValue(), newNote.type);
		    	dao.ofy().put(log);
		    	
				//make a json with data needed by backbone to make a model
				Gson gson = new Gson();
				HashMap<String, Object> data = new HashMap<String, Object>();
				data.put("id", newNote.id);
				data.put("type", newNote.type); 
				data.put("reviewed",newNote.reviewed );
				data.put("contents",newNote.contents.getValue());
				resp.getWriter().print(gson.toJson(data));
				
				UserContentProgress.incrementNotes(dao.ofy().get(sectionK).getContent(), userKey, new Date().getTime());
			} catch (Exception e) {
				System.err.println("given note was invalid");
				e.printStackTrace();
			}	
		}
		
	}
	private Key<Note> saveNote(Note note){
		DAO dao = new DAO();
		Objectify ofy = dao.ofy();
		Key<Note> noteKey = ofy.put(note);
		FeedData feedData = new FeedData("note", note.user, note.group, note.section, null, noteKey );
		ofy.put(feedData);
		return noteKey;
	}
	
}
