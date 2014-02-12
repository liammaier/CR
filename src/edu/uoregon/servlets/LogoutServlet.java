package edu.uoregon.servlets;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class LogoutServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -7018033742007491813L;

	/**
	 *  Logs user in and tells the server their info
	 */
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		

		SaraServlet.logout(request,response);
		

	}

}
