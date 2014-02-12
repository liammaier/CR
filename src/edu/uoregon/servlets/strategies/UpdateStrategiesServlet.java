package edu.uoregon.servlets.strategies;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Objectify;



import edu.uoregon.models.Content;
import edu.uoregon.models.DAO;

import edu.uoregon.models.SaraUser;
import edu.uoregon.models.strategies.StratData;
import edu.uoregon.servlets.SaraServlet;

public class UpdateStrategiesServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	
	//edit strategy data
	public void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		System.out.println("hello");

		SaraUser currentUser = SaraServlet.login(request,response);
		JSONObject stratObj = SaraServlet.readJSON(request);

		System.out.println(stratObj.toString());

		if(currentUser != null){	
	    	try {

				String StrategyDataIdString = request.getPathInfo().substring(1);
				
				if(StrategyDataIdString != null){
					DAO dao = new DAO();
					Objectify ofy = dao.ofy(); 
					StratData strat = ofy.get(new Key<StratData>(StratData.class,new Long(StrategyDataIdString)));
			    	
			    	String strategyData =stratObj.get("strategyData").toString();
			    	strat.strategyData = strategyData;
		        	ofy.put(strat);
				}
	    	}catch(Exception e){
	    		e.printStackTrace();
	    	}
	    }
	}	

	//add a new strategy data
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
	
		SaraUser currentUser = SaraServlet.login(request,response);
		
		if(currentUser != null){	
			
	    	try {
				JSONObject stratObj = SaraServlet.readJSON(request);
				
				String strategyData =stratObj.get("strategyData").toString();
		    	
		    	
		    	Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
				String strat = stratObj.get("strategy").toString();
				Key<Content> docKey = new Key<Content>(Content.class,new Long(stratObj.get("content").toString()));
		    	
		    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
		    	Objectify ofy = dao.ofy(); 
	    	
	    		// if there isn't an existing record, create a new entity
	        	StratData newData = new StratData (userKey, docKey.getId(),strat ,strategyData);
	        	
	        	ofy.put(newData);    
		        	
	    	}catch(Exception e){
	    		e.printStackTrace();
	    	}
		}
	}
	
	//delete strategy data
	public void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
	
		SaraUser currentUser = SaraServlet.login(request,response);
		
		if(currentUser != null){	

			String StrategyDataIdString = request.getPathInfo().substring(1);
	    	
			DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
	    	Objectify ofy = dao.ofy(); 
	    	
        	ofy.delete(ofy.get(new Key<StratData>(StratData.class,new Long(StrategyDataIdString))));  
		}	
	}
	
}
