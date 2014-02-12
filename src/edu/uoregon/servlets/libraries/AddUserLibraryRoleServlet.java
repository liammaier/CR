package edu.uoregon.servlets.libraries;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import com.google.appengine.api.datastore.Email;
import com.googlecode.objectify.Key;
import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.servlets.SaraServlet;

public class AddUserLibraryRoleServlet extends HttpServlet {

	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
	 *  Creates a new Discussion and an initial comment.
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");

		String libId = request.getParameter("libId");
		String userToAddEmail = request.getParameter("userEmail").toLowerCase();

		if(libId == null|| libId.equals("") ||libId.equals("")||userToAddEmail == null|| userToAddEmail.equals("")){			
			throw new IllegalArgumentException();
		}
		
		SaraUser currentUser = SaraServlet.login(request,response);
		//if they did not give a specific lib give them all of them
		DAO dao = new DAO();
		
		if(currentUser != null){
			Key<SaraUser> userK= SaraUser.getCurrentUserKey();
			Key<Library> libK = new Key<Library>(Library.class,Long.parseLong(libId));
		
			UserLibraryRole leaderRole = dao.ofy().query(UserLibraryRole.class).filter("user",userK).filter("library",libK).get();
			
			// check to see if it's a admin or a leader of the library
			if(SaraServlet.isAdmin() || (leaderRole != null && leaderRole.role.equals("instructor")) ){
				
				Key<SaraUser> newLibUser = dao.ofy().query(SaraUser.class).filter("email",new Email(userToAddEmail)).getKey();
				
				if(newLibUser == null){
					SaraUser newUser = new SaraUser(userToAddEmail); 
					newLibUser = dao.ofy().put(newUser);
				}
				
				//if we don't already have the role saved save it
				if(dao.ofy().query(UserLibraryRole.class).filter("user",newLibUser).filter("library",libK).get()== null){
					dao.ofy().put( new UserLibraryRole(libK,newLibUser,"member")  );
					System.out.println("saved new userLibRole");
				}else{
					System.err.println("user already in that library");	
				}
					
				
			}else{
				System.err.println("user is not the leader of this lib");	
			}
			
		}else {
			System.err.println("invalid user");	
			
		}
		response.sendRedirect("/admin/actions.html");
	}

}
