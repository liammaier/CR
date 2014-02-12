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
import edu.uoregon.models.caret.CaretContent;
import edu.uoregon.models.caret.CaretBookContent;
import edu.uoregon.servlets.SaraServlet;

// if there is no UserRole defined for a user then they don't have any extra privileges
@Cached

public class GetCaretContent extends HttpServlet {

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
			List<CaretBookContent> contents = dao.ofy().query(CaretBookContent.class).filter("user",userKey).list();
			List<HashMap<String, Object>> outContent = new ArrayList<HashMap<String, Object>>();
			if(contents != null){
				for(CaretBookContent userContent: contents){
					CaretContent content = dao.ofy().get(userContent.content);
		    		HashMap<String, Object> data = new HashMap<String, Object>();
		    		data.put("title", content.title); 
					data.put("id", content.id); 
					data.put("timeCreated",  content.timeCreated.getTime());
					data.put("json",  content.json);
					data.put("contentType", content.type);
					data.put("contents", content.contents); 
					data.put("description", content.description); 
					outContent.add(data);
				}
				
				resp.getWriter().print(gson.toJson(outContent));

			}else{
				System.err.println("lib Id is not valid");
			}
		}else{
			System.err.println("user out of sync");
		}
	}
}