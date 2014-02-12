package edu.uoregon.servlets;

import java.io.IOException;
import java.util.Iterator;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.labs.repackaged.org.json.JSONArray;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.google.appengine.labs.repackaged.org.json.JSONTokener;
import com.googlecode.objectify.Key;

import edu.uoregon.models.DAO;
import edu.uoregon.models.Content;
import edu.uoregon.models.Resource;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.reader.GlossaryItem;
import edu.uoregon.models.reader.Section;


public class AddResourceServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		
		if(SaraServlet.isAdmin()){
			
			SaraUser currentUser = SaraServlet.login(request,response);
			//make sure that we are logged in
			if(currentUser != null){
				
				DAO dao = new DAO();
				
				String resourceDescription = request.getParameter("resourceDescription");
		    	String resourceName = request.getParameter("resourceName");
		    	String resourceType = request.getParameter("resourceType");
		    	String resourceUrl = request.getParameter("resourceUrl");
		    	
		    	//make sure necessary params are given
		    	if ((resourceName == null) || 
		    		(resourceName.equals(""))||
		    		(resourceType == null) || 
		    		(resourceType.equals(""))) {
		    			throw new IllegalArgumentException();
		    	}
		    	if(resourceDescription == null){
		    		resourceDescription = "";
		    	}
		    	
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
		    	}    	
		    	
		    	if(resourceType.equals("article")){

		    		// ARTICLE 
		    		
		    		// CHECK TO SEE IF ARTICLE CONTENT ALREADY EXISTS
			    	Content content = dao.ofy().query(Content.class).filter("url", resourceUrl).get();
			    	
			    	if (content == null ) {
			    		// if it doesn't exist, make it and add everything
			    		int numPages = Integer.parseInt(request.getParameter("articlepages"));
			    		int numSections = Integer.parseInt(request.getParameter("articlesections"));
			    		Content article = new Content(resourceName, resourceType, resourceDescription, resourceUrl, numPages, numSections, resourceKey, "/contents/"+resourceUrl+"/"+resourceUrl+".css");
			    		Key<Content> contentKey =dao.ofy().put(article);
			    		
			    		// ADD SECTIONS TO ARTICLES
			    		
						String sectionsToAdd = request.getParameter("sections");
						if(sectionsToAdd != null && !sectionsToAdd.equals("[]")){
							
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
						
						// ADD GLOSSARY ITEMS
						try {
							// delete existing glossary items
							dao.ofy().delete(dao.ofy().query(GlossaryItem.class).filter("content", contentKey).list());
							
							// add
							String glossaryitemJSONString = request.getParameter("glossaryitems");
							String glossaryorderJSONString = request.getParameter("glossaryorder");
							
							glossaryitemJSONString = glossaryitemJSONString.replace("\\t", "").replace("\\n", " ");
							JSONObject glossaryItems = new JSONObject(new JSONTokener(glossaryitemJSONString));
							JSONObject glossaryOrder = new JSONObject(new JSONTokener(glossaryorderJSONString));
							
							// Now iterate over keys
							Iterator<?> keys = glossaryItems.keys();
							while(keys.hasNext()) {
								String key = (String) keys.next();
								dao.ofy().put(new GlossaryItem(contentKey, key, glossaryItems.get(key).toString(), glossaryOrder.getInt(key)));
							}
						} catch (JSONException e) {
							e.printStackTrace();
						}
			    	}
		    		
		    	} else {// end article
		    	
			    	// BOOK
			    	
			    	// PROCESS CHAPTERS
			    	int i = 0;
			    	while(request.getParameter("chaptername"+i) != null){
			    		
			    		String name = request.getParameter("chaptername"+i);
			    		String desc = request.getParameter("desc"+i);
			    		String contentUrl  = request.getParameter("url"+i);
			    		int numPages  = Integer.parseInt(request.getParameter("pages"+i));
			    		int numSections  = Integer.parseInt(request.getParameter("sectioncount"+i));
			    		
			    		// CHECK TO SEE IF CHAPTER ALREADY EXISTS
				    	Content content = dao.ofy().query(Content.class).filter("url", contentUrl).get();
				    	
				    	if (content == null ) {
				    		// if it doesn't exist, make it and add everything
				    		content = new Content(name, "chapter", desc, contentUrl, numPages, numSections, resourceKey, "/contents/"+resourceUrl+"/"+resourceUrl+".css", i);
					    	
				    		Key<Content> contentKey = dao.ofy().put(content);
				    		
				    		// ADD SECTIONS TO CHAPTERS
				    		
							String sectionsToAdd = request.getParameter("sections"+i);
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
							
							// ADD GLOSSARY ITEMS
							try {
								// delete existing glossary items
								dao.ofy().delete(dao.ofy().query(GlossaryItem.class).filter("content", contentKey).list());
								
								// add
								String glossaryitemJSONString = request.getParameter("glossaryitems"+i);
								String glossaryorderJSONString = request.getParameter("glossaryorder"+i);
								
								glossaryitemJSONString = glossaryitemJSONString.replace("\\t", "").replace("\\n", " ");
								JSONObject glossaryItems = new JSONObject(new JSONTokener(glossaryitemJSONString));
								JSONObject glossaryOrder = new JSONObject(new JSONTokener(glossaryorderJSONString));
								
								// Now iterate over keys
								Iterator<?> keys = glossaryItems.keys();
								while(keys.hasNext()) {
									String key = (String) keys.next();
									dao.ofy().put(new GlossaryItem(contentKey, key, glossaryItems.get(key).toString(), glossaryOrder.getInt(key)));
								}
							} catch (JSONException e) {
								e.printStackTrace();
							}
				    	}    			    		
			    		
			    		i++;
			    	}
		    	}
		    	System.out.println("created resource");
				
		    }
		
		}else{
			response.sendRedirect("/notAdmin");
		}
	}
	
}
