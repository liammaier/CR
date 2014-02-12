package edu.uoregon.models;

import java.io.Serializable;
import javax.persistence.Id;

import com.googlecode.objectify.*;
import com.googlecode.objectify.annotation.Cached;

@Cached
public class Question implements Serializable {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 4628213328465841212L;
	@Id public Long id;
	public Key <Content> content;
	public String question;
	public boolean answer;
	public boolean practice;
	
	// For Objectify
	@SuppressWarnings("unused")
	private Question() {}
	
	public Question(Key <Content> content,String question,boolean answer,boolean practice){
		this.content = content;
		this.question = question;
		this.answer = answer;
		this.practice = practice;
	}
}
