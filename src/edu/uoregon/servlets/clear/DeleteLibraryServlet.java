package edu.uoregon.servlets.clear;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.Objectify;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.servlets.SaraServlet;

public class DeleteLibraryServlet extends HttpServlet {

	
	/**
	 * 
	 */
	private static final long serialVersionUID = 7257199890664099784L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		if(SaraServlet.isAdmin()){
			
	    	SaraUser currentUser = SaraServlet.login(request,response);
			//make sure that we are logged in
			if(currentUser != null){

				DAO dao = new DAO();
				Objectify ofy = dao.ofy();
				List<Object> toDelete = new ArrayList<Object>();
				
				// get the library key
				Key<Library> libraryKey = new Key<Library>(Library.class, Integer.parseInt(request.getParameter("library")));
				
				// REMOVE FROM USER LIBARRY ROLES
				
				// get the user library roles that we want to delete
				Collection<UserLibraryRole> userLibRoles = ofy.query(UserLibraryRole.class).filter("library", libraryKey).list();
				
				toDelete.addAll(userLibRoles);
				
				// delete actual resource
				toDelete.add(ofy.get(libraryKey));

				
				// delete them all and return
				ofy.delete(toDelete);
				response.sendRedirect("/admin/actions.html");
				
			}
		}
	}
	
}
