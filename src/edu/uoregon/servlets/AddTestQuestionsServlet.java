package edu.uoregon.servlets;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.Objectify;

import edu.uoregon.models.DAO;
import edu.uoregon.models.Content;
import edu.uoregon.models.Question;
import edu.uoregon.models.SaraUser;

public class AddTestQuestionsServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -4016394960268813939L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		if(SaraServlet.isAdmin()){
			
	    	SaraUser currentUser = SaraServlet.login(request,response);
			//make sure that we are logged in
			if(currentUser != null){
				
		    	
				String contentId = request.getParameter("contentId");

		    	
		    	//make sure contentid was given
		    	if(contentId == null || contentId == ""){
		    		System.err.println("given contentId is empty");
		    		return;
		    	}
		    	
		    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
		    	Objectify ofy = dao.ofy();  
		    	try{
		    		Key<Content> contentKey = new Key<Content>(Content.class,new Long(contentId));
			    	//get all questions given
			    	for(int i = 0;request.getParameter("question"+i) != null;i++){
			    		
			    		String questionString = request.getParameter("question"+i);
			    		String answer = request.getParameter("answer"+i);
			    		String practice = request.getParameter("practice"+i);
			    		
			    		//check to make sure each question or answer was given if not skip it
			    		if(questionString == ""|| questionString == null||answer == null){
			    			System.err.println("question or answer was not given at "+i);
				    		continue;
			    		}
			    		
				    	Question question = new Question( contentKey, questionString, new Boolean(answer),new Boolean(practice));
	
			    			    		
				    	ofy.put(question);
			    		
			    	}
		    	}catch(Exception e){
		    		e.printStackTrace();
		    	}
		    }
			System.out.println("created resource");
			response.sendRedirect("/menu");
		
		}else{
			response.sendRedirect("/notAdmin");
		}
	}
	
}
