/**
 * GitHub Analytics Schema
 * Defines the structure for processed GitHub data
 */
export const githubAnalyticsSchema = {
    username: String,
    avatarUrl: String,
    stats: {
        totalStars: Number,
        totalForks: Number,
        totalRepos: Number,
        totalContributions: Number, // Last 365 days
        followerCount: Number,
        followingCount: Number,
        pullRequestCount: Number,
        issueCount: Number
    },
    languages: [
        {
            name: String,
            percentage: Number, // 0-100
            color: String,
            sizeInBytes: Number
        }
    ],
    contributionCalendar: [
        {
            date: String, // YYYY-MM-DD
            count: Number,
            level: Number // 0-4
        }
    ],
    lastSyncedAt: Date
};

/**
 * LinkedIn Analytics Schema
 * Defines the structure for processed LinkedIn data
 */
export const linkedinAnalyticsSchema = {
    memberId: String,
    accountName: String,
    headline: String,
    summary: String,
    profileUrl: String,
    positions: [
        {
            company: String,
            title: String,
            startDate: String, // YYYY-MM-DD or MM/YYYY
            endDate: String, // 'Present' or ISO date
            description: String,
            isCurrent: Boolean
        }
    ],
    verifiedSkills: [String],
    connectionCount: Number,
    lastSyncedAt: Date
};
