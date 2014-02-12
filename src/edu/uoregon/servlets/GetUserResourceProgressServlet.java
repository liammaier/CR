package edu.uoregon.servlets;

import java.io.IOException;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import edu.uoregon.models.Content;
import edu.uoregon.models.DAO;
import edu.uoregon.models.Resource;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.UserContentProgress;

public class GetUserResourceProgressServlet extends HttpServlet {

	
	private static final long serialVersionUID = 8428464045367259464L;

	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		
		SaraUser currentUser = SaraServlet.login(req,resp);
		
		if(currentUser != null){
			DAO dao = new DAO();
			if(req.getParameter("resourceid") != null) {
				Long resourceId = new Long(req.getParameter("resourceid"));
				Key<Resource> resourceKey = new Key<Resource>(Resource.class, resourceId);
				
				// get all the chapters assocuated with the resource
				Collection<Content> contents = dao.ofy().query(Content.class).filter("resource", resourceKey).list();
				
				Gson gson = new Gson();
	    		resp.setContentType("application/json");
	    		resp.setCharacterEncoding("UTF-8");
				
	    		
	    		
	    		// loop through the chapters and find the most recent one
	    		Date lastRead = new Date(0);
	    		String contentName = "";
	    		long lastContentId = 0;
	    		int section = 0;
	    		String strategy = "read";
				for (Content c : contents){
					Key<Content> contentKey = new Key<Content>(Content.class, c.id);
					
					UserContentProgress progress = dao.ofy().query(UserContentProgress.class).filter("user", SaraUser.getCurrentUserKey()).filter("content", contentKey).get();
					
					// compare with the previouly found most recent one
					if (progress != null && lastRead.compareTo(progress.getLastUpdated()) <= 0){
						lastRead = progress.getLastUpdated();
						contentName = c.title;
						lastContentId = c.id;
						section = progress.getMostRecentSection();
						strategy= progress.getStrategy();
					}
					
				}
				
				HashMap<String, Object> data = new HashMap<String, Object>();
				
				data.put("lastRead", lastRead);
				data.put("contentName", contentName);
				data.put("lastContentId", lastContentId);
				data.put("section", section);
				data.put("strategy", strategy);
	    		
				resp.getWriter().print(gson.toJson(data));
			}
		}
	}
}
