package edu.uoregon.servlets.clear;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Key;

import edu.uoregon.models.*;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.reader.*;
import edu.uoregon.servlets.SaraServlet;

public class DeleteResourceServlet extends HttpServlet {

	
	/**
	 * 
	 */
	private static final long serialVersionUID = 634583075217111916L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		if(SaraServlet.isAdmin()){
			
	    	SaraUser currentUser = SaraServlet.login(request,response);
			//make sure that we are logged in
			if(currentUser != null){

				DAO dao = new DAO();
				List<Object> toDelete = new ArrayList<Object>();
				
				// get the resource key
				Key<Resource> resourceKey = new Key<Resource>(Resource.class, Integer.parseInt(request.getParameter("resource")));
				
				// REMOVE FROM LIBRARY
				
				// get them all
				Collection<Library> allLibraries = dao.ofy().query(Library.class).list();
				
				// remove from all
				for (Library lib : allLibraries) {
					lib.removeResource(resourceKey);
					dao.ofy().put(lib);
				}
				
				// DELETE RESOURCE ACCESS
				//toDelete.addAll(dao.ofy().query(ResourceAccess.class).filter("resource", resourceKey).list());
				
				
				// BY CONTENT
				
				// get content list
				Collection<Key<Content>> contentList = dao.ofy().query(Content.class).filter("resource", resourceKey).listKeys();
				
				// delete content
				toDelete.addAll(dao.ofy().query(Content.class).filter("resource", resourceKey).list());
				
				// loopp through content
				
				for (Key<Content> cKey : contentList ){
					
					// delete sections	
					toDelete.addAll(dao.ofy().query(Section.class).filter("content", cKey).list());

					// delete glossary
					toDelete.addAll(dao.ofy().query(GlossaryItem.class).filter("content", cKey).list());
				}
				
				// delete actual resource
				toDelete.add(dao.ofy().get(resourceKey));

				
				// delete them all and return
				dao.ofy().delete(toDelete);
				response.sendRedirect("/admin/actions.html");
				
			}
		}
	}
	
}
