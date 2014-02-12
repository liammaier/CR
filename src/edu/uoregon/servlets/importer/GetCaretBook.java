package edu.uoregon.servlets.importer;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;


import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.caret.CaretBook;
import edu.uoregon.models.caret.CaretContent;
import edu.uoregon.models.caret.UserCaretBook;
import edu.uoregon.models.caret.CaretBookContent;
import edu.uoregon.servlets.SaraServlet;

// if there is no UserRole defined for a user then they don't have any extra privileges
@Cached

public class GetCaretBook extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 5864871920834781515L;

	//get library by id
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		resp.setCharacterEncoding("UTF-8");
		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
			
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
						
			DAO dao = new DAO();
			Gson gson = new Gson();	
			List<UserCaretBook> books = dao.ofy().query(UserCaretBook.class).filter("user",userKey).list();
			List<HashMap<String, Object>> outBook = new ArrayList<HashMap<String, Object>>();
			if(books != null){
				for(UserCaretBook userBook: books){
					CaretBook book = dao.ofy().get(userBook.book);
		    		HashMap<String, Object> data = new HashMap<String, Object>();
		    		
		    		Key<CaretBook> bookKey = new Key<CaretBook>(CaretBook.class,book.id); 
					List<CaretBookContent> bookContents = dao.ofy().query(CaretBookContent.class).filter("book", bookKey).list();
					System.out.println(bookContents.size());
					List<HashMap<String, Object>> contents = new ArrayList<HashMap<String, Object>>();
					
					//get all the chapters for this book and return them
					for(CaretBookContent bookcontent : bookContents){
						Key<CaretContent> contentKey = bookcontent.content;
						CaretContent content = dao.ofy().get(contentKey);
			    		HashMap<String, Object> contentData = new HashMap<String, Object>();
			    		contentData.put("title", content.title); 
			    		contentData.put("id", content.id); 
			    		contentData.put("timeCreated", content.timeCreated.getTime());
			    		contentData.put("contentType", content.type);
			    		contentData.put("contents", content.contents); 
			    		contentData.put("description", content.description);
			    		contentData.put("json",content.json);
						contents.add(contentData);
					}
					//add chapters to json
		    		data.put("chapters", gson.toJson(contents));
		    		data.put("title", book.title);
					data.put("id", book.id); 
					data.put("timeCreated", book.timeCreated.getTime());
					data.put("description", book.description); 
					data.put("current", book.current);
					data.put("tagTypes", book.tagTypes);
					outBook.add(data);
				}
				
				resp.getWriter().print(gson.toJson(outBook));

			}else{
				System.err.println("lib Id is not valid");
			}
		}else{
			System.err.println("user out of sync");
		}
	}
}