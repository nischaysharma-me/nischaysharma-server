import BaseIntegrationProvider from "../base.js";
import { Octokit } from "@octokit/rest";

class GitHubIntegrationProvider extends BaseIntegrationProvider {
    /**
     * @param {Object} config
     * @param {string} config.accessToken - GitHub Personal Access Token or OAuth Token
     * @param {string} config.owner - GitHub username or organization name
     * @param {string} config.repo - Default repository name
     */
    constructor(config) {
        super(config);
        
        if (config?.accessToken) {
            this.client = new Octokit({
                auth: config.accessToken
            });
        }
    }

    /**
     * Connect/Validate the GitHub connection
     */
    async connect() {
        try {
            if (!this.client) {
                throw new Error("GitHub Access Token is required for connection");
            }
            // Simple request to verify the token
            const { data } = await this.client.users.getAuthenticated();
            return {
                success: true,
                user: data.login,
                name: data.name,
                accountName: data.login
            };
        } catch (error) {
            throw new Error(`GitHub Connection Error: ${error.message}`);
        }
    }

    /**
     * Validates if the repository exists and is accessible
     */
    async validate() {
        try {
            const { owner, repo } = this.config;
            if (!owner || !repo) {
                throw new Error("GitHub owner and repo are required for validation");
            }

            await this.client.repos.get({
                owner,
                repo
            });

            return true;
        } catch (error) {
            return false;
        }
    }

    async disconnect() {
        if (this.client) {
            this.client = null;
        }
        return true;
    }

    /**
     * Sync data or fetch info
     * @param {Object} options 
     * @param {string} options.action - 'get_content', 'get_repos', 'get_stats'
     */
    async sync(options = {}) {
        try {
            const { action = 'get_content', owner, repo, path = "" } = { ...this.config, ...options };
            
            if (action === 'get_repos') {
                return await this.getRepositories();
            }

            if (action === 'get_stats') {
                return await this.getProfileStats();
            }

            if (action === 'get_pinned') {
                return await this.getPinnedRepositories();
            }

            const { data } = await this.client.repos.getContent({
                owner,
                repo,
                path
            });

            return data;
        } catch (error) {
            throw new Error(`GitHub Sync Error: ${error.message}`);
        }
    }

    /**
     * Helper to get list of repositories for the authenticated user
     */
    async getRepositories() {
        try {
            const { data } = await this.client.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 100,
                affiliation: 'owner'
            });
            return data.map(repo => ({
                id: repo.id,
                title: repo.name,
                description: repo.description || '',
                link: repo.html_url,
                full_name: repo.full_name,
                private: repo.private,
                stars: repo.stargazers_count,
                language: repo.language
            }));
        } catch (error) {
            throw new Error(`GitHub API Error: ${error.message}`);
        }
    }

    /**
     * Fetch deep profile statistics using GraphQL
     */
    async getProfileStats() {
        try {
            const query = `
                {
                  viewer {
                    login
                    avatarUrl
                    repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
                      totalCount
                      nodes {
                        name
                        stargazerCount
                        forkCount
                        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                          edges {
                            size
                            node {
                              name
                              color
                            }
                          }
                        }
                      }
                    }
                    contributionsCollection {
                      contributionCalendar {
                        totalContributions
                        weeks {
                          contributionDays {
                            contributionCount
                            date
                            contributionLevel
                          }
                        }
                      }
                    }
                    repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, PULL_REQUEST_REVIEW]) {
                      totalCount
                    }
                    followers {
                      totalCount
                    }
                    following {
                      totalCount
                    }
                    pullRequests {
                      totalCount
                    }
                    issues {
                      totalCount
                    }
                  }
                }
            `;

            const { viewer } = await this.client.graphql(query);
            return viewer;
        } catch (error) {
            throw new Error(`GitHub GraphQL Error: ${error.message}`);
        }
    }

    /**
     * Fetch pinned repositories using GraphQL
     */
    async getPinnedRepositories() {
        try {
            const query = `
                {
                  viewer {
                    pinnedItems(first: 6, types: [REPOSITORY]) {
                      nodes {
                        ... on Repository {
                          name
                          description
                          url
                          openGraphImageUrl
                          stargazerCount
                          languages(first: 3, orderBy: {field: SIZE, direction: DESC}) {
                            nodes {
                              name
                            }
                          }
                          repositoryTopics(first: 5) {
                            nodes {
                              topic {
                                name
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
            `;

            const { viewer } = await this.client.graphql(query);
            return viewer.pinnedItems.nodes.map(repo => ({
                title: repo.name,
                description: repo.description || '',
                link: repo.url,
                image: repo.openGraphImageUrl,
                stars: repo.stargazerCount,
                skills: repo.languages.nodes.map(l => l.name),
                tags: repo.repositoryTopics.nodes.map(t => t.topic.name)
            }));
        } catch (error) {
            throw new Error(`GitHub Pinned Repos Error: ${error.message}`);
        }
    }
}

export default GitHubIntegrationProvider;
