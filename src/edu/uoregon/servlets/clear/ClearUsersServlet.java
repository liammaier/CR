package edu.uoregon.servlets.clear;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import edu.uoregon.models.*;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.servlets.SaraServlet;

public class ClearUsersServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 6339816314625393398L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		if(SaraServlet.isAdmin()){
			
	    	SaraUser currentUser = SaraServlet.login(request,response);
			//make sure that we are logged in
			if(currentUser != null){
				//make sure that we are logged in
		    	List<Object> all = new ArrayList<Object>();
				if(currentUser != null){
					DAO dao = new DAO();
					all.addAll(dao.ofy().query(SaraUser.class).list());
					all.addAll(dao.ofy().query(Option.class).list());
					all.addAll(dao.ofy().query(Library.class).list());
					all.addAll(dao.ofy().query(UserLibraryRole.class).list());
					dao.ofy().delete(all);
					response.sendRedirect("/admin/actions.html");
				}
			}
		}
	}
	
}
