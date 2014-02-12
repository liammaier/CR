package edu.uoregon.models;

import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.util.DAOBase;

import edu.uoregon.models.caret.CaretBook;
import edu.uoregon.models.caret.CaretContent;
import edu.uoregon.models.caret.UserCaretBook;
import edu.uoregon.models.caret.CaretBookContent;
import edu.uoregon.models.groups.Group;
import edu.uoregon.models.groups.GroupAccessRequest;
import edu.uoregon.models.groups.GroupBanList;
import edu.uoregon.models.groups.GroupInviteRequest;
import edu.uoregon.models.groups.GroupOption;
import edu.uoregon.models.groups.GroupStatRecord;
import edu.uoregon.models.groups.UserGroupRole;
import edu.uoregon.models.libraries.Assignment;
import edu.uoregon.models.libraries.Library;
import edu.uoregon.models.libraries.UserLibraryRole;
import edu.uoregon.models.reader.Comment;
import edu.uoregon.models.reader.Discussion;
import edu.uoregon.models.reader.GlossaryItem;
import edu.uoregon.models.reader.Highlight;
import edu.uoregon.models.reader.Note;
import edu.uoregon.models.reader.NoteIgnore;
import edu.uoregon.models.reader.Section;
import edu.uoregon.models.strategies.StratData;



public class DAO extends DAOBase {

	// register entity classes here
	static {
		ObjectifyService.register(Library.class);
		ObjectifyService.register(CaretContent.class);
		ObjectifyService.register(CaretBook.class);
		ObjectifyService.register(CaretBookContent.class);
		ObjectifyService.register(UserCaretBook.class);
		ObjectifyService.register(Content.class);
		ObjectifyService.register(Group.class);
		ObjectifyService.register(GroupAccessRequest.class);
		ObjectifyService.register(GroupOption.class);
		ObjectifyService.register(SaraUser.class);
		ObjectifyService.register(GroupInviteRequest.class);
		ObjectifyService.register(UserGroupRole.class);
		ObjectifyService.register(SaraLog.class);
		ObjectifyService.register(GroupBanList.class);
		ObjectifyService.register(UserLibraryRole.class);
		ObjectifyService.register(Discussion.class);
		ObjectifyService.register(Comment.class);
		ObjectifyService.register(Resource.class);
		ObjectifyService.register(Note.class);
		ObjectifyService.register(Highlight.class);
		ObjectifyService.register(NoteIgnore.class);
		ObjectifyService.register(FeedData.class);
		ObjectifyService.register(Assignment.class);
		ObjectifyService.register(Section.class);
		ObjectifyService.register(GroupStatRecord.class);
		ObjectifyService.register(UserSectionGroupStat.class);
		ObjectifyService.register(UserSectionStat.class);
		ObjectifyService.register(StratData.class);
		ObjectifyService.register(Question.class);
		ObjectifyService.register(Answer.class);
		ObjectifyService.register(GlossaryItem.class);
		ObjectifyService.register(Option.class);
		ObjectifyService.register(UserImage.class);
		ObjectifyService.register(Image.class);
		ObjectifyService.register(UserContentProgress.class);
		ObjectifyService.register(Reminder.class);

	}
	
}
