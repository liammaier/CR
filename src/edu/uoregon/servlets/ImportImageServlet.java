package edu.uoregon.servlets;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Key;

import edu.uoregon.models.ContentImage;
import edu.uoregon.models.DAO;
import edu.uoregon.models.Content;
import edu.uoregon.models.Image;

import edu.uoregon.models.SaraUser;
import edu.uoregon.models.UserImage;
// import user edited content into campus reader
public class ImportImageServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		
		SaraUser currentUser = SaraServlet.login(request,response);
		//make sure that we are logged in
		if(currentUser != null){
			
			DAO dao = new DAO();
			String contentString = request.getParameter("contentId");
			Long saveId = null;
			Boolean userSave = (contentString == null);
	    	//if they didn't pass a content id and image id to save this image with, then we are saving it to the user.
	    	if(!userSave){
	    		saveId = new Long(contentString);
	    		
	    		String imageIdString = request.getParameter("imageId");
			
		    	//make sure necessary params are given
		    	if ((imageIdString == null) || 
		    		(imageIdString.equals("") ||		    		
		    		(saveId == null) 
		    	)) {
		    		throw new IllegalArgumentException();
		    	}
		    	
		    	Image image = dao.ofy().get(new Key<Image>(Image.class,new Long(imageIdString)));
	    		Key<Image> imageKey = dao.ofy().put(image);
	    		
	    		Content content = dao.ofy().get(new Key<Content>(Content.class,new Long(imageIdString)));
	    		Key<Content> contentKey = dao.ofy().put(content);
    		
	    		ContentImage contentImage = new ContentImage(contentKey,imageKey);
	    		dao.ofy().put(contentImage);
	    		response.getWriter().print("{'id':"+image.id +"}");
		    //save with content 
	    	}else{
	    		saveId = currentUser.id;
	    		
	    		String imageCredit = request.getParameter("credit");
				String imageCaption = request.getParameter("caption");
				String imageSrc = request.getParameter("src");
		    	//make sure necessary params are given
				Image image = null;
				System.out.println(request.getContentType());
		    	if (imageSrc == null){
		    		try{
		    			image = new Image(request.getInputStream(),"");
		    		}catch(Exception e){
		    			throw new IllegalArgumentException();
		    		}
		    	}else{
		    		if(imageCaption == null){
		    			imageCaption = "";
		    			imageCredit = "";
		    			image = new Image(imageSrc,imageCaption,imageCredit);
		    		}else{
		    			image = new Image(imageSrc,imageCaption,imageCredit);
		    		}

		    	}
		    	
		    	//if the image saved correctly
		    	if(image.src != null){
		    		Key<Image> imageKey = dao.ofy().put(image);
		    		
		    		//save for the user
		    		UserImage userImage = new UserImage(currentUser.getKey(),imageKey);
		    		dao.ofy().put(userImage);
		    		response.getWriter().print("{\"id\":\""+image.id +"\"}");
		    	}else{
		    		
		    	}
	    	}
		}
	}
}
