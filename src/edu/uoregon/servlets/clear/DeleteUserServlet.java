package edu.uoregon.servlets.clear;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Key;

import edu.uoregon.models.*;
import edu.uoregon.models.caret.UserCaretBook;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.models.reader.*;
import edu.uoregon.models.strategies.StratData;
import edu.uoregon.servlets.SaraServlet;

public class DeleteUserServlet extends HttpServlet {

	
	/**
	 * 
	 */
	private static final long serialVersionUID = 634583075217111916L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		if(SaraServlet.isAdmin()){
			
	    	SaraUser currentUser = SaraServlet.login(request,response);
			//make sure that we are logged in
			if(currentUser != null){

				DAO dao = new DAO();
				List<Object> toDelete = new ArrayList<Object>();
				
				// get the user key
				Key<SaraUser> userKey = new Key<SaraUser>(SaraUser.class, Integer.parseInt(request.getParameter("user")));
							
				// REMOVE HIGHLIGHTS
				toDelete.addAll(dao.ofy().query(Highlight.class).filter("user",userKey).list());
				
				// REMOVE NOTES
				toDelete.addAll(dao.ofy().query(Note.class).filter("user",userKey).list());
				
				// REMOVE STRAT DATA
				toDelete.addAll(dao.ofy().query(StratData.class).filter("user",userKey).list());
				
				// REMOVE USERCARETBOOK
				toDelete.addAll(dao.ofy().query(UserCaretBook.class).filter("user",userKey).list());
				
				// REMOVE USER CONTENT PROGRESS
				toDelete.addAll(dao.ofy().query(UserContentProgress.class).filter("user",userKey).list());
				
				// REMOVE USER LIBRARY ROLE
				toDelete.addAll(dao.ofy().query(UserLibraryRole.class).filter("user",userKey).list());
				
				// REMOVE OPTIONS
				toDelete.addAll(dao.ofy().query(Option.class).filter("user",userKey).list());
				
				// TODO: REMOVE USER IMAGE????? (Ask Liam)		
				
				// delete actual user
				toDelete.add(dao.ofy().get(userKey));
				
				// delete them all and return
				dao.ofy().delete(toDelete);
				response.sendRedirect("/admin/actions.html");
				
			}
		}
	}
	
}
