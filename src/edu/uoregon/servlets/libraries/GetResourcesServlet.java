package edu.uoregon.servlets.libraries;

import java.io.IOException;
import java.util.ArrayList;
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
import edu.uoregon.servlets.SaraServlet;

public class GetResourcesServlet extends HttpServlet {

	
	/**
	 * 
	 */
	private static final long serialVersionUID = -2025490250149281245L;

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		
		String id = request.getParameter("libId");
		String inLib = request.getParameter("inlibrary");
		if(inLib == null |inLib.equals("") |id == null |id.equals("")){			
			throw new IllegalArgumentException();
		}
		
		SaraUser currentUser = SaraServlet.login(request,response);
		
		if(currentUser != null){
        	
        	//Key<SaraUser> userK= SaraUser.getCurrentUserKey();
        	
        	Key<Library> libK = new Key<Library>(Library.class,new Long(id));
			
			DAO dao = new DAO();
			Library lib = dao.ofy().get(libK);
			
			//find out what role the user has in this library so the client can give them the appropriate options
			ArrayList<Key<Resource>> resourceKeys = lib.resources;
			
			List<Object> output = new ArrayList<Object>();
			
			//if we are trying to get all the resources in the library
			if(new Boolean(inLib)){
				if(resourceKeys != null){
					Map<Key<Resource>, Resource> resources = dao.ofy().get(resourceKeys);
					for(Resource resource : resources.values()){
						
						output.add(resource);
					}
				}
			}else{
				// get the resources that are not in the library
				List<Resource> allResources = dao.ofy().query(Resource.class).list();
				for(Resource resource : allResources){
					if(resourceKeys == null || !resourceKeys.contains(new Key<Resource>(Resource.class, resource.id))){

						output.add(resource);
					}
				}
			}
			Gson gson = new Gson();
			try{
				response.getWriter().print(gson.toJson(output));
        	} catch (NotFoundException e) {
        		e.printStackTrace();
        	}
		}
	}
}
