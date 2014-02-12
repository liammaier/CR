package edu.uoregon.servlets;

import java.io.BufferedReader;
import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.google.appengine.labs.repackaged.org.json.JSONTokener;
import com.googlecode.objectify.Key;
import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraLog;
import edu.uoregon.models.SaraLog.Strategy;
import edu.uoregon.models.SaraLog.Type;
import edu.uoregon.models.SaraUser;

public abstract class SaraServlet extends HttpServlet {


	/**
	 * 
	 */
	private static final long serialVersionUID = 703661272695843503L;


	public static boolean isAdmin() {
        return UserServiceFactory.getUserService().isUserAdmin();
			
	}
	protected SaraUser currentUser(HttpSession session) {
		return (SaraUser) session.getAttribute("sara_user");
	}

	protected boolean authenticated(HttpSession session) {
		UserService userService = UserServiceFactory.getUserService();
        User googleUser = userService.getCurrentUser();

        SaraUser user = currentUser(session);
        boolean notNull = (user != null) && (googleUser != null);

        return (notNull && (googleUser.getUserId().equals(user.googleId)));
	}

	// returns false if no SaraUser exists for the google user
	public static SaraUser logout(HttpServletRequest request, HttpServletResponse response) {
		request.getSession().invalidate();
		UserService userService = UserServiceFactory.getUserService();
		try {
			response.sendRedirect(userService.createLogoutURL("/"));
		} catch (IOException e) {
			e.printStackTrace();
			try {
				response.sendRedirect(("/"));
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
		}
		
		
		return null;
			
	}
	// returns false if no SaraUser exists for the google user
	public static SaraUser login(HttpServletRequest request, HttpServletResponse response) {
		
		@SuppressWarnings("unchecked")
		Key<SaraUser> userKey = (Key<SaraUser>) request.getSession().getAttribute("userKey");
		SaraUser currentUser = null;

		DAO dao = new DAO();
		
		UserService userService = UserServiceFactory.getUserService();
		User googleUser = userService.getCurrentUser();
		
		// if user not in  session then check db, if all else fails send to registration
		if(userKey != null){
			
			currentUser = dao.ofy().get(userKey);
			if(currentUser.googleId == null){
				try {
					response.sendRedirect("/createUser?type='Green'&nickname="+googleUser.getEmail());
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				return null;
			}else{
				
			}
			return currentUser;
		}else{

			if(googleUser == null){

				//sending to login if we have control, otherwise returning null to the caller
				try {
					System.out.println("sending to login");
					response.sendRedirect(userService.createLoginURL(request.getRequestURI()));
	
				} catch (Exception e) {
					e.printStackTrace();
				}
				return null;
			}else{
				
				Key<SaraUser> userK = SaraUser.getCurrentUserKey();
				
				
				//if we have control redirect to registration, otherwise return null to caller.
				if(userK == null){
					try {
						response.sendRedirect("/createUser?type='Green'&nickname="+googleUser.getEmail());
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
						
					}
					return null;
	
				//if we found them log if we need to, then return the user
				}else{
					
					//String email,Type type, Strategy strategy, Key<Content> contentKey, int sectionNum, String data1, String data2) {
					SaraLog logT = new SaraLog(googleUser.getEmail().toLowerCase(),Type.LOGIN, Strategy.MENUS, null, null, null, null);
					dao.ofy().put(logT);
					
					request.getSession().setAttribute("userKey", userK);
					SaraUser userS = dao.ofy().get(userK);
					System.out.println(userS.googleId);
					if(userS.googleId == null){
						try {
							response.sendRedirect("/createUser?type='Green'&nickname="+googleUser.getEmail());
						} catch (IOException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
						return null;
					}else{
						return userS;
					}
					//if they just logged in, log it!
					
				}
	
			}
		}

	}
	
	public static Long getIdFromUrl(String str){
		int index = nthOccurrence(str,'/');
		try{
			return new Long(str.substring(index+1, str.length()-1));
		}catch(ClassCastException e){
			e.printStackTrace();
			return null;
		}
		
		
	}
	public static JSONObject readJSON(HttpServletRequest req){
		//read in the json of the request
				StringBuffer jb = new StringBuffer();
				  String line = null;
				  try {
				    BufferedReader reader = req.getReader();
				    while ((line = reader.readLine()) != null)
				      jb.append(line);
				  } catch (Exception e) { /*report an error*/ }

				  try {
					  
						return new JSONObject(new JSONTokener(jb.toString()));
					
					}catch(Exception e){
						System.err.println("given note was invalid");
						e.printStackTrace();
					}
				return null;
				 
				  
				  
	}
	
	
	public static int nthOccurrence(String str, char c) {
	    int pos = str.indexOf(c, 0);
	    int lastPos = 0;
	    
	    while (str.indexOf(c, pos+1) != -1){
	    	
	    	lastPos = pos;
	    	pos = str.indexOf(c, pos+1);
	    }
	    return lastPos;
	}
}
