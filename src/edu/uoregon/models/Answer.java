package edu.uoregon.models;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Id;

import com.googlecode.objectify.*;
import com.googlecode.objectify.annotation.Cached;

@Cached
public class Answer implements Serializable {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 7717665134041863617L;
			
	@Id public Long id;
	public Key <SaraUser> user;
	public Key<Question> question;
	public boolean correct;
	public Long timeTaken;
	public Date time;
	
	// For Objectify
	@SuppressWarnings("unused")
	private Answer() {}
	
	public Answer(Key <SaraUser> user,Key<Question> question,boolean correct,Long timeTaken){
		this.user = user;
		this.question = question;
		this.correct = correct;
		this.timeTaken =timeTaken;
		this.time = new Date();
		
	}
}
