// Unified Member Service - Links members across Blog, Email, and News Feed
export const memberService = {
  // Get all members
  getMembers: () => {
    const members = localStorage.getItem('members');
    return members ? JSON.parse(members) : [];
  },

  // Add new member
  addMember: (memberData) => {
    const members = memberService.getMembers();
    const newMember = {
      id: Date.now(),
      ...memberData,
      joined: new Date().toISOString(),
      status: 'active',
      stats: {
        posts: 0,
        comments: 0,
        emailsOpened: 0,
        blogPosts: 0,
        lastActive: new Date().toISOString()
      }
    };
    members.push(newMember);
    localStorage.setItem('members', JSON.stringify(members));
    return newMember;
  },

  // Get member by email
  getMemberByEmail: (email) => {
    const members = memberService.getMembers();
    return members.find(m => m.email === email);
  },

  // Update member stats
  updateMemberStats: (email, statType) => {
    const members = memberService.getMembers();
    const updatedMembers = members.map(member => {
      if (member.email === email) {
        return {
          ...member,
          stats: {
            ...member.stats,
            [statType]: (member.stats[statType] || 0) + 1,
            lastActive: new Date().toISOString()
          }
        };
      }
      return member;
    });
    localStorage.setItem('members', JSON.stringify(updatedMembers));
  },

  // Track news feed post
  trackNewsFeedPost: (email) => {
    memberService.updateMemberStats(email, 'posts');
  },

  // Track comment
  trackComment: (email) => {
    memberService.updateMemberStats(email, 'comments');
  },

  // Track email opened
  trackEmailOpened: (email) => {
    memberService.updateMemberStats(email, 'emailsOpened');
  },

  // Track blog post
  trackBlogPost: (email) => {
    memberService.updateMemberStats(email, 'blogPosts');
  },

  // Get member activity
  getMemberActivity: (email) => {
    const member = memberService.getMemberByEmail(email);
    if (!member) return null;

    // Get all activities for this member
    const newsfeedPosts = JSON.parse(localStorage.getItem('newsfeed_posts') || '[]')
      .filter(p => p.author.email === email);
    
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]')
      .filter(p => p.author === email);

    return {
      member,
      activities: {
        newsfeedPosts,
        blogPosts,
        totalEngagement: member.stats.posts + member.stats.comments + member.stats.blogPosts
      }
    };
  },

  // Sync member across all sections
  syncMember: (email, updates) => {
    const members = memberService.getMembers();
    const updatedMembers = members.map(member => {
      if (member.email === email) {
        return { ...member, ...updates };
      }
      return member;
    });
    localStorage.setItem('members', JSON.stringify(updatedMembers));
  }
};

export default memberService;