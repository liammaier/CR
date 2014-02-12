package edu.uoregon.servlets;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;

public class EditUserNoteServlet extends HttpServlet {
	
	/**
	 *  // this is for getting and setting the user note that the user sets at the end of session and sees at the start of session
	 */
	private static final long serialVersionUID = 7836754007127959300L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		SaraUser currentUser = SaraServlet.login(request, response);
		
		//make sure that we are logged in as a valid user
		if(currentUser != null){

			// get the new note
			String newNote = request.getParameter("newnote");
			DAO dao = new DAO();
			
			currentUser.setNextSessionNote(newNote);
			
			dao.ofy().put(currentUser);
			
		}else{
			response.getWriter().print("{}");
		}
	}
	
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		SaraUser currentUser = SaraServlet.login(request, response);
		
		//make sure that we are logged in as a valid user
		if(currentUser != null){
			DAO dao = new DAO();
			
			response.getWriter().print(currentUser.getNextSessionNote());
			
			// reset the note
			currentUser.setNextSessionNote(""); 
			
			dao.ofy().put(currentUser);
			
		}else{
			response.getWriter().print("{}");
		}
	}
	
	
}
