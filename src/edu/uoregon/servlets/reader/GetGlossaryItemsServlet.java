package edu.uoregon.servlets.reader;

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

import edu.uoregon.models.Content;
import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.reader.GlossaryItem;
import edu.uoregon.servlets.SaraServlet;

public class GetGlossaryItemsServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		SaraUser currentUser = SaraServlet.login(req,resp);
		
		if(currentUser != null){
			
			// Get all of the glossary items for the current document and return them
			
			DAO dao = new DAO();
			Key<Content> contentKey = new Key<Content>(Content.class, new Long(req.getParameter("contentID")));
			List<GlossaryItem> glossaryItems = dao.ofy().query(GlossaryItem.class).ancestor(contentKey).list();
			
			ArrayList<HashMap<String, String>> glossaryItemCollection = new ArrayList<HashMap<String, String>>();
			Iterator<GlossaryItem> it = glossaryItems.iterator();
			
			// Start with blank items
			for(int i = 0; i < glossaryItems.size(); i ++){
				glossaryItemCollection.add(new HashMap<String, String>());
			}
			
			while(it.hasNext()){
				GlossaryItem gi = it.next();
				HashMap<String, String> data = new HashMap<String, String>();
				data.put("name", gi.getName()); 
				data.put("description", gi.getDescription());
				glossaryItemCollection.set(gi.getOrder(), data);
			}
			
			Gson gson = new Gson();
			resp.getWriter().print(gson.toJson(glossaryItemCollection));
			
		}
	}
	
}
