package edu.uoregon.servlets;

import java.io.IOException;
import java.util.HashMap;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import com.googlecode.objectify.NotFoundException;
import edu.uoregon.models.SaraUser;

public class UserServlet extends HttpServlet {

	private static final long serialVersionUID = 8428464045367259464L;

	/**
	 *  Logs user in and tells the server their info
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		
		SaraUser currentUser = SaraServlet.login(request,response);

		//make sure that we are logged in as a valid user
		if(currentUser != null){

			//get ready to send things back to client
			Gson gson = new Gson();
    		response.setContentType("application/json");
    		response.setCharacterEncoding("UTF-8");
    		HashMap<String, Object> data = new HashMap<String, Object>();

        	data.put("nickname", currentUser.name);
        	data.put("userEmail", currentUser.email);
        	data.put("seenTutorial", currentUser.seenTutorial);

        	data.put("logoutUrl",  UserServiceFactory.getUserService().createLoginURL(request.getHeader("Referer")));
        	
	        try{
	        	//send a JSON with all of the data for a user
	        	response.getWriter().print(gson.toJson(data));
			} catch (NotFoundException e) {
				e.printStackTrace();
			}
		}
	}
}
