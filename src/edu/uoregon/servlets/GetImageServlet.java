package edu.uoregon.servlets;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Key;

import edu.uoregon.models.DAO;
import edu.uoregon.models.Image;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.UserImage;

// import user edited content into campus reader
public class GetImageServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setCharacterEncoding("UTF-8");
	
		SaraUser currentUser = SaraServlet.login(request,response);
		//make sure that we are logged in
		if(currentUser != null){
			
			String imageIdString = request.getPathInfo().substring(1);
			
	    	//make sure necessary params are given
	    	if ((imageIdString == null) || 
	    		(imageIdString.equals("")		    		
	    	)) {
	    			throw new IllegalArgumentException();
	    	}
	    	Long imageId = new Long(0);
	    	try{
	    		imageId = new Long(imageIdString);
	    	}catch(Exception e){
    			throw new IllegalArgumentException();

	    	}
			DAO dao = new DAO();
			Key<Image> imageKey = new Key<Image>(Image.class,imageId);
			Key<UserImage> userImage = dao.ofy().query(UserImage.class).filter("user",currentUser.getKey()).filter("image",imageKey).getKey();
			
	    	//if they didn't pass a content id and image id to save this image with, then we are saving it to the user.
	    	if(userImage != null || SaraServlet.isAdmin()){
	    		//return the image contents
				Image image = dao.ofy().get(imageKey);
				if(image.src != null){
					response.setContentType("image/png");
					response.getOutputStream().write(image.src.getBytes());
				}else{
					response.getWriter().print("Saved image is corrupted.");

				}
	    	}else{
				response.getWriter().print("You are not verified to access this content.");

	    	}
	    	
		}
	    	
	}
	
}
