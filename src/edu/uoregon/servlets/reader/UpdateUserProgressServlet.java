package edu.uoregon.servlets.reader;

import java.io.IOException;
import java.util.Calendar;
import java.util.TimeZone;

import javax.servlet.http.*;
import com.googlecode.objectify.*;

import edu.uoregon.models.Content;
import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.UserContentProgress;

import edu.uoregon.servlets.SaraServlet;


public class UpdateUserProgressServlet extends HttpServlet {

	private static final long serialVersionUID = 8219581904264024095L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		SaraUser currentUser = SaraServlet.login(request,response);
		if(currentUser != null){
			
			// get user key
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			
			// get content key
	    	Long content = Long.parseLong(request.getParameter("contentkey"));
	    	Key<Content> contentKey = null;
	    	if (content != null && !content.equals(""))
	    		contentKey = new Key<Content>(Content.class, content);
	    	else 
	    		throw new IllegalArgumentException();
	    	
	    	// get page or section info
	    	String[] pages = request.getParameterValues("pagesread[]");
	    	String[] sections = request.getParameterValues("sectionsread[]");
	    	String timeRead = request.getParameter("timeread");
	    	String strategy = request.getParameter("strategy");
	    	
	    	Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("GMT")); // the timezone here doesn't matter
	    	long time= calendar.getTimeInMillis();
	    	
	    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
	    	Objectify ofy = dao.ofy();  
	    	UserContentProgress userCP = ofy.query(UserContentProgress.class).filter("content", contentKey).filter("user", userKey).get();
	    	if (userCP == null) {
	    		userCP = new UserContentProgress(time, contentKey, userKey);
	    	}
	    	userCP.addPages(pages);
	    	userCP.addSections(sections);
	    	userCP.addMinutes(Math.round(Integer.parseInt(timeRead)/60000));
	    	userCP.setStrategy(strategy);
	    	
	    	userCP.updateTime(time);
	    	
	    	ofy.put(userCP);
	    	
			    
		} else {
			System.err.println("User out of Sync");
		}
			
		
	}
	
}