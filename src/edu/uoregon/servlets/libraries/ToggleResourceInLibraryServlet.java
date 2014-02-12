package edu.uoregon.servlets.libraries;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Key;
import edu.uoregon.models.DAO;
import edu.uoregon.models.Resource;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.servlets.SaraServlet;

public class ToggleResourceInLibraryServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 533980349216328408L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");

		Long libID = new Long(request.getParameter("libID"));
		Long resourceID = new Long(request.getParameter("resourceID"));
		
		SaraUser currentUser = SaraServlet.login(request,response);
		//if they did not give a specific lib give them all of them
		if(currentUser != null){
			DAO dao = new DAO();
			Library library = dao.ofy().get(new Key<Library>(Library.class, libID));
			//String type = request.getParameter("type");

			Key<Resource> resKey = new Key<Resource>(Resource.class, resourceID);
			
			// Now see which one we want to do
			String action = request.getParameter("action");
			if(resKey != null && library != null){
				dao.ofy().delete(library);
				if(action.equals("add")){
					library.addResource(resKey);
				}else if(action.equals("remove")){
					library.removeResource(resKey);
				}
				dao.ofy().put(library);
			}else {
				System.out.println("Null pointer accessed!");
			}
			
			
		}
	}
	
}
