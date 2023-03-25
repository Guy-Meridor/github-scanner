import GithubService from "./git-service.js";

export default class githubApiController {
    githubService: GithubService;

    constructor(token: string) {
        this.githubService = new GithubService(token);
    }

    async getRepos() {
        try {
            const repos = await this.githubService.getRepos();
            const repos_for_list = repos.map((repo) => ({
                name: repo.name,
                size: repo.size,
                owner: repo.owner.login,
            }));

            return repos_for_list;
        } catch (error) {
            console.dir(error);
            throw new Error(
                `Couldn't get repository list from Github using the given token`
            );
        }
    }

    async getRepoDetails({ owner, repo }: { owner: string; repo: string }) {
        try {
            const repoRequests = Promise.all([
                this.githubService.getRepo(owner, repo),
                this.githubService.getRepoContentData(owner, repo),
                this.githubService.getRepoActiveWebHooks(owner, repo),
            ]);

            const [repository, contentData, active_webhooks] =
                await repoRequests;
            const repoDetails = {
                owner,
                name: repo,
                size: repository.size,
                number_of_files: contentData.number_of_files,
                file_content: contentData.file_content,
                active_webhooks: active_webhooks,
            };

            return repoDetails;
        } catch (error) {
            console.dir(error);
            throw new Error(
                `Couldn't get details for owner: ${owner} and repo: ${repo} with the given token`
            );
        }
    }
}
