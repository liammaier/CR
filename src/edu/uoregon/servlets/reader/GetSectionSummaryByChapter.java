package edu.uoregon.servlets.reader;

import com.google.gson.Gson;
import com.googlecode.objectify.Key;

import edu.uoregon.models.Content;
import edu.uoregon.models.DAO;
import edu.uoregon.models.reader.Note;
import edu.uoregon.models.reader.Section;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


public class GetSectionSummaryByChapter extends HttpServlet{
	/**
	 * 
	 */
	private static final long serialVersionUID = 4995774085941556360L;

	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		
		DAO dao = new DAO();
		ArrayList<Content> contents = (ArrayList<Content>) dao.ofy().query(Content.class).list();
		Iterator<Content> contentsIterator = contents.iterator();
		
		// The array list to hold all contents result
		ArrayList<HashMap<String, Object>> listOfAllContents = new ArrayList<HashMap<String, Object>>();
		
		// get each content
		while (contentsIterator.hasNext()){
			Content content = contentsIterator.next();
			
			// get all sections
			content.getSections();
			Section[] sections = content.sections;
			
			// the object of current section object
			HashMap<String, Object> contentData = new HashMap<String, Object>();
			ArrayList<HashMap<String, Object>> arrayListOfSections = new ArrayList<HashMap<String, Object>>();
			
			
			// get each section
			for (Section section: sections){
				// get all the section summaries in this section
				ArrayList<Note> sectionSummaries = (ArrayList<Note>) dao.ofy().query(Note.class).filter("type", "Section Summary").filter("section", new Key<Section>(Section.class, section.id)).list();
				
				if (!sectionSummaries.isEmpty()){
					// the object of current section object
					HashMap<String, Object> sectionData = new HashMap<String, Object>();
					sectionData.put("name", section.name);
					sectionData.put("sectionSummaries", sectionSummaries);
					
					arrayListOfSections.add(sectionData);
					contentData.put("name", content.title);
					contentData.put("sections", arrayListOfSections);
					
					if (!listOfAllContents.contains(contentData)){
						listOfAllContents.add(contentData);
					}
				}
			}
		}
		
		Gson gson = new Gson();
		resp.getWriter().print(gson.toJson(listOfAllContents));
		
	}
}
