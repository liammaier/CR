package edu.uoregon.servlets.clear;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import edu.uoregon.models.*;
import edu.uoregon.models.reader.*;
import edu.uoregon.servlets.SaraServlet;

public class ClearUserDataServlet extends HttpServlet {

	
	/**
	 * 
	 */
	private static final long serialVersionUID = -1139625945040610350L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		if(SaraServlet.isAdmin()){
			
	    	SaraUser currentUser = SaraServlet.login(request,response);
			//make sure that we are logged in
			if(currentUser != null){
				//make sure that we are logged in
		    	List<Object> all = new ArrayList<Object>();
				if(currentUser != null){
					DAO dao = new DAO();
					all.addAll(dao.ofy().query(SaraLog.class).list());
					all.addAll(dao.ofy().query(FeedData.class).list());
					all.addAll(dao.ofy().query(Note.class).list());
					all.addAll(dao.ofy().query(Highlight.class).list());
					// stratdata
					all.addAll(dao.ofy().query(Answer.class).list());
					all.addAll(dao.ofy().query(NoteIgnore.class).list());
					all.addAll(dao.ofy().query(UserContentProgress.class).list());
					dao.ofy().delete(all);
					response.sendRedirect("/admin/actions.html");
				}
			}
		}
	}
	
}
