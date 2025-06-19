
import React from 'react';
import { Post } from '../../types';
import Avatar from '../UI/Avatar';
import { format } from 'date-fns'; 

interface FeedCardProps {
  post: Post;
}

const FeedCard: React.FC<FeedCardProps> = ({ post }) => {
  return (
    <div className="bg-bgSurface shadow-sm rounded-lg border border-borderLight overflow-hidden mb-4"> {/* Reduced mb-6 to mb-4 */}
      <div className="p-4"> {/* Reduced p-6 to p-4 */}
        <div className="flex items-center mb-3"> {/* Reduced mb-4 to mb-3 */}
          <Avatar src={post.authorAvatarUrl} alt={post.authorName} size="md" />
          <div className="ml-3"> {/* Reduced ml-4 to ml-3 */}
            <h3 className="text-md font-semibold text-textDisplay">{post.authorName}</h3> {/* Changed to text-md */}
            <p className="text-xs text-textSubtle">
              {format(new Date(post.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <h4 className="text-lg font-semibold text-textBody mb-2">{post.title}</h4> {/* Changed color, reduced font to lg */}
        <p className="text-textBody whitespace-pre-line mb-3 text-sm">{post.content}</p> {/* Changed color, text-sm */}
        {post.mediaUrl && post.mediaType === 'image' && (
          <div className="my-3 rounded-md overflow-hidden border border-borderLight"> {/* Reduced margin, rounded-md */}
            <img src={post.mediaUrl} alt={post.title} className="w-full h-auto object-cover max-h-80" /> {/* Reduced max-h */}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedCard;