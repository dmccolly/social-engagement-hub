# CRITICAL DEVELOPMENT RULES

**MANDATORY CHECKS BEFORE ANY INFRASTRUCTURE CHANGE**

## Rule 1: Map All Dependencies Before Changes

**BEFORE modifying any routing, proxy, API endpoint, or configuration:**

1. Document which services/features use the current configuration
2. List all API groups and their endpoints
3. Map which frontend services call which backend endpoints
4. Identify all affected systems

**Example:** Before changing `/xano/*` proxy route, check:
- What API groups exist? (EmailMarketing, Events & Calendar, etc.)
- What endpoints are in each group?
- Which frontend services use which endpoints?
- Will this change affect newsfeed, blog, events, members, etc.?

## Rule 2: Test All Affected Features After Deployment

**AFTER any infrastructure change is deployed:**

1. Create a test checklist of ALL features that could be affected
2. Test each feature systematically
3. Document test results
4. Report any breakage immediately

**Example:** After changing proxy routing:
- Test event creation ✓
- Test event updates ✓
- Test newsfeed loading ✗ BROKEN
- Test blog loading ✗ BROKEN
- Test member features ✓

## Rule 3: Use Specific Routes, Not Wildcards

**WHEN creating proxy routes or redirects:**

1. Use specific paths for specific features
2. Avoid catch-all wildcards that redirect everything
3. Order routes from most specific to least specific
4. Document which route serves which feature

**Example:** Instead of:
```
/xano/* https://api-group-1/:splat
```

Use:
```
/xano/events/* https://events-api/:splat
/xano/newsfeed/* https://content-api/:splat
/xano/blog/* https://content-api/:splat
/xano/* https://default-api/:splat
```

---

## Implementation in Future Sessions

**These rules MUST be added to project documentation and referenced in:**
- README.md
- CONTRIBUTING.md
- Any deployment or infrastructure change procedures

**Store this file in the repository root and reference it in all future sessions.**
