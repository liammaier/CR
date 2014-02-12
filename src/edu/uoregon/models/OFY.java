package edu.uoregon.models;

import com.googlecode.objectify.Objectify;

public class OFY {
	
	private static final DAO dao = new DAO();
	
	private static final Objectify ofy = dao.ofy();
	
	private OFY (){	}
	
	public static Objectify getOFY(){
		return ofy;
	}
	
}
