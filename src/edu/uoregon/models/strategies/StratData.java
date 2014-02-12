package edu.uoregon.models.strategies;

import java.util.Date;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;

import edu.uoregon.models.SaraUser;

//this is the user strat relationship
@Cached
public class StratData {

	@Id public Long id; // id's of type Long are auto-generated

	public Key<SaraUser> user;
	public long content;
	public String strategy;
	public String strategyData;
	
	
	public Date	timestamp; 

	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private StratData() {}
	
	public StratData(Key<SaraUser> user, long content,String strategy, String strategyData) {
		this.content = content;
		this.user = user;
		this.strategy = strategy;
		this.strategyData = strategyData;
		this.timestamp = new Date();
	}
	public StratData(Key<SaraUser> user,long content,String strategy) {
		this.content = content;
		this.user = user;
		this.strategyData = "";
		this.strategy = strategy;
		this.timestamp = new Date();
	}
	
	public void update (String strategyData) {

		this.strategyData = strategyData;
		this.timestamp = new Date();
	}	

	
}