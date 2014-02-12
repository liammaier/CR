package edu.uoregon.models;

import java.util.Date;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;

import edu.uoregon.models.groups.Group;
import edu.uoregon.models.reader.Section;

@Cached
public class FeedData {

	@Id private Long id;
	private String type;
	private Key<SaraUser> user;
	private Key<Group> group;
	private Key<Section> section;
	private Key<SaraUser> targetUser;
	@SuppressWarnings("rawtypes")
	private Key targetObject;
	private Date time;
	
	@SuppressWarnings("unused")
	private FeedData(){}

	public FeedData(String type, Key<SaraUser> user, Key<Group> group, Key<Section> section, 
			Key<SaraUser> targetUser, @SuppressWarnings("rawtypes") Key targetObject)
	{
		this.targetObject = targetObject;
		this.type = type;
		this.user = user;
		this.group = group;
		this.section = section;
		this.targetUser = targetUser;
		this.targetObject = targetObject;
		this.time = new Date();
	}


	//standard getter methods
	public String getType(){return type;}
	public Key<SaraUser> getUser() {return user;}
	public Key<Group> getGroup() {return group;}
	public Key<Section> getDocument() {return section;}
	public Key<SaraUser> getTargetUser() {return targetUser;}
	@SuppressWarnings("unchecked")
	public Key<SaraUser> getTargetObject() {return targetObject;}
	public Date getTime() {return time;}

}
