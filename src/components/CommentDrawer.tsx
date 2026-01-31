"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Heart, Send } from "lucide-react";

interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  isLiked: boolean;
}

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  commentCount: number;
}

const DUMMY_COMMENTS: Comment[] = [
  {
    id: "1",
    username: "monad_whale",
    avatar: "MW",
    text: "This is insane! Monad is going to change everything",
    time: "2m ago",
    likes: 234,
    isLiked: false,
  },
  {
    id: "2",
    username: "crypto_sarah",
    avatar: "CS",
    text: "The speed on this network is unreal",
    time: "5m ago",
    likes: 89,
    isLiked: true,
  },
  {
    id: "3",
    username: "web3_builder",
    avatar: "WB",
    text: "Finally a TikTok that actually pays creators properly",
    time: "12m ago",
    likes: 567,
    isLiked: false,
  },
  {
    id: "4",
    username: "nft_collector",
    avatar: "NC",
    text: "Just unlocked the exclusive content, totally worth it!",
    time: "18m ago",
    likes: 123,
    isLiked: false,
  },
  {
    id: "5",
    username: "defi_maxi",
    avatar: "DM",
    text: "The UI is so smooth, feels like a native app",
    time: "25m ago",
    likes: 45,
    isLiked: false,
  },
  {
    id: "6",
    username: "purple_enjoyer",
    avatar: "PE",
    text: "Purple is the new black",
    time: "32m ago",
    likes: 312,
    isLiked: true,
  },
  {
    id: "7",
    username: "based_dev",
    avatar: "BD",
    text: "How do I become a creator on here?",
    time: "45m ago",
    likes: 78,
    isLiked: false,
  },
  {
    id: "8",
    username: "anon_user",
    avatar: "AU",
    text: "LFG! This is the future of social media",
    time: "1h ago",
    likes: 890,
    isLiked: false,
  },
];

export default function CommentDrawer({ isOpen, onClose, commentCount }: CommentDrawerProps) {
  const [comments, setComments] = useState<Comment[]>(DUMMY_COMMENTS);
  const [newComment, setNewComment] = useState("");

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Close drawer if dragged down more than 100px
    if (info.offset.y > 100) {
      onClose();
    }
  };

  const toggleCommentLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      username: "you",
      avatar: "YU",
      text: newComment,
      time: "Just now",
      likes: 0,
      isLiked: false,
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - semi-transparent to see video */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 h-[60vh] z-50 flex flex-col"
          >
            {/* Drawer Content */}
            <div className="flex flex-col h-full bg-black/90 backdrop-blur-xl rounded-t-3xl overflow-hidden border-t border-white/10">
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 bg-white/30 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10">
                <div className="w-10" /> {/* Spacer for centering */}
                <h2 className="text-white font-semibold text-base">
                  {commentCount} Comments
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-hide">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5F31E8] to-[#7C4DFF] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {comment.avatar}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 text-sm font-medium">
                          @{comment.username}
                        </span>
                        <span className="text-white/30 text-xs">
                          {comment.time}
                        </span>
                      </div>
                      <p className="text-white text-sm mt-0.5 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>

                    {/* Like Button */}
                    <button
                      onClick={() => toggleCommentLike(comment.id)}
                      className="flex flex-col items-center gap-0.5 flex-shrink-0 pt-1"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          comment.isLiked
                            ? "fill-red-500 text-red-500"
                            : "text-white/40"
                        }`}
                      />
                      <span className="text-white/40 text-[10px]">
                        {comment.likes}
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Input Field */}
              <div className="p-4 border-t border-white/10 bg-black/50">
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">YU</span>
                  </div>

                  {/* Input */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                      placeholder="Add a comment..."
                      className="w-full bg-white/10 text-white placeholder-white/40 text-sm px-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-[#5F31E8]/50 transition-all"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    className="w-9 h-9 rounded-full bg-[#5F31E8] hover:bg-[#7C4DFF] disabled:bg-white/10 disabled:text-white/30 flex items-center justify-center transition-colors"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
