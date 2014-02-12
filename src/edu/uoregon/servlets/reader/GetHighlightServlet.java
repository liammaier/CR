package edu.uoregon.servlets.reader;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.*;
import com.googlecode.objectify.*;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.models.reader.Highlight;
import edu.uoregon.models.reader.HighlightIgnore;
import edu.uoregon.models.reader.Section;
import edu.uoregon.servlets.SaraServlet;



public class GetHighlightServlet extends HttpServlet {

	private static final long serialVersionUID = 3656850019620025909L;

	/*
	 *This should return a json with a list of highlight arrays, which each have a list of highlights
	 */
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		
		SaraUser currentUser = SaraServlet.login(req,resp);
		
		// TEMP CODE
		// if there is no libId then there is no instructor highlights
		if(req.getParameter("libId") == null){
			DAO dao = new DAO();
			Key<SaraUser> userK= SaraUser.getCurrentUserKey();
			Long secId = new Long(req.getParameter("section")); 
			//Long index = new Long(req.getParameter("index")); 
			//Long contId = new Long(req.getParameter("contentID")); 
			Key<Section> sectionKey = new Key<Section>(Section.class,secId);
			
			Collection<Highlight> highlights  = dao.ofy().query(Highlight.class).filter("user", userK).filter("section",sectionKey).list();
			Iterator<Highlight> highlightsIterator = highlights.iterator();
			
    		
    		HashMap<String, Object> outerPut = new HashMap<String, Object>();
    		Collection<HashMap<String, Object>> output = new ArrayList<HashMap<String, Object>>();
    		
			Gson gson = new Gson();
			while(highlightsIterator.hasNext()) {
				
				Highlight highlight = highlightsIterator.next();
				
				HashMap<String, Object> data = new HashMap<String, Object>();
				//get ready to send things back to client
//				if(highlight.user == userK){
//					data.put("instructor", false); 
//				}else{
//					data.put("instructor", true); 
//				}
				data.put("id", highlight.id);
				data.put("type", highlight.type);
				data.put("contents", highlight.contents.getValue());
				data.put("annotation", highlight.annotation);
				data.put("question", highlight.question);
				data.put("answer", highlight.answer);
				data.put("sectionID", secId);
				data.put("completesentences", highlight.completesentences.getValue());
				data.put("sentenceOffset", highlight.sentenceOffset);
				data.put("startContainer", highlight.startContainer);
				data.put("endContainer", highlight.endContainer);
				data.put("startOffset", highlight.startOffset);
				data.put("endOffset", highlight.endOffset);
				data.put("reviewed", highlight.reviewed);
				data.put("othertype", highlight.othertype);
				output.add(data);
				
			}
			outerPut.put("highlights",output);
			//outerPut.put("index",index);
			resp.getWriter().print(gson.toJson(outerPut));
			return;
		}
		// END TEMP CODE

		if(currentUser != null){
			Key<SaraUser> userK= SaraUser.getCurrentUserKey();
			DAO dao = new DAO();
			if(req.getParameter("section") != null) {
				Long secId = new Long(req.getParameter("section")); 
				//Long index = new Long(req.getParameter("index")); 
				//Long contId = new Long(req.getParameter("contentID")); 
				Long libId = new Long(req.getParameter("libID"));
				Key<Section> sectionKey = new Key<Section>(Section.class,secId);
				
				//get all the instructors and add them to a list.
				List<UserLibraryRole> instructorRoles = dao.ofy().query(UserLibraryRole.class).filter("library",new Key<Library>(Library.class,libId)).filter("role","instructor").list();
				List<Key<SaraUser>> instructors = new ArrayList<Key<SaraUser>>();
				for(int i = 0; i< instructorRoles.size();i++){
					instructors.add(instructorRoles.get(i).user);
				}
				List<Key<SaraUser>> selfAndInstructors =  new ArrayList<Key<SaraUser>>(instructors);
				selfAndInstructors.add(userK);
				
				//get all highlights
				Collection<Key<Highlight>> highlightKeys  = dao.ofy().query(Highlight.class).filter("section",sectionKey).filter("user in",selfAndInstructors).listKeys();
				
				//highlights that we have hidden(instructor highlights only)
				Collection<HighlightIgnore> temp = dao.ofy().query(HighlightIgnore.class).filter("user",userK).list();
				Collection<Key<Highlight>> ignoredHighlights = new ArrayList<Key<Highlight>>();
				for(HighlightIgnore highlightIg : temp){
					ignoredHighlights.add(highlightIg.highlight);
				}
				
				//remove them fromm our list of output highlights
				highlightKeys.removeAll(ignoredHighlights);
				
				resp.setContentType("application/json");
	    		resp.setCharacterEncoding("UTF-8");
	    		
	    		HashMap<String, Object> outerPut = new HashMap<String, Object>();
	    		Collection<HashMap<String, Object>> output = new ArrayList<HashMap<String, Object>>();
	    		Gson gson = new Gson();
				//for each note of the current type add it to the output
	    		Map<Key<Highlight>, Highlight> highlights = dao.ofy().get(highlightKeys);
				for (Highlight highlight : highlights.values()){
					
					HashMap<String, Object> data = new HashMap<String, Object>();
					
					//get ready to send things back to client
					if(highlight.user.equals(userK)){
						data.put("instructor", false); 
					}else{
						data.put("instructor", true); 
					}
					data.put("id", highlight.id);
					data.put("type", highlight.type);
					data.put("contents", highlight.contents.getValue());
					data.put("annotation", highlight.annotation);
					data.put("question", highlight.question);
					data.put("answer", highlight.answer);
					data.put("completesentences", highlight.completesentences.getValue());
					data.put("sentenceOffset", highlight.sentenceOffset);
					data.put("sectionID", secId);
					data.put("startContainer", highlight.startContainer);
					data.put("endContainer", highlight.endContainer);
					data.put("startOffset", highlight.startOffset);
					data.put("endOffset", highlight.endOffset);
					data.put("reviewed", highlight.reviewed);
					data.put("othertype", highlight.othertype);
					output.add(data);
				}
				outerPut.put("highlights",output);
				//outerPut.put("index",index);
				
				//send the highlights
				resp.getWriter().print(gson.toJson(outerPut));
			}
		}else{
			System.out.println("user out of sync");
		}
	}

}
