package edu.uoregon.servlets.libraries;

import com.google.gson.Gson;
import java.io.IOException;

import java.util.HashMap;


import javax.servlet.http.*;
import com.googlecode.objectify.*;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;

import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.servlets.SaraServlet;




public class UpdateLibraryServlet extends HttpServlet {

	private static final long serialVersionUID = 3656850019620025909L;

	//get library by id
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");

		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
			
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			
			String libraryIdString = req.getPathInfo().substring(1);
			if(libraryIdString != null){
				Long libraryId = new Long(libraryIdString);
				DAO dao = new DAO();
				Library lib = dao.ofy().get(new Key<Library>(Library.class,libraryId));
				if(SaraServlet.isAdmin() || dao.ofy().query(UserLibraryRole.class).filter("library",lib).filter("user",userKey).get() != null){
					resp.setContentType("application/json");
		    		resp.setCharacterEncoding("UTF-8");
		    		Gson gson = new Gson();	
		    		


					//find out what role the user has in this library so the client can give them the appropriate options
		    		//Key<Library> libK = new Key<Library>(Library.class,lib.id);
		    		//UserLibraryRole userLRole = dao.ofy().query(UserLibraryRole.class).filter("user",userKey).filter("library",libK).get();
	    			
		    		HashMap<String, Object> data = new HashMap<String, Object>();
		    		data.put("name", lib.name); 
					data.put("id", lib.id); 
					data.put("timeCreated", lib.timeCreated);
					data.put("type", lib.type); 
					data.put("description", lib.description); 
					//data.put("instructor", instructor);
					resp.getWriter().print(gson.toJson(data));
				}else{
					System.err.println("cannot access non user lib");
				}
			
			}else{
				System.err.println("lib Id is not valid");
			}
		}else{
			System.err.println("user out of sync");
		}
	}
//	
//	//create a new highlight
//	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
//		resp.setContentType("application/json");
//		SaraUser currentUser = SaraServlet.login(req,resp);
//		if(currentUser != null){
//				
//			try {
//				JSONObject noteObj = SaraServlet.readJSON(req);
//				Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
//				Key<Section> sectionK = new Key<Section>(Section.class,new Long(noteObj.get("sectionID").toString()));
//				
//				String annotation = noteObj.get("annotation").toString();
//				String contents = noteObj.get("contents").toString();
//				int startContainer = new Integer(noteObj.get("startContainer").toString());
//				int startOffset = new Integer(noteObj.get("startOffset").toString());
//				int endContainer = new Integer(noteObj.get("endContainer").toString());
//				int endOffset = new Integer(noteObj.get("endOffset").toString());
//	
//				//"highlights" leave out the type and contents of a note
//				Note highlight = new Note(sectionK, "Highlight", contents, annotation, userKey, startContainer, startOffset, endContainer, endOffset);
//			
//				saveNote(highlight);
//				
//				//log it
//				DAO dao = new DAO();
//		    	SaraLog log = new SaraLog(dao.ofy().get(userKey).email.getEmail(),"highlight created", highlight.contents.getValue());
//		    	dao.ofy().put(log);				
//				
//				
//				Gson gson = new Gson();
//				HashMap<String, Object> data = new HashMap<String, Object>();
//	    		data.put("id", highlight.id);  
//				data.put("contents", highlight.contents.getValue());
//				data.put("annotation", annotation);
//				//data.put("instructor", instructor);
//				data.put("sectionID", dao.ofy().get(highlight.section).id);
//				data.put("startContainer", highlight.startContainer);
//				data.put("endContainer", highlight.endContainer);
//				data.put("startOffset", highlight.startOffset);
//				data.put("endOffset", highlight.endOffset);
//				resp.getWriter().print(gson.toJson(data));
//				
//			}catch(Exception e){
//				e.printStackTrace();
//			}
//			
//		}else{
//			System.err.println("user out of sync");
//		}
//	}
//	//delete a highlight
//	public void doDelete(HttpServletRequest req, HttpServletResponse resp){
//
//		SaraUser currentUser = SaraServlet.login(req,resp);
//		if(currentUser != null){
//			
//			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
//			
//			//id for note we should be deleting
//			Long noteId = new Long(req.getPathInfo().substring(1));
//			
//			if(noteId != null){
//				DAO dao = new DAO();
//				Note highlight = dao.ofy().get(new Key<Note>(Note.class,noteId));
//				if(highlight.user.equals(userKey)){
//					
//		    		dao.ofy().delete(highlight);
//		    	
//		    		//log it
//			    	SaraLog log = new SaraLog(dao.ofy().get(userKey).email.getEmail()," highlight deleted",highlight.contents.getValue());
//			    	dao.ofy().put(log);	
//			    	
//				}else{
//					System.err.println("cannot access other user notes");
//				}			
//			}
//		}else{
//			System.err.println("user out of sync");
//		}
//	}
//	
//	//edit a highlight
//	public void doPut(HttpServletRequest req, HttpServletResponse resp){
//
//		
//		SaraUser currentUser = SaraServlet.login(req,resp);
//		if(currentUser != null){
//			
//			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
//			
//			//id for note we should be updating
//			Long noteId = new Long(req.getPathInfo().substring(1));
//			
//			//gets contents to update for note
//			JSONObject noteObj = SaraServlet.readJSON(req);
//			
//			if(noteId != null){
//				DAO dao = new DAO();
//				Note highlight = dao.ofy().get(new Key<Note>(Note.class,noteId));
//				if(highlight.user.equals(userKey)){
//					
//		    		dao.ofy().delete(highlight);
//		    	try{
//			    	highlight.annotation = noteObj.get("annotation").toString();
//			    	highlight.star = new Boolean(noteObj.get("star").toString());
//			    	
//			    	saveNote(highlight);
//			    	
//			    	//log it
//			    	SaraLog log = new SaraLog(dao.ofy().get(userKey).email.getEmail()," highlight updated",highlight.contents.getValue());
//			    	dao.ofy().put(log);	
//			    	
//		    	}catch(Exception e){
//		    		e.printStackTrace();
//		    	}
//				}else{
//					System.err.println("cannot access other user notes");
//				}			
//			}
//		}else{
//			System.err.println("user out of sync");
//		}
//	}
//	

}
