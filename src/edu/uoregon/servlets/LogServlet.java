package edu.uoregon.servlets;

import java.io.IOException;
import java.util.Date;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import edu.uoregon.models.SaraLog;
import edu.uoregon.models.SaraUser;


public class LogServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 7019387970593958549L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
    	
		SaraUser currentUser = SaraServlet.login(request, response);
    	//make sure that we are logged in as a valid user
		if(currentUser != null){
			
	    	String type = request.getParameter("type");
	    	String content = request.getParameter("contentkey");
	    	String strategy = request.getParameter("strategy");
	    	String section = request.getParameter("sectionkey");
	    	String data1 = request.getParameter("data1");
	    	String data2 = request.getParameter("data2");
	    	String email = currentUser.email.getEmail().toLowerCase();
	    	
	    	if ((type == null) || (type.equals(""))) {
	    			throw new IllegalArgumentException();
		    }
	    	
	    	SaraLog.log(email, new Date().getTime(), type, strategy, section, content, data1, data2);
	    	
	    }else if (request.getParameter("type").equals("welcome")) { // don't need to be logged in on login screen 
	    	
	    	String type = request.getParameter("type");
	    	String content = request.getParameter("contentkey");
	    	String strategy = request.getParameter("strategy");
	    	String section = request.getParameter("sectionkey");
	    	String data1 = request.getParameter("data1");
	    	String data2 = request.getParameter("data2");
	    	
	    	if ((type == null) || (type.equals(""))) {
	    			throw new IllegalArgumentException();
		    }
	    	
	    	SaraLog.log("", new Date().getTime(), type, strategy, section, content, data1, data2);
	    	
	    } else {
	    	System.err.println("User out of Sync");
	    }
			    
	}
	
}
