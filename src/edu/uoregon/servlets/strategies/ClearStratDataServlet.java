package edu.uoregon.servlets.strategies;

import java.io.IOException;
import java.util.List;


import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

import com.googlecode.objectify.Objectify;
import edu.uoregon.models.DAO;
import edu.uoregon.models.strategies.StratData;


@SuppressWarnings("serial")
public class ClearStratDataServlet extends HttpServlet {
	
	
	/**
	 *  Logs the strategy data
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		UserService userService = UserServiceFactory.getUserService();
        User user = userService.getCurrentUser();
        
        // get basic information
    	String userID = user.getUserId();
    	String docID = request.getParameter("docid");
    	String stratName = request.getParameter("stratname");
    	
        if (userID != null && docID != null && stratName != null) {
        	
//        	// get strategy info
//        	String promptPrimary = request.getParameter("promptprimary");
//        	String promptSecondary = request.getParameter("promptsecondary");
//        	String responsePrimary = request.getParameter("responseprimary");
//        	String responseSecondary = request.getParameter("responsesecondary");
        	
        	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
        	Objectify ofy = dao.ofy();  	
        	
        	// check if there is an existing record already	
        	List<StratData> list = ofy.query(StratData.class).filter("userID", userID).filter("docID", docID).filter("stratName", stratName).list();
        	
        	for(StratData strat : list){
        		ofy.delete(strat);
        		System.out.println("deleted data for "+ stratName);
        	}        	
        }
	}
}
