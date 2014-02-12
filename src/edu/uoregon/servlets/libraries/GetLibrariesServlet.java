package edu.uoregon.servlets.libraries;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.NotFoundException;
import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.servlets.SaraServlet;

public class GetLibrariesServlet extends HttpServlet {

	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1035233858858073759L;

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		
		//gives us the current user or NULL if they are not allowed in the site,
		SaraUser currentUser = SaraServlet.login(request,response);
		
		if(currentUser != null){
        	Collection<Library> libraries = Library.getAllLibraries();
        	
        	Key<SaraUser> userK= SaraUser.getCurrentUserKey();
        	
        	//get ready to send things back to client
			Gson gson = new Gson();
    		response.setContentType("application/json");
    		response.setCharacterEncoding("UTF-8");
    		
			Collection<HashMap<String, Object>> mylibraries = new ArrayList<HashMap<String, Object>>();
    		for (Library library : libraries) {
    			HashMap<String, Object> data = new HashMap<String, Object>();
    			String leaderEmail = library.getLeaderEmail();
    			
    			Key<Library> libK = new Key<Library>(Library.class,library.id);
    			
    			DAO dao = new DAO();
    			
				//find out what role the user has in this library so the client can give them the appropriate options
    			UserLibraryRole userLRole = dao.ofy().query(UserLibraryRole.class).filter("user",userK).filter("library",libK).get();
				if(userLRole != null){
					data.put("name", library.name); 
					data.put("role", userLRole.role);
					data.put("id", library.id); 
					data.put("timeCreated", library.timeCreated);
					data.put("leader",leaderEmail); 
					data.put("type", library.type); 
					data.put("description", library.description); 
					data.put("numbooks", (library.resources != null ? library.resources.size() : 0) ); // if resources is null it's just 0. otherwise get thze
					mylibraries.add(data);
				}
			  		  					
			}
			try{
				response.getWriter().print(gson.toJson(mylibraries));
        	} catch (NotFoundException e) {
        		e.printStackTrace();
        	}
    		
		}
	}

}
