package edu.uoregon.servlets.reader;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.*;
import com.googlecode.objectify.*;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;

import edu.uoregon.models.reader.Highlight;
import edu.uoregon.models.reader.Note;
import edu.uoregon.models.reader.Section;
import edu.uoregon.servlets.SaraServlet;




public class GetSuperNotebookDataServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		Gson gson = new Gson();
		
		SaraUser currentUser = SaraServlet.login(req,resp);
		
		if(currentUser != null){
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			DAO dao = new DAO();
			Objectify ofy = dao.ofy();
			
			// Get the content
			String secString = req.getParameter("sections");
			String[] idStrings = secString.substring(1, secString.length()-1).split(",");
			
			//an array that contains each section's notes, which are arrays of JSON
			ArrayList<HashMap<String, Object>> outputList = new ArrayList<HashMap<String, Object>>();
			
			for(int i = 0; i < idStrings.length; i++){
				// For each id, let's get the list and highlights for it
				Key<Section> sectionKey = new Key<Section>(Section.class, Integer.valueOf(idStrings[i]));
				HashMap<String, Object> section = new HashMap<String, Object>();
				
				// Get highlights
				ArrayList<HashMap<String, Object>> secHighlights = new ArrayList<HashMap<String, Object>>();
				List<Highlight> highlights = ofy.query(Highlight.class).filter("user", userKey).filter("section", sectionKey).list();
				Iterator<Highlight> it = highlights.iterator();
				while(it.hasNext()){
					Highlight highlight = (Highlight) it.next();
					HashMap<String, Object> data = new HashMap<String, Object>();
					// Add highlight data
					data.put("id", highlight.id);
					data.put("section", highlight.section);
					data.put("annotation", highlight.annotation);
					data.put("contents", highlight.contents.getValue());
					data.put("completesentences", highlight.completesentences.getValue());
					data.put("sentenceOffset", highlight.sentenceOffset);
					data.put("question", highlight.question);
					data.put("answer", highlight.answer);
					data.put("type", highlight.type);
					data.put("othertype", highlight.othertype);
					
					secHighlights.add(data);
				}
				section.put("highlights", secHighlights);
				
				// Get list
				ArrayList<HashMap<String, Object>> secList = new ArrayList<HashMap<String, Object>>();
				List<Note> list = ofy.query(Note.class).filter("user", userKey).filter("section", sectionKey).list();
				Iterator<Note> listit = list.iterator();
				while(listit.hasNext()){
					Note note = (Note) listit.next();
					HashMap<String, Object> data = new HashMap<String, Object>();
					// Add highlight data
					data.put("id", note.id);
					data.put("type", note.type);
					data.put("sectionID", ofy.get(note.section).id);
					data.put("section", ofy.get(note.section).id);
					data.put("contents", note.contents.getValue());
					data.put("timeCreated", note.timeCreated.toString());
					
					secList.add(data);
				}
				section.put("list", secList);
				
				// Get section summary
				
				
				// Put the section into the outputList
				outputList.add(section);
			}
			
			resp.getWriter().print(gson.toJson(outputList));
				
		}else {
			System.out.println("user out of sync");
		}
	}

}