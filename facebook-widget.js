// Facebook Widget Extension for Interactive Newsfeed
// These methods will be added to the InteractiveNewsfeed class

// Add these methods to InteractiveNewsfeed prototype
InteractiveNewsfeed.prototype.initializeFacebookWidget = function() {
    console.log('initializeFacebookWidget called');
    this.createFacebookWidget();
    console.log('createFacebookWidget completed');
    this.loadFacebookPosts();
    console.log('loadFacebookPosts completed');
    this.initializeFacebookInteractions();
    console.log('initializeFacebookInteractions completed');
};

InteractiveNewsfeed.prototype.createFacebookWidget = function() {
    console.log('createFacebookWidget: Starting');
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
    
    // Insert widget into the newsfeed center
    const newsfeedCenter = document.querySelector('.newsfeed-center');
    console.log('newsfeedCenter element:', newsfeedCenter);
    if (newsfeedCenter) {
        console.log('Inserting Facebook widget HTML');
        newsfeedCenter.insertAdjacentHTML('afterbegin', widgetHTML);
        console.log('Facebook widget HTML inserted');
    } else {
        console.error('newsfeed-center element not found!');
    }
};

InteractiveNewsfeed.prototype.loadFacebookPosts = function() {
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
               content: 'Working on some exciting new features for our app. Cannot wait to share them with you all! 💻✨',
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
};

InteractiveNewsfeed.prototype.createFacebookPost = function(post) {
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
};

InteractiveNewsfeed.prototype.initializeFacebookInteractions = function() {
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
};

InteractiveNewsfeed.prototype.createFacebookPostContent = function() {
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
};

InteractiveNewsfeed.prototype.handleFacebookAction = function(action, postId, button) {
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
};

InteractiveNewsfeed.prototype.toggleLike = function(postId, button) {
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
};

InteractiveNewsfeed.prototype.toggleComments = function(postId) {
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
};

InteractiveNewsfeed.prototype.sharePost = function(postId) {
    this.showNotification('Post shared to your timeline!', 'success');
    this.updatePostStats(postId, 'shares', 1);
};

InteractiveNewsfeed.prototype.addFacebookComment = function(postId, comment) {
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
};

InteractiveNewsfeed.prototype.updatePostStats = function(postId, statType, increment) {
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
};

InteractiveNewsfeed.prototype.handleCreatorAction = function(action) {
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
};

InteractiveNewsfeed.prototype.showFeelingDialog = function() {
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
};

InteractiveNewsfeed.prototype.showLocationDialog = function() {
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
};

InteractiveNewsfeed.prototype.switchFacebookTab = function(tabButton) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Add active class to clicked tab
    tabButton.classList.add('active');
    
    const tabName = tabButton.dataset.tab;
    this.showNotification(`${tabName.charAt(0).toUpperCase() + tabName.slice(1)} tab coming soon!`, 'info');
};

InteractiveNewsfeed.prototype.showDialog = function(title, content, onShow) {
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
};

InteractiveNewsfeed.prototype.closeDialog = function() {
    const dialog = document.querySelector('.custom-dialog');
    const overlay = document.querySelector('.custom-dialog-overlay');
    
    if (dialog && overlay) {
        overlay.style.opacity = '0';
        dialog.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
};

console.log('Facebook Widget extension loaded!');