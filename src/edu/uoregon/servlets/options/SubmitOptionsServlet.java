package edu.uoregon.servlets.options;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Objectify;

import edu.uoregon.models.DAO;
import edu.uoregon.models.Option;
import edu.uoregon.models.SaraUser;
import edu.uoregon.servlets.SaraServlet;

public class SubmitOptionsServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");

		// gives us the current user or NULL if they are not allowed in the site
		SaraUser currentUser = SaraServlet.login(request,response);
		if(currentUser != null){

	    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
	    	Objectify ofy = dao.ofy();
    	
	    	// get all options for user
	    	List<Option> options = ofy.query(Option.class).filter("user", currentUser.getKey()).list();    	
	    	
	    	// delete all options so we can add new ones
	    	dao.ofy().delete(options);
	        	
	    	// Option(Key<SaraUser> user, String name, String type, boolean enabled,  String data) {
	    	
	    	// PREVIEW STRATS
	    	String[] previewStrats = {"previewsections","previewfigures"};
	    	for (String name : previewStrats){
	    		if (request.getParameter(name) != null) {
	    			ofy.put(new Option(currentUser.getKey(), name, "preview", true,""));
	    		}
	    	}
	    	
	    	// READER OPTIONS
	    	String[] readerOptions = {"ttsspeed","ttsaccent","ttspitch"};
	    	for (String name : readerOptions){
	    		if (request.getParameter(name) != null) {
	    			ofy.put(new Option(currentUser.getKey(), name, "read", true, request.getParameter(name)));
	    		}
	    	}
	    	
	    	// REVIEW STRATS
	    	String[] reviewStrats = {"reviewmultimedia","reviewsummaries","reviewheatmap"};
	    	for (String name : reviewStrats){
	    		if (request.getParameter(name) != null) {
	    			ofy.put(new Option(currentUser.getKey(), name, "review", true,""));
	    		}
	    	}	    	
	    	
	    	response.sendRedirect("/basic/options/options.html");
	    	
		}
	}
	
	// find the reminder we're looking for
	public List<Option> findOption(List<Option> options, String name) {
		List<Option> output = new ArrayList<Option>();
		for (Option option : options){
			if (option.name.equals(name)){
				output.add(option);
			}
		}
		return output;
	}
	
}