package edu.uoregon.servlets.reader;

import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.google.gson.Gson;
import java.io.IOException;

import java.util.Date;
import java.util.HashMap;


import javax.servlet.http.*;
import com.googlecode.objectify.*;

import edu.uoregon.models.DAO;
import edu.uoregon.models.FeedData;
import edu.uoregon.models.SaraLog;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.UserContentProgress;

import edu.uoregon.models.SaraLog.Strategy;
import edu.uoregon.models.SaraLog.Type;
import edu.uoregon.models.reader.Highlight;
import edu.uoregon.models.reader.HighlightIgnore;
import edu.uoregon.models.reader.Section;
import edu.uoregon.servlets.SaraServlet;




public class UpdateHighlightServlet extends HttpServlet {

	private static final long serialVersionUID = 3656850019620025909L;

	//gives a highlight given an id
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		
		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
			
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			
			String hightlightIdString = req.getPathInfo().substring(1);
			if(hightlightIdString != null){
				Long hightlightId = new Long(hightlightIdString);
				DAO dao = new DAO();
				Highlight highlight = dao.ofy().get(new Key<Highlight>(Highlight.class,hightlightId));
				if(highlight.user.equals(userKey)){
					resp.setContentType("application/json");
		    		resp.setCharacterEncoding("UTF-8");
		    		Gson gson = new Gson();	
		    		
		    		HashMap<String, Object> data = new HashMap<String, Object>();
		    		
					data.put("id", highlight.id);  
					data.put("contents", highlight.contents.getValue());
					data.put("annotation", highlight.annotation);
					data.put("question", highlight.question);
					data.put("answer", highlight.answer);
					data.put("sectionID", dao.ofy().get(highlight.section).id);
					data.put("completesentences", highlight.completesentences.getValue());
					data.put("sentenceOffset", highlight.sentenceOffset);
					data.put("startContainer", highlight.startContainer);
					data.put("endContainer", highlight.endContainer);
					data.put("startOffset", highlight.startOffset);
					data.put("endOffset", highlight.endOffset);
					data.put("reviewed", highlight.reviewed);
					data.put("othertype", highlight.othertype);
					resp.getWriter().print(gson.toJson(data));
				}else{
					System.err.println("cannot access other user highlights");
				}
			
			}else{
				System.err.println("highlight Id is not valid");
			}
		}else{
			System.err.println("user out of sync");
		}
	}
	
	//create a new highlight
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		
		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
				
			try {
				JSONObject highlightObj = SaraServlet.readJSON(req);
				Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
				Key<Section> sectionK = new Key<Section>(Section.class,new Long(highlightObj.get("sectionID").toString()));

				String annotation = highlightObj.get("annotation").toString();
				String contents = highlightObj.get("contents").toString();
				int startContainer = new Integer(highlightObj.get("startContainer").toString());
				int startOffset = new Integer(highlightObj.get("startOffset").toString());
				int endContainer = new Integer(highlightObj.get("endContainer").toString());
				int endOffset = new Integer(highlightObj.get("endOffset").toString());
	
				//"highlights" leave out the type and contents of a highlight
				Highlight highlight = new Highlight(sectionK, contents, highlightObj.get("completesentences").toString(), annotation, userKey, highlightObj.get("type").toString(), startContainer, startOffset, endContainer, endOffset);
				if(highlightObj.get("question") != null && !highlightObj.get("question").equals("") ){
					// Save the question and answer
					highlight.question = highlightObj.get("question").toString();
					highlight.answer = highlightObj.get("answer").toString();
				}
				highlight.sentenceOffset = new Integer(highlightObj.get("sentenceOffset").toString());
				highlight.othertype = highlightObj.get("othertype").toString();
				saveHighlight(highlight);
				
				//log it
				DAO dao = new DAO();
				//SaraLog(String email,Type type, Strategy strategy, Key<Content> contentKey, int sectionNum, String data1, String data2) {
		    	SaraLog log = new SaraLog(dao.ofy().get(userKey).email.getEmail(),Type.HIGHLIGHT_CREATED, Strategy.READ, null, sectionK, contents, annotation);
		    	dao.ofy().put(log);				
				
				Gson gson = new Gson();
				HashMap<String, Object> data = new HashMap<String, Object>();
	    		data.put("id", highlight.id);  
				data.put("contents", highlight.contents.getValue());
				data.put("completesentences", highlight.completesentences.getValue());
				data.put("sentenceOffset", highlight.sentenceOffset);
				data.put("type", highlight.type);
				data.put("annotation", annotation);
				data.put("question", highlight.question);
				data.put("answer", highlight.answer);
				data.put("reviewed",highlight.reviewed );
				data.put("sectionID", dao.ofy().get(highlight.section).id);
				data.put("startContainer", highlight.startContainer);
				data.put("endContainer", highlight.endContainer);
				data.put("startOffset", highlight.startOffset);
				data.put("endOffset", highlight.endOffset);
				data.put("othertype", highlight.othertype);
				resp.getWriter().print(gson.toJson(data));
				
				
				UserContentProgress.incrementHighlights(dao.ofy().get(sectionK).getContent(), userKey, new Date().getTime());
				
			}catch(Exception e){
				e.printStackTrace();
			}
			
		}else{
			System.err.println("user out of sync");
		}
	}
	//delete a highlight
	public void doDelete(HttpServletRequest req, HttpServletResponse resp){
		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
			
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			resp.setContentType("application/json");
			//id for highlight we should be deleting
			Long highlightId = new Long(req.getPathInfo().substring(1));
			
			if(highlightId != null){
				DAO dao = new DAO();
				Highlight highlight = dao.ofy().get(new Key<Highlight>(Highlight.class,highlightId));
				if(highlight.user.equals(userKey)){
		    		dao.ofy().delete(highlight);
		
		    		//log it
		    		//SaraLog(String email,Type type, Strategy strategy, Key<Content> contentKey, int sectionNum, String data1, String data2) {
				    SaraLog log = new SaraLog(dao.ofy().get(userKey).email.getEmail(),Type.HIGHLIGHT_DELETED, Strategy.READ, null, highlight.section, ""+highlight.contents, highlight.annotation);
			    	dao.ofy().put(log);	
				}else{
					System.out.println("delete");
					HighlightIgnore ignoreHighlight = new HighlightIgnore(userKey,new Key<Highlight>(Highlight.class,highlightId));
					dao.ofy().put(ignoreHighlight);
				}			
			}
		}else{
			System.err.println("user out of sync");
		}
	}
	
	//edit a highlight
	public void doPut(HttpServletRequest req, HttpServletResponse resp){
		
		SaraUser currentUser = SaraServlet.login(req,resp);
		if(currentUser != null){
			
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			
			//id for highlight we should be updating
			Long highlightId = new Long(req.getPathInfo().substring(1));
			
			//gets contents to update for highlight
			JSONObject highlightObj = SaraServlet.readJSON(req);
			
			if(highlightId != null){
				DAO dao = new DAO();
				Highlight highlight = dao.ofy().get(new Key<Highlight>(Highlight.class,highlightId));
				if(highlight.user.equals(userKey)){
					
		    		dao.ofy().delete(highlight);
		    	try{
			    	highlight.annotation = highlightObj.get("annotation").toString();
			    	highlight.reviewed =  new Boolean(highlightObj.get("reviewed").toString());
			    	highlight.question = highlightObj.get("question").toString();
			    	highlight.answer = highlightObj.get("answer").toString();
			    	highlight.type = highlightObj.get("type").toString();
			    	highlight.othertype = highlightObj.get("othertype").toString();
			    	saveHighlight(highlight);
			    	
			    	//log it
			    	//SaraLog(String email,Type type, Strategy strategy, Key<Content> contentKey, int sectionNum, String data1, String data2) {
				    SaraLog log = new SaraLog(dao.ofy().get(userKey).email.getEmail(),Type.HIGHLIGHT_UPDATED, Strategy.READ, null, highlight.section, ""+highlight.contents, highlight.annotation);
			    	dao.ofy().put(log);	

					Gson gson = new Gson();
					HashMap<String, Object> data = new HashMap<String, Object>();
					data.put("id", highlight.id);  
					data.put("contents", highlight.contents.getValue());
					data.put("completesentences", highlight.completesentences.getValue());
					data.put("annotation",highlight.annotation );
					data.put("question",highlight.question );
					data.put("answer",highlight.answer );
					data.put("type", highlight.type);
					data.put("reviewed",highlight.reviewed );
					data.put("sectionID", dao.ofy().get(highlight.section).id);
					data.put("startContainer", highlight.startContainer);
					data.put("endContainer", highlight.endContainer);
					data.put("startOffset", highlight.startOffset);
					data.put("endOffset", highlight.endOffset);
					data.put("othertype", highlight.othertype);
					resp.getWriter().print(gson.toJson(data));
		    	}catch(Exception e){
		    		e.printStackTrace();
		    	}
				}else{
					System.err.println("cannot access other user highlights");
				}			
			}
		}else{
			System.err.println("user out of sync");
		}

	}
	
	private Key<Highlight> saveHighlight(Highlight highlight){
		DAO dao = new DAO();
		Objectify ofy = dao.ofy();
		Key<Highlight> highlightKey = ofy.put(highlight);
		FeedData feedData = new FeedData("highlight", highlight.user, highlight.group, highlight.section, null, highlightKey );
		ofy.put(feedData);
		return highlightKey;
	}
}