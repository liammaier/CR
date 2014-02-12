package edu.uoregon.servlets;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.labs.repackaged.org.json.JSONArray;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.google.appengine.labs.repackaged.org.json.JSONTokener;
import com.google.gson.Gson;
import com.googlecode.objectify.Key;

import edu.uoregon.models.DAO;
import edu.uoregon.models.Content;
import edu.uoregon.models.Resource;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.reader.Section;

// import user edited content into campus reader
public class ImportBookServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private final String STAGINGLIBNAME = "";

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response){

		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
	
		//make sure that we are logged in
		DAO dao = new DAO();
		SaraUser currentUser = null;

    	currentUser = SaraServlet.login(request,response);
		
		if(currentUser != null){
			JSONObject bookObj = SaraServlet.readJSON(request);
			System.out.println(bookObj);

			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			try{
				
				String description = bookObj.get("description").toString();
				String title = bookObj.get("title").toString();
				String type = bookObj.get("type").toString();
				JSONArray chapters = (JSONArray) bookObj.get("chapters");
				
				//resource
				Resource resource = dao.ofy().query(Resource.class).filter("title", bookObj.get("title")).get();
		    	
		    	Key<Resource> resourceKey = null;
		    	if (resource != null ) {
		    		/**don't remove for now just add the new content**/
//		    		// if it did exist, get the key
//		    		resourceKey = Resource.getResourceKeyById(resource.id);
//		    		
//		    		//remove all of the old chapters from the resource		    	
//			    	Content[] oldContent = resource.getChapters().chapters;
//			    	for(Content c : oldContent){
//			    		dao.ofy().delete(c);
//			    	}
//			    	dao.ofy().delete(resource);
		    	}
		    	
	    		// otherwise, make it and get the key
	    		resource = new Resource(title, type,description, "imported");
		    	resourceKey = dao.ofy().put(resource);

				Content[] contentList = new Content[chapters.length()];

				for(int i = 0; i < chapters.length(); i++ ){
					JSONObject chapter = (JSONObject) chapters.get(i);
					System.out.println(chapter);

					String contentName = chapter.get("name").toString();
					String contentDesc = chapter.get("description").toString();
					String contentUrl  = contentName + currentUser.name;
					System.out.println(chapter);

					int numPages  = Integer.parseInt(chapter.get("pages").toString());
					int numSections  = Integer.parseInt(chapter.get("numsections").toString());
					String contentHtml = chapter.get("html").toString();
					String contentCSSURL = chapter.get("css").toString();
					String importedURL = chapter.get("url").toString();
					String sectionsToAdd = chapter.get("sections").toString();
					if(sectionsToAdd.length() > 0){
						//only add this chapter if it has a starting section
				    	Content content = new Content(contentName, "import", contentDesc, contentUrl, numPages, numSections, resourceKey,contentCSSURL, 0, contentHtml, importedURL);
						Key<Content> contentKey  = dao.ofy().put(content);
						
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
				}
				
	    		Gson gson = new Gson();
	    		
				response.getWriter().print("{message :'Success'}");
			}catch(Exception e){
				e.printStackTrace();
			}
			
		}
	}
}
