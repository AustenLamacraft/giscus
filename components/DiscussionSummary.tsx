import { ReactNode } from 'react';
import { useDateFormatter, useGiscusTranslation, useRelativeTimeFormatter } from '../lib/i18n';
import { IGiscussion } from '../lib/types/adapter';
import cheerio from 'cheerio';

interface IDiscussionProps {
  children?: ReactNode;
  discussion: IGiscussion;
}

export function DiscussionSummary({ children, discussion: { discussion } }: IDiscussionProps) {
  const { t } = useGiscusTranslation();
  const formatDate = useDateFormatter();
  const formatDateDistance = useRelativeTimeFormatter();

  const comment = discussion.comments[0];
  const discussionHref = cheerio.load(discussion.bodyHTML)('a')[0].attribs.href;
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
        <div className={`w-full min-w-0`}>
          <div className="gsc-comment-header">
            <div className="gsc-comment-author" style={{ whiteSpace: 'pre-wrap' }}>
              <a
                rel="nofollow noopener noreferrer"
                target="_blank"
                href={comment.author.url}
                className="gsc-comment-author-avatar"
              >
                <img
                  className="mr-2 rounded-full"
                  src={comment.author.avatarUrl}
                  width="30"
                  height="30"
                  alt={`@${comment.author.login}`}
                />
                <span className="font-semibold link-primary">{comment.author.login}</span>
              </a>
              {comment.authorAssociation !== 'NONE' ? (
                <div className="hidden ml-2 text-xs sm:inline-flex">
                  <span
                    className={`px-1 ml-1 capitalize border rounded-md ${
                      comment.viewerDidAuthor ? 'color-box-border-info' : 'color-label-border'
                    }`}
                  >
                    {t(comment.authorAssociation)}
                  </span>
                </div>
              ) : null}
              {' commented '}
              <time
                className="whitespace-nowrap"
                title={formatDate(comment.createdAt)}
                dateTime={comment.createdAt}
              >
                {formatDateDistance(comment.createdAt)}
              </time>
            </div>
            <div className="flex">
              {comment.lastEditedAt ? (
                <button
                  className="color-text-secondary gsc-comment-edited"
                  title={t('lastEditedAt', { date: formatDate(comment.lastEditedAt) })}
                >
                  {t('edited')}
                </button>
              ) : null}
            </div>
            <span className="text-xs color-text-tertiary">
              {t('replies', { count: comment.replyCount, plus: '' })}
            </span>
          </div>
          <div
            className={`markdown gsc-comment-content${
              comment.isMinimized ? ' minimized color-bg-tertiary border-color-primary' : ''
            }`}
          >
            <a
              rel="nofollow noopener noreferrer"
              target="_blank"
              href={discussionHref}
              className="ml-2 link"
            >
              {discussion.title}
            </a>
          </div>
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
