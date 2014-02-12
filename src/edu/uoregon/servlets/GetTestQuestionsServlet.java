package edu.uoregon.servlets;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;


import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import com.google.gson.Gson;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.Objectify;
import edu.uoregon.models.Content;
import edu.uoregon.models.DAO;
import edu.uoregon.models.Question;
import edu.uoregon.models.SaraUser;


@SuppressWarnings("serial")
public class GetTestQuestionsServlet extends HttpServlet {
	
	
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		// gives us the current user or NULL if they are not allowed in the site
		SaraUser currentUser = SaraServlet.login(request,response);
		if(currentUser != null){
	    	
	    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
	    	Objectify ofy = dao.ofy();  
	    	
	    	Gson gson = new Gson();
	    	
	    	response.setContentType("application/json");
    		response.setCharacterEncoding("UTF-8");
	    	
	    	//make sure there exists a content with the given id
	    	try{
	    		Key<Content> contentKey;
	    		
	    		if(request.getParameter("type").equals("contentID")){
	    			String contentId = request.getParameter("contentId");
		    		contentKey = new Key<Content>(Content.class,new Long(contentId));
		    		
				}else if(request.getParameter("type").equals("contentURL")){
					String contentURL = request.getParameter("contentURL");
					Content content = ofy.query(Content.class).filter("url", contentURL).get();
					contentKey = new Key<Content>(Content.class, content.id);
				}else {
					System.err.println("incorrect type given");
					return;
				}
	    		
	    		List<Question> questions = ofy.query(Question.class).filter("content", contentKey).filter("practice",false).list();
	    		List<Question> practiceQuestions = ofy.query(Question.class).filter("content", contentKey).filter("practice",true).list();
	    		
	    		Collections.shuffle(questions);
	    		//add all the questions to the begging of the list
	    		questions.addAll(0, practiceQuestions);
	    		
	    		//add all question to output and send as json
	    		ArrayList<HashMap<String, Object>> output = new ArrayList<HashMap<String, Object>>();
	    		for(Question q: questions){
	    			HashMap<String, Object> data = new HashMap<String, Object>();
					data.put("id",  q.id); 
					data.put("question",  q.question);
					data.put("practice", q.practice);
					output.add(data);
				}
			
	    		
	    		response.getWriter().print(gson.toJson(output));
	
	    	}catch(Exception e){
	    		System.err.println("invalid contentId given");
	    		return;
	    	}
    	
    	
		}
	}

}
