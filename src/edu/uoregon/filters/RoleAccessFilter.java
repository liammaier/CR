package edu.uoregon.filters;

import java.io.IOException;
import java.util.List;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.Email;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.googlecode.objectify.Objectify;

import edu.uoregon.models.DAO;
import edu.uoregon.models.groups.UserGroupRole;

public class RoleAccessFilter implements Filter {

	String requiredRole;
	String notAuthorizedUrl = "/public/access_denied.html";
	
	@Override
	public void destroy() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		// TODO Auto-generated method stub
		
		UserService userService = UserServiceFactory.getUserService();
        User user = userService.getCurrentUser();
		
//        String groupIdString = request.getParameter("group_id");
//		Long groupID = Long.parseLong(groupIdString);
//		Key<Group> groupKey = new Key<Group>(Group.class, groupID);
        
		boolean authorized = false;
		
		// user should never be null because of a security-constraint in web.xml on urls of /content
		// but if it ever is just treat it like the user doesn't have access to the requested content.
		if (user != null) { 
			
			DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
        	Objectify ofy = dao.ofy();

        	List<UserGroupRole> userRoles = ofy.query(UserGroupRole.class).filter("email", new Email(user.getEmail())).list();
        		
        	for (UserGroupRole userRole : userRoles) {
        		if (userRole.role.equals(requiredRole)) {
        			authorized = true;
        		}
        	}
		} //endif
		
		if (authorized) {
			chain.doFilter(request, response);
		} else { // redirect to need access page
			if (response instanceof HttpServletResponse) {
				HttpServletResponse httpResponse = (HttpServletResponse) response;
				httpResponse.sendRedirect(notAuthorizedUrl);
			}
		}
	}

	@Override
	public void init(FilterConfig config) throws ServletException {
		this.requiredRole = config.getInitParameter("required_role");
	}

}
