# GitHub Integration: Implementation Details & Requirements

This document provides a detailed breakdown of the features, technical requirements, and implementation steps for the advanced GitHub integration on TaughtCode.

## 1. Feature Set

### 1.1 Profile Analytics Sync
- **Goal**: Display a user's GitHub impact directly on their TaughtCode profile.
- **Metrics to Fetch**:
  - Total Contributions (last year)
  - Total Stars Received
  - Top Languages Used
  - Public Repository Count
  - Follower/Following Counts

### 1.2 Enhanced Repository Sync
- **Goal**: Allow users to curate their "Featured Projects" section.
- **UI**: A searchable list of all public user repositories with checkboxes.
- **Data**: Sync Title, Description, Link, Primary Language, and Star Count.

### 1.3 Content Syndication (Push to GitHub)
- **Goal**: Automatically back up or publish TaughtCode articles to a specific GitHub repository.
- **Workflow**:
  1. User selects a target repository in Article Settings.
  2. Server converts Article HTML to clean Markdown.
  3. Server uses the GitHub Trees/Commits API to push the file to a specified branch (e.g., `main` or `posts`).
  4. Link to the GitHub file is displayed in the TaughtCode editor.

## 2. Technical Requirements

### 2.1 OAuth Scopes
To support these features, the following scopes must be requested during the connection flow:
- `read:user`: To fetch profile data and stats.
- `repo`: **Required** to push content to repositories and fetch private repo stats (if desired).
- `gist`: (Optional) If we want to support pushing to GitHub Gists.

### 2.2 APIs Used
- **GitHub GraphQL API (v4)**: Preferred for fetching aggregate profile stats in a single request.
- **GitHub REST API (v3)**: Used for repository listing and performing commits/file updates.

## 3. Backend Architecture (`taughtcode-server`)

### 3.1 New Service Methods (`githubProvider.js`)
- `getProfileStats()`: Executes a GraphQL query to fetch contribution and repository metadata.
- `pushFileToRepo(owner, repo, path, content, message)`: Handles the multi-step process of creating a blob, tree, and commit.

### 3.2 Data Model Updates
The `integrations.github` object in the User model will store:
- `stats`: The cached analytics data.
- `lastSyncedAt`: Timestamp of the last stats/repo refresh.

## 4. Frontend UI (`nischaysharma-client`)

### 4.1 Profile Components
- **GitHubStatsCard**: A visual component showing the fetched metrics with subtle animations.
- **RepoSelectorModal**: An interactive list allowing the user to "Pick 5" repositories to feature.

### 4.2 Editor Integration
- **GitHub Sync Panel**: Located in the "Social Distribution" or a new "Integrations" sidebar tab.
- **Target Repo Picker**: Dropdown to choose where the article should be pushed.

## 5. Implementation Roadmap

1. **Phase 1**: Update OAuth scopes and implement the GraphQL stats fetcher.
2. **Phase 2**: Build the Repository Selector UI and improve the mapping of featured projects.
3. **Phase 3**: Implement the HTML-to-Markdown converter and the GitHub Commit pipeline.
4. **Phase 4**: Add real-time "Pushing..." status via WebSockets.
