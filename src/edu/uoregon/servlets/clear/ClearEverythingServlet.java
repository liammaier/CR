package edu.uoregon.servlets.clear;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import edu.uoregon.models.*;
import edu.uoregon.models.libraries.Assignment;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.models.reader.*;
import edu.uoregon.models.strategies.*;
import edu.uoregon.servlets.SaraServlet;

public class ClearEverythingServlet extends HttpServlet {

	
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
				//make sure that we are logged in
		    	List<Object> all = new ArrayList<Object>();
				if(currentUser != null){
					DAO dao = new DAO();
					all.addAll(dao.ofy().query(Answer.class).list());
					all.addAll(dao.ofy().query(Assignment.class).list());
					all.addAll(dao.ofy().query(Comment.class).list());
					all.addAll(dao.ofy().query(Content.class).list());
					all.addAll(dao.ofy().query(Discussion.class).list());
					all.addAll(dao.ofy().query(FeedData.class).list());
					all.addAll(dao.ofy().query(NewsFeed.class).list());
					all.addAll(dao.ofy().query(GlossaryItem.class).list());
					all.addAll(dao.ofy().query(Highlight.class).list());
					all.addAll(dao.ofy().query(HighlightIgnore.class).list());
					all.addAll(dao.ofy().query(Library.class).list());
					all.addAll(dao.ofy().query(Note.class).list());
					all.addAll(dao.ofy().query(NoteIgnore.class).list());
					all.addAll(dao.ofy().query(Option.class).list());
					all.addAll(dao.ofy().query(Resource.class).list());
					all.addAll(dao.ofy().query(ResourceAccess.class).list());
					all.addAll(dao.ofy().query(SaraLog.class).list());
					all.addAll(dao.ofy().query(SaraUser.class).list());
					all.addAll(dao.ofy().query(Section.class).list());
					all.addAll(dao.ofy().query(StratData.class).list());
					all.addAll(dao.ofy().query(UserContentProgress.class).list());
					all.addAll(dao.ofy().query(UserLibraryRole.class).list());
					all.addAll(dao.ofy().query(UserSectionGroupStat.class).list());
					all.addAll(dao.ofy().query(UserSectionStat.class).list());
					all.addAll(dao.ofy().query(UserStatistics.class).list());
					all.addAll(dao.ofy().query(Question.class).list());
					dao.ofy().delete(all);
					response.sendRedirect("/admin/actions.html");
				}
			}
		}
	}
	
}
