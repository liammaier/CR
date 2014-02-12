package edu.uoregon.servlets;

import java.io.IOException;
import java.util.Collection;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Key;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;

import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;


public class AddBasicDataServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		
		if(SaraServlet.isAdmin()){
			
			SaraUser currentUser = SaraServlet.login(request,response);
			//make sure that we are logged in
			if(currentUser != null){
		    	
				DAO dao = new DAO();
				
				// Demo and CR library
				Library demoLib = dao.ofy().query(Library.class).filter("name", "Demo").get();
				Library crLib = dao.ofy().query(Library.class).filter("name", "About Campus Reader").get();
				
				if (demoLib == null && crLib == null) {
					// if it's not already made, make them
			    	Key<Library> demoKey = dao.ofy().put(new Library("Demo","Some sample content", "open"));
			    	Key<Library> crKey = dao.ofy().put(new Library("About Campus Reader","Documents about the Campus Reader project", "open"));

			    	// add people to both libraries
			    	Collection<SaraUser> allUsers = dao.ofy().query(SaraUser.class).list();
			    	for (SaraUser user : allUsers){
			    		dao.ofy().put( new UserLibraryRole(demoKey,user.getKey(),"member"));
			    		dao.ofy().put( new UserLibraryRole(crKey,user.getKey(),"member"));
			    	}
				}
				
				// redirect
				response.sendRedirect("/admin/actions.html");
				
		    }
		
		}else{
			response.sendRedirect("/notAdmin");
		}
	}
	
}
