package edu.uoregon.servlets;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;

public class EditUserServlet extends HttpServlet {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 7836754007127959300L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		SaraUser currentUser = SaraServlet.login(request, response);
		
		//make sure that we are logged in as a valid user
		if(currentUser != null){

			//get the parameter change
			String type = request.getParameter("type");
			String value = request.getParameter("value");
			DAO dao = new DAO();
			dao.ofy().delete(currentUser);
			if(type.equals("seenTutorial")){
				if(value.equals("true")){
					currentUser.seenTutorial = true;
				}else if(value.equals("false")){
					currentUser.seenTutorial = false;
				}
			}
			dao.ofy().put(currentUser);
		}else{
			response.getWriter().print("{}");
		}
	}
	
}
