package edu.uoregon.servlets.reader;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;

import javax.servlet.http.*;
import com.googlecode.objectify.*;

import edu.uoregon.models.Content;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.reader.Section;
import edu.uoregon.servlets.SaraServlet;



public class GetSectionsServlet extends HttpServlet {

	private static final long serialVersionUID = 3656850019620025909L;

	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		
		SaraUser currentUser = SaraServlet.login(req,resp);
		
		if(currentUser != null){
			SaraUser.getCurrentUserKey();
			
			if(req.getParameter("docId") != null) {
				Long id = new Long(req.getParameter("docId"));
				Content resource = Content.getResourceById(id);
	
				Key<Content> dockey = new Key<Content>(Content.class, resource.getId());
				
				Collection<Section> sections = Section.getAllSections(dockey);
	
				Gson gson = new Gson();

	    		resp.setContentType("application/json");
	    		resp.setCharacterEncoding("UTF-8");
	    		
	    		ArrayList<HashMap<String, Object>> output = new ArrayList<HashMap<String, Object>>();
				Iterator<Section> sectionIterator = sections.iterator();
				while(sectionIterator.hasNext()) {
					Section section = (Section) sectionIterator.next();
					
					//get ready to send things back to client

	    			HashMap<String, Object> data = new HashMap<String, Object>();
					data.put("id", section.id); 
					data.put("name", section.name); 
					data.put("number", section.sectionNum);
					data.put("subsection", section.subsection);
					
					output.add(data);
				}
				
				// bubble sort
				for(int i = 0; i < output.size() - 1; i ++){
					for(int j = i+1; j < output.size(); j ++){
						if(Integer.parseInt(output.get(i).get("number").toString()) > Integer.parseInt(output.get(j).get("number").toString())) {
							// swap them
							HashMap<String, Object> temp = output.get(i);
							output.set(i, output.get(j));
							output.set(j, temp);
						}
					}
				}
				
				resp.getWriter().print(gson.toJson(output));
			}
		}
	}

}
