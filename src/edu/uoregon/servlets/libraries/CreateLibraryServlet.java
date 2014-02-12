package edu.uoregon.servlets.libraries;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.datastore.Email;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Objectify;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.servlets.SaraServlet;

public class CreateLibraryServlet extends HttpServlet {

	
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.sendRedirect("/admin/create_library.html");
	}
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 5744168471737836192L;

	/**
	 *  Creates a new Discussion and an initial comment.
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		if(SaraServlet.isAdmin()){
				
			
	    	SaraUser currentUser = SaraServlet.login(request,response);
			//make sure that we are logged in
			if(currentUser != null){
		    	String libraryDescription = request.getParameter("libraryDescription");
		    	String libraryName = request.getParameter("libraryName");
		    	String libraryType = request.getParameter("libraryType");
		    	String leaderEmailString = request.getParameter("leader").toLowerCase();
		    	
		    	
		    	//make sure necessary params are given
		    	if ((libraryName == null) || 
		    		(libraryName.equals(""))||
		    		(libraryType == null) || 
		    		(libraryType.equals(""))||
		    		(leaderEmailString == null) || 
		    		(leaderEmailString.equals(""))) {
		    			throw new IllegalArgumentException();
		    	}
		    	if(libraryDescription == null){
		    		libraryDescription = "";
		    	}
		    	
		    	//add library to db
		    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
		    	Objectify ofy = dao.ofy();
		    	Key<Library> libraryKey = dao.ofy().put(new Library(libraryName,libraryDescription,libraryType));		    	
		    	
	    		Email leaderEmail = new Email(leaderEmailString);
			
				Key<SaraUser> leaderKey = ofy.query(SaraUser.class).filter("email", leaderEmail).getKey();
	        	
				if(leaderKey != null && libraryKey != null){
					dao.ofy().put(new UserLibraryRole(libraryKey,leaderKey,"instructor"));
				} else{
					System.err.println("failed to create Library");
				}
				
				System.out.println("created library");
				
		    }
			
			response.sendRedirect("/menu");
		
		}else{
			response.sendRedirect("/notAdmin");
		}
	}
	

	// assignment stuff. We're not doing this...
//	private int assignmentNumbers(Enumeration<String> parameterNames) {
//		int max = 0;
//		while(parameterNames.hasMoreElements()){
//			
//			String param = parameterNames.nextElement().toString();
//
//			char lastchar = param.charAt(param.length()-1);
//			if(Character.isDigit(lastchar) && Character.digit(lastchar,10) > max){
//				
//				
//				max = Character.digit(lastchar,10);
//			}
//		}
//		return max;
//		
//	}
//	
	//	@SuppressWarnings("unchecked")
	//	int numbAssignments = assignmentNumbers(request.getParameterNames());
	//
	//	//go through all assignment params given
	//	for(int i = 1; i <= numbAssignments;i++){
	//		
	//		DateFormat df = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
	//		
	//		Date dueDate = null;
	//		try {
	//			dueDate = df.parse(request.getParameter("dueDate"+(i)));
	//		} catch (ParseException e) {
	//			//bad date sent by user tell them
	//			// will use something like data.add(datesdidntwork, datesthatdidntworkarray)  eventually
	//			e.printStackTrace();
	//			
	//		}
	//		if(dueDate != null){
	//			ofy.put(new Assignment(request.getParameter("name"+(i+1)),request.getParameter("description"+(i+1)),dueDate,libraryKey));
	//		}
	//		
	//	}
	
	
}
