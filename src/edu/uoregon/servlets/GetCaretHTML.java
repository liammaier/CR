package edu.uoregon.servlets;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Key;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.caret.CaretContent;
import edu.uoregon.models.caret.CaretBookContent;

// import user edited content into campus reader
public class GetCaretHTML extends HttpServlet {

	private static final long serialVersionUID = 1L;

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		SaraUser currentUser = SaraServlet.login(request,response);
		//make sure that we are logged in
		if(currentUser != null){
			
			String contentIdString = request.getPathInfo().substring(1).replace(".html","");
			
			Key<SaraUser> userKey = SaraUser.getCurrentUserKey();

	    	//make sure necessary params are given
	    	if ((contentIdString == null) || 
	    		(contentIdString.equals("")		    		
	    	)) {
	    		throw new IllegalArgumentException();
	    	}
	    	Long contentId = new Long(0);
	    	try{
	    		contentId = new Long(contentIdString);
	    	}catch(Exception e){
    			throw new IllegalArgumentException();
	    	}
			DAO dao = new DAO();
			CaretBookContent userContent = dao.ofy().query(CaretBookContent.class).filter("user",userKey).filter("content",new Key<CaretContent>(CaretContent.class,contentId)).get();
	    	//if they didn't pass a content id and image id to save this image with, then we are saving it to the user.
			if(userContent != null){
				CaretContent content = dao.ofy().get(userContent.content);
		    	if(content != null){
		    		//return the image contents
					if(content.contents != null){
						response.setContentType("application/octet-stream");
						response.setCharacterEncoding("UTF-8");
						response.getWriter().print(content.contents);
					}else{
						response.getWriter().print("Saved image is corrupted.");
					}
		    	}else{
					response.getWriter().print("You are not verified to access this content.");
		    	}
			}
		}
	}
}
