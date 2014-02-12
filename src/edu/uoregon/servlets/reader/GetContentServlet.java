package edu.uoregon.servlets.reader;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import edu.uoregon.models.Content;
import edu.uoregon.models.DAO;
import edu.uoregon.models.Resource;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.reader.Section;
import edu.uoregon.servlets.SaraServlet;

public class GetContentServlet extends HttpServlet {

	
	private static final long serialVersionUID = 8428464045367259464L;

	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		
		SaraUser currentUser = SaraServlet.login(req,resp);
		
		if(currentUser != null){
			SaraUser.getCurrentUserKey();
			
			if(req.getParameter("contentID") != null) {
				
				Gson gson = new Gson();
	    		resp.setContentType("application/json");
	    		resp.setCharacterEncoding("UTF-8");
	    		DAO dao = new DAO();
	    		
	    		// get content
	    		
				Long id = new Long(req.getParameter("contentID"));
				Content content = Content.getResourceById(id);
				
				Resource parent = dao.ofy().get(content.resource);
				// get resource name
				content.resourceTitle = parent.title;
				// get next chapter id
				Long nextChapterId = null;
				if (parent.getNextChapter(id) != null)
					nextChapterId = parent.getNextChapter(id).id;
			
				
				// get sections
				
				Key<Content> contentKey = new Key<Content>(Content.class, content.getId());
				Collection<Section> sections = Section.getAllSections(contentKey);
	
	    		ArrayList<HashMap<String, Object>> sectionOutput = new ArrayList<HashMap<String, Object>>();
				Iterator<Section> sectionIterator = sections.iterator();
				while(sectionIterator.hasNext()) {
					Section section = (Section) sectionIterator.next();
					//get ready to send things back to client
					HashMap<String, Object> sectionData = new HashMap<String, Object>();
					sectionData.put("id", section.id); 
					sectionData.put("name", section.name); 
					sectionData.put("number", section.sectionNum);
					sectionData.put("subsection", section.subsection);
					sectionOutput.add(sectionData);
				}
				
				// bubble sort
				for(int i = 0; i < sectionOutput.size() - 1; i ++){
					for(int j = i+1; j < sectionOutput.size(); j ++){
						if(Integer.parseInt(sectionOutput.get(i).get("number").toString()) > Integer.parseInt(sectionOutput.get(j).get("number").toString())) {
							// swap them
							HashMap<String, Object> temp = sectionOutput.get(i);
							sectionOutput.set(i, sectionOutput.get(j));
							sectionOutput.set(j, temp);
						}
					}
				}
				//add the content to the end of the list
				HashMap<String, Object> data = new HashMap<String, Object>();
				
				data.put("content",content);
				data.put("nextChapterId",nextChapterId);
				data.put("sections",sectionOutput);
				resp.getWriter().print(gson.toJson(data));
			}
		}
	}
}
