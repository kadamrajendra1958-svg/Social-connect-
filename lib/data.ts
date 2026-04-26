export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  coverImage?: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  image?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  timestamp: Date;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface Notification {
  id: string;
  actor: User;
  type: 'like' | 'comment' | 'follow' | 'mention';
  post?: Partial<Post>;
  timestamp: Date;
  isRead: boolean;
}

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    handle: 'sarahj_',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    bio: 'Product Designer | Coffee Enthusiast ☕️',
    followers: 1240,
    following: 850,
    coverImage: 'https://picsum.photos/seed/sarah/800/300'
  },
  {
    id: '2',
    name: 'Alex Chen',
    handle: 'alexc_dev',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    bio: 'Building the future of web. Full-stack dev.',
    followers: 8900,
    following: 420,
  },
  {
    id: '3',
    name: 'Maya Rodriguez',
    handle: 'mayaphotos',
    avatar: 'https://i.pravatar.cc/150?u=maya',
    bio: 'Capturing moments worldwide 📸',
    followers: 45000,
    following: 120,
  }
];

export const CURRENT_USER = MOCK_USERS[0];

export const MOCK_POSTS: Post[] = [
  {
    authorId: '2',
    id: 'p1',
    author: MOCK_USERS[1],
    content: 'Just finished rebuilding the entire application stack. Next.js App Router combined with Tailwind CSS is an absolute game-changer for developer velocity! 🚀',
    likesCount: 142,
    commentsCount: 24,
    sharesCount: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    isLiked: false,
    isSaved: true
  },
  {
    authorId: '3',
    id: 'p2',
    author: MOCK_USERS[2],
    content: 'Sunset in Kyoto today was absolutely unreal. The colors were incredible. Nature never ceases to amaze me.',
    image: 'https://picsum.photos/seed/kyoto/600/400',
    likesCount: 892,
    commentsCount: 65,
    sharesCount: 45,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    isLiked: true,
    isSaved: false
  },
  {
    authorId: '1',
    id: 'p3',
    author: MOCK_USERS[0],
    content: 'Does anyone have good recommendations for a reliable ergonomic office chair? My back is starting to complain after long coding sessions. 🪑🤕',
    likesCount: 56,
    commentsCount: 112,
    sharesCount: 4,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isLiked: false,
    isSaved: false
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    actor: MOCK_USERS[1],
    type: 'like',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isRead: false
  },
  {
    id: 'n2',
    actor: MOCK_USERS[2],
    type: 'follow',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: true
  },
  {
    id: 'n3',
    actor: MOCK_USERS[2],
    type: 'comment',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    isRead: true
  }
];
