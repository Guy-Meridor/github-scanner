import GithubAccess from "./git-access.js";
import EventManager from "./event-service.js";
import { repoScanLimiter } from "./concurency-limiter.js";

export default class GithubService {
    githubAccess: GithubAccess;
    eventManager: EventManager;

    constructor(token: string) {
        this.githubAccess = new GithubAccess(token);
        this.eventManager = new EventManager();
    }

    async getRepoActiveWebHooks(owner: string, repo: string) {
        const webhooks = await this.githubAccess.getRepoActiveWebHooks(
            owner,
            repo
        );
        const active_webhooks = webhooks.filter((webhook) => webhook.active);
        const webhooks_names = active_webhooks.map((webhook) => webhook.name);
        return webhooks_names;
    }

    async #repoFileScan(owner: string, repo: string, path: string = "") {
        const subfolders = [];

        const contents = await this.githubAccess.getRepoContents(
            owner,
            repo,
            path
        );

        contents.forEach((content) => {
            switch (content.type) {
                case "file":
                    this.eventManager.emit(
                        EventManager.FILE_FOUND_EVENT_KEY,
                        content
                    );
                    break;
                case "dir":
                    subfolders.push(content.path);
                    break;
            }
        });

        return Promise.all(
            subfolders.map((subfolderPath) =>
                this.#repoFileScan(owner, repo, subfolderPath)
            )
        );
    }

    async getRepoContentData(owner: string, repo: string) {
        const scanPromise = repoScanLimiter(() =>
            this.#repoFileScan(owner, repo)
        );
        const scanResults = {
            number_of_files: 0,
            file_content: null,
        };

        async function countFileListener(file) {
            scanResults.number_of_files += 1;
        }

        this.eventManager.on(
            EventManager.FILE_FOUND_EVENT_KEY,
            countFileListener
        );

        async function fileSearchListener(file) {
            if (file.name.endsWith(".yml")) {
                scanResults.file_content = await this.githubAccess.getFile(
                    file.download_url
                );
                this.eventManager.removeListener(
                    EventManager.FILE_FOUND_EVENT_KEY,
                    fileSearchListener
                );
            }
        }

        this.eventManager.on(
            EventManager.FILE_FOUND_EVENT_KEY,
            fileSearchListener.bind(this)
        );

        await scanPromise;

        this.eventManager.removeAllListeners(EventManager.FILE_FOUND_EVENT_KEY);
        return scanResults;
    }

    getRepos() {
        return this.githubAccess.getRepos();
    }

    getRepo(owner: string, repo: string) {
        return this.githubAccess.getRepo(owner, repo);
    }
}
