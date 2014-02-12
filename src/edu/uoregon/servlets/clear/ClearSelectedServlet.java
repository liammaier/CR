package edu.uoregon.servlets.clear;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Key;

import edu.uoregon.models.*;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.models.reader.*;
import edu.uoregon.models.strategies.*;
import edu.uoregon.servlets.SaraServlet;

public class ClearSelectedServlet extends HttpServlet {

	
	/**
	 * 
	 */
	private static final long serialVersionUID = -913078738749871562L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		if(SaraServlet.isAdmin()){
			
	    	SaraUser currentUser = SaraServlet.login(request,response);
			//make sure that we are logged in
			if(currentUser != null){
				
				DAO dao = new DAO();
				
				String[] classnames = request.getParameterValues("classnames");
				String userID = request.getParameter("user");
				
				List<Object> all = new ArrayList<Object>();
				
				String classnamesstring = "";
				for (String classname : classnames) {
					classnamesstring += classname + " ";
				}
				
				// clear for all users
				if (userID.equals("all")) {
					if (classnamesstring.contains("library")) {all.addAll(dao.ofy().query(Library.class).list());}  
					if (classnamesstring.contains("highlight")){all.addAll(dao.ofy().query(Highlight.class).list());}  
					if (classnamesstring.contains("content")){all.addAll(dao.ofy().query(Content.class).list());}  
					if (classnamesstring.contains("note")){all.addAll(dao.ofy().query(Note.class).list());}  
					if (classnamesstring.contains("option")){all.addAll(dao.ofy().query(Option.class).list());}  
					if (classnamesstring.contains("resource")){all.addAll(dao.ofy().query(Resource.class).list());}  
					if (classnamesstring.contains("sarauser")){all.addAll(dao.ofy().query(SaraUser.class).list());}  
					if (classnamesstring.contains("section")){all.addAll(dao.ofy().query(Section.class).list());}  
					if (classnamesstring.contains("stratdata")){all.addAll(dao.ofy().query(StratData.class).list());}    
					if (classnamesstring.contains("usercontentprogress")){all.addAll(dao.ofy().query(UserContentProgress.class).list());}  
					if (classnamesstring.contains("userlibraryrole")){all.addAll(dao.ofy().query(UserLibraryRole.class).list());} 
					if (classnamesstring.contains("saralog")){all.addAll(dao.ofy().query(SaraLog.class).list());} 
				} else {  
					
					// clear just for one user
					
					Key<SaraUser> userKey = new Key<SaraUser>(SaraUser.class, Integer.parseInt(userID));
					
					String userEmail = dao.ofy().get(userKey).email.getEmail();
					
					if (classnamesstring.contains("highlight")){all.addAll(dao.ofy().query(Highlight.class).filter("user", userKey).list());}  
					if (classnamesstring.contains("note")){all.addAll(dao.ofy().query(Note.class).filter("user", userKey).list());}  
					if (classnamesstring.contains("stratdata")){all.addAll(dao.ofy().query(StratData.class).filter("user", userKey).list());}  
					if (classnamesstring.contains("usercontentprogress")){all.addAll(dao.ofy().query(UserContentProgress.class).filter("user", userKey).list());}  
					if (classnamesstring.contains("userlibraryrole")){all.addAll(dao.ofy().query(UserLibraryRole.class).filter("user", userKey).list());} 
					if (classnamesstring.contains("saralog")){all.addAll(dao.ofy().query(SaraLog.class).filter("user", userEmail).list());}
					if (classnamesstring.contains("option")){all.addAll(dao.ofy().query(Option.class).filter("user", userEmail).list());}  
					if (classnamesstring.contains("sarauser")){all.addAll(dao.ofy().query(SaraUser.class).filter("name", userEmail).list());}
				}
				
				dao.ofy().delete(all);
				response.sendRedirect("/admin/cleardatabase.jsp");
				
			}
		}
	}
	
}
