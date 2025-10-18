// Visitor Security Service - Integrates with your existing system
// Adds rate limiting, content moderation, and spam prevention

class VisitorSecurityService {
  constructor() {
    this.rateLimits = new Map();
    this.blockedIPs = new Set();
    this.spamKeywords = [
      'buy now', 'click here', 'free money', 'viagra', 'casino',
      'loan', 'debt', 'weight loss', 'make money fast', 'work from home',
      'urgent', 'act now', 'limited time', 'guaranteed', 'risk free'
    ];
  }

  // Rate limiting implementation
  checkRateLimit(visitorId, action = 'post') {
    const key = `${visitorId}:${action}`;
    const now = Date.now();
    const limits = {
      post: { max: 5, window: 60000 },      // 5 posts per minute
      reply: { max: 10, window: 60000 },    // 10 replies per minute
      like: { max: 50, window: 60000 }      // 50 likes per minute
    };

    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, { count: 1, resetTime: now + limits[action].window });
      return { allowed: true, remaining: limits[action].max - 1 };
    }

    const limit = this.rateLimits.get(key);
    if (now > limit.resetTime) {
      this.rateLimits.set(key, { count: 1, resetTime: now + limits[action].window });
      return { allowed: true, remaining: limits[action].max - 1 };
    }

    if (limit.count >= limits[action].max) {
      return { allowed: false, remaining: 0, retryAfter: limit.resetTime - now };
    }

    limit.count++;
    return { allowed: true, remaining: limits[action].max - limit.count };
  }

  // Content moderation
  moderateContent(text) {
    const issues = [];
    const lowerText = text.toLowerCase();
    
    // Check for spam keywords
    for (const keyword of this.spamKeywords) {
      if (lowerText.includes(keyword)) {
        issues.push({ type: 'spam_keyword', keyword, severity: 'medium' });
      }
    }

    // Check for excessive caps
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.5 && text.length > 10) {
      issues.push({ type: 'excessive_caps', severity: 'low' });
    }

    // Check for excessive exclamation marks
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 5) {
      issues.push({ type: 'excessive_exclamation', severity: 'low' });
    }

    // Check for URLs (limit to 2 per post)
    const urlCount = (text.match(/https?:\/\//g) || []).length;
    if (urlCount > 2) {
      issues.push({ type: 'excessive_urls', severity: 'medium' });
    }

    // Check for duplicate content (basic)
    if (text.length > 50) {
      const words = text.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      const duplicateRatio = 1 - (uniqueWords.size / words.length);
      if (duplicateRatio > 0.7) {
        issues.push({ type: 'duplicate_content', severity: 'high' });
      }
    }

    return {
      approved: !issues.some(issue => issue.severity === 'high'),
      issues,
      score: this.calculateSpamScore(issues)
    };
  }

  calculateSpamScore(issues) {
    const weights = { high: 10, medium: 5, low: 2 };
    return issues.reduce((score, issue) => score + weights[issue.severity], 0);
  }

  // IP-based security check
  async checkIPReputation(ip) {
    if (this.blockedIPs.has(ip)) {
      return { allowed: false, reason: 'blocked_ip' };
    }

    // Check for suspicious IP patterns
    const suspiciousPatterns = [
      /^192\.168\./, // Private IP ranges (shouldn't happen in production)
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(ip)) {
        return { allowed: false, reason: 'suspicious_ip' };
      }
    }

    return { allowed: true };
  }

  // Email validation
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, reason: 'invalid_format' };
    }

    // Check for disposable email domains
    const disposableDomains = [
      'tempmail.org', '10minutemail.com', 'mailinator.com',
      'guerrillamail.com', 'throwaway.email', 'temp-mail.org'
    ];

    const domain = email.split('@')[1].toLowerCase();
    if (disposableDomains.includes(domain)) {
      return { valid: false, reason: 'disposable_email' };
    }

    return { valid: true };
  }

  // Generate security headers
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    };
  }

  // Clean and sanitize input
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .substring(0, 2000); // Limit length
  }

  // Log security events
  logSecurityEvent(event) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...event
    };
    
    // In production, send to logging service
    console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
    
    // Store in database for analysis
    this.storeSecurityLog(logEntry);
  }

  async storeSecurityLog(logEntry) {
    // Placeholder for database storage
    // In production, store in security_logs table via XANO
    try {
      const response = await fetch(`${process.env.REACT_APP_XANO_BASE_URL}/security_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry)
      });
      
      if (!response.ok) {
        console.error('Failed to store security log');
      }
    } catch (error) {
      console.error('Error storing security log:', error);
    }
  }

  // Get visitor reputation score
  async getVisitorReputation(visitorEmail) {
    try {
      // Get visitor's history from XANO
      const response = await fetch(`${process.env.REACT_APP_XANO_BASE_URL}/visitor_reputation?email=${visitorEmail}`);
      
      if (!response.ok) {
        return { score: 50, reason: 'no_history' }; // Default neutral score
      }
      
      const data = await response.json();
      return data.reputation || { score: 50, reason: 'no_history' };
    } catch (error) {
      console.error('Error getting visitor reputation:', error);
      return { score: 50, reason: 'error' };
    }
  }

  // Check if visitor is trusted
  async isTrustedUser(visitorEmail) {
    try {
      const reputation = await this.getVisitorReputation(visitorEmail);
      return reputation.score >= 70; // Trust score threshold
    } catch (error) {
      console.error('Error checking trust status:', error);
      return false;
    }
  }
}

// Security middleware for API calls
export const securityMiddleware = {
  // Rate limiting middleware
  rateLimit: (action = 'post') => async (requestData) => {
    const visitorId = requestData.visitor_id || requestData.author_email;
    const securityService = new VisitorSecurityService();
    
    const rateLimitCheck = securityService.checkRateLimit(visitorId, action);
    
    if (!rateLimitCheck.allowed) {
      securityService.logSecurityEvent({
        type: 'rate_limit_exceeded',
        visitorId,
        action,
        ip: requestData.ip_address
      });
      
      return {
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: rateLimitCheck.retryAfter
      };
    }
    
    return { success: true };
  },

  // Content moderation middleware
  moderateContent: async (requestData) => {
    const securityService = new VisitorSecurityService();
    const content = requestData.content || requestData.text || '';
    
    const moderation = securityService.moderateContent(content);
    
    if (!moderation.approved) {
      securityService.logSecurityEvent({
        type: 'content_blocked',
        visitorId: requestData.visitor_id,
        content: content.substring(0, 200),
        issues: moderation.issues
      });
      
      return {
        success: false,
        error: 'Content blocked',
        issues: moderation.issues,
        score: moderation.score
      };
    }
    
    return { success: true, moderation };
  },

  // IP check middleware
  checkIP: async (requestData) => {
    const securityService = new VisitorSecurityService();
    const ipCheck = await securityService.checkIPReputation(requestData.ip_address);
    
    if (!ipCheck.allowed) {
      securityService.logSecurityEvent({
        type: 'blocked_ip_attempt',
        ip: requestData.ip_address,
        reason: ipCheck.reason
      });
      
      return {
        success: false,
        error: 'Access denied',
        reason: ipCheck.reason
      };
    }
    
    return { success: true };
  }
};

export default VisitorSecurityService;