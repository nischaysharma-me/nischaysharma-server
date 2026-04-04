/**
 * GitHub Analytics Utilities
 * Processes raw data from GitHub APIs (GraphQL/REST) into TaughtCode format
 */

/**
 * Calculates language percentages from byte counts
 * @param {Array} repos - List of repositories with language data
 * @returns {Array} Sorted list of languages with percentages
 */
export function calculateLanguagePercentages(repos) {
    const languageMap = new Map();
    let totalBytes = 0;

    repos.forEach(repo => {
        if (!repo.languages?.edges) return;
        
        repo.languages.edges.forEach(edge => {
            const { name, color } = edge.node;
            const size = edge.size;
            
            const existing = languageMap.get(name) || { name, color, sizeInBytes: 0 };
            existing.sizeInBytes += size;
            languageMap.set(name, existing);
            totalBytes += size;
        });
    });

    if (totalBytes === 0) return [];

    return Array.from(languageMap.values())
        .map(lang => ({
            ...lang,
            percentage: parseFloat(((lang.sizeInBytes / totalBytes) * 100).toFixed(2))
        }))
        .sort((a, b) => b.sizeInBytes - a.sizeInBytes);
}

/**
 * Flattens GitHub contribution calendar into a simple date-count array
 * @param {Object} calendar - contributionCalendar from GraphQL
 * @returns {Array} Flattened activity data
 */
export function processContributionCalendar(calendar) {
    if (!calendar?.weeks) return [];

    const activity = [];
    calendar.weeks.forEach(week => {
        week.contributionDays.forEach(day => {
            activity.push({
                date: day.date,
                count: day.contributionCount,
                level: day.contributionLevel // 0-4 matching GitHub's intensities
            });
        });
    });

    return activity;
}

/**
 * Summarizes aggregate impact metrics across all repositories
 * @param {Object} viewer - Root user object from GraphQL
 * @returns {Object} Summarized stats
 */
export function summarizeProfileStats(viewer) {
    const repos = viewer.repositories.nodes;
    
    return {
        totalStars: repos.reduce((acc, repo) => acc + repo.stargazerCount, 0),
        totalForks: repos.reduce((acc, repo) => acc + repo.forkCount, 0),
        totalRepos: viewer.repositories.totalCount,
        totalContributions: viewer.contributionsCollection.contributionCalendar.totalContributions,
        followerCount: viewer.followers.totalCount,
        followingCount: viewer.following.totalCount,
        pullRequestCount: viewer.pullRequests.totalCount,
        issueCount: viewer.issues.totalCount,
        contributedRepositoryCount: viewer.repositoriesContributedTo.totalCount
    };
}
