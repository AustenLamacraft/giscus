import { ReactNode } from 'react';
import { useDateFormatter, useGiscusTranslation, useRelativeTimeFormatter } from '../lib/i18n';
import { IComment, IReply, IGiscussion } from '../lib/types/adapter';
import cheerio from 'cheerio';
import { last, prev } from 'cheerio/lib/api/traversing';

interface IDiscussionProps {
  children?: ReactNode;
  discussion: IGiscussion;
}

export function DiscussionSummary({ children, discussion: { discussion } }: IDiscussionProps) {
  const { t } = useGiscusTranslation();
  const formatDate = useDateFormatter();
  const formatDateDistance = useRelativeTimeFormatter();

  const { totalCommentCount, totalReplyCount } = discussion;

  const commentOrLastReply = (comment: IComment) => {
    return comment.replies[comment.replies.length - 1] || comment;
  };

  const latestComment = discussion.comments.reduce((prev: IComment | IReply, curr: IComment) => {
    if (
      Date.parse(prev.lastEditedAt || prev.createdAt) <
      Date.parse(curr.lastEditedAt || curr.createdAt)
    ) {
      return commentOrLastReply(curr);
    }
    return prev;
  }, commentOrLastReply(discussion.comments[0]));

  const discussionHref = cheerio.load(discussion.bodyHTML)('a')[0]?.attribs.href;
  const discussionDescription = cheerio.load(discussion.bodyHTML)('p').contents().first().text();
  // const [backPage, setBackPage] = useState(0);

  // const replies = comment.replies.slice(-5 - backPage * 50);
  // const remainingReplies = comment.replyCount - replies.length;

  // const hasNextPage = replies.length < comment.replies.length;
  // const hasUnfetchedReplies = !hasNextPage && remainingReplies > 0;

  // const { token } = useContext(AuthContext);

  // const updateReactions = useCallback(
  //   (reaction: Reaction, promise: Promise<unknown>) =>
  //     onCommentUpdate(updateCommentReaction(comment, reaction), promise),
  //   [comment, onCommentUpdate],
  // );

  // const incrementBackPage = () => setBackPage(backPage + 1);

  // const upvote = useCallback(() => {
  //   const upvoteCount = comment.viewerHasUpvoted
  //     ? comment.upvoteCount - 1
  //     : comment.upvoteCount + 1;

  //   const promise = toggleUpvote(
  //     { upvoteInput: { subjectId: comment.id } },
  //     token,
  //     comment.viewerHasUpvoted,
  //   );

  //   onCommentUpdate(
  //     {
  //       ...comment,
  //       upvoteCount,
  //       viewerHasUpvoted: !comment.viewerHasUpvoted,
  //     },
  //     promise,
  //   );
  // }, [comment, onCommentUpdate, token]);

  // const [renderedComment, setRenderedComment] = useState(undefined);
  // useEffect(() => {
  //   renderMarkdown(comment.body).then((value) => {
  //     setRenderedComment(processCommentBody(value));
  //   });
  // }, [comment.body]);

  // const hidden = !!comment.deletedAt || comment.isMinimized;

  return (
    <>
      <div className="gsc-comment">
        <div className={'w-full min-w-0'}>
          <div
            className={`markdown gsc-comment-header${
              latestComment.isMinimized ? ' minimized color-bg-tertiary border-color-primary' : ''
            }`}
          >
            {discussionHref ? (
              <a
                rel="nofollow noopener noreferrer"
                target="_blank"
                href={discussionHref}
                className="ml-2 link"
              >
                {discussionDescription}
              </a>
            ) : (
              <span>{discussionDescription}</span>
            )}
          </div>
          <div className="gsc-comment-header">
            <div className="gsc-comment-author" style={{ whiteSpace: 'pre-wrap' }}>
              <a
                rel="nofollow noopener noreferrer"
                target="_blank"
                href={latestComment.author.url}
                className="gsc-comment-author-avatar"
              >
                <img
                  className="mr-2 rounded-full"
                  src={latestComment.author.avatarUrl}
                  width="30"
                  height="30"
                  alt={`@${latestComment.author.login}`}
                />
                <span className="font-semibold link-primary">{latestComment.author.login}</span>
              </a>
              <div className="hidden ml-2 sm:inline-flex">
                {latestComment.authorAssociation !== 'NONE' ? (
                  <span
                    className={`text-xs px-1 ml-1 capitalize border rounded-md ${
                      latestComment.viewerDidAuthor ? 'color-box-border-info' : 'color-label-border'
                    }`}
                  >
                    {t(latestComment.authorAssociation)}
                  </span>
                ) : null}
                {' commented'}
              </div>
              {', '}
              <time
                className="whitespace-nowrap"
                title={formatDate(latestComment.createdAt)}
                dateTime={latestComment.createdAt}
              >
                {formatDateDistance(latestComment.createdAt)}
              </time>
            </div>
            <span className="text-xs color-text-tertiary">
              {t('comments', { count: totalCommentCount, plus: '' })}
              {', '}
              {t('replies', { count: totalReplyCount, plus: '' })}
            </span>
          </div>
          {/* <div className="gsc-comment-header">
            
            <div className="flex">
              {latestComment.lastEditedAt ? (
                <button
                  className="color-text-secondary gsc-comment-edited"
                  title={t('lastEditedAt', { date: formatDate(latestComment.lastEditedAt) })}
                >
                  {t('edited')}
                </button>
              ) : null}
            </div>
          </div> */}
          {/* <div
            className={`markdown gsc-comment-content${
              comment.isMinimized ? ' minimized color-bg-tertiary border-color-primary' : ''
            }`}
          >
            {discussionHref ? (
              <a
                rel="nofollow noopener noreferrer"
                target="_blank"
                href={discussionHref}
                className="ml-2 link"
              >
                {discussionDescription}
              </a>
            ) : (
              <span>{discussionDescription}</span>
            )}
          </div> */}
          {children}
          {/* {!comment.isMinimized ? (
            // <div className="gsc-comment-footer">
              <div className="gsc-comment-replies-count">
                <span className="text-xs color-text-tertiary">
                  {t('replies', { count: comment.replyCount, plus: '' })}
                </span>
              </div>
            // </div>
          ) : null} */}
        </div>
      </div>
      <hr />
    </>
  );
}
