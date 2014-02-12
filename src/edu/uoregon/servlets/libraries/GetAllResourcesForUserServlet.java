package edu.uoregon.servlets.libraries;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.NotFoundException;

import edu.uoregon.models.DAO;
import edu.uoregon.models.Resource;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.servlets.SaraServlet;

public class GetAllResourcesForUserServlet extends HttpServlet {

	
	/**
	 * 
	 */
	private static final long serialVersionUID = 6562844371451032557L;

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
			
		SaraUser currentUser = SaraServlet.login(request,response);
		
		if(currentUser != null){
        	
			// see if we should return the chapters and sections, or just the resource list
			boolean chapters = false;
			if (request.getParameter("chapters") != null && request.getParameter("chapters").equals("true"))
				chapters = true;
				
			DAO dao = new DAO();
			
        	Key<SaraUser> userK= SaraUser.getCurrentUserKey();
        	
        	// find out which libraries the user is in
        	List<UserLibraryRole> libraryRoles = dao.ofy().query(UserLibraryRole.class).filter("user", userK).list();
        	        	
        	// get the list of library keys
        	HashSet<Key<Library>> libraryKeys = new HashSet<Key<Library>>();
        	for (UserLibraryRole role : libraryRoles){
        		libraryKeys.add(role.library);
        	}
        	
        	// get the libraries
        	Map<Key<Library>, Library> libaries = dao.ofy().get(libraryKeys);
        	
        	// get all the resources into one list (no duplicates)
        	HashSet<Key<Resource>> resourceKeys = new HashSet<Key<Resource>>();
        	for (Library lib : libaries.values()){
        		if (lib != null && lib.resources != null)
        			resourceKeys.addAll(lib.resources);
        	}
        			
        	Gson gson = new Gson();
        	List<Resource> output = new ArrayList<Resource>();
			
			// output all of them
			if(resourceKeys != null){
				Map<Key<Resource>, Resource> resources = dao.ofy().get(resourceKeys);
				
				if (chapters) {
					// get and return the chapters in each section too
					for(Resource resource : resources.values()){
						output.add(resource.getChapters());
					}
				} else {
					for(Resource resource : resources.values()){
						output.add(resource);
					}
				}
			}
			
			try{
				response.getWriter().print(gson.toJson(output));
        	} catch (NotFoundException e) {
        		e.printStackTrace();
        	}
		}
	}
}
