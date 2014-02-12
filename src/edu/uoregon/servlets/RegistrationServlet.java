package edu.uoregon.servlets;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.googlecode.objectify.Key;

import edu.uoregon.models.DAO;
import edu.uoregon.models.Option;
import edu.uoregon.models.SaraLog;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.SaraLog.Strategy;
import edu.uoregon.models.SaraLog.Type;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;

public class RegistrationServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -5478956388873858295L;

	/**
	 *  Logs user in and tells the server their info
	 */

public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		String name = request.getParameter("nickname");
		String type = request.getParameter("type");
		UserService userService = UserServiceFactory.getUserService();
		User googleUser = userService.getCurrentUser();
		DAO dao = new DAO();
		if ((type == null) ||(type.equals(""))) {
        	throw new IllegalArgumentException();
        }
		Key<SaraUser> newUserKey = SaraUser.getCurrentUserKey();
		SaraUser newUser = null;
		if(newUserKey != null){
			newUser = dao.ofy().get(newUserKey);
			newUser.initilizeUser(googleUser,type,name);
			dao.ofy().put(newUser);
		}else{
			newUser = new SaraUser(googleUser,type,name);
			newUserKey = dao.ofy().put(newUser);
		}
		
		// generate basic options for the new user
		Option.addDefaultOptions(newUser.getKey());
		
		// find demo library and add person to it
		Library demoLib = dao.ofy().query(Library.class).filter("name", "Demo").get();
		if (demoLib != null) {
			dao.ofy().put( new UserLibraryRole(demoLib.getKey(),newUserKey,"member"));
		}
		// find CR library and add person to it
		Library crLib = dao.ofy().query(Library.class).filter("name", "About Campus Reader").get();
		if (crLib != null) {
			dao.ofy().put( new UserLibraryRole(crLib.getKey(),newUserKey,"member"));
		}
		
		//anytime we make a new user give them a my group and make them leader of it
		//String email,Type type, Strategy strategy, Key<Content> contentKey, int sectionNum, String data1, String data2) {
		SaraLog logT = new SaraLog(newUser.email.getEmail().toLowerCase(), Type.NEW_USER_REGISTRATION, Strategy.MENUS, null, null, null, null);
		dao.ofy().put(logT);
		request.getSession().setAttribute("userKey", newUserKey);
		System.out.println("Created an account for " + newUser.name);

		response.sendRedirect("/menu");
	}
}
