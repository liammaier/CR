package edu.uoregon.servlets.groups;

import java.io.IOException;
import java.util.HashMap;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.appengine.api.datastore.Email;
import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.NotFoundException;
import com.googlecode.objectify.Objectify;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.groups.Group;
import edu.uoregon.models.groups.UserGroupRole;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.servlets.SaraServlet;

public class CreateGroupServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -5963250953569057468L;
	String resourcePath = "/WEB-INF/administration/admin/create_group.jsp";
	
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
		
		ServletContext context = this.getServletContext();
		RequestDispatcher dispatcher = context.getRequestDispatcher(resourcePath);

		dispatcher.forward(request, response);
		
	}
	
	/**
	 *  Creates a new Discussion and an initial comment.
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		HttpSession session = request.getSession();
    	SaraUser currentUser = SaraServlet.login(request,response);
		//make sure that we are logged in
		if(currentUser != null){
			//make sure are in a lib
	        Library currentLib = (Library) session.getAttribute("current_lib");
	        if(currentLib != null){
		   
		    	String groupDescription = request.getParameter("groupDescription");
		    	String groupName = request.getParameter("group");
		    	String groupType = request.getParameter("type");
		    	String leaderEmailString = request.getParameter("leader").toLowerCase();
		    	if ((groupName == null) || 
		    		(groupName.equals(""))||
		    		(groupType == null) || 
		    		(groupType.equals(""))) {
		    			throw new IllegalArgumentException();
		    	}
		    	if(groupDescription == null){
		    		groupDescription = "";
		    	}
		    	
		    	
		    	String followBool = request.getParameter("followBool");
		    	boolean followable;
		    	if(followBool.equals("true")){
		    		followable = true;
		    	}else{
		    		followable = false;
		    	}
		    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
		    	Objectify ofy = dao.ofy();
		    	
		    	
		    	// Transmit groupID back to jQuery
				
		    	
		    	if ((leaderEmailString != null) && (!leaderEmailString.equals(""))) {
		    	
		    		Email leaderEmail = new Email(leaderEmailString);
		    		
		    		try {
		    			Key<SaraUser> leaderKey = ofy.query(SaraUser.class).filter("email", leaderEmail).getKey();
		    			Key<Group> groupKey = null;
		            	
		    			//get ready to send things back to client
		    			Gson gson = new Gson();
		        		response.setContentType("application/json");
		        		response.setCharacterEncoding("UTF-8");
		        		HashMap<String, Object> data = new HashMap<String, Object>();
		        		
		        		
		    			
		    			//if we have this group name already then tell the client to stop them from making it
		            	if(ofy.query(Group.class).filter("name", groupName).get()== null){
		            		Group group = new Group(currentLib,groupName, groupDescription, groupType, followable);
		            		groupKey = ofy.put(group);
		                	System.out.println("Created group " + groupName);
		                	
		                	data.put("group_id", Long.toString(group.id));
		            		data.put("freeName", true);
		            	
		        			UserGroupRole leader = new UserGroupRole(groupKey, leaderKey, "leader");
		        			ofy.put(leader);
		        			
		        			System.out.println("Added leader " + leaderEmail.getEmail() + " to group " + groupName);
		            	}else{
		            		data.put("freeName", false);
		            	}
		            	response.getWriter().print(gson.toJson(data));
		    		} catch (NotFoundException e) {
		    			System.out.println("Could not add " + leaderEmail.getEmail() + " as leader because no user exists with that email");
		    		}
		    	}else{
		    		
		    		System.out.println("Could not add the user as leader because no user exists with that email");
		    	}
	        }
	    }
	}
}
