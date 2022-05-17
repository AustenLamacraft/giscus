import { useContext, useEffect, useCallback, useRef, useState, ChangeEvent } from 'react';
import { AuthContext, ConfigContext } from '../lib/context';
import { useGiscusTranslation } from '../lib/i18n';
import { useDiscussionsSummary } from '../services/giscus/discussions';
import { DiscussionSummary } from './DiscussionSummary';

interface ISummaryProps {
  onError?: (message: string) => void;
}

export default function Summary({ onError }: ISummaryProps) {
  const { token } = useContext(AuthContext);
  const { t } = useGiscusTranslation();
  const { repo, discussionsSummary, categoryId, category } = useContext(ConfigContext);
  // const [orderBy, setOrderBy] = useState<CommentOrder>(defaultCommentOrder);
  const query = { repo, number: discussionsSummary, categoryId, category };

  const [term, setTerm] = useState('');
  const { ...data } = useDiscussionsSummary({ ...query, term }, token);

  useEffect(() => {
    if (data.error && onError) {
      onError(data.error?.message);
    }
  }, [data.error, onError]);

  const textarea = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (input === '') {
      setTerm('');
    }
  }, [input]);


  // useEffect(() => {
  //   if (!emitMetadata || !data.discussion.id) return;
  //   const message: IMetadataMessage = {
  //     discussion: data.discussion,
  //     viewer: data.viewer,
  //   };
  //   emitData(message, origin);
  // }, [data.discussion, data.viewer, emitMetadata, origin]);

  // const shouldCreateDiscussion = data.isNotFound && !number;
  // const shouldShowBranding = !!data.discussion.url;

  // const shouldShowReplyCount =
  //   !data.error && !data.isNotFound && !data.isLoading && data.totalReplyCount > 0;

  // const shouldShowCommentBox =
  //   (data.isRateLimited && !token) ||
  //   (!data.isLoading && !data.isLocked && (!data.error || (data.isNotFound && !number)));

  // if (data.isLoading) {
  //   return (
  //     <div className="gsc-loading">
  //       <div className="gsc-loading-image" />
  //       <span className="gsc-loading-text color-fg-muted">{t('loadingComments')}</span>
  //     </div>
  //   );
  // }


  return (
    <div className="color-text-primary gsc-main">
      <div className="gsc-comments">
        <div className="gsc-header">
          <div className="gsc-left-header">
            <h3 className="gsc-comments-count">Latest comments</h3>
          </div>
        </div>
        <div className="gsc-comment-box-main">
          <textarea
            className="form-control input-contrast gsc-comment-box-search"
            placeholder={'Search comments'}
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={false}
            ref={textarea}
            onKeyPress={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                setTerm(input);
              }
            }}
          ></textarea>
        </div>
        {data.isLoading ? (
          <div className="gsc-loading">
            <div className="gsc-loading-image" />
            <span className="gsc-loading-text color-fg-muted">{t('loadingComments')}</span>
          </div>
        ) : (
          <div className="gsc-timeline">
            {!data.isLoading
              ? data?.discussions
                  ?.filter((discussion) => {
                    const comment = discussion.discussion.comments[0];
                    return !!comment && !comment.deletedAt;
                  })
                  .map((discussion) => (
                    <DiscussionSummary key={discussion.discussion.id} discussion={discussion} />
                  ))
              : null}
          </div>
        )}
      </div>
    </div>
  );
}
