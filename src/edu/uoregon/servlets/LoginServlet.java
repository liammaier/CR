package edu.uoregon.servlets;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import edu.uoregon.models.SaraUser;

public class LoginServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 7124931838112365560L;

	/**
	 *  Logs user in and tells the server their info
	 */
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {

		SaraUser currentUser = SaraServlet.login(request,response);
		System.out.println(currentUser);
		//make sure that we are logged in if not we will be redirected
		if(currentUser != null){
			response.sendRedirect("/menu");
		}

	}

}
