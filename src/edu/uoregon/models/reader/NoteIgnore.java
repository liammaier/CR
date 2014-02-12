package edu.uoregon.models.reader;

import com.googlecode.objectify.*;
import com.googlecode.objectify.annotation.Cached;
import javax.persistence.Id;
import edu.uoregon.models.SaraUser;

@Cached
public class NoteIgnore {
	@Id	public Long id;
	public Key<Note> note;
	public Key<SaraUser> user;

	public NoteIgnore(Key<SaraUser> user , Key<Note> note){	
		this.note = note;
		this.user = user;
	}

	@SuppressWarnings("unused")
	private NoteIgnore() {}

}
