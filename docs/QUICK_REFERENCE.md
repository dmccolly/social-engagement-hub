# Social Engagement Hub - Quick Reference Card

## 🔗 API Endpoints

### Base URL
```
https://xajo-bs7d-cagt.n7e.xano.io/api:YOUR_API_GROUP_PATH
```

---

## 👥 Visitor Endpoints

| Method | Endpoint | Parameters | Description |
|--------|----------|------------|-------------|
| GET | `/visitor/profile` | `visitor_token` | Get visitor profile |
| PUT | `/visitor/profile` | `visitor_token`, `first_name`, `last_name` | Update profile |
| POST | `/visitor/posts` | `visitor_token`, `content` | Create post (needs approval) |
| GET | `/visitor/posts` | - | Get all approved posts |
| POST | `/visitor/posts/{id}/replies` | `id`, `visitor_token`, `content` | Reply to post |
| POST | `/visitor/posts/{id}/like` | `id`, `visitor_token` | Like a post |

---

## 🛡️ Admin Endpoints

| Method | Endpoint | Parameters | Description |
|--------|----------|------------|-------------|
| GET | `/admin/visitor/posts/pending` | - | Get posts awaiting approval |
| POST | `/admin/visitor/posts/{id}/approve` | `id` | Approve a post |
| POST | `/admin/visitor/posts/{id}/reject` | `id` | Reject a post |

---

## 📦 Endpoint IDs

### Visitor Endpoints
- 133: GET /visitor/profile
- 134: PUT /visitor/profile
- 135: POST /visitor/posts
- 136: GET /visitor/posts
- 137: POST /visitor/posts/{id}/replies
- 138: POST /visitor/posts/{id}/like

### Admin Endpoints
- 192: GET /admin/visitor/posts/pending
- 193: POST /admin/visitor/posts/{id}/approve
- 194: POST /admin/visitor/posts/{id}/reject

---

## 🔧 Configuration Checklist

- [ ] Get API base path from Xano dashboard
- [ ] Configure CORS for your frontend domain
- [ ] Add unique constraint on visitor_like table
- [ ] Set up admin authentication middleware
- [ ] Test all endpoints
- [ ] Update frontend with actual API URLs
- [ ] Deploy to production

---

## 🗄️ Database Tables

- **visitor** - Profile information
- **visitor_post** - Posts with approval flag
- **visitor_reply** - Replies to posts
- **visitor_like** - Post likes

---

## 📍 Xano Details

- **Instance:** xajo-bs7d-cagt.n7e.xano.io
- **Workspace ID:** 1
- **API Group ID:** 6
- **API Group Name:** EmailMarketing

---

## 🚨 Important Notes

1. **visitor_token** is required for all visitor operations
2. Posts are created with `is_approved: false` by default
3. Only approved posts appear in GET /visitor/posts
4. Admin endpoints need additional authentication (configure in Xano)
5. Add unique constraint to prevent duplicate likes

---

*Quick reference for Social Engagement Hub API*
*9 endpoints total: 6 visitor + 3 admin*
