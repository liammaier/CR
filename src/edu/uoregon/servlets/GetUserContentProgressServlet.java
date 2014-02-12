package edu.uoregon.servlets;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import edu.uoregon.models.Content;
import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.UserContentProgress;

public class GetUserContentProgressServlet extends HttpServlet {

	
	private static final long serialVersionUID = 8428464045367259464L;

	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		
		SaraUser currentUser = SaraServlet.login(req,resp);
		
		if(currentUser != null){
			DAO dao = new DAO();
			if(req.getParameter("contentid") != null) {
				Long id = new Long(req.getParameter("contentid"));
				Key<Content> contentKey = new Key<Content>(Content.class, id);
				
				Gson gson = new Gson();
	    		resp.setContentType("application/json");
	    		resp.setCharacterEncoding("UTF-8");
	    		
	    		UserContentProgress progress = dao.ofy().query(UserContentProgress.class).filter("user", SaraUser.getCurrentUserKey()).filter("content", contentKey).get();
	    		
				resp.getWriter().print(gson.toJson(progress));
			}
		}
	}
}
