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
import edu.uoregon.models.caret.UserCaretBook;
import edu.uoregon.servlets.SaraServlet;




public class UpdateCaretBook extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1635341023395345738L;
	//get book by id
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		resp.setCharacterEncoding("UTF-8");
		req.setCharacterEncoding("UTF-8");
		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
			
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			
			String bookIdString = req.getPathInfo().substring(1);
			if(bookIdString != null){
				Long bookId = new Long(bookIdString);
				DAO dao = new DAO();
				CaretBook book = dao.ofy().get(new Key<CaretBook>(CaretBook.class,bookId));
	    		Gson gson = new Gson();	
	    		HashMap<String, Object> data = new HashMap<String, Object>();
				data.put("tagTypes", book.tagTypes);
	    		data.put("title", book.title); 
				data.put("id", book.id);
				data.put("timeCreated", book.timeCreated.getTime());
				data.put("description", book.description); 
				resp.getWriter().print(gson.toJson(data));
			}else{
				System.err.println("book ID was not given");
			}
		}else{
			System.err.println("user out of sync");
		}
	}
	//new caret book
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		resp.setCharacterEncoding("UTF-8");
		req.setCharacterEncoding("UTF-8");
		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
			JSONObject bookObj = SaraServlet.readJSON(req);
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			try{
				String description = bookObj.get("description").toString();
				String title = bookObj.get("title").toString();
				CaretBook book = new CaretBook(title,description);
				
				DAO dao = new DAO();
				Key<CaretBook> bookKey = dao.ofy().put(book);
				UserCaretBook userRelation = new UserCaretBook(bookKey, userKey );
				dao.ofy().put(userRelation);
				
	    		Gson gson = new Gson();	
	    		HashMap<String, Object> data = new HashMap<String, Object>();
				data.put("tagTypes", book.tagTypes);
	    		data.put("title", book.title); 
				data.put("id", book.id); 
				data.put("timeCreated", book.timeCreated.getTime());
				data.put("description", book.description);
				resp.getWriter().print(gson.toJson(data));

			}catch(Exception e){
				e.printStackTrace();
				System.err.println("invalid parameters for caret book");
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
			
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			String bookIdString = req.getPathInfo().substring(1);
			
			if(bookIdString != null){
				Long bookId = new Long(bookIdString);
				DAO dao = new DAO();
				CaretBook book = dao.ofy().get(new Key<CaretBook>(CaretBook.class,bookId));
				JSONObject bookObj = SaraServlet.readJSON(req);
				try{
					book.description = bookObj.get("description").toString();
					book.title = bookObj.get("title").toString();
					book.tagTypes = bookObj.get("tagTypes").toString();
					
					//reset the timestamp so we can tell which one was the last to be edited on the client
					System.out.println(book.timeCreated);
					book.timeCreated = new Date();
					System.out.println(book.timeCreated);
					Key<CaretBook> bookKey = dao.ofy().put(book);
		    		Gson gson = new Gson();	
		    		HashMap<String, Object> data = new HashMap<String, Object>();
					data.put("tagTypes", book.tagTypes);
		    		data.put("title", book.title);
					data.put("id", book.id);
					data.put("timeCreated", book.timeCreated.getTime());
					data.put("description", book.description);
					resp.getWriter().print(gson.toJson(data));
				}catch(Exception e){
					//System.err.println("invalid parameters for caret book");
				}
			}else{
				System.err.println("user out of sync");
			}
		}
	}
}
