package edu.uoregon.servlets.options;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.googlecode.objectify.Objectify;

import edu.uoregon.models.DAO;
import edu.uoregon.models.Option;
import edu.uoregon.models.SaraUser;
import edu.uoregon.servlets.SaraServlet;

public class GetUserOptionsServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1L;

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		// gives us the current user or NULL if they are not allowed in the site
		SaraUser currentUser = SaraServlet.login(request,response);
		if(currentUser != null){
	    	
	    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
	    	Objectify ofy = dao.ofy();  
	    	
	    	Gson gson = new Gson();
	    	response.setContentType("application/json");
    		response.setCharacterEncoding("UTF-8");
	    		    	
	    	List<Option> options = ofy.query(Option.class).filter("user", currentUser.getKey()).list();
	    	
	    	if (options.isEmpty()) {
	    		Option.addDefaultOptions(currentUser.getKey());
	    		options = ofy.query(Option.class).filter("user", currentUser.getKey()).list();
	    	}
	    	
	    	
	    	response.getWriter().print(gson.toJson(options));
		}
	}
}
