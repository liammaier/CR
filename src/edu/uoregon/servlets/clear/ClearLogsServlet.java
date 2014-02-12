package edu.uoregon.servlets.clear;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraLog;
import edu.uoregon.models.SaraUser;
import edu.uoregon.servlets.SaraServlet;

public class ClearLogsServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -7701073236640894800L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		if(SaraServlet.isAdmin()){
			
	    	SaraUser currentUser = SaraServlet.login(request,response);
			//make sure that we are logged in
			if(currentUser != null){
				DAO dao = new DAO();
				List<SaraLog> logs = dao.ofy().query(SaraLog.class).list();
				dao.ofy().delete(logs);
				response.sendRedirect("/admin/actions.html");
			}
		}
	}
	
}
