package edu.uoregon.servlets;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.Objectify;

import edu.uoregon.models.Answer;
import edu.uoregon.models.DAO;
import edu.uoregon.models.Question;
import edu.uoregon.models.SaraUser;

public class SaveAnswerServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -4768502906307815016L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		if(SaraServlet.isAdmin()){
			
	    	SaraUser currentUser = SaraServlet.login(request,response);
			//make sure that we are logged in
			if(currentUser != null){
				
				Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
				
				try {
					String questionId = request.getParameter("questionId").toString();
					Long timeTaken = new Long(request.getParameter("timeTaken").toString());
					boolean userAnswer = new Boolean(request.getParameter("answer").toString());
				
			    	//make sure contentid was given
			    	if(questionId == null || questionId == ""){
			    		System.err.println("given contentId is empty");
			    		return;
			    	}
			    	
			    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
			    	Objectify ofy = dao.ofy();  
			    	
		    		Key<Question> questionKey = new Key<Question>(Question.class,new Long(questionId));
			    	Question question = ofy.get(questionKey);
			    	
			    	//if they got the question right
			    	Boolean correct = false;
			    	if(question.answer == userAnswer) correct = true;
			    	
			    	Answer answer = new Answer(userKey, questionKey, correct,timeTaken);
			    	
			    	ofy.put(answer);
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
	
		    }
			
		}else{
			response.sendRedirect("/notAdmin");
		}
	}
	
}
