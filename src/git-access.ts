import axios from "axios";

const base_github_url = "https://api.github.com";

export default class GithubAccess {
    token: string;

    constructor(token: string) {
        this.token = token;
    }

    get headers() : Object {
        return {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/vnd.github+json",
        };
    }
    async #base_get_request(url: string, config: Object = {}) {
        const response = await axios.get(url, config);
        return response.data;
    }

    async getRepos() {
        return this.#base_get_request(`${base_github_url}/user/repos`, {
            headers: this.headers,
        });
    }

    async getRepo(owner: string, repo: string) {
        return this.#base_get_request(
            `${base_github_url}/repos/${owner}/${repo}`,
            {
                headers: this.headers,
            }
        );
    }

    async getRepoActiveWebHooks(owner: string, repo: string) {
        return this.#base_get_request(
            `${base_github_url}/repos/${owner}/${repo}/hooks`,
            {
                headers: this.headers,
            }
        );
    }

    async getFile(download_url: string) {
        return this.#base_get_request(download_url, {
            headers: this.headers,
        });
    }

    async getRepoContents(owner: string, repo: string, path: string = "") {
        return this.#base_get_request(
            `${base_github_url}/repos/${owner}/${repo}/contents/${path}`,
            { headers: this.headers }
        );
    }
}
