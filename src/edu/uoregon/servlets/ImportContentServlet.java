package edu.uoregon.servlets;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.Email;
import com.google.appengine.labs.repackaged.org.json.JSONArray;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.google.appengine.labs.repackaged.org.json.JSONTokener;
import com.googlecode.objectify.Key;

import edu.uoregon.models.DAO;
import edu.uoregon.models.Content;
import edu.uoregon.models.Resource;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.models.reader.Section;

// import user edited content into campus reader
public class ImportContentServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	@Override
	protected void doOptions(HttpServletRequest request, HttpServletResponse response){ 
	    // pre-flight request processing
		response.setHeader("Access-Control-Allow-Origin", "");
		response.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST");
		response.setHeader("Access-Control-Allow-Headers", "X-Custom-Header");
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response){
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
		response.setHeader("Access-Control-Allow-Credentials", "true");
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
    	System.out.println("got request");
	
		//make sure that we are logged in
		DAO dao = new DAO();
		SaraUser currentUser = null;
		
		String googleId = request.getParameter("googleId");
    	if(googleId != null){
    		Key<SaraUser> userKey = new Key<SaraUser>(SaraUser.class, dao.ofy().query(SaraUser.class).filter("googleId", googleId).get().id);
    		if(userKey != null){
    			currentUser = dao.ofy().get(userKey);
    		}
    	}else{
    		currentUser = SaraServlet.login(request,response);
    	}
		
		String resourceDescription = "Documents that you have manually edited and imported into campus reader";
    	String resourceName = "Imported Content";
    	String resourceType = "import";
    	String resourceUrl = "imported_" + currentUser.name;
    	
    	//make sure necessary params are given
//	    	if ((resourceName == null) || 
//	    		(resourceName.equals(""))||
//	    		(resourceType == null) || 
//	    		(resourceType.equals(""))) {
//	    			throw new IllegalArgumentException();
//	    	}
    	
    	// SEE IF RESOURCE ALREADY EXISTS
    	Resource resource = dao.ofy().query(Resource.class).filter("url", resourceUrl).get();
    	
    	Key<Resource> resourceKey = null;
    	if (resource != null ) {
    		// if it did exist, get the key
    		resourceKey = Resource.getResourceKeyById(resource.id);
    	} else {
    		// otherwise, make it and get the key
    		resource = new Resource(resourceName, resourceType, resourceDescription, resourceUrl);
	    	
	    	resourceKey = dao.ofy().put(resource);
	    	
	    	// then make a library for it
	    	
	    	String libraryDescription = "Private Library for " + currentUser.name;
	    	String libraryName = "Private Library for " + currentUser.name;;
	    	String libraryType = "closed";
	    	String leaderEmailString = currentUser.getEmail().toLowerCase();
	    	
	    	Library library = new Library(libraryName,libraryDescription,libraryType);
	    	
	    	// add resource to library
	    	library.addResource(resourceKey);
	    	
	    	// add library to db
	    	Key<Library> libraryKey = dao.ofy().put(library);		    	
	    	
	    	// add library role
    		Email leaderEmail = new Email(leaderEmailString);
			Key<SaraUser> userKey = dao.ofy().query(SaraUser.class).filter("email", leaderEmail).getKey();
        	
			if(userKey != null && libraryKey != null){
				dao.ofy().put(new UserLibraryRole(libraryKey,userKey,"instructor"));
			} else{
				System.err.println("failed to create Library");
			}
			
			System.out.println("created library");
	    	
    	}    	
    	

		String contentName = request.getParameter("name");
		String contentDesc = request.getParameter("desc");
		String contentUrl  = contentName + currentUser.name;
		int numPages  = Integer.parseInt(request.getParameter("pages"));
		int numSections  = Integer.parseInt(request.getParameter("numsections"));
		String contentHtml = request.getParameter("html");
		String contentCSSURL = request.getParameter("css");
		String importedURL = request.getParameter("url");
		
		// CHECK TO SEE IF CHAPTER ALREADY EXISTS
    	Content content = dao.ofy().query(Content.class).filter("url", contentUrl).get();
    	
    	if (content == null ) {
    		// if it doesn't exist, make it and add everything
    		content = new Content(contentName, "import", contentDesc, contentUrl, numPages, numSections, resourceKey,contentCSSURL, 0, contentHtml, importedURL);
	    	
    		Key<Content> contentKey = dao.ofy().put(content);
    		
    		// ADD SECTIONS TO CHAPTERS
    		
			String sectionsToAdd = request.getParameter("sections");
			if(sectionsToAdd.length() > 0){
				
				try{
					JSONArray sectionsJSON = new JSONArray(new JSONTokener(sectionsToAdd));
				
					for(int n = 0; n < sectionsJSON.length();n++){
						
						JSONObject section = sectionsJSON.getJSONObject(n);
						int sectionNumber = section.getInt("sectionNumber");
						String sectionName = section.getString("name");
						Boolean subsection = new Boolean(section.getString("subsection"));
						
						Section newSection = new Section(contentKey, sectionNumber, sectionName, subsection);
						dao.ofy().put(newSection);
					
					}
				}catch(JSONException e){
					e.printStackTrace();
				}
			}
			System.out.println("created resource");
    	}
	}
}
