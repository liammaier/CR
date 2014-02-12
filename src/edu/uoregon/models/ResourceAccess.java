package edu.uoregon.models;

import java.io.Serializable;
import com.googlecode.objectify.*;
import com.googlecode.objectify.annotation.Cached;

import javax.persistence.Id;

@Cached
public class ResourceAccess implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	@Id public Long id;
	public Key<SaraUser> user;
	public Key<Resource> resource;
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private ResourceAccess() {}
	
	public ResourceAccess(Key<Resource> resource, Key<SaraUser> user) {
		this.resource = resource;
		this.user = user;
	}
	
	
}
