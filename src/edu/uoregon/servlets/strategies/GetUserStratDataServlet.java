package edu.uoregon.servlets.strategies;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;

import javax.servlet.http.*;
import com.googlecode.objectify.*;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.strategies.StratData;
import edu.uoregon.servlets.SaraServlet;

public class GetUserStratDataServlet extends HttpServlet {

	private static final long serialVersionUID = 3656850019620025909L;

	/*
	 *This should return a json with a list of highlight arrays, which each have a list of highlights
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("application/json");
		
		SaraUser currentUser = SaraServlet.login(req,resp);

		if(currentUser != null){
			Key<SaraUser> userK= SaraUser.getCurrentUserKey();
			DAO dao = new DAO();
			
			if(req.getParameter("contentid") != null) {
				
				long contentID = new Long(req.getParameter("contentid"));  
								
				//get the strat data object
				Collection<StratData> allStratData = dao.ofy().query(StratData.class).filter("user",userK).filter("content", contentID).list();
				
				resp.setContentType("application/json");
	    		resp.setCharacterEncoding("UTF-8");
	    		
	    		Gson gson = new Gson();
								
	    		HashMap <String, Object> data = new HashMap <String, Object>();
	    		
	    		// put each strategy into the data json
	    		String[] strategyList = {"preview-sections","review-summaries", "review-multimedia", "preview-figures"}; 
	    		for (String strategy : strategyList) {
	    			
	    			// try to find the stratdata for each strategy
	    			boolean found = false;
	    			for (StratData stratData : allStratData ){
	    				if (strategy.equals(stratData.strategy)) {
	    					
	    					// construct the strat data object so that the strategyData is an object
	    	    			HashMap<String, Object> stratDataObject = new HashMap<String, Object>();
	    	    			stratDataObject.put("strategy", stratData.strategy); 
	    	    			stratDataObject.put("id", stratData.id); 
	    	    			stratDataObject.put("strategyData",gson.fromJson(stratData.strategyData,Object.class)); 
	    					
	    	    			// add to output
	    					data.put(strategy, stratDataObject);
	    					
	    					found = true;
	    				}
		    		}
	    			
	    			// if it wasn't found, add an empty one
	    			if (!found) {
    					// construct the strat data object so that the strategyData is an object
    	    			HashMap<String, Object> stratDataObject = new HashMap<String, Object>();
    	    			stratDataObject.put("strategy", strategy); 
    	    			stratDataObject.put("strategyData",""); 
    					
    	    			// add to output
    					data.put(strategy, stratDataObject);
    					
	    			}
	    			
	    		}
	    		
				//send the stratdata
				resp.getWriter().print(gson.toJson(data));
			}
		}else{
			System.out.println("user out of sync");
		}
	}

}
