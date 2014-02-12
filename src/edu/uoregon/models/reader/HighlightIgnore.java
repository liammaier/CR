package edu.uoregon.models.reader;

import com.googlecode.objectify.*;
import com.googlecode.objectify.annotation.Cached;
import javax.persistence.Id;
import edu.uoregon.models.SaraUser;

@Cached
public class HighlightIgnore {
	@Id	public Long id;
	public Key<Highlight> highlight;
	public Key<SaraUser> user;

	public HighlightIgnore(Key<SaraUser> user , Key<Highlight> highlight){	
		this.highlight = highlight;
		this.user = user;
	}

	@SuppressWarnings("unused")
	private HighlightIgnore() {}

}
