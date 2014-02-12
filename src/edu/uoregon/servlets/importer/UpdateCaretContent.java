package edu.uoregon.servlets.importer;

import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.google.gson.Gson;
import java.io.IOException;

import java.util.Date;
import java.util.HashMap;
import javax.servlet.http.*;
import com.googlecode.objectify.*;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;

import edu.uoregon.models.caret.CaretBook;
import edu.uoregon.models.caret.CaretContent;
import edu.uoregon.models.caret.CaretBookContent;
import edu.uoregon.servlets.SaraServlet;




public class UpdateCaretContent extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1635341023395345738L;
	//get content by id
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		resp.setCharacterEncoding("UTF-8");
		req.setCharacterEncoding("UTF-8");
		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
			
			String contentIdString = req.getPathInfo().substring(1);
			if(contentIdString != null){
				Long contentId = new Long(contentIdString);
				DAO dao = new DAO();
				CaretContent content = dao.ofy().get(new Key<CaretContent>(CaretContent.class,contentId));
	    		Gson gson = new Gson();	
	    		HashMap<String, Object> data = new HashMap<String, Object>();
	    		data.put("title", content.title); 
				data.put("id", content.id);
				data.put("json",content.json);
				data.put("timeCreated", content.timeCreated.getTime());
				data.put("contentType", content.type);
				data.put("contents", content.contents); 
				data.put("description", content.description);
				
				resp.getWriter().print(gson.toJson(data));
			}else{
				System.err.println("content ID was not given");
			}
		}else{
			System.err.println("user out of sync");
		}
	}
	//new caret content
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		resp.setCharacterEncoding("UTF-8");
		req.setCharacterEncoding("UTF-8");
		SaraUser currentUser = SaraServlet.login(req,resp);
		System.out.println("here");

		if(currentUser != null){
			JSONObject contentObj = SaraServlet.readJSON(req);
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			DAO dao = new DAO();
			System.out.println("here");

			try{
				System.out.println(contentObj);
				String description = contentObj.get("description").toString();
				String title = contentObj.get("title").toString();
				String contents = contentObj.get("contents").toString();
				String type = contentObj.get("contentType").toString();
				String json = contentObj.get("json").toString();
				//create the content from given params
				CaretContent content = new CaretContent(contents,json,title,type,description);
				
				//find the book that this content is supposed to belong to
				String bookId = contentObj.get("bookId").toString();
				
				Key<CaretBook> bookKey = new Key<CaretBook>(CaretBook.class,new Long(bookId)); 
				
				Key<CaretContent> contentKey = dao.ofy().put(content);
				
				//save the relation for the book
				CaretBookContent bookContentRel = new CaretBookContent(bookKey,contentKey); 

				dao.ofy().put(bookContentRel);
				
	    		Gson gson = new Gson();	
	    		HashMap<String, Object> data = new HashMap<String, Object>();
	    		data.put("title", content.title); 
				data.put("id", content.id);
				data.put("json",content.json);
				data.put("timeCreated", content.timeCreated.getTime());
				data.put("contentType", content.type);
				data.put("contents", content.contents); 
				data.put("description", content.description);
				resp.getWriter().print(gson.toJson(data));
				
			}catch(Exception e){
				System.err.println("invalid parameters for caret content");
			}
		}else{
			System.err.println("user out of sync");
		}
	}
	//update	
	public void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		resp.setCharacterEncoding("UTF-8");
		req.setCharacterEncoding("UTF-8");
		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
			
			String contentIdString = req.getPathInfo().substring(1);
			if(contentIdString != null){
				Long contentId = new Long(contentIdString);
				DAO dao = new DAO();
				CaretContent content = dao.ofy().get(new Key<CaretContent>(CaretContent.class,contentId));
				JSONObject contentObj = SaraServlet.readJSON(req);
				try{
					content.description = contentObj.get("description").toString();
					content.title = contentObj.get("title").toString();
					content.contents = contentObj.get("contents").toString();
					content.type = contentObj.get("contentType").toString();
					content.json = contentObj.get("json").toString();
					//reset the timestamp so we can tell which one was the last to be editted on the client
					content.timeCreated = new Date();
					
					dao.ofy().put(content);
					
		    		Gson gson = new Gson();	
		    		HashMap<String, Object> data = new HashMap<String, Object>();
		    		data.put("title", content.title); 
					data.put("id", content.id); 
					data.put("json" ,content.json);
					data.put("timeCreated", content.timeCreated.getTime());
					data.put("contentType", content.type);
					data.put("contents", content.contents); 
					data.put("description", content.description);
					resp.getWriter().print(gson.toJson(data));
				}catch(Exception e){
					System.err.println("invalid parameters for caret content");
				}
			}else{
				System.err.println("user out of sync");
			}
		}
	}
}
