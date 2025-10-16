// Interactive Newsfeed - Facebook-style Social Feed with Visitor Management
class InteractiveNewsfeed {
    constructor() {
        this.posts = [];
        this.visitors = [];
        this.currentVisitor = null;
        this.comments = [];
        this.reactions = [];
        this.trendingTopics = [];
        this.isLoading = false;
        this.currentPage = 1;
        this.postsPerPage = 10;
        
        this.init();
    }

    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.renderPosts();
        this.renderTrendingTopics();
        this.renderRecentActivity();
        this.checkCurrentVisitor();
        this.startRealTimeUpdates();
        this.initializeFacebookWidget();
    }

    // Sample Data for Demo
    loadSampleData() {
        // Sample visitors
        this.visitors = [
            {
                id: 1,
                name: "Sarah Johnson",
                email: "sarah@example.com",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face",
                interests: ["Technology", "Business"],
                joinedAt: new Date('2024-01-15'),
                lastActive: new Date(),
                status: 'active',
                isAdmin: false
            },
            {
                id: 2,
                name: "Mike Chen",
                email: "mike@example.com",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                interests: ["Marketing", "Design"],
                joinedAt: new Date('2024-01-10'),
                lastActive: new Date(),
                status: 'active',
                isAdmin: true
            },
            {
                id: 3,
                name: "Lisa Martinez",
                email: "lisa@example.com",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                interests: ["Lifestyle", "Travel"],
                joinedAt: new Date('2024-01-08'),
                lastActive: new Date(),
                status: 'active',
                isAdmin: false
            }
        ];

        // Sample posts
        this.posts = [
            {
                id: 1,
                userId: 1,
                content: "Just launched our new product! 🚀 Really excited to share this with the community. What do you all think about the latest trends in social engagement?",
                media: [
                    {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop',
                        caption: 'Our new product launch'
                    }
                ],
                hashtags: ['#ProductLaunch', '#SocialEngagement', '#Community'],
                location: null,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                likes: 24,
                comments: 8,
                shares: 3,
                isLiked: false,
                isShared: false,
                visibility: 'public',
                status: 'active'
            },
            {
                id: 2,
                userId: 2,
                content: "Great discussion at today's marketing meetup! Learned so much about community building and engagement strategies. Thanks to everyone who attended! 🙌",
                media: [],
                hashtags: ['#Marketing', '#CommunityBuilding', '#Networking'],
                location: 'Tech Hub Conference Center',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                likes: 18,
                comments: 5,
                shares: 2,
                isLiked: true,
                isShared: false,
                visibility: 'public',
                status: 'active'
            },
            {
                id: 3,
                userId: 3,
                content: "Beautiful sunrise this morning! Sometimes we need to step back and appreciate the simple things in life. What are you grateful for today? 🌅",
                media: [
                    {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
                        caption: 'Morning sunrise'
                    }
                ],
                hashtags: ['#Gratitude', '#Morning', '#Mindfulness'],
                location: null,
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                likes: 31,
                comments: 12,
                shares: 7,
                isLiked: false,
                isShared: false,
                visibility: 'public',
                status: 'active'
            }
        ];

        // Sample comments
        this.comments = [
            {
                id: 1,
                postId: 1,
                userId: 2,
                content: "This looks amazing! Congratulations on the launch! 🎉",
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                likes: 5,
                isLiked: false,
                replies: []
            },
            {
                id: 2,
                postId: 1,
                userId: 3,
                content: "Love the design! How long did it take to develop?",
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                likes: 3,
                isLiked: false,
                replies: [
                    {
                        id: 101,
                        commentId: 2,
                        userId: 1,
                        content: "Thanks! It took about 6 months of development.",
                        timestamp: new Date(Date.now() - 15 * 60 * 1000),
                        likes: 2,
                        isLiked: false
                    }
                ]
            },
            {
                id: 3,
                postId: 2,
                userId: 1,
                content: "Wish I could have made it! Will there be a recording?",
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                likes: 4,
                isLiked: true,
                replies: []
            }
        ];

        // Sample trending topics
        this.trendingTopics = [
            { topic: '#SocialEngagement', count: 45 },
            { topic: '#CommunityBuilding', count: 38 },
            { topic: '#ProductLaunch', count: 32 },
            { topic: '#MarketingTips', count: 28 },
            { topic: '#Networking', count: 24 }
        ];

        // Update current visitor if exists
        this.checkCurrentVisitor();
    }

    // Setup Event Listeners
    setupEventListeners() {
        // Post creator
        const postContent = document.getElementById('postContent');
        if (postContent) {
            postContent.addEventListener('input', (e) => {
                this.updateCharacterCount(e.target, 1000);
            });
        }

        // Media upload
        const mediaUploadZone = document.getElementById('mediaUploadZone');
        if (mediaUploadZone) {
            mediaUploadZone.addEventListener('click', () => {
                document.getElementById('mediaInput').click();
            });

            // Drag and drop
            mediaUploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                mediaUploadZone.classList.add('dragover');
            });

            mediaUploadZone.addEventListener('dragleave', () => {
                mediaUploadZone.classList.remove('dragover');
            });

            mediaUploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                mediaUploadZone.classList.remove('dragover');
                this.handleMediaUpload(e.dataTransfer.files);
            });
        }

        const mediaInput = document.getElementById('mediaInput');
        if (mediaInput) {
            mediaInput.addEventListener('change', (e) => {
                this.handleMediaUpload(e.target.files);
            });
        }

        // Visitor sign-up form
        const visitorForm = document.getElementById('visitorForm');
        if (visitorForm) {
            visitorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registerVisitor();
            });
        }

        // Comment form
        const commentContent = document.getElementById('commentContent');
        if (commentContent) {
            commentContent.addEventListener('input', (e) => {
                this.updateCharacterCount(e.target, 500);
            });
        }

        // Infinite scroll
        window.addEventListener('scroll', () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
                this.loadMorePosts();
            }
        });

        // Real-time updates
        this.startRealTimeUpdates();
    }

    // Check Current Visitor
    checkCurrentVisitor() {
        const savedVisitor = localStorage.getItem('currentVisitor');
        if (savedVisitor) {
            this.currentVisitor = JSON.parse(savedVisitor);
            this.updateUserInterface();
        }
    }

    // Update User Interface
    updateUserInterface() {
        if (this.currentVisitor) {
            // Update user card
            const userCard = document.getElementById('userCard');
            if (userCard) {
                userCard.innerHTML = `
                    <div class="user-profile-display">
                        <img src="${this.currentVisitor.avatar}" alt="${this.currentVisitor.name}" class="user-avatar">
                        <div class="user-details">
                            <span class="user-name">${this.currentVisitor.name}</span>
                            <span class="post-visibility">
                                <i class="fas fa-globe"></i> Public
                            </span>
                        </div>
                    </div>
                `;
            }

            // Update comment user name
            const commentUserName = document.getElementById('commentUserName');
            if (commentUserName) {
                commentUserName.textContent = this.currentVisitor.name;
            }

            // Update current user name in post creator
            const currentUserName = document.getElementById('currentUserName');
            if (currentUserName) {
                currentUserName.textContent = this.currentVisitor.name;
            }

            // Show management panel if admin
            if (this.currentVisitor.isAdmin) {
                const managementPanel = document.getElementById('managementPanel');
                if (managementPanel) {
                    managementPanel.style.display = 'block';
                }
            }
        }
    }

    // Visitor Sign-up Functions
    showVisitorSignUp() {
        document.getElementById('visitorSignUpModal').style.display = 'flex';
    }

    hideVisitorSignUp() {
        document.getElementById('visitorSignUpModal').style.display = 'none';
        document.getElementById('visitorForm').reset();
    }

    registerVisitor() {
        const name = document.getElementById('visitorName').value.trim();
        const email = document.getElementById('visitorEmail').value.trim();
        const interests = document.getElementById('visitorInterests').value.trim();
        const newsletterOptIn = document.getElementById('newsletterOptIn').checked;
        const termsAccepted = document.getElementById('termsAccepted').checked;

        if (!name || !email) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (!termsAccepted) {
            this.showNotification('Please accept the terms of service', 'error');
            return;
        }

        // Check if email already exists
        const existingVisitor = this.visitors.find(v => v.email === email);
        if (existingVisitor) {
            this.currentVisitor = existingVisitor;
            this.updateUserInterface();
            this.showNotification('Welcome back! You are now logged in.', 'success');
        } else {
            // Create new visitor
            const newVisitor = {
                id: Date.now(),
                name: name,
                email: email,
                avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=150&h=150&fit=crop&crop=face`,
                interests: interests ? interests.split(',').map(i => i.trim()) : [],
                joinedAt: new Date(),
                lastActive: new Date(),
                status: 'active',
                isAdmin: false,
                preferences: {
                    newsletter: newsletterOptIn,
                    notifications: true
                }
            };

            this.visitors.push(newVisitor);
            this.currentVisitor = newVisitor;
            this.updateUserInterface();
            this.showNotification('Welcome to our community! You are now registered.', 'success');
        }

        // Save to localStorage
        localStorage.setItem('currentVisitor', JSON.stringify(this.currentVisitor));

        this.hideVisitorSignUp();
        this.updateCommunityStats();
        this.renderSuggestedUsers();
    }

    // Post Creation Functions
    showPostCreator() {
        if (!this.currentVisitor) {
            this.showNotification('Please sign up first to create posts', 'warning');
            this.showVisitorSignUp();
            return;
        }
        document.getElementById('postCreator').style.display = 'block';
        document.getElementById('postContent').focus();
    }

    hidePostCreator() {
        document.getElementById('postCreator').style.display = 'none';
        document.getElementById('postContent').value = '';
        document.getElementById('mediaPreview').innerHTML = '';
        this.updateCharacterCount(document.getElementById('postContent'), 1000);
    }

    handleMediaUpload(files) {
        const mediaPreview = document.getElementById('mediaPreview');
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const mediaItem = document.createElement('div');
                    mediaItem.className = 'media-item';
                    
                    if (file.type.startsWith('image/')) {
                        mediaItem.innerHTML = `
                            <img src="${e.target.result}" alt="Uploaded media">
                            <button class="media-remove" onclick="this.parentElement.remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        `;
                    } else {
                        mediaItem.innerHTML = `
                            <video src="${e.target.result}" controls></video>
                            <button class="media-remove" onclick="this.parentElement.remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        `;
                    }
                    
                    mediaPreview.appendChild(mediaItem);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    publishPost() {
        if (!this.currentVisitor) {
            this.showNotification('Please sign up first to create posts', 'warning');
            return;
        }

        const content = document.getElementById('postContent').value.trim();
        if (!content) {
            this.showNotification('Please write something before posting', 'warning');
            return;
        }

        const mediaItems = Array.from(document.querySelectorAll('#mediaPreview .media-item')).map(item => {
            const mediaElement = item.querySelector('img, video');
            return {
                type: mediaElement.tagName.toLowerCase(),
                url: mediaElement.src,
                caption: ''
            };
        });

        const newPost = {
            id: Date.now(),
            userId: this.currentVisitor.id,
            content: content,
            media: mediaItems,
            hashtags: this.extractHashtags(content),
            location: null, // Could be extended with location picker
            timestamp: new Date(),
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false,
            isShared: false,
            visibility: 'public',
            status: 'active'
        };

        this.posts.unshift(newPost);
        this.hidePostCreator();
        this.renderPosts();
        this.updateCommunityStats();
        this.updateTrendingTopics();
        this.showNotification('Post published successfully!', 'success');
        
        // Add to recent activity
        this.addRecentActivity('post', this.currentVisitor.name, 'published a new post');
    }

    extractHashtags(text) {
        const hashtagRegex = /#[a-zA-Z0-9_]+/g;
        return text.match(hashtagRegex) || [];
    }

    // Post Rendering
    renderPosts() {
        const container = document.getElementById('postsFeed');
        if (!container) return;

        const postsToShow = this.posts.slice(0, this.currentPage * this.postsPerPage);

        if (postsToShow.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper fa-3x"></i>
                    <h3>No posts yet</h3>
                    <p>Be the first to share something with the community!</p>
                    <button class="btn btn-primary" onclick="showPostCreator()">
                        <i class="fas fa-plus"></i> Create First Post
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = postsToShow.map(post => this.createPostHTML(post)).join('');
        
        // Add event listeners for post interactions
        this.setupPostEventListeners();
    }

    createPostHTML(post) {
        const user = this.visitors.find(v => v.id === post.userId);
        const timeAgo = this.getTimeAgo(post.timestamp);
        const comments = this.comments.filter(c => c.postId === post.id);

        return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-user-info">
                        <img src="${user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}" alt="${user?.name || 'User'}" class="post-user-avatar">
                        <div class="post-user-details">
                            <span class="post-user-name">${user?.name || 'Unknown User'}</span>
                            <span class="post-timestamp">${timeAgo}</span>
                            ${post.location ? `<span class="post-location"><i class="fas fa-map-marker-alt"></i> ${post.location}</span>` : ''}
                        </div>
                    </div>
                    <div class="post-menu">
                        <button class="post-menu-btn" onclick="newsfeed.togglePostMenu(${post.id})">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                        <div class="post-menu-dropdown" id="postMenu${post.id}">
                            <a href="#" class="post-menu-item" onclick="newsfeed.savePost(${post.id}); return false;">
                                <i class="fas fa-bookmark"></i> Save Post
                            </a>
                            <a href="#" class="post-menu-item" onclick="newsfeed.copyLink(${post.id}); return false;">
                                <i class="fas fa-link"></i> Copy Link
                            </a>
                            ${this.currentVisitor?.isAdmin ? `
                                <a href="#" class="post-menu-item" onclick="newsfeed.editPost(${post.id}); return false;">
                                    <i class="fas fa-edit"></i> Edit Post
                                </a>
                                <a href="#" class="post-menu-item" onclick="newsfeed.deletePost(${post.id}); return false;">
                                    <i class="fas fa-trash"></i> Delete Post
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="post-content">
                    <div class="post-text">${this.formatPostContent(post.content)}</div>
                    ${post.hashtags.length > 0 ? `
                        <div class="post-hashtags">
                            ${post.hashtags.map(tag => `<span class="post-hashtag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${post.media.length > 0 ? `
                        <div class="post-media">
                            ${post.media.map(media => `
                                ${media.type === 'image' ? 
                                    `<img src="${media.url}" alt="${media.caption || 'Post image'}" onclick="newsfeed.viewMedia('${media.url}')">` :
                                    `<video src="${media.url}" controls onclick="newsfeed.viewMedia('${media.url}')"></video>`
                                }
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="post-stats">
                    <div class="post-stats-left">
                        <span class="post-likes-count">${post.likes} likes</span>
                        <span class="post-comments-count">${post.comments} comments</span>
                        <span class="post-shares-count">${post.shares} shares</span>
                    </div>
                </div>
                
                <div class="post-actions-bar">
                    <button class="post-action ${post.isLiked ? 'liked' : ''}" onclick="newsfeed.toggleLike(${post.id})">
                        <i class="fas fa-thumbs-up"></i>
                        <span class="post-action-count">${post.likes}</span>
                        <span>Like</span>
                    </button>
                    <button class="post-action" onclick="newsfeed.showCommentModal(${post.id})">
                        <i class="fas fa-comment"></i>
                        <span class="post-action-count">${post.comments}</span>
                        <span>Comment</span>
                    </button>
                    <button class="post-action ${post.isShared ? 'active' : ''}" onclick="newsfeed.sharePost(${post.id})">
                        <i class="fas fa-share"></i>
                        <span class="post-action-count">${post.shares}</span>
                        <span>Share</span>
                    </button>
                </div>
                
                <div class="post-comments">
                    <div class="comments-header">
                        <span class="comments-count">${comments.length} comments</span>
                    </div>
                    
                    ${comments.slice(0, 3).map(comment => this.createCommentHTML(comment)).join('')}
                    
                    ${comments.length > 3 ? `
                        <div class="load-more-comments">
                            <button class="load-more-btn" onclick="newsfeed.loadMoreComments(${post.id})">
                                View ${comments.length - 3} more comments
                            </button>
                        </div>
                    ` : ''}
                    
                    <div class="comment-form">
                        <img src="${this.currentVisitor?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}" alt="${this.currentVisitor?.name || 'User'}" class="comment-form-avatar">
                        <div class="comment-form-content">
                            <textarea class="comment-input" placeholder="Write a comment..." maxlength="500" onkeypress="newsfeed.handleCommentKeypress(event, ${post.id})"></textarea>
                            <div class="comment-form-actions">
                                <div class="comment-form-buttons">
                                    <button class="emoji-btn" onclick="newsfeed.insertEmoji()" title="Add Emoji">
                                        <i class="fas fa-smile"></i>
                                    </button>
                                    <button class="photo-btn" onclick="newsfeed.attachPhotoToComment()" title="Add Photo">
                                        <i class="fas fa-camera"></i>
                                    </button>
                                </div>
                                <button class="post-comment-btn" onclick="newsfeed.publishComment(${post.id})">
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Post Interaction Functions
    setupPostEventListeners() {
        // Like buttons
        document.querySelectorAll('.post-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
            });
        });

        // Comment inputs
        document.querySelectorAll('.comment-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const postId = parseInt(e.target.closest('.post-card').dataset.postId);
                    this.publishComment(postId);
                }
            });
        });
    }

    handleCommentKeypress(event, postId) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.publishComment(postId);
        }
    }

    toggleLike(postId) {
        if (!this.currentVisitor) {
            this.showNotification('Please sign up to like posts', 'warning');
            return;
        }

        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.isLiked = !post.isLiked;
            post.likes += post.isLiked ? 1 : -1;
            this.renderPosts();
            this.showNotification(post.isLiked ? 'Post liked!' : 'Post unliked', 'success');
            this.addRecentActivity('like', this.currentVisitor.name, `liked ${post.userId === this.currentVisitor.id ? 'their own' : 'a'} post`);
        }
    }

    showCommentModal(postId) {
        if (!this.currentVisitor) {
            this.showNotification('Please sign up to comment', 'warning');
            return;
        }
        
        const modal = document.getElementById('commentModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.dataset.postId = postId;
            document.getElementById('commentContent').focus();
        }
    }

    hideCommentModal() {
        const modal = document.getElementById('commentModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('commentContent').value = '';
            this.updateCharacterCount(document.getElementById('commentContent'), 500);
        }
    }

    publishComment(postId) {
        if (!this.currentVisitor) {
            this.showNotification('Please sign up to comment', 'warning');
            return;
        }

        const commentContent = document.getElementById('commentContent')?.value.trim() || 
                             document.querySelector(`[data-post-id="${postId}"] .comment-input`)?.value.trim();

        if (!commentContent) {
            this.showNotification('Please write a comment', 'warning');
            return;
        }

        const newComment = {
            id: Date.now(),
            postId: postId,
            userId: this.currentVisitor.id,
            content: commentContent,
            timestamp: new Date(),
            likes: 0,
            isLiked: false,
            replies: []
        };

        this.comments.push(newComment);
        
        // Update post comment count
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.comments += 1;
        }

        this.hideCommentModal();
        this.renderPosts();
        this.showNotification('Comment published!', 'success');
        this.addRecentActivity('comment', this.currentVisitor.name, 'commented on a post');
    }

    sharePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.isShared = true;
            post.shares += 1;
            this.renderPosts();
            this.showNotification('Post shared!', 'success');
            
            // Copy to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(`Check out this post: ${post.content.substring(0, 100)}...`);
            }
        }
    }

    // Management Functions
    savePost(postId) {
        this.showNotification('Post saved to your collection!', 'success');
    }

    copyLink(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const link = `${window.location.origin}${window.location.pathname}?post=${postId}`;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(link);
                this.showNotification('Link copied to clipboard!', 'success');
            }
        }
    }

    editPost(postId) {
        this.showNotification('Edit functionality coming soon!', 'info');
    }

    deletePost(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            this.posts = this.posts.filter(p => p.id !== postId);
            this.comments = this.comments.filter(c => c.postId !== postId);
            this.renderPosts();
            this.updateCommunityStats();
            this.showNotification('Post deleted successfully', 'success');
        }
    }

    viewMedia(url) {
        window.open(url, '_blank');
    }

    loadMoreComments(postId) {
        this.showNotification('Loading more comments...', 'info');
        // In a real app, this would load more comments from the server
    }

    insertEmoji() {
        this.showNotification('Emoji picker coming soon!', 'info');
    }

    mentionUser() {
        this.showNotification('Mention functionality coming soon!', 'info');
    }

    addHashtag() {
        const input = document.querySelector('.comment-input:focus');
        if (input) {
            input.value += '#';
            input.focus();
        }
    }

    addLocation() {
        this.showNotification('Location feature coming soon!', 'info');
    }

    attachPhotoToComment() {
        this.showNotification('Photo attachment coming soon!', 'info');
    }

    // UI Helper Functions
    formatPostContent(content) {
        // Convert hashtags to links
        return content.replace(/#[a-zA-Z0-9_]+/g, (match) => {
            return `<span class="post-hashtag">${match}</span>`;
        });
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - new Date(timestamp);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    }

    updateCharacterCount(element, maxLength) {
        const current = element.value.length;
        const counter = element.parentElement.querySelector('.char-count');
        if (counter) {
            counter.textContent = `${current} / ${maxLength}`;
            counter.style.color = current > maxLength ? 'var(--error)' : 'var(--secondary-text)';
        }
    }

    togglePostMenu(postId) {
        const dropdown = document.getElementById(`postMenu${postId}`);
        if (dropdown) {
            dropdown.classList.toggle('show');
            
            // Close other dropdowns
            document.querySelectorAll('.post-menu-dropdown').forEach(menu => {
                if (menu.id !== `postMenu${postId}`) {
                    menu.classList.remove('show');
                }
            });
        }
    }

    // Community Stats
    updateCommunityStats() {
        document.getElementById('totalPosts').textContent = this.posts.filter(p => p.status === 'active').length;
        document.getElementById('totalMembers').textContent = this.visitors.filter(v => v.status === 'active').length;
        
        const totalInteractions = this.posts.reduce((sum, post) => {
            return sum + post.likes + post.comments + post.shares;
        }, 0);
        document.getElementById('totalInteractions').textContent = totalInteractions;
    }

    // Trending Topics
    renderTrendingTopics() {
        const container = document.getElementById('trendingList');
        if (container) {
            container.innerHTML = this.trendingTopics.map(topic => `
                <div class="trending-item" onclick="newsfeed.filterByTopic('${topic.topic}')">
                    <span class="trending-keyword">${topic.topic}</span>
                    <span class="trending-count">${topic.count}</span>
                </div>
            `).join('');
        }
    }

    filterByTopic(topic) {
        const filteredPosts = this.posts.filter(post => 
            post.hashtags.includes(topic) || post.content.includes(topic)
        );
        
        if (filteredPosts.length > 0) {
            this.renderFilteredPosts(filteredPosts);
            this.showNotification(`Filtered by ${topic}`, 'info');
        } else {
            this.showNotification(`No posts found for ${topic}`, 'info');
        }
    }

    renderFilteredPosts(filteredPosts) {
        const container = document.getElementById('postsFeed');
        if (container) {
            container.innerHTML = filteredPosts.map(post => this.createPostHTML(post)).join('');
            this.setupPostEventListeners();
        }
    }

    // Recent Activity
    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (container) {
            const recentActivity = [
                {
                    type: 'join',
                    user: 'Sarah Johnson',
                    action: 'joined the community',
                    time: '2 minutes ago'
                },
                {
                    type: 'post',
                    user: 'Mike Chen',
                    action: 'published a new post',
                    time: '5 minutes ago'
                },
                {
                    type: 'like',
                    user: 'Lisa Martinez',
                    action: 'liked a post',
                    time: '10 minutes ago'
                }
            ];

            container.innerHTML = recentActivity.map(activity => `
                <div class="activity-item">
                    <div class="activity-avatar">
                        <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">
                            <strong>${activity.user}</strong> ${activity.action}
                        </div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    getActivityIcon(type) {
        const icons = {
            'join': 'user-plus',
            'post': 'edit',
            'like': 'heart',
            'comment': 'comment',
            'share': 'share'
        };
        return icons[type] || 'circle';
    }

    addRecentActivity(type, user, action) {
        // Add to recent activity (could be extended to show real-time updates)
        console.log(`Activity: ${user} ${action}`);
    }

    // Suggested Users
    renderSuggestedUsers() {
        const container = document.getElementById('suggestedUsers');
        if (container && this.currentVisitor) {
            const suggestedUsers = this.visitors.filter(v => 
                v.id !== this.currentVisitor.id && 
                !this.currentVisitor.interests?.some(interest => v.interests?.includes(interest))
            ).slice(0, 3);

            container.innerHTML = suggestedUsers.map(user => `
                <div class="suggested-user">
                    <img src="${user.avatar}" alt="${user.name}" class="suggested-avatar">
                    <div class="suggested-info">
                        <div class="suggested-name">${user.name}</div>
                        <div class="suggested-interests">${user.interests?.join(', ') || 'New member'}</div>
                    </div>
                    <button class="connect-btn" onclick="newsfeed.connectWithUser(${user.id})">
                        Connect
                    </button>
                </div>
            `).join('');
        }
    }

    connectWithUser(userId) {
        this.showNotification('Connection request sent!', 'success');
    }

    // Load More Posts
    loadMorePosts() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        document.getElementById('loadMore').innerHTML = '<div class="loading-spinner"></div><p>Loading more posts...</p>';
        
        // Simulate loading delay
        setTimeout(() => {
            this.currentPage++;
            this.renderPosts();
            this.isLoading = false;
            document.getElementById('loadMore').innerHTML = `
                <button class="btn btn-outline" onclick="loadMorePosts()">
                    <i class="fas fa-chevron-down"></i> Load More Posts
                </button>
            `;
        }, 1500);
    }

    // Real-time Updates
    startRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.simulateRealTimeActivity();
        }, 30000);
    }

    simulateRealTimeActivity() {
        // Simulate new likes, comments, or posts
        if (Math.random() > 0.7 && this.posts.length > 0) {
            const randomPost = this.posts[Math.floor(Math.random() * this.posts.length)];
            randomPost.likes += Math.floor(Math.random() * 3) + 1;
            this.renderPosts();
        }
    }

    // Management Tools (for admins)
    showPostManagement() {
        this.showNotification('Post management coming soon!', 'info');
    }

    showUserManagement() {
        this.showNotification('User management coming soon!', 'info');
    }

    showAnalytics() {
        this.showNotification('Analytics dashboard coming soon!', 'info');
    }

    showModeration() {
        this.showNotification('Moderation tools coming soon!', 'info');
    }

    // Notification System
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} slide-in`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add notification styles
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 16px 20px;
                border-radius: 8px;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            }
            .notification-success {
                border-left: 4px solid #42b72a;
            }
            .notification-error {
                border-left: 4px solid #f02849;
            }
            .notification-warning {
                border-left: 4px solid #f7b928;
            }
            .notification-info {
                border-left: 4px solid #1877f2;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                }
                to {
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    // Utility Functions
    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - new Date(timestamp);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return new Date(timestamp).toLocaleDateString();
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.post-menu')) {
            document.querySelectorAll('.post-menu-dropdown').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

// Initialize Interactive Newsfeed
const newsfeed = new InteractiveNewsfeed();
window.newsfeed = newsfeed;

// Global functions for HTML onclick events
function showPostCreator() {
    newsfeed.showPostCreator();
}

function hidePostCreator() {
    newsfeed.hidePostCreator();
}

function showVisitorSignUp() {
    newsfeed.showVisitorSignUp();
}

function hideVisitorSignUp() {
    newsfeed.hideVisitorSignUp();
}

function registerVisitor() {
    newsfeed.registerVisitor();
}

function publishPost() {
    newsfeed.publishPost();
}

function publishComment() {
    const postId = parseInt(document.getElementById('commentModal')?.dataset.postId || 
                           document.querySelector('.post-card')?.dataset.postId);
    if (postId) {
        newsfeed.publishComment(postId);
    }
}

function loadMorePosts() {
    newsfeed.loadMorePosts();
}

function showCommentModal(postId) {
    newsfeed.showCommentModal(postId);
}

function hideCommentModal() {
    newsfeed.hideCommentModal();
}

function toggleLike(postId) {
    newsfeed.toggleLike(postId);
}

function sharePost(postId) {
    newsfeed.sharePost(postId);
}

function togglePostMenu(postId) {
    newsfeed.togglePostMenu(postId);
}

function loadMoreComments(postId) {
    newsfeed.loadMoreComments(postId);
}

function showPostManagement() {
    newsfeed.showPostManagement();
}

function showUserManagement() {
    newsfeed.showUserManagement();
}

function showAnalytics() {
    newsfeed.showAnalytics();
}

function showModeration() {
    newsfeed.showModeration();
}

function filterByTopic(topic) {
    newsfeed.filterByTopic(topic);
}

function connectWithUser(userId) {
    newsfeed.connectWithUser(userId);
}

function handleMediaUpload(files) {
    newsfeed.handleMediaUpload(files);
}

function insertEmoji() {
    newsfeed.insertEmoji();
}

function mentionUser() {
    newsfeed.mentionUser();
}

function addHashtag() {
    newsfeed.addHashtag();
}

function addLocation() {
    newsfeed.addLocation();
}

function attachPhotoToComment() {
    newsfeed.attachPhotoToComment();
}

console.log('🚀 Interactive Newsfeed loaded successfully!');
    // Facebook-style Widget Functions
    initializeFacebookWidget() {
        this.createFacebookWidget();
        this.loadFacebookPosts();
        this.initializeFacebookInteractions();
    }

    createFacebookWidget() {
        const widgetHTML = `
            <div class="facebook-widget">
                <div class="facebook-header">
                    <h3><i class="fab fa-facebook"></i> Social Feed</h3>
                    <div class="facebook-tabs">
                        <button class="tab-btn active" data-tab="posts">Posts</button>
                        <button class="tab-btn" data-tab="stories">Stories</button>
                        <button class="tab-btn" data-tab="live">Live</button>
                    </div>
                </div>
                
                <div class="facebook-content">
                    <!-- Post Creator -->
                    <div class="post-creator">
                        <div class="creator-avatar">
                            <img src="https://picsum.photos/seed/currentuser/40/40" alt="You">
                        </div>
                        <div class="creator-input">
                            <textarea placeholder="What's on your mind?" id="facebookPostInput"></textarea>
                            <div class="creator-options">
                                <button class="option-btn" data-action="photo">
                                    <i class="fas fa-image"></i> Photo
                                </button>
                                <button class="option-btn" data-action="video">
                                    <i class="fas fa-video"></i> Video
                                </button>
                                <button class="option-btn" data-action="feeling">
                                    <i class="fas fa-smile"></i> Feeling
                                </button>
                                <button class="option-btn" data-action="location">
                                    <i class="fas fa-map-marker-alt"></i> Location
                                </button>
                            </div>
                            <button class="post-btn" id="facebookPostBtn">Post</button>
                        </div>
                    </div>
                    
                    <!-- Facebook Posts Container -->
                    <div class="facebook-posts" id="facebookPosts">
                        <!-- Posts will be loaded here -->
                    </div>
                </div>
            </div>
        `;
        
        // Insert widget into the newsfeed
        const newsfeedContainer = document.querySelector('.newsfeed-container');
        if (newsfeedContainer) {
            newsfeedContainer.insertAdjacentHTML('afterbegin', widgetHTML);
        }
    }

    loadFacebookPosts() {
        const samplePosts = [
            {
                id: 1,
                author: 'Sarah Johnson',
                avatar: 'https://picsum.photos/seed/sarah/50/50',
                time: '2 hours ago',
                content: 'Just launched my new website! Check it out and let me know what you think. 🚀',
                image: 'https://picsum.photos/seed/website/600/400',
                likes: 45,
                comments: 12,
                shares: 3,
                liked: false
            },
            {
                id: 2,
                author: 'Mike Chen',
                avatar: 'https://picsum.photos/seed/mike/50/50',
                time: '4 hours ago',
                content: 'Amazing sunset at the beach today. Sometimes you just need to pause and appreciate the beauty around us. 🌅',
                image: 'https://picsum.photos/seed/sunset/600/400',
                likes: 89,
                comments: 23,
                shares: 7,
                liked: true
            },
            {
                id: 3,
                author: 'Emily Davis',
                avatar: 'https://picsum.photos/seed/emily/50/50',
                time: '6 hours ago',
                content: 'Working on some exciting new features for our app. Can\\'t wait to share them with you all! 💻✨',
                likes: 67,
                comments: 18,
                shares: 5,
                liked: false
            }
        ];
        
        const postsContainer = document.getElementById('facebookPosts');
        if (postsContainer) {
            postsContainer.innerHTML = '';
            samplePosts.forEach(post => {
                postsContainer.appendChild(this.createFacebookPost(post));
            });
        }
    }

    createFacebookPost(post) {
        const postElement = document.createElement('div');
        postElement.className = 'facebook-post';
        postElement.innerHTML = `
            <div class="post-header">
                <img src="${post.avatar}" alt="${post.author}" class="post-avatar">
                <div class="post-meta">
                    <h4 class="post-author">${post.author}</h4>
                    <span class="post-time">${post.time}</span>
                </div>
                <button class="post-options">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
            
            <div class="post-content">
                <p>${post.content}</p>
                ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
            </div>
            
            <div class="post-stats">
                <div class="reactions">
                    <span class="reaction-count">${post.likes}</span>
                    <div class="reaction-icons">
                        <span class="reaction-icon like">👍</span>
                        <span class="reaction-icon love">❤️</span>
                        <span class="reaction-icon wow">😮</span>
                    </div>
                </div>
                <div class="shares-comments">
                    <span>${post.comments} comments</span>
                    <span>${post.shares} shares</span>
                </div>
            </div>
            
            <div class="post-actions">
                <button class="action-btn ${post.liked ? 'liked' : ''}" data-action="like" data-post-id="${post.id}">
                    <i class="fas fa-thumbs-up"></i>
                    <span>Like</span>
                </button>
                <button class="action-btn" data-action="comment" data-post-id="${post.id}">
                    <i class="fas fa-comment"></i>
                    <span>Comment</span>
                </button>
                <button class="action-btn" data-action="share" data-post-id="${post.id}">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </button>
            </div>
            
            <div class="comments-section" id="comments-${post.id}" style="display: none;">
                <div class="comment-input">
                    <img src="https://picsum.photos/seed/currentuser/32/32" alt="You" class="comment-avatar">
                    <input type="text" placeholder="Write a comment..." class="comment-field" data-post-id="${post.id}">
                </div>
                <div class="comments-list">
                    <!-- Comments will be loaded here -->
                </div>
            </div>
        `;
        
        return postElement;
    }

    initializeFacebookInteractions() {
        // Post creation
        const postBtn = document.getElementById('facebookPostBtn');
        const postInput = document.getElementById('facebookPostInput');
        
        if (postBtn && postInput) {
            postBtn.addEventListener('click', () => this.createFacebookPostContent());
            postInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.createFacebookPostContent();
                }
            });
        }
        
        // Post actions (like, comment, share)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const btn = e.target.closest('.action-btn');
                const action = btn.dataset.action;
                const postId = btn.dataset.postId;
                
                this.handleFacebookAction(action, postId, btn);
            }
            
            if (e.target.closest('.option-btn')) {
                const btn = e.target.closest('.option-btn');
                const action = btn.dataset.action;
                this.handleCreatorAction(action);
            }
        });
        
        // Comment input
        document.addEventListener('keypress', (e) => {
            if (e.target.classList.contains('comment-field') && e.key === 'Enter') {
                const postId = e.target.dataset.postId;
                const comment = e.target.value.trim();
                
                if (comment) {
                    this.addFacebookComment(postId, comment);
                    e.target.value = '';
                }
            }
        });
        
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                this.switchFacebookTab(e.target);
            }
        });
    }

    createFacebookPostContent() {
        const postInput = document.getElementById('facebookPostInput');
        const content = postInput.value.trim();
        
        if (!content) {
            this.showNotification('Please write something before posting!', 'warning');
            return;
        }
        
        const newPost = {
            id: Date.now(),
            author: 'You',
            avatar: 'https://picsum.photos/seed/currentuser/50/50',
            time: 'Just now',
            content: content,
            image: null,
            likes: 0,
            comments: 0,
            shares: 0,
            liked: false
        };
        
        const postsContainer = document.getElementById('facebookPosts');
        if (postsContainer) {
            const postElement = this.createFacebookPost(newPost);
            postsContainer.insertBefore(postElement, postsContainer.firstChild);
            
            // Clear input
            postInput.value = '';
            
            // Show success notification
            this.showNotification('Post published successfully!', 'success');
            
            // Animate the new post
            postElement.style.opacity = '0';
            postElement.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                postElement.style.transition = 'all 0.3s ease';
                postElement.style.opacity = '1';
                postElement.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    handleFacebookAction(action, postId, button) {
        switch (action) {
            case 'like':
                this.toggleLike(postId, button);
                break;
            case 'comment':
                this.toggleComments(postId);
                break;
            case 'share':
                this.sharePost(postId);
                break;
        }
    }

    toggleLike(postId, button) {
        const isLiked = button.classList.contains('liked');
        const likeSpan = button.querySelector('span');
        
        if (isLiked) {
            button.classList.remove('liked');
            likeSpan.textContent = 'Like';
        } else {
            button.classList.add('liked');
            likeSpan.textContent = 'Liked';
            
            // Add animation
            button.style.transform = 'scale(1.2)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 200);
        }
        
        this.updatePostStats(postId, 'likes', isLiked ? -1 : 1);
    }

    toggleComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        if (commentsSection) {
            const isVisible = commentsSection.style.display !== 'none';
            commentsSection.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                // Focus on comment input
                const commentInput = commentsSection.querySelector('.comment-field');
                if (commentInput) {
                    setTimeout(() => commentInput.focus(), 100);
                }
            }
        }
    }

    sharePost(postId) {
        this.showNotification('Post shared to your timeline!', 'success');
        this.updatePostStats(postId, 'shares', 1);
    }

    addFacebookComment(postId, comment) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        const commentsList = commentsSection.querySelector('.comments-list');
        
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <img src="https://picsum.photos/seed/currentuser/32/32" alt="You" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">You</span>
                    <span class="comment-time">Just now</span>
                </div>
                <p class="comment-text">${comment}</p>
                <div class="comment-actions">
                    <button class="comment-action">Like</button>
                    <button class="comment-action">Reply</button>
                    <span class="comment-time">1s</span>
                </div>
            </div>
        `;
        
        commentsList.appendChild(commentElement);
        this.updatePostStats(postId, 'comments', 1);
        
        // Animate new comment
        commentElement.style.opacity = '0';
        commentElement.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            commentElement.style.transition = 'all 0.3s ease';
            commentElement.style.opacity = '1';
            commentElement.style.transform = 'translateY(0)';
        }, 100);
    }

    updatePostStats(postId, statType, increment) {
        const post = document.querySelector(`[data-post-id="${postId}"]`).closest('.facebook-post');
        const statsContainer = post.querySelector('.post-stats');
        
        if (statType === 'likes') {
            const reactionCount = statsContainer.querySelector('.reaction-count');
            const currentLikes = parseInt(reactionCount.textContent) || 0;
            reactionCount.textContent = Math.max(0, currentLikes + increment);
        } else if (statType === 'comments') {
            const commentsSpan = statsContainer.querySelector('.shares-comments span:first-child');
            const currentCount = parseInt(commentsSpan.textContent) || 0;
            commentsSpan.textContent = `${Math.max(0, currentCount + increment)} comments`;
        } else if (statType === 'shares') {
            const sharesSpan = statsContainer.querySelector('.shares-comments span:last-child');
            const currentCount = parseInt(sharesSpan.textContent) || 0;
            sharesSpan.textContent = `${Math.max(0, currentCount + increment)} shares`;
        }
    }

    handleCreatorAction(action) {
        switch (action) {
            case 'photo':
                this.showNotification('Photo upload feature coming soon!', 'info');
                break;
            case 'video':
                this.showNotification('Video upload feature coming soon!', 'info');
                break;
            case 'feeling':
                this.showFeelingDialog();
                break;
            case 'location':
                this.showLocationDialog();
                break;
        }
    }

    showFeelingDialog() {
        const feelings = ['Happy', 'Loved', 'Excited', 'Sad', 'Angry', 'Confused'];
        const feelingHTML = feelings.map(feeling => 
            `<button class="feeling-option" data-feeling="${feeling}">${feeling}</button>`
        ).join('');
        
        this.showDialog('How are you feeling?', feelingHTML, () => {
            document.querySelectorAll('.feeling-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    const feeling = btn.dataset.feeling;
                    const postInput = document.getElementById('facebookPostInput');
                    postInput.value = `is feeling ${feeling}`;
                    this.closeDialog();
                });
            });
        });
    }

    showLocationDialog() {
        const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
        const locationHTML = locations.map(location => 
            `<button class="location-option" data-location="${location}">${location}</button>`
        ).join('');
        
        this.showDialog('Where are you?', locationHTML, () => {
            document.querySelectorAll('.location-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    const location = btn.dataset.location;
                    const postInput = document.getElementById('facebookPostInput');
                    postInput.value = `is in ${location}`;
                    this.closeDialog();
                });
            });
        });
    }

    switchFacebookTab(tabButton) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active class to clicked tab
        tabButton.classList.add('active');
        
        const tabName = tabButton.dataset.tab;
        this.showNotification(`${tabName.charAt(0).toUpperCase() + tabName.slice(1)} tab coming soon!`, 'info');
    }

    showDialog(title, content, onShow) {
        // Remove existing dialog if any
        const existingDialog = document.querySelector('.custom-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        const dialogHTML = `
            <div class="custom-dialog-overlay">
                <div class="custom-dialog">
                    <div class="dialog-header">
                        <h3>${title}</h3>
                        <button class="dialog-close">&times;</button>
                    </div>
                    <div class="dialog-content">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        
        const dialog = document.querySelector('.custom-dialog');
        const overlay = document.querySelector('.custom-dialog-overlay');
        const closeBtn = document.querySelector('.dialog-close');
        
        // Event listeners
        closeBtn.addEventListener('click', () => this.closeDialog());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeDialog();
            }
        });
        
        // Call onShow callback
        if (onShow) {
            onShow();
        }
        
        // Animate dialog
        setTimeout(() => {
            overlay.style.opacity = '1';
            dialog.style.transform = 'scale(1)';
        }, 10);
    }

    closeDialog() {
        const dialog = document.querySelector('.custom-dialog');
        const overlay = document.querySelector('.custom-dialog-overlay');
        
        if (dialog && overlay) {
            overlay.style.opacity = '0';
            dialog.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }
