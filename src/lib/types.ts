export interface Profile {
    user_id: string;
    handle: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    specialty: string | null;
    country: string | null;
    website: string | null;
    role: 'member' | 'moderator' | 'admin';
    created_at: string;
    updated_at: string;
}

export interface Category {
    slug: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    sort_order: number;
}

export interface Post {
    id: string;
    author_id: string;
    category_slug: string;
    title: string;
    body: string;
    attachment_urls: string[];
    like_count: number;
    comment_count: number;
    is_pinned: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    body: string;
    is_deleted: boolean;
    created_at: string;
}

export interface PostWithAuthor extends Post {
    author: Profile;
    category: Category;
}

export interface CommentWithAuthor extends Comment {
    author: Profile;
}
