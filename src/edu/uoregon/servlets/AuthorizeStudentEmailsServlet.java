package edu.uoregon.servlets;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.datastore.Email;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;


public class AuthorizeStudentEmailsServlet extends HttpServlet {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 5378283676291813232L;

	/**
	 *  Add a book as a resource for a group
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		UserService userService = UserServiceFactory.getUserService();
        User user = userService.getCurrentUser();

        
        if (user != null) {
		
        	//String groupIdString = request.getParameter("group_id");
        	String studentEmailsString = request.getParameter("student_emails");
        	String [] studentEmails = studentEmailsString.split(",");
        	
        	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
        	
        	for (String studentEmail : studentEmails) {
        		
        		if(studentEmail.contains("@")&&studentEmail.contains(".")){
        			if(dao.ofy().query(SaraUser.class).filter("email", new Email(studentEmail.toLowerCase())).getKey() == null){
	        			SaraUser newUser = new SaraUser(studentEmail);
	        			dao.ofy().put(newUser);
	        			System.out.println("Authorized student email " + studentEmail );
        			}else{
        				System.out.println("Student email " + studentEmail+ " is already in the database." );
        			}
        		}
        	}
        	response.sendRedirect("/admin/actions.html");       		
        }

	}

}
